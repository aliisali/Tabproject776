-- JobManager Pro - Insert Demo Data Only
-- Run this in Supabase SQL Editor

-- Insert businesses (will skip if already exists)
INSERT INTO businesses (id, name, address, phone, email, features, subscription) VALUES
  ('550e8400-e29b-41d4-a716-446655440001', 'ABC Construction Co.', '123 Main Street, City, State 12345', '+1 (555) 123-4567', 'contact@abcconstruction.com', ARRAY['job_management', 'calendar', 'reports', 'camera'], 'premium'),
  ('550e8400-e29b-41d4-a716-446655440002', 'XYZ Electrical Services', '456 Oak Avenue, Town, State 67890', '+1 (555) 987-6543', 'info@xyzelectrical.com', ARRAY['job_management', 'calendar'], 'basic')
ON CONFLICT (id) DO NOTHING;

-- Insert users (will skip if already exists)
INSERT INTO users (id, email, name, role, business_id, permissions, is_active, email_verified) VALUES
  ('550e8400-e29b-41d4-a716-446655440003', 'admin@platform.com', 'Platform Admin', 'admin', null, ARRAY['all'], true, true),
  ('550e8400-e29b-41d4-a716-446655440004', 'business@company.com', 'Business Manager', 'business', '550e8400-e29b-41d4-a716-446655440001', ARRAY['manage_employees', 'view_dashboard', 'create_jobs'], true, true),
  ('550e8400-e29b-41d4-a716-446655440005', 'employee@company.com', 'Field Employee', 'employee', '550e8400-e29b-41d4-a716-446655440001', ARRAY['create_jobs', 'manage_tasks', 'capture_signatures'], true, true)
ON CONFLICT (email) DO NOTHING;

-- Update business admin references
UPDATE businesses SET admin_id = '550e8400-e29b-41d4-a716-446655440004' WHERE id = '550e8400-e29b-41d4-a716-446655440001';

-- Insert customers (will skip if already exists)
INSERT INTO customers (id, name, email, phone, mobile, address, postcode, business_id) VALUES
  ('550e8400-e29b-41d4-a716-446655440006', 'ABC Corp', 'contact@abccorp.com', '+1 (555) 111-2222', '+1 (555) 111-3333', '123 Business Ave, City, State', '12345', '550e8400-e29b-41d4-a716-446655440001')
ON CONFLICT (id) DO NOTHING;

-- Insert products (will skip if already exists)
INSERT INTO products (id, name, category, description, image, specifications, price, is_active) VALUES
  ('550e8400-e29b-41d4-a716-446655440008', 'Industrial HVAC Unit', 'HVAC Systems', 'High-efficiency commercial HVAC system', 'https://images.pexels.com/photos/8293778/pexels-photo-8293778.jpeg?auto=compress&cs=tinysrgb&w=400', ARRAY['Cooling Capacity: 5 Tons', 'Heating Capacity: 120,000 BTU', 'Energy Rating: SEER 16'], 2500, true)
ON CONFLICT (id) DO NOTHING;

-- Insert jobs (will skip if already exists)
INSERT INTO jobs (id, title, description, status, customer_id, employee_id, business_id, scheduled_date, completed_date, quotation, invoice, checklist) VALUES
  ('JOB-001', 'HVAC Installation', 'Install new HVAC system in office building', 'completed', '550e8400-e29b-41d4-a716-446655440006', '550e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440001', '2024-01-15T09:00:00Z', '2024-01-15T16:30:00Z', 2500, 2500, '[{"id": "1", "text": "Site inspection", "completed": true}, {"id": "2", "text": "Equipment delivery", "completed": true}]')
ON CONFLICT (id) DO NOTHING;

-- Insert notifications (will skip if already exists)
INSERT INTO notifications (id, user_id, title, message, type, read) VALUES
  ('550e8400-e29b-41d4-a716-44665544000a', '550e8400-e29b-41d4-a716-446655440005', 'Welcome to JobManager Pro', 'Your account has been set up successfully!', 'system', false)
ON CONFLICT (id) DO NOTHING;

-- Verify data was inserted
SELECT 'Setup complete!' as status;
SELECT count(*) as user_count FROM users;
SELECT count(*) as business_count FROM businesses;