import express from 'express';
import bcrypt from 'bcryptjs';
import { body, validationResult } from 'express-validator';
import { pool } from '../server';
import { AuthRequest, requireRole } from '../middleware/auth';
import { logActivity } from '../utils/logger';

const router = express.Router();

// Get all users (admin only)
router.get('/', requireRole(['admin']), async (req: AuthRequest, res) => {
  try {
    const result = await pool.query(`
      SELECT u.*, b.name as business_name 
      FROM users u 
      LEFT JOIN businesses b ON u.business_id = b.id 
      ORDER BY u.created_at DESC
    `);

    const users = result.rows.map(user => ({
      ...user,
      businessId: user.business_id,
      parentId: user.parent_id,
      businessName: user.business_name
    }));

    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Create user
router.post('/', [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  body('name').isLength({ min: 2 }),
  body('role').isIn(['admin', 'business', 'employee'])
], async (req: AuthRequest, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password, name, role, businessId, permissions = [] } = req.body;

    // Check permissions
    if (req.user?.role !== 'admin' && req.user?.role !== 'business') {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    // Business users can only create employees
    if (req.user?.role === 'business' && role !== 'employee') {
      return res.status(403).json({ error: 'Business users can only create employees' });
    }

    // Check if user already exists
    const existingUser = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Set business ID for employees created by business users
    const finalBusinessId = req.user?.role === 'business' ? req.user.businessId : businessId;

    // Create user
    const userResult = await pool.query(
      `INSERT INTO users (email, name, password_hash, role, business_id, parent_id, permissions, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [email, name, passwordHash, role, finalBusinessId, req.user?.id, permissions, req.user?.id]
    );

    const newUser = userResult.rows[0];
    
    // Log activity
    await logActivity(req.user!.id, 'user_created', 'user', newUser.id, req);

    const { password_hash, ...userWithoutPassword } = newUser;
    res.status(201).json({
      user: {
        ...userWithoutPassword,
        businessId: newUser.business_id,
        parentId: newUser.parent_id
      }
    });

  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ error: 'Failed to create user' });
  }
});

// Update user
router.put('/:id', async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Check permissions
    if (req.user?.role !== 'admin' && req.user?.id !== id) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    // Hash password if provided
    if (updates.password) {
      updates.password_hash = await bcrypt.hash(updates.password, 10);
      delete updates.password;
    }

    // Build update query
    const updateFields = [];
    const values = [];
    let paramCount = 1;

    for (const [key, value] of Object.entries(updates)) {
      if (key !== 'id' && key !== 'created_at') {
        updateFields.push(`${key} = $${paramCount}`);
        values.push(value);
        paramCount++;
      }
    }

    if (updateFields.length === 0) {
      return res.status(400).json({ error: 'No valid fields to update' });
    }

    updateFields.push('updated_at = NOW()');
    values.push(id);

    const query = `UPDATE users SET ${updateFields.join(', ')} WHERE id = $${paramCount} RETURNING *`;
    const result = await pool.query(query, values);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Log activity
    await logActivity(req.user!.id, 'user_updated', 'user', id, req);

    const { password_hash, ...userWithoutPassword } = result.rows[0];
    res.json({
      user: {
        ...userWithoutPassword,
        businessId: userWithoutPassword.business_id
      }
    });

  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ error: 'Failed to update user' });
  }
});

// Delete user
router.delete('/:id', requireRole(['admin', 'business']), async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;

    // Check if user exists
    const userResult = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Delete user
    await pool.query('DELETE FROM users WHERE id = $1', [id]);

    // Log activity
    await logActivity(req.user!.id, 'user_deleted', 'user', id, req);

    res.json({ message: 'User deleted successfully' });

  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

export default router;