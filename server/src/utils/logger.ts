import { Request } from 'express';
import * as process from 'process';
import { pool } from '../server';

export const logActivity = async (
  userId: string,
  action: string,
  targetType: string,
  targetId: string,
  req: Request,
  details?: any
) => {
  try {
    await pool.query(
      `INSERT INTO activity_logs (user_id, action, target_type, target_id, details, ip_address, user_agent)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [
        userId,
        action,
        targetType,
        targetId,
        details ? JSON.stringify(details) : null,
        req.ip,
        req.get('User-Agent')
      ]
    );
  } catch (error) {
    console.error('Error logging activity:', error);
  }
};