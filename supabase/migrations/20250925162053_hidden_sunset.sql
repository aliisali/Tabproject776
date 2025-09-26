/*
  # Job Management Platform Database Schema

  1. New Tables
    - `users` - User accounts with roles (admin, business, employee)
    - `businesses` - Business information and settings
    - `jobs` - Job records with status tracking
    - `customers` - Customer information
    - `products` - Product catalog for AR visualization
    - `notifications` - User notifications

  2. Security
    - Enable RLS on all tables
    - Add policies for role-based access control

  3. Features
    - User authentication and authorization
    - Business management with multi-tenancy
    - Job tracking and management
    - Customer relationship management
    - Product catalog management
    - Notification system
*/

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  email text UNIQUE NOT NULL,
  name text NOT NULL,
  role text NOT NULL CHECK (role IN ('admin', 'business', 'employee')),
  business_id uuid REFERENCES businesses(id),
  permissions text[] DEFAULT '{}',
  is_active boolean DEFAULT true,
  email_verified boolean DEFAULT false,
  verification_token text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Businesses table
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

-- Jobs table
CREATE TABLE IF NOT EXISTS jobs (
  id text PRIMARY KEY,
  title text NOT NULL,
  description text NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'in-progress', 'completed', 'cancelled')),
  customer_id uuid REFERENCES customers(id),
  employee_id uuid REFERENCES users(id),
  business_id uuid REFERENCES businesses(id),
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

-- Customers table
CREATE TABLE IF NOT EXISTS customers (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  email text,
  phone text,
  mobile text,
  address text NOT NULL,
  postcode text NOT NULL,
  business_id uuid REFERENCES businesses(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Products table
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

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES users(id),
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

-- Users policies
CREATE POLICY "Users can read own data" ON users
  FOR SELECT TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Admins can read all users" ON users
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Business users can read employees" ON users
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND role = 'business' 
      AND business_id = users.business_id
    )
  );

-- Businesses policies
CREATE POLICY "Business admins can read own business" ON businesses
  FOR SELECT TO authenticated
  USING (
    admin_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Jobs policies
CREATE POLICY "Users can read jobs in their business" ON jobs
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND (
        role = 'admin' OR
        business_id = jobs.business_id OR
        id = jobs.employee_id
      )
    )
  );

-- Customers policies
CREATE POLICY "Users can read customers in their business" ON customers
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND (
        role = 'admin' OR
        business_id = customers.business_id
      )
    )
  );

-- Products policies
CREATE POLICY "All authenticated users can read products" ON products
  FOR SELECT TO authenticated
  USING (is_active = true);

CREATE POLICY "Admins can manage products" ON products
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Notifications policies
CREATE POLICY "Users can read own notifications" ON notifications
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

-- Insert policies for data creation
CREATE POLICY "Admins can insert users" ON users
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Business users can insert employees" ON users
  FOR INSERT TO authenticated
  WITH CHECK (
    role = 'employee' AND
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND role = 'business' 
      AND business_id = users.business_id
    )
  );

CREATE POLICY "Admins can insert businesses" ON businesses
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Business users can insert jobs" ON jobs
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND (
        role = 'admin' OR
        (role IN ('business', 'employee') AND business_id = jobs.business_id)
      )
    )
  );

CREATE POLICY "Business users can insert customers" ON customers
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND (
        role = 'admin' OR
        (role = 'business' AND business_id = customers.business_id)
      )
    )
  );

-- Update triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_businesses_updated_at BEFORE UPDATE ON businesses
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_jobs_updated_at BEFORE UPDATE ON jobs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON customers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_notifications_updated_at BEFORE UPDATE ON notifications
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert some initial data
INSERT INTO businesses (id, name, address, phone, email, admin_id, features, subscription) VALUES
  ('550e8400-e29b-41d4-a716-446655440001', 'ABC Construction Co.', '123 Main Street, City, State 12345', '+1 (555) 123-4567', 'contact@abcconstruction.com', null, ARRAY['job_management', 'calendar', 'reports', 'camera', 'ar_viewer'], 'premium'),
  ('550e8400-e29b-41d4-a716-446655440002', 'XYZ Electrical Services', '456 Oak Avenue, Town, State 67890', '+1 (555) 987-6543', 'info@xyzelectrical.com', null, ARRAY['job_management', 'calendar'], 'basic')
ON CONFLICT (id) DO NOTHING;

INSERT INTO users (id, email, name, role, business_id, permissions, is_active, email_verified) VALUES
  ('550e8400-e29b-41d4-a716-446655440003', 'admin@platform.com', 'Platform Admin', 'admin', null, ARRAY['all'], true, true),
  ('550e8400-e29b-41d4-a716-446655440004', 'business@company.com', 'Business Manager', 'business', '550e8400-e29b-41d4-a716-446655440001', ARRAY['manage_employees', 'view_dashboard', 'create_jobs'], true, true),
  ('550e8400-e29b-41d4-a716-446655440005', 'employee@company.com', 'Field Employee', 'employee', '550e8400-e29b-41d4-a716-446655440001', ARRAY['create_jobs', 'manage_tasks', 'capture_signatures'], true, true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO customers (id, name, email, phone, mobile, address, postcode, business_id) VALUES
  ('550e8400-e29b-41d4-a716-446655440006', 'ABC Corp', 'contact@abccorp.com', '+1 (555) 111-2222', '+1 (555) 111-3333', '123 Business Ave, City, State', '12345', '550e8400-e29b-41d4-a716-446655440001'),
  ('550e8400-e29b-41d4-a716-446655440007', 'XYZ Ltd', 'info@xyzltd.com', '+1 (555) 333-4444', '+1 (555) 333-5555', '456 Commerce St, Town, State', '67890', '550e8400-e29b-41d4-a716-446655440001')
ON CONFLICT (id) DO NOTHING;

INSERT INTO products (id, name, category, description, image, specifications, price, is_active) VALUES
  ('550e8400-e29b-41d4-a716-446655440008', 'Industrial HVAC Unit', 'HVAC', 'High-efficiency commercial HVAC system', 'https://images.pexels.com/photos/8293778/pexels-photo-8293778.jpeg?auto=compress&cs=tinysrgb&w=400', ARRAY['Cooling Capacity: 5 Tons', 'Heating Capacity: 120,000 BTU', 'Energy Rating: SEER 16'], 2500, true),
  ('550e8400-e29b-41d4-a716-446655440009', 'Electrical Panel Box', 'Electrical', '200A main electrical panel with breakers', 'https://images.pexels.com/photos/257736/pexels-photo-257736.jpeg?auto=compress&cs=tinysrgb&w=400', ARRAY['Amperage: 200A', 'Voltage: 240V', 'Circuits: 40'], 450, true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO jobs (id, title, description, status, customer_id, employee_id, business_id, scheduled_date, completed_date, quotation, invoice, checklist) VALUES
  ('JOB-001', 'HVAC Installation', 'Install new HVAC system in office building', 'completed', '550e8400-e29b-41d4-a716-446655440006', '550e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440001', '2024-01-15T09:00:00Z', '2024-01-15T16:30:00Z', 2500, 2500, '[{"id": "1", "text": "Site inspection", "completed": true}, {"id": "2", "text": "Equipment delivery", "completed": true}, {"id": "3", "text": "Installation", "completed": true}, {"id": "4", "text": "Testing", "completed": true}]'),
  ('JOB-002', 'Electrical Maintenance', 'Routine electrical system maintenance', 'in-progress', '550e8400-e29b-41d4-a716-446655440007', '550e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440001', '2024-01-16T14:00:00Z', null, 800, null, '[{"id": "1", "text": "Safety check", "completed": true}, {"id": "2", "text": "Component inspection", "completed": true}, {"id": "3", "text": "Repairs", "completed": false}, {"id": "4", "text": "Final testing", "completed": false}]')
ON CONFLICT (id) DO NOTHING;

INSERT INTO notifications (id, user_id, title, message, type, read) VALUES
  ('550e8400-e29b-41d4-a716-44665544000a', '550e8400-e29b-41d4-a716-446655440005', 'New Job Assignment', 'You have been assigned to JOB-003: Plumbing Repair', 'job', false),
  ('550e8400-e29b-41d4-a716-44665544000b', '550e8400-e29b-41d4-a716-446655440005', 'Reminder: Submit Timesheet', 'Don''t forget to submit your timesheet for this week', 'reminder', false)
ON CONFLICT (id) DO NOTHING;