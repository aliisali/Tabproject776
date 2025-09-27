import express, { Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { pool } from '../server';
import { AuthRequest } from '../middleware/auth';
import { logActivity } from '../utils/logger';

const router = express.Router();

// Get customers (filtered by business)
router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    let query = 'SELECT * FROM customers';
    let params: any[] = [];

    // Filter by business for non-admin users
    if (req.user?.role !== 'admin') {
      query += ' WHERE business_id = $1';
      params = [req.user?.businessId];
    }

    query += ' ORDER BY created_at DESC';

    const result = await pool.query(query, params);

    const customers = result.rows.map(customer => ({
      ...customer,
      businessId: customer.business_id
    }));

    res.json(customers);
  } catch (error) {
    console.error('Error fetching customers:', error);
    res.status(500).json({ error: 'Failed to fetch customers' });
  }
});

// Create customer
router.post('/', [
  body('name').isLength({ min: 2 }),
  body('address').isLength({ min: 5 }),
  body('postcode').isLength({ min: 3 })
], async (req: AuthRequest, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, phone, mobile, address, postcode } = req.body;
    const businessId = req.user?.businessId;

    const result = await pool.query(
      `INSERT INTO customers (name, email, phone, mobile, address, postcode, business_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [name, email, phone, mobile, address, postcode, businessId]
    );

    const newCustomer = result.rows[0];
    
    // Log activity
    await logActivity(req.user!.id, 'customer_created', 'customer', newCustomer.id, req);

    res.status(201).json({
      customer: {
        ...newCustomer,
        businessId: newCustomer.business_id
      }
    });

  } catch (error) {
    console.error('Error creating customer:', error);
    res.status(500).json({ error: 'Failed to create customer' });
  }
});

// Update customer
router.put('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Check if customer exists and user has permission
    const customerResult = await pool.query('SELECT * FROM customers WHERE id = $1', [id]);
    if (customerResult.rows.length === 0) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    const customer = customerResult.rows[0];
    
    // Permission check
    if (req.user?.role !== 'admin' && req.user?.businessId !== customer.business_id) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    // Build update query
    const updateFields = [];
    const values = [];
    let paramCount = 1;

    for (const [key, value] of Object.entries(updates)) {
      if (key !== 'id' && key !== 'created_at' && key !== 'business_id') {
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

    const query = `UPDATE customers SET ${updateFields.join(', ')} WHERE id = $${paramCount} RETURNING *`;
    const result = await pool.query(query, values);

    // Log activity
    await logActivity(req.user!.id, 'customer_updated', 'customer', id, req);

    const updatedCustomer = result.rows[0];
    res.json({
      customer: {
        ...updatedCustomer,
        businessId: updatedCustomer.business_id
      }
    });

  } catch (error) {
    console.error('Error updating customer:', error);
    res.status(500).json({ error: 'Failed to update customer' });
  }
});

// Delete customer
router.delete('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    // Check if customer exists and user has permission
    const customerResult = await pool.query('SELECT * FROM customers WHERE id = $1', [id]);
    if (customerResult.rows.length === 0) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    const customer = customerResult.rows[0];
    
    // Permission check
    if (req.user?.role !== 'admin' && req.user?.businessId !== customer.business_id) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    // Delete customer
    await pool.query('DELETE FROM customers WHERE id = $1', [id]);

    // Log activity
    await logActivity(req.user!.id, 'customer_deleted', 'customer', id, req);

    res.json({ message: 'Customer deleted successfully' });

  } catch (error) {
    console.error('Error deleting customer:', error);
    res.status(500).json({ error: 'Failed to delete customer' });
  }
});

export default router;