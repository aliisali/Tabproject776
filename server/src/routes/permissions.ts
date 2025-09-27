import express, { Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { pool } from '../server';
import { AuthRequest, requireRole } from '../middleware/auth';
import { logActivity } from '../utils/logger';

const router = express.Router();

// Module Permissions Routes

// Get module permissions
router.get('/modules', async (req: AuthRequest, res: Response) => {
  try {
    let query = `
      SELECT mp.*, u.name as user_name, u.email as user_email, u.role as user_role
      FROM module_permissions mp
      LEFT JOIN users u ON mp.user_id = u.id
    `;
    let params: any[] = [];

    // Filter based on user role
    if (req.user?.role !== 'admin') {
      query += ' WHERE mp.user_id = $1';
      params = [req.user?.id];
    }

    query += ' ORDER BY mp.granted_at DESC';

    const result = await pool.query(query, params);

    const permissions = result.rows.map(permission => ({
      ...permission,
      userId: permission.user_id,
      moduleName: permission.module_name,
      canAccess: permission.can_access,
      canGrantAccess: permission.can_grant_access,
      grantedBy: permission.granted_by,
      grantedAt: permission.granted_at,
      isActive: permission.is_active,
      userName: permission.user_name,
      userEmail: permission.user_email,
      userRole: permission.user_role
    }));

    res.json(permissions);
  } catch (error) {
    console.error('Error fetching module permissions:', error);
    res.status(500).json({ error: 'Failed to fetch module permissions' });
  }
});

// Grant module permission
router.post('/modules', [
  body('userId').isUUID(),
  body('moduleName').isLength({ min: 1 }),
  body('canAccess').isBoolean()
], requireRole(['admin']), async (req: AuthRequest, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { userId, moduleName, canAccess, canGrantAccess = false } = req.body;

    // Upsert permission
    const result = await pool.query(
      `INSERT INTO module_permissions (user_id, module_name, can_access, can_grant_access, granted_by)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (user_id, module_name) 
       DO UPDATE SET 
         can_access = EXCLUDED.can_access,
         can_grant_access = EXCLUDED.can_grant_access,
         granted_by = EXCLUDED.granted_by,
         granted_at = NOW(),
         is_active = true
       RETURNING *`,
      [userId, moduleName, canAccess, canGrantAccess, req.user!.id]
    );

    const permission = result.rows[0];
    
    // Log activity
    await logActivity(req.user!.id, 'module_permission_granted', 'permission', permission.id, req);

    res.status(201).json({
      permission: {
        ...permission,
        userId: permission.user_id,
        moduleName: permission.module_name,
        canAccess: permission.can_access,
        canGrantAccess: permission.can_grant_access,
        grantedBy: permission.granted_by,
        grantedAt: permission.granted_at,
        isActive: permission.is_active
      }
    });

  } catch (error) {
    console.error('Error granting module permission:', error);
    res.status(500).json({ error: 'Failed to grant module permission' });
  }
});

// Revoke module permission
router.delete('/modules/:userId/:moduleName', requireRole(['admin']), async (req: AuthRequest, res: Response) => {
  try {
    const { userId, moduleName } = req.params;

    // Delete permission
    const result = await pool.query(
      'DELETE FROM module_permissions WHERE user_id = $1 AND module_name = $2 RETURNING *',
      [userId, moduleName]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Permission not found' });
    }

    // Log activity
    await logActivity(req.user!.id, 'module_permission_revoked', 'permission', `${userId}-${moduleName}`, req);

    res.json({ message: 'Module permission revoked successfully' });

  } catch (error) {
    console.error('Error revoking module permission:', error);
    res.status(500).json({ error: 'Failed to revoke module permission' });
  }
});

// Model Permissions Routes

// Get model permissions
router.get('/models', async (req: AuthRequest, res: Response) => {
  try {
    const query = `
      SELECT mp.*, b.name as business_name, u.name as granted_by_name
      FROM model_permissions mp
      LEFT JOIN businesses b ON mp.business_id = b.id
      LEFT JOIN users u ON mp.granted_by = u.id
      ORDER BY mp.granted_at DESC
    `;

    const result = await pool.query(query);

    const permissions = result.rows.map(permission => ({
      ...permission,
      businessId: permission.business_id,
      canView3DModels: permission.can_view_3d_models,
      canUseInAR: permission.can_use_in_ar,
      grantedBy: permission.granted_by,
      grantedAt: permission.granted_at,
      isActive: permission.is_active,
      businessName: permission.business_name,
      grantedByName: permission.granted_by_name
    }));

    res.json(permissions);
  } catch (error) {
    console.error('Error fetching model permissions:', error);
    res.status(500).json({ error: 'Failed to fetch model permissions' });
  }
});

// Grant model permission
router.post('/models', [
  body('businessId').isUUID(),
  body('canView3DModels').isBoolean(),
  body('canUseInAR').isBoolean()
], requireRole(['admin']), async (req: AuthRequest, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { businessId, canView3DModels, canUseInAR } = req.body;

    // Upsert permission
    const result = await pool.query(
      `INSERT INTO model_permissions (business_id, can_view_3d_models, can_use_in_ar, granted_by)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (business_id) 
       DO UPDATE SET 
         can_view_3d_models = EXCLUDED.can_view_3d_models,
         can_use_in_ar = EXCLUDED.can_use_in_ar,
         granted_by = EXCLUDED.granted_by,
         granted_at = NOW(),
         is_active = true
       RETURNING *`,
      [businessId, canView3DModels, canUseInAR, req.user!.id]
    );

    const permission = result.rows[0];
    
    // Log activity
    await logActivity(req.user!.id, 'model_permission_granted', 'permission', permission.id, req);

    res.status(201).json({
      permission: {
        ...permission,
        businessId: permission.business_id,
        canView3DModels: permission.can_view_3d_models,
        canUseInAR: permission.can_use_in_ar,
        grantedBy: permission.granted_by,
        grantedAt: permission.granted_at,
        isActive: permission.is_active
      }
    });

  } catch (error) {
    console.error('Error granting model permission:', error);
    res.status(500).json({ error: 'Failed to grant model permission' });
  }
});

// Revoke model permission
router.delete('/models/:businessId', requireRole(['admin']), async (req: AuthRequest, res: Response) => {
  try {
    const { businessId } = req.params;

    // Delete permission
    const result = await pool.query(
      'DELETE FROM model_permissions WHERE business_id = $1 RETURNING *',
      [businessId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Model permission not found' });
    }

    // Log activity
    await logActivity(req.user!.id, 'model_permission_revoked', 'permission', businessId, req);

    res.json({ message: 'Model permission revoked successfully' });

  } catch (error) {
    console.error('Error revoking model permission:', error);
    res.status(500).json({ error: 'Failed to revoke model permission' });
  }
});

export default router;