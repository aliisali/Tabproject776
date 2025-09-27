import express from 'express';
import { body, validationResult } from 'express-validator';
import { pool } from '../server';
import { AuthRequest, requireRole } from '../middleware/auth';
import { logActivity } from '../utils/logger';

const router = express.Router();

// Get all businesses (admin only)
router.get('/', requireRole(['admin']), async (req: AuthRequest, res) => {
  try {
    const result = await pool.query(`
      SELECT b.*, u.name as admin_name 
      FROM businesses b 
      LEFT JOIN users u ON b.admin_id = u.id 
      ORDER BY b.created_at DESC
    `);

    const businesses = result.rows.map(business => ({
      ...business,
      adminId: business.admin_id,
      vrViewEnabled: business.vr_view_enabled,
      adminName: business.admin_name
    }));

    res.json(businesses);
  } catch (error) {
    console.error('Error fetching businesses:', error);
    res.status(500).json({ error: 'Failed to fetch businesses' });
  }
});

// Create business
router.post('/', [
  body('name').isLength({ min: 2 }),
  body('address').isLength({ min: 5 }),
  body('email').isEmail().normalizeEmail()
], requireRole(['admin']), async (req: AuthRequest, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, address, phone, email, adminId, features = [], subscription = 'basic' } = req.body;

    const result = await pool.query(
      `INSERT INTO businesses (name, address, phone, email, admin_id, features, subscription)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [name, address, phone, email, adminId, features, subscription]
    );

    const newBusiness = result.rows[0];
    
    // Log activity
    await logActivity(req.user!.id, 'business_created', 'business', newBusiness.id, req);

    res.status(201).json({
      business: {
        ...newBusiness,
        adminId: newBusiness.admin_id,
        vrViewEnabled: newBusiness.vr_view_enabled
      }
    });

  } catch (error) {
    console.error('Error creating business:', error);
    res.status(500).json({ error: 'Failed to create business' });
  }
});

// Update business
router.put('/:id', requireRole(['admin']), async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

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

    const query = `UPDATE businesses SET ${updateFields.join(', ')} WHERE id = $${paramCount} RETURNING *`;
    const result = await pool.query(query, values);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Business not found' });
    }

    // Log activity
    await logActivity(req.user!.id, 'business_updated', 'business', id, req);

    const business = result.rows[0];
    res.json({
      business: {
        ...business,
        adminId: business.admin_id,
        vrViewEnabled: business.vr_view_enabled
      }
    });

  } catch (error) {
    console.error('Error updating business:', error);
    res.status(500).json({ error: 'Failed to update business' });
  }
});

// Delete business
router.delete('/:id', requireRole(['admin']), async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;

    // Check if business exists
    const businessResult = await pool.query('SELECT * FROM businesses WHERE id = $1', [id]);
    if (businessResult.rows.length === 0) {
      return res.status(404).json({ error: 'Business not found' });
    }

    // Delete business (cascade will handle related records)
    await pool.query('DELETE FROM businesses WHERE id = $1', [id]);

    // Log activity
    await logActivity(req.user!.id, 'business_deleted', 'business', id, req);

    res.json({ message: 'Business deleted successfully' });

  } catch (error) {
    console.error('Error deleting business:', error);
    res.status(500).json({ error: 'Failed to delete business' });
  }
});

export default router;