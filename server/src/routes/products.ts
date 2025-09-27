import express from 'express';
import { body, validationResult } from 'express-validator';
import { pool } from '../server';
import { AuthRequest, requireRole } from '../middleware/auth';
import { logActivity } from '../utils/logger';

const router = express.Router();

// Get all products
router.get('/', async (req: AuthRequest, res) => {
  try {
    const result = await pool.query('SELECT * FROM products WHERE is_active = true ORDER BY created_at DESC');

    const products = result.rows.map(product => ({
      ...product,
      model3d: product.model_3d,
      arModel: product.ar_model,
      isActive: product.is_active
    }));

    res.json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// Create product (admin only)
router.post('/', [
  body('name').isLength({ min: 2 }),
  body('category').isLength({ min: 2 }),
  body('price').isNumeric()
], requireRole(['admin']), async (req: AuthRequest, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      name,
      category,
      description,
      image,
      model3d,
      arModel,
      specifications = [],
      price
    } = req.body;

    const result = await pool.query(
      `INSERT INTO products (name, category, description, image, model_3d, ar_model, specifications, price)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [name, category, description, image, model3d, arModel, specifications, price]
    );

    const newProduct = result.rows[0];
    
    // Log activity
    await logActivity(req.user!.id, 'product_created', 'product', newProduct.id, req);

    res.status(201).json({
      product: {
        ...newProduct,
        model3d: newProduct.model_3d,
        arModel: newProduct.ar_model,
        isActive: newProduct.is_active
      }
    });

  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ error: 'Failed to create product' });
  }
});

// Update product
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

    const query = `UPDATE products SET ${updateFields.join(', ')} WHERE id = $${paramCount} RETURNING *`;
    const result = await pool.query(query, values);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Log activity
    await logActivity(req.user!.id, 'product_updated', 'product', id, req);

    const updatedProduct = result.rows[0];
    res.json({
      product: {
        ...updatedProduct,
        model3d: updatedProduct.model_3d,
        arModel: updatedProduct.ar_model,
        isActive: updatedProduct.is_active
      }
    });

  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ error: 'Failed to update product' });
  }
});

// Delete product
router.delete('/:id', requireRole(['admin']), async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;

    // Soft delete (set is_active to false)
    const result = await pool.query(
      'UPDATE products SET is_active = false, updated_at = NOW() WHERE id = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Log activity
    await logActivity(req.user!.id, 'product_deleted', 'product', id, req);

    res.json({ message: 'Product deleted successfully' });

  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ error: 'Failed to delete product' });
  }
});

export default router;