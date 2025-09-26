-- JobManager Pro - Simple Data Insert (No Deletions)
-- Run this in Supabase SQL Editor to add correct demo data

-- Insert businesses with proper UUIDs (will skip if already exists)
INSERT INTO businesses (id, name, address, phone, email, features, subscription) VALUES
  ('550e8400-e29b-41d4-a716-446655440001', 'ABC Construction Co.', '123 Main Street, City, State 12345', '+1 (555) 123-4567', 'contact@abcconstruction.com', ARRAY['job_management', 'calendar', 'reports', 'camera', 'ar_viewer'], 'premium'),
  ('550e8400-e29b-41d4-a716-446655440002', 'XYZ Electrical Services', '456 Oak Avenue, Town, State 67890', '+1 (555) 987-6543', 'info@xyzelectrical.com', ARRAY['job_management', 'calendar'], 'basic')
ON CONFLICT (id) DO NOTHING;

-- Insert users with proper UUIDs (will skip if already exists)
INSERT INTO users (id, email, name, role, business_id, permissions, is_active, email_verified) VALUES
  ('550e8400-e29b-41d4-a716-446655440003', 'admin@platform.com', 'Platform Admin', 'admin', null, ARRAY['all'], true, true),
  ('550e8400-e29b-41d4-a716-446655440004', 'business@company.com', 'Business Manager', 'business', '550e8400-e29b-41d4-a716-446655440001', ARRAY['manage_employees', 'view_dashboard', 'create_jobs'], true, true),
  ('550e8400-e29b-41d4-a716-446655440005', 'employee@company.com', 'Field Employee', 'employee', '550e8400-e29b-41d4-a716-446655440001', ARRAY['create_jobs', 'manage_tasks', 'capture_signatures'], true, true)
ON CONFLICT (email) DO NOTHING;

-- Update business admin references
UPDATE businesses SET admin_id = '550e8400-e29b-41d4-a716-446655440004' WHERE id = '550e8400-e29b-41d4-a716-446655440001';

-- Insert customers (will skip if already exists)
INSERT INTO customers (id, name, email, phone, mobile, address, postcode, business_id) VALUES
  ('550e8400-e29b-41d4-a716-446655440006', 'ABC Corp', 'contact@abccorp.com', '+1 (555) 111-2222', '+1 (555) 111-3333', '123 Business Ave, City, State', '12345', '550e8400-e29b-41d4-a716-446655440001'),
  ('550e8400-e29b-41d4-a716-446655440007', 'XYZ Ltd', 'info@xyzltd.com', '+1 (555) 333-4444', '+1 (555) 333-5555', '456 Commerce St, Town, State', '67890', '550e8400-e29b-41d4-a716-446655440001')
ON CONFLICT (id) DO NOTHING;

-- Insert products (will skip if already exists)
INSERT INTO products (id, name, category, description, image, specifications, price, is_active) VALUES
  ('550e8400-e29b-41d4-a716-446655440008', 'Industrial HVAC Unit', 'HVAC Systems', 'High-efficiency commercial HVAC system', 'https://images.pexels.com/photos/8293778/pexels-photo-8293778.jpeg?auto=compress&cs=tinysrgb&w=400', ARRAY['Cooling Capacity: 5 Tons', 'Heating Capacity: 120,000 BTU', 'Energy Rating: SEER 16'], 2500, true),
  ('550e8400-e29b-41d4-a716-446655440009', 'Electrical Panel Box', 'Electrical', '200A main electrical panel with breakers', 'https://images.pexels.com/photos/257736/pexels-photo-257736.jpeg?auto=compress&cs=tinysrgb&w=400', ARRAY['Amperage: 200A', 'Voltage: 240V', 'Circuits: 40'], 450, true)
ON CONFLICT (id) DO NOTHING;

-- Insert jobs (will skip if already exists)
INSERT INTO jobs (id, title, description, status, customer_id, employee_id, business_id, scheduled_date, completed_date, quotation, invoice, checklist) VALUES
  ('JOB-001', 'HVAC Installation', 'Install new HVAC system in office building', 'completed', '550e8400-e29b-41d4-a716-446655440006', '550e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440001', '2024-01-15T09:00:00Z', '2024-01-15T16:30:00Z', 2500, 2500, '[{"id": "1", "text": "Site inspection", "completed": true}, {"id": "2", "text": "Equipment delivery", "completed": true}, {"id": "3", "text": "Installation", "completed": true}, {"id": "4", "text": "Testing", "completed": true}]'),
  ('JOB-002', 'Electrical Maintenance', 'Routine electrical system maintenance', 'in-progress', '550e8400-e29b-41d4-a716-446655440007', '550e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440001', '2024-01-16T14:00:00Z', null, 800, null, '[{"id": "1", "text": "Safety check", "completed": true}, {"id": "2", "text": "Component inspection", "completed": true}, {"id": "3", "text": "Repairs", "completed": false}, {"id": "4", "text": "Final testing", "completed": false}]')
ON CONFLICT (id) DO NOTHING;

-- Insert notifications (will skip if already exists)
INSERT INTO notifications (id, user_id, title, message, type, read) VALUES
  ('550e8400-e29b-41d4-a716-44665544000a', '550e8400-e29b-41d4-a716-446655440005', 'Welcome to JobManager Pro', 'Your account has been set up successfully!', 'system', false),
  ('550e8400-e29b-41d4-a716-44665544000b', '550e8400-e29b-41d4-a716-446655440005', 'New Job Assignment', 'You have been assigned to JOB-002: Electrical Maintenance', 'job', false)
ON CONFLICT (id) DO NOTHING;

-- Insert initial module access for admin
INSERT INTO module_access (user_id, module_name, can_access, can_grant_access, granted_by) VALUES
  ('550e8400-e29b-41d4-a716-446655440003', 'ar-camera', true, true, '550e8400-e29b-41d4-a716-446655440003')
ON CONFLICT (user_id, module_name) DO NOTHING;

-- Verify the data was inserted correctly
SELECT 'Users created:' as info, count(*) as count FROM users;
SELECT 'Businesses created:' as info, count(*) as count FROM businesses;
SELECT 'Jobs created:' as info, count(*) as count FROM jobs;
SELECT 'Customers created:' as info, count(*) as count FROM customers;
SELECT 'Products created:' as info, count(*) as count FROM products;
SELECT 'Notifications created:' as info, count(*) as count FROM notifications;

-- Test the foreign key relationships work
SELECT 
  u.name as user_name, 
  u.role,
  b.name as business_name
FROM users u 
LEFT JOIN businesses b ON u.business_id = b.id
LIMIT 5;