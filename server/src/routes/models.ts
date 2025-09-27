import express, { Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { pool } from '../server';
import { AuthRequest, requireRole } from '../middleware/auth';
import { logActivity } from '../utils/logger';

const router = express.Router();

// Get all 3D models
router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    let query = `
      SELECT m.*, u.name as creator_name
      FROM models_3d m
      LEFT JOIN users u ON m.created_by = u.id
    `;
    let params: any[] = [];

    // Filter based on user role and permissions
    if (req.user?.role !== 'admin') {
      // Check if user's business has permission to view 3D models
      query += ` WHERE EXISTS (
        SELECT 1 FROM model_permissions mp
        JOIN users u ON u.business_id = mp.business_id
        WHERE u.id = $1 AND mp.can_view_3d_models = true AND mp.is_active = true
      )`;
      params = [req.user?.id];
    }

    query += ' ORDER BY m.created_at DESC';

    const result = await pool.query(query, params);

    const models = result.rows.map(model => ({
      ...model,
      originalImage: model.original_image,
      modelUrl: model.model_url,
      createdBy: model.created_by,
      creatorName: model.creator_name,
      createdAt: model.created_at,
      updatedAt: model.updated_at
    }));

    res.json(models);
  } catch (error) {
    console.error('Error fetching 3D models:', error);
    res.status(500).json({ error: 'Failed to fetch 3D models' });
  }
});

// Create 3D model (admin only)
router.post('/', [
  body('name').isLength({ min: 1 }),
  body('originalImage').isURL()
], requireRole(['admin']), async (req: AuthRequest, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      name,
      originalImage,
      modelUrl,
      thumbnail,
      status = 'processing',
      settings = {}
    } = req.body;

    const result = await pool.query(
      `INSERT INTO models_3d (name, original_image, model_url, thumbnail, status, settings, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [name, originalImage, modelUrl, thumbnail, status, JSON.stringify(settings), req.user!.id]
    );

    const newModel = result.rows[0];
    
    // Log activity
    await logActivity(req.user!.id, '3d_model_created', 'model', newModel.id, req);

    res.status(201).json({
      model: {
        ...newModel,
        originalImage: newModel.original_image,
        modelUrl: newModel.model_url,
        createdBy: newModel.created_by,
        createdAt: newModel.created_at
      }
    });

  } catch (error) {
    console.error('Error creating 3D model:', error);
    res.status(500).json({ error: 'Failed to create 3D model' });
  }
});

// Update 3D model
router.put('/:id', requireRole(['admin']), async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Build update query
    const updateFields = [];
    const values = [];
    let paramCount = 1;

    for (const [key, value] of Object.entries(updates)) {
      if (key !== 'id' && key !== 'created_at' && key !== 'created_by') {
        // Handle field mapping
        if (key === 'originalImage') {
          updateFields.push(`original_image = $${paramCount}`);
        } else if (key === 'modelUrl') {
          updateFields.push(`model_url = $${paramCount}`);
        } else if (key === 'createdBy') {
          updateFields.push(`created_by = $${paramCount}`);
        } else {
          updateFields.push(`${key} = $${paramCount}`);
        }
        values.push(value);
        paramCount++;
      }
    }

    if (updateFields.length === 0) {
      return res.status(400).json({ error: 'No valid fields to update' });
    }

    updateFields.push('updated_at = NOW()');
    values.push(id);

    const query = `UPDATE models_3d SET ${updateFields.join(', ')} WHERE id = $${paramCount} RETURNING *`;
    const result = await pool.query(query, values);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: '3D model not found' });
    }

    // Log activity
    await logActivity(req.user!.id, '3d_model_updated', 'model', id, req);

    const updatedModel = result.rows[0];
    res.json({
      model: {
        ...updatedModel,
        originalImage: updatedModel.original_image,
        modelUrl: updatedModel.model_url,
        createdBy: updatedModel.created_by,
        createdAt: updatedModel.created_at
      }
    });

  } catch (error) {
    console.error('Error updating 3D model:', error);
    res.status(500).json({ error: 'Failed to update 3D model' });
  }
});

// Delete 3D model
router.delete('/:id', requireRole(['admin']), async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    // Check if model exists
    const modelResult = await pool.query('SELECT * FROM models_3d WHERE id = $1', [id]);
    if (modelResult.rows.length === 0) {
      return res.status(404).json({ error: '3D model not found' });
    }

    // Delete model
    await pool.query('DELETE FROM models_3d WHERE id = $1', [id]);

    // Log activity
    await logActivity(req.user!.id, '3d_model_deleted', 'model', id, req);

    res.json({ message: '3D model deleted successfully' });

  } catch (error) {
    console.error('Error deleting 3D model:', error);
    res.status(500).json({ error: 'Failed to delete 3D model' });
  }
});

export default router;