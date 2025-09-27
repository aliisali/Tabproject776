import express, { Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { pool } from '../server';
import { AuthRequest } from '../middleware/auth';
import { logActivity } from '../utils/logger';

const router = express.Router();

// Get notifications for current user
router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    let query = 'SELECT * FROM notifications';
    let params: any[] = [];

    // Filter by user for non-admin users
    if (req.user?.role !== 'admin') {
      query += ' WHERE user_id = $1';
      params = [req.user?.id];
    }

    query += ' ORDER BY created_at DESC';

    const result = await pool.query(query, params);

    const notifications = result.rows.map(notification => ({
      ...notification,
      userId: notification.user_id,
      createdAt: notification.created_at,
      updatedAt: notification.updated_at
    }));

    res.json(notifications);
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
});

// Create notification
router.post('/', [
  body('title').isLength({ min: 1 }),
  body('message').isLength({ min: 1 }),
  body('userId').isUUID()
], async (req: AuthRequest, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { title, message, type = 'system', userId } = req.body;

    const result = await pool.query(
      `INSERT INTO notifications (user_id, title, message, type)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [userId, title, message, type]
    );

    const newNotification = result.rows[0];
    
    // Log activity
    await logActivity(req.user!.id, 'notification_created', 'notification', newNotification.id, req);

    res.status(201).json({
      notification: {
        ...newNotification,
        userId: newNotification.user_id,
        createdAt: newNotification.created_at
      }
    });

  } catch (error) {
    console.error('Error creating notification:', error);
    res.status(500).json({ error: 'Failed to create notification' });
  }
});

// Mark notification as read
router.put('/:id/read', async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    // Check if notification exists and user has permission
    const notificationResult = await pool.query('SELECT * FROM notifications WHERE id = $1', [id]);
    if (notificationResult.rows.length === 0) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    const notification = notificationResult.rows[0];
    
    // Permission check
    if (req.user?.role !== 'admin' && req.user?.id !== notification.user_id) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    // Mark as read
    const result = await pool.query(
      'UPDATE notifications SET read = true, updated_at = NOW() WHERE id = $1 RETURNING *',
      [id]
    );

    // Log activity
    await logActivity(req.user!.id, 'notification_read', 'notification', id, req);

    const updatedNotification = result.rows[0];
    res.json({
      notification: {
        ...updatedNotification,
        userId: updatedNotification.user_id,
        createdAt: updatedNotification.created_at
      }
    });

  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ error: 'Failed to mark notification as read' });
  }
});

// Delete notification
router.delete('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    // Check if notification exists and user has permission
    const notificationResult = await pool.query('SELECT * FROM notifications WHERE id = $1', [id]);
    if (notificationResult.rows.length === 0) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    const notification = notificationResult.rows[0];
    
    // Permission check
    if (req.user?.role !== 'admin' && req.user?.id !== notification.user_id) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    // Delete notification
    await pool.query('DELETE FROM notifications WHERE id = $1', [id]);

    // Log activity
    await logActivity(req.user!.id, 'notification_deleted', 'notification', id, req);

    res.json({ message: 'Notification deleted successfully' });

  } catch (error) {
    console.error('Error deleting notification:', error);
    res.status(500).json({ error: 'Failed to delete notification' });
  }
});

export default router;