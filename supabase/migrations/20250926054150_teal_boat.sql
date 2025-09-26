-- JobManager Pro - Complete Database Setup for Live Deployment
-- Copy and run this entire script in your Supabase SQL Editor

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create businesses table
CREATE TABLE IF NOT EXISTS businesses (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  address text NOT NULL,
  phone text NOT NULL,
  email text NOT NULL,
  admin_id uuid,
  features text[] DEFAULT '{}',
  subscription text DEFAULT 'basic' CHECK (subscription IN ('basic', 'premium', 'enterprise')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  email text UNIQUE NOT NULL,
  name text NOT NULL,
  role text NOT NULL CHECK (role IN ('admin', 'business', 'employee')),
  business_id uuid REFERENCES businesses(id) ON DELETE SET NULL,
  parent_id uuid REFERENCES users(id) ON DELETE SET NULL,
  created_by uuid REFERENCES users(id) ON DELETE SET NULL,
  permissions text[] DEFAULT '{}',
  is_active boolean DEFAULT true,
  email_verified boolean DEFAULT false,
  verification_token text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Add foreign key for businesses.admin_id
ALTER TABLE businesses 
ADD CONSTRAINT businesses_admin_id_fkey 
FOREIGN KEY (admin_id) REFERENCES users(id) ON DELETE SET NULL;

-- Create customers table
CREATE TABLE IF NOT EXISTS customers (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  email text,
  phone text,
  mobile text,
  address text NOT NULL,
  postcode text NOT NULL,
  business_id uuid REFERENCES businesses(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create jobs table
CREATE TABLE IF NOT EXISTS jobs (
  id text PRIMARY KEY,
  title text NOT NULL,
  description text NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'in-progress', 'completed', 'cancelled')),
  customer_id uuid REFERENCES customers(id) ON DELETE SET NULL,
  employee_id uuid REFERENCES users(id) ON DELETE SET NULL,
  business_id uuid REFERENCES businesses(id) ON DELETE CASCADE,
  scheduled_date timestamptz NOT NULL,
  completed_date timestamptz,
  quotation numeric DEFAULT 0,
  invoice numeric DEFAULT 0,
  signature text,
  images text[] DEFAULT '{}',
  documents text[] DEFAULT '{}',
  checklist jsonb DEFAULT '[]',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create products table
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  category text NOT NULL,
  description text NOT NULL,
  image text NOT NULL,
  model_3d text,
  ar_model text,
  specifications text[] DEFAULT '{}',
  price numeric NOT NULL DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  title text NOT NULL,
  message text NOT NULL,
  type text DEFAULT 'system' CHECK (type IN ('reminder', 'job', 'system')),
  read boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Enable read access for all users" ON users FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated users only" ON users FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for users based on email" ON users FOR UPDATE USING (true);
CREATE POLICY "Enable delete for users based on email" ON users FOR DELETE USING (true);

CREATE POLICY "Enable read access for all users" ON businesses FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated users only" ON businesses FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for users based on email" ON businesses FOR UPDATE USING (true);
CREATE POLICY "Enable delete for users based on email" ON businesses FOR DELETE USING (true);

CREATE POLICY "Enable read access for all users" ON jobs FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated users only" ON jobs FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for users based on email" ON jobs FOR UPDATE USING (true);
CREATE POLICY "Enable delete for users based on email" ON jobs FOR DELETE USING (true);

CREATE POLICY "Enable read access for all users" ON customers FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated users only" ON customers FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for users based on email" ON customers FOR UPDATE USING (true);
CREATE POLICY "Enable delete for users based on email" ON customers FOR DELETE USING (true);

CREATE POLICY "Enable read access for all users" ON products FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated users only" ON products FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for users based on email" ON products FOR UPDATE USING (true);
CREATE POLICY "Enable delete for users based on email" ON products FOR DELETE USING (true);

CREATE POLICY "Enable read access for all users" ON notifications FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated users only" ON notifications FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for users based on email" ON notifications FOR UPDATE USING (true);
CREATE POLICY "Enable delete for users based on email" ON notifications FOR DELETE USING (true);

-- Insert demo data with proper UUIDs
INSERT INTO businesses (id, name, address, phone, email, features, subscription) VALUES
  ('550e8400-e29b-41d4-a716-446655440001', 'ABC Construction Co.', '123 Main Street, City, State 12345', '+1 (555) 123-4567', 'contact@abcconstruction.com', ARRAY['job_management', 'calendar', 'reports', 'camera'], 'premium')
ON CONFLICT (id) DO NOTHING;

INSERT INTO users (id, email, name, role, business_id, permissions, is_active, email_verified) VALUES
  ('550e8400-e29b-41d4-a716-446655440003', 'admin@platform.com', 'Platform Admin', 'admin', null, ARRAY['all'], true, true),
  ('550e8400-e29b-41d4-a716-446655440004', 'business@company.com', 'Business Manager', 'business', '550e8400-e29b-41d4-a716-446655440001', ARRAY['manage_employees', 'view_dashboard', 'create_jobs'], true, true),
  ('550e8400-e29b-41d4-a716-446655440005', 'employee@company.com', 'Field Employee', 'employee', '550e8400-e29b-41d4-a716-446655440001', ARRAY['create_jobs', 'manage_tasks', 'capture_signatures'], true, true)
ON CONFLICT (email) DO NOTHING;

UPDATE businesses SET admin_id = '550e8400-e29b-41d4-a716-446655440004' WHERE id = '550e8400-e29b-41d4-a716-446655440001';

INSERT INTO customers (id, name, email, phone, mobile, address, postcode, business_id) VALUES
  ('550e8400-e29b-41d4-a716-446655440006', 'ABC Corp', 'contact@abccorp.com', '+1 (555) 111-2222', '+1 (555) 111-3333', '123 Business Ave, City, State', '12345', '550e8400-e29b-41d4-a716-446655440001')
ON CONFLICT (id) DO NOTHING;

INSERT INTO products (id, name, category, description, image, specifications, price, is_active) VALUES
  ('550e8400-e29b-41d4-a716-446655440008', 'Industrial HVAC Unit', 'HVAC Systems', 'High-efficiency commercial HVAC system', 'https://images.pexels.com/photos/8293778/pexels-photo-8293778.jpeg?auto=compress&cs=tinysrgb&w=400', ARRAY['Cooling Capacity: 5 Tons', 'Heating Capacity: 120,000 BTU', 'Energy Rating: SEER 16'], 2500, true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO jobs (id, title, description, status, customer_id, employee_id, business_id, scheduled_date, completed_date, quotation, invoice, checklist) VALUES
  ('JOB-001', 'HVAC Installation', 'Install new HVAC system in office building', 'completed', '550e8400-e29b-41d4-a716-446655440006', '550e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440001', '2024-01-15T09:00:00Z', '2024-01-15T16:30:00Z', 2500, 2500, '[{"id": "1", "text": "Site inspection", "completed": true}, {"id": "2", "text": "Equipment delivery", "completed": true}]')
ON CONFLICT (id) DO NOTHING;

INSERT INTO notifications (id, user_id, title, message, type, read) VALUES
  ('550e8400-e29b-41d4-a716-44665544000a', '550e8400-e29b-41d4-a716-446655440005', 'Welcome to JobManager Pro', 'Your account has been set up successfully!', 'system', false)
ON CONFLICT (id) DO NOTHING;

-- Verify setup
SELECT 'Setup Complete!' as status;
SELECT 'Users created: ' || count(*) as result FROM users;
SELECT 'Businesses created: ' || count(*) as result FROM businesses;
SELECT 'Jobs created: ' || count(*) as result FROM jobs;