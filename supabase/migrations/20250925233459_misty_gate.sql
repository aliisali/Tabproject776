/*
  # Fix UUID Data Issues - JobManager Pro

  This migration fixes UUID format issues in the database by:
  1. Cleaning up any existing data with invalid UUIDs
  2. Inserting proper demo data with correct UUID format
  3. Ensuring all foreign key relationships work correctly

  Run this in your Supabase SQL Editor to fix the UUID issues.
*/

-- First, clean up any existing data that might have invalid UUIDs
DELETE FROM activity_logs WHERE user_id IN ('1', '2', '3', 'admin', 'business', 'employee');
DELETE FROM user_sessions WHERE user_id IN ('1', '2', '3', 'admin', 'business', 'employee');
DELETE FROM user_hierarchy WHERE parent_id IN ('1', '2', '3', 'admin', 'business', 'employee') OR child_id IN ('1', '2', '3', 'admin', 'business', 'employee');
DELETE FROM module_access WHERE user_id IN ('1', '2', '3', 'admin', 'business', 'employee');
DELETE FROM user_permissions WHERE user_id IN ('1', '2', '3', 'admin', 'business', 'employee');
DELETE FROM notifications WHERE user_id IN ('1', '2', '3', 'admin', 'business', 'employee');
DELETE FROM jobs WHERE id IN ('1', '2', '3') OR customer_id IN ('1', '2', '3') OR employee_id IN ('1', '2', '3', 'admin', 'business', 'employee') OR business_id IN ('1', '2', '3', 'business-1');
DELETE FROM customers WHERE id IN ('1', '2', '3', 'customer-1') OR business_id IN ('1', '2', '3', 'business-1');
DELETE FROM products WHERE id IN ('1', '2', '3', 'product-1');
DELETE FROM users WHERE id IN ('1', '2', '3', 'admin', 'business', 'employee');
DELETE FROM businesses WHERE id IN ('1', '2', '3', 'business-1');

-- Insert businesses with proper UUIDs
INSERT INTO businesses (id, name, address, phone, email, features, subscription) VALUES
  ('550e8400-e29b-41d4-a716-446655440001', 'ABC Construction Co.', '123 Main Street, City, State 12345', '+1 (555) 123-4567', 'contact@abcconstruction.com', ARRAY['job_management', 'calendar', 'reports', 'camera', 'ar_viewer'], 'premium'),
  ('550e8400-e29b-41d4-a716-446655440002', 'XYZ Electrical Services', '456 Oak Avenue, Town, State 67890', '+1 (555) 987-6543', 'info@xyzelectrical.com', ARRAY['job_management', 'calendar'], 'basic')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  address = EXCLUDED.address,
  phone = EXCLUDED.phone,
  email = EXCLUDED.email,
  features = EXCLUDED.features,
  subscription = EXCLUDED.subscription;

-- Insert users with proper UUIDs and relationships
INSERT INTO users (id, email, name, role, business_id, permissions, is_active, email_verified) VALUES
  ('550e8400-e29b-41d4-a716-446655440003', 'admin@platform.com', 'Platform Admin', 'admin', null, ARRAY['all'], true, true),
  ('550e8400-e29b-41d4-a716-446655440004', 'business@company.com', 'Business Manager', 'business', '550e8400-e29b-41d4-a716-446655440001', ARRAY['manage_employees', 'view_dashboard', 'create_jobs'], true, true),
  ('550e8400-e29b-41d4-a716-446655440005', 'employee@company.com', 'Field Employee', 'employee', '550e8400-e29b-41d4-a716-446655440001', ARRAY['create_jobs', 'manage_tasks', 'capture_signatures'], true, true)
ON CONFLICT (email) DO UPDATE SET
  name = EXCLUDED.name,
  role = EXCLUDED.role,
  business_id = EXCLUDED.business_id,
  permissions = EXCLUDED.permissions,
  is_active = EXCLUDED.is_active,
  email_verified = EXCLUDED.email_verified;

-- Update business admin_id references
UPDATE businesses SET admin_id = '550e8400-e29b-41d4-a716-446655440004' WHERE id = '550e8400-e29b-41d4-a716-446655440001';
UPDATE businesses SET admin_id = '550e8400-e29b-41d4-a716-446655440004' WHERE id = '550e8400-e29b-41d4-a716-446655440002';

-- Insert customers with proper UUIDs
INSERT INTO customers (id, name, email, phone, mobile, address, postcode, business_id) VALUES
  ('550e8400-e29b-41d4-a716-446655440006', 'ABC Corp', 'contact@abccorp.com', '+1 (555) 111-2222', '+1 (555) 111-3333', '123 Business Ave, City, State', '12345', '550e8400-e29b-41d4-a716-446655440001'),
  ('550e8400-e29b-41d4-a716-446655440007', 'XYZ Ltd', 'info@xyzltd.com', '+1 (555) 333-4444', '+1 (555) 333-5555', '456 Commerce St, Town, State', '67890', '550e8400-e29b-41d4-a716-446655440001')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  email = EXCLUDED.email,
  phone = EXCLUDED.phone,
  mobile = EXCLUDED.mobile,
  address = EXCLUDED.address,
  postcode = EXCLUDED.postcode,
  business_id = EXCLUDED.business_id;

-- Insert products with proper UUIDs
INSERT INTO products (id, name, category, description, image, specifications, price, is_active) VALUES
  ('550e8400-e29b-41d4-a716-446655440008', 'Industrial HVAC Unit', 'HVAC Systems', 'High-efficiency commercial HVAC system', 'https://images.pexels.com/photos/8293778/pexels-photo-8293778.jpeg?auto=compress&cs=tinysrgb&w=400', ARRAY['Cooling Capacity: 5 Tons', 'Heating Capacity: 120,000 BTU', 'Energy Rating: SEER 16'], 2500, true),
  ('550e8400-e29b-41d4-a716-446655440009', 'Electrical Panel Box', 'Electrical', '200A main electrical panel with breakers', 'https://images.pexels.com/photos/257736/pexels-photo-257736.jpeg?auto=compress&cs=tinysrgb&w=400', ARRAY['Amperage: 200A', 'Voltage: 240V', 'Circuits: 40'], 450, true)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  category = EXCLUDED.category,
  description = EXCLUDED.description,
  image = EXCLUDED.image,
  specifications = EXCLUDED.specifications,
  price = EXCLUDED.price,
  is_active = EXCLUDED.is_active;

-- Insert jobs with proper UUIDs
INSERT INTO jobs (id, title, description, status, customer_id, employee_id, business_id, scheduled_date, completed_date, quotation, invoice, checklist) VALUES
  ('JOB-001', 'HVAC Installation', 'Install new HVAC system in office building', 'completed', '550e8400-e29b-41d4-a716-446655440006', '550e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440001', '2024-01-15T09:00:00Z', '2024-01-15T16:30:00Z', 2500, 2500, '[{"id": "1", "text": "Site inspection", "completed": true}, {"id": "2", "text": "Equipment delivery", "completed": true}, {"id": "3", "text": "Installation", "completed": true}, {"id": "4", "text": "Testing", "completed": true}]'),
  ('JOB-002', 'Electrical Maintenance', 'Routine electrical system maintenance', 'in-progress', '550e8400-e29b-41d4-a716-446655440007', '550e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440001', '2024-01-16T14:00:00Z', null, 800, null, '[{"id": "1", "text": "Safety check", "completed": true}, {"id": "2", "text": "Component inspection", "completed": true}, {"id": "3", "text": "Repairs", "completed": false}, {"id": "4", "text": "Final testing", "completed": false}]')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  status = EXCLUDED.status,
  customer_id = EXCLUDED.customer_id,
  employee_id = EXCLUDED.employee_id,
  business_id = EXCLUDED.business_id,
  scheduled_date = EXCLUDED.scheduled_date,
  completed_date = EXCLUDED.completed_date,
  quotation = EXCLUDED.quotation,
  invoice = EXCLUDED.invoice,
  checklist = EXCLUDED.checklist;

-- Insert notifications with proper UUIDs
INSERT INTO notifications (id, user_id, title, message, type, read) VALUES
  ('550e8400-e29b-41d4-a716-44665544000a', '550e8400-e29b-41d4-a716-446655440005', 'Welcome to JobManager Pro', 'Your account has been set up successfully!', 'system', false),
  ('550e8400-e29b-41d4-a716-44665544000b', '550e8400-e29b-41d4-a716-446655440005', 'New Job Assignment', 'You have been assigned to JOB-002: Electrical Maintenance', 'job', false)
ON CONFLICT (id) DO UPDATE SET
  user_id = EXCLUDED.user_id,
  title = EXCLUDED.title,
  message = EXCLUDED.message,
  type = EXCLUDED.type,
  read = EXCLUDED.read;

-- Insert initial module access for admin users
INSERT INTO module_access (user_id, module_name, can_access, can_grant_access, granted_by) VALUES
  ('550e8400-e29b-41d4-a716-446655440003', 'ar-camera', true, true, '550e8400-e29b-41d4-a716-446655440003')
ON CONFLICT (user_id, module_name) DO UPDATE SET
  can_access = EXCLUDED.can_access,
  can_grant_access = EXCLUDED.can_grant_access,
  granted_by = EXCLUDED.granted_by,
  granted_at = now(),
  is_active = true;

-- Verify the data was inserted correctly
SELECT 'Users created:' as info, count(*) as count FROM users;
SELECT 'Businesses created:' as info, count(*) as count FROM businesses;
SELECT 'Jobs created:' as info, count(*) as count FROM jobs;
SELECT 'Customers created:' as info, count(*) as count FROM customers;
SELECT 'Products created:' as info, count(*) as count FROM products;
SELECT 'Notifications created:' as info, count(*) as count FROM notifications;

-- Test the foreign key relationships
SELECT 
  u.name as user_name, 
  u.role,
  p.name as parent_name,
  b.name as business_name
FROM users u 
LEFT JOIN users p ON u.parent_id = p.id
LEFT JOIN businesses b ON u.business_id = b.id;