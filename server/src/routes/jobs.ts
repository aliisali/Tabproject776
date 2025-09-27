import express from 'express';
import { body, validationResult } from 'express-validator';
import { pool } from '../server';
import { AuthRequest } from '../middleware/auth';
import { logActivity } from '../utils/logger';

const router = express.Router();

// Get jobs (filtered by user role)
router.get('/', async (req: AuthRequest, res) => {
  try {
    let query = `
      SELECT j.*, c.name as customer_name, u.name as employee_name, b.name as business_name
      FROM jobs j
      LEFT JOIN customers c ON j.customer_id = c.id
      LEFT JOIN users u ON j.employee_id = u.id
      LEFT JOIN businesses b ON j.business_id = b.id
    `;
    let params: any[] = [];

    // Filter based on user role
    if (req.user?.role === 'business') {
      query += ' WHERE j.business_id = $1';
      params = [req.user.businessId];
    } else if (req.user?.role === 'employee') {
      query += ' WHERE (j.business_id = $1 OR j.employee_id = $2)';
      params = [req.user.businessId, req.user.id];
    }

    query += ' ORDER BY j.scheduled_date DESC';

    const result = await pool.query(query, params);

    const jobs = result.rows.map(job => ({
      ...job,
      customerId: job.customer_id,
      employeeId: job.employee_id,
      businessId: job.business_id,
      scheduledDate: job.scheduled_date,
      completedDate: job.completed_date,
      customerName: job.customer_name,
      employeeName: job.employee_name,
      businessName: job.business_name
    }));

    res.json(jobs);
  } catch (error) {
    console.error('Error fetching jobs:', error);
    res.status(500).json({ error: 'Failed to fetch jobs' });
  }
});

// Create job
router.post('/', [
  body('title').isLength({ min: 2 }),
  body('description').isLength({ min: 5 }),
  body('customerId').isUUID(),
  body('scheduledDate').isISO8601()
], async (req: AuthRequest, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      title,
      description,
      customerId,
      employeeId,
      scheduledDate,
      quotation,
      checklist = []
    } = req.body;

    // Generate job ID
    const jobId = `JOB-${Date.now().toString().slice(-6)}`;

    // Use user's business ID
    const businessId = req.user?.businessId;

    const result = await pool.query(
      `INSERT INTO jobs (id, title, description, customer_id, employee_id, business_id, scheduled_date, quotation, checklist)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
      [jobId, title, description, customerId, employeeId, businessId, scheduledDate, quotation, JSON.stringify(checklist)]
    );

    const newJob = result.rows[0];
    
    // Log activity
    await logActivity(req.user!.id, 'job_created', 'job', newJob.id, req);

    res.status(201).json({
      job: {
        ...newJob,
        customerId: newJob.customer_id,
        employeeId: newJob.employee_id,
        businessId: newJob.business_id,
        scheduledDate: newJob.scheduled_date,
        completedDate: newJob.completed_date
      }
    });

  } catch (error) {
    console.error('Error creating job:', error);
    res.status(500).json({ error: 'Failed to create job' });
  }
});

// Update job
router.put('/:id', async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Check if user can update this job
    const jobResult = await pool.query('SELECT * FROM jobs WHERE id = $1', [id]);
    if (jobResult.rows.length === 0) {
      return res.status(404).json({ error: 'Job not found' });
    }

    const job = jobResult.rows[0];
    
    // Permission check
    if (req.user?.role !== 'admin' && 
        req.user?.businessId !== job.business_id && 
        req.user?.id !== job.employee_id) {
      return res.status(403).json({ error: 'Insufficient permissions' });
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

    const query = `UPDATE jobs SET ${updateFields.join(', ')} WHERE id = $${paramCount} RETURNING *`;
    const result = await pool.query(query, values);

    // Log activity
    await logActivity(req.user!.id, 'job_updated', 'job', id, req);

    const updatedJob = result.rows[0];
    res.json({
      job: {
        ...updatedJob,
        customerId: updatedJob.customer_id,
        employeeId: updatedJob.employee_id,
        businessId: updatedJob.business_id,
        scheduledDate: updatedJob.scheduled_date,
        completedDate: updatedJob.completed_date
      }
    });

  } catch (error) {
    console.error('Error updating job:', error);
    res.status(500).json({ error: 'Failed to update job' });
  }
});

// Delete job
router.delete('/:id', async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;

    // Check if job exists and user has permission
    const jobResult = await pool.query('SELECT * FROM jobs WHERE id = $1', [id]);
    if (jobResult.rows.length === 0) {
      return res.status(404).json({ error: 'Job not found' });
    }

    const job = jobResult.rows[0];
    
    // Permission check
    if (req.user?.role !== 'admin' && req.user?.businessId !== job.business_id) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    // Delete job
    await pool.query('DELETE FROM jobs WHERE id = $1', [id]);

    // Log activity
    await logActivity(req.user!.id, 'job_deleted', 'job', id, req);

    res.json({ message: 'Job deleted successfully' });

  } catch (error) {
    console.error('Error deleting job:', error);
    res.status(500).json({ error: 'Failed to delete job' });
  }
});

export default router;