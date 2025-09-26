/*
  # JobManager Pro - Complete Database Setup
  
  Run this entire script in your Supabase SQL Editor to set up the complete database
  for the JobManager Pro application with all tables, relationships, and sample data.
  
  1. Tables Created:
    - users (with parent-child relationships)
    - businesses 
    - jobs
    - customers
    - products
    - notifications
    - user_permissions
    - module_access
    - user_hierarchy
    - activity_logs
    - user_sessions
  
  2. Security:
    - Row Level Security enabled on all tables
    - Proper access policies for each role
    - Secure parent-child relationships
  
  3. Sample Data:
    - Demo admin, business, and employee users
    - Sample businesses and customers
    - Example jobs and products
    - Initial notifications
*/

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing tables if they exist (in correct order to handle dependencies)
DROP TABLE IF EXISTS activity_logs CASCADE;
DROP TABLE IF EXISTS user_sessions CASCADE;
DROP TABLE IF EXISTS user_hierarchy CASCADE;
DROP TABLE IF EXISTS module_access CASCADE;
DROP TABLE IF EXISTS user_permissions CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS jobs CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS customers CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS businesses CASCADE;

-- Create businesses table first (referenced by users)
CREATE TABLE businesses (
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

-- Create users table with proper foreign key relationships
CREATE TABLE users (
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

-- Add foreign key constraint for businesses.admin_id after users table exists
ALTER TABLE businesses 
ADD CONSTRAINT businesses_admin_id_fkey 
FOREIGN KEY (admin_id) REFERENCES users(id) ON DELETE SET NULL;

-- Create customers table
CREATE TABLE customers (
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
CREATE TABLE jobs (
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
CREATE TABLE products (
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
CREATE TABLE notifications (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  title text NOT NULL,
  message text NOT NULL,
  type text DEFAULT 'system' CHECK (type IN ('reminder', 'job', 'system')),
  read boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create user permissions table
CREATE TABLE user_permissions (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  permission_name text NOT NULL,
  granted_by uuid REFERENCES users(id) ON DELETE SET NULL,
  granted_at timestamptz DEFAULT now(),
  is_active boolean DEFAULT true,
  UNIQUE(user_id, permission_name)
);

-- Create module access table
CREATE TABLE module_access (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  module_name text NOT NULL,
  can_access boolean DEFAULT false,
  can_grant_access boolean DEFAULT false,
  granted_by uuid REFERENCES users(id) ON DELETE SET NULL,
  granted_at timestamptz DEFAULT now(),
  revoked_at timestamptz,
  is_active boolean DEFAULT true,
  UNIQUE(user_id, module_name)
);

-- Create user hierarchy table
CREATE TABLE user_hierarchy (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  parent_id uuid REFERENCES users(id) ON DELETE CASCADE,
  child_id uuid REFERENCES users(id) ON DELETE CASCADE,
  relationship_type text NOT NULL CHECK (relationship_type IN ('admin_business', 'admin_employee', 'business_employee')),
  created_by uuid REFERENCES users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  is_active boolean DEFAULT true,
  UNIQUE(parent_id, child_id)
);

-- Create activity logs table
CREATE TABLE activity_logs (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES users(id) ON DELETE SET NULL,
  action text NOT NULL,
  target_type text,
  target_id text,
  details jsonb DEFAULT '{}',
  ip_address inet,
  user_agent text,
  created_at timestamptz DEFAULT now()
);

-- Create user sessions table
CREATE TABLE user_sessions (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  session_token text UNIQUE NOT NULL,
  expires_at timestamptz NOT NULL,
  created_at timestamptz DEFAULT now(),
  last_accessed timestamptz DEFAULT now(),
  ip_address inet,
  user_agent text,
  is_active boolean DEFAULT true
);

-- Enable Row Level Security on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE module_access ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_hierarchy ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;

-- Users table policies
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

CREATE POLICY "Users can update own data" ON users
  FOR UPDATE TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Admins can update all users" ON users
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Businesses table policies
CREATE POLICY "Business admins can read own business" ON businesses
  FOR SELECT TO authenticated
  USING (
    admin_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can manage businesses" ON businesses
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Jobs table policies
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

CREATE POLICY "Business users can manage jobs" ON jobs
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND (
        role = 'admin' OR
        (role IN ('business', 'employee') AND business_id = jobs.business_id)
      )
    )
  );

-- Customers table policies
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

CREATE POLICY "Business users can manage customers" ON customers
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND (
        role = 'admin' OR
        (role = 'business' AND business_id = customers.business_id)
      )
    )
  );

-- Products table policies
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

-- Notifications table policies
CREATE POLICY "Users can read own notifications" ON notifications
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can manage own notifications" ON notifications
  FOR ALL TO authenticated
  USING (user_id = auth.uid());

-- User permissions table policies
CREATE POLICY "Users can read own permissions" ON user_permissions
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Admins can read all permissions" ON user_permissions
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Users can manage permissions they granted" ON user_permissions
  FOR ALL TO authenticated
  USING (granted_by = auth.uid());

-- Module access table policies
CREATE POLICY "Users can read own module access" ON module_access
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Admins can manage all module access" ON module_access
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Users can grant access if they have grant permission" ON module_access
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM module_access ma
      WHERE ma.user_id = auth.uid() 
      AND ma.module_name = module_access.module_name
      AND ma.can_grant_access = true
      AND ma.is_active = true
    ) OR
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- User hierarchy table policies
CREATE POLICY "Users can read their hierarchy" ON user_hierarchy
  FOR SELECT TO authenticated
  USING (
    parent_id = auth.uid() OR 
    child_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Users can create hierarchy they manage" ON user_hierarchy
  FOR INSERT TO authenticated
  WITH CHECK (
    parent_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Activity logs table policies
CREATE POLICY "Users can read own activity logs" ON activity_logs
  FOR SELECT TO authenticated
  USING (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "All authenticated users can create activity logs" ON activity_logs
  FOR INSERT TO authenticated
  WITH CHECK (true);

-- User sessions table policies
CREATE POLICY "Users can read own sessions" ON user_sessions
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can manage own sessions" ON user_sessions
  FOR ALL TO authenticated
  USING (user_id = auth.uid());

-- Create indexes for better performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_business_id ON users(business_id);
CREATE INDEX idx_users_parent_id ON users(parent_id);
CREATE INDEX idx_users_created_by ON users(created_by);
CREATE INDEX idx_businesses_admin_id ON businesses(admin_id);
CREATE INDEX idx_jobs_business_id ON jobs(business_id);
CREATE INDEX idx_jobs_employee_id ON jobs(employee_id);
CREATE INDEX idx_jobs_customer_id ON jobs(customer_id);
CREATE INDEX idx_jobs_status ON jobs(status);
CREATE INDEX idx_customers_business_id ON customers(business_id);
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_user_permissions_user_id ON user_permissions(user_id);
CREATE INDEX idx_module_access_user_id ON module_access(user_id);
CREATE INDEX idx_user_hierarchy_parent_id ON user_hierarchy(parent_id);
CREATE INDEX idx_user_hierarchy_child_id ON user_hierarchy(child_id);
CREATE INDEX idx_activity_logs_user_id ON activity_logs(user_id);
CREATE INDEX idx_user_sessions_user_id ON user_sessions(user_id);

-- Create functions for user management
CREATE OR REPLACE FUNCTION create_user_with_hierarchy(
  p_email text,
  p_name text,
  p_role text,
  p_parent_id uuid DEFAULT NULL,
  p_permissions text[] DEFAULT '{}'
) RETURNS uuid AS $$
DECLARE
  new_user_id uuid;
  perm text;
BEGIN
  -- Create the user
  INSERT INTO users (email, name, role, parent_id, created_by, permissions, is_active, email_verified)
  VALUES (p_email, p_name, p_role, p_parent_id, auth.uid(), p_permissions, true, false)
  RETURNING id INTO new_user_id;
  
  -- Create hierarchy relationship if parent exists
  IF p_parent_id IS NOT NULL THEN
    INSERT INTO user_hierarchy (parent_id, child_id, relationship_type, created_by)
    VALUES (
      p_parent_id, 
      new_user_id, 
      CASE 
        WHEN p_role = 'business' THEN 'admin_business'
        WHEN p_role = 'employee' THEN 
          CASE 
            WHEN (SELECT role FROM users WHERE id = p_parent_id) = 'admin' THEN 'admin_employee'
            ELSE 'business_employee'
          END
        ELSE 'admin_business'
      END,
      auth.uid()
    );
  END IF;
  
  -- Add individual permissions
  FOREACH perm IN ARRAY p_permissions
  LOOP
    INSERT INTO user_permissions (user_id, permission_name, granted_by)
    VALUES (new_user_id, perm, auth.uid())
    ON CONFLICT (user_id, permission_name) DO NOTHING;
  END LOOP;
  
  -- Log the activity
  INSERT INTO activity_logs (user_id, action, target_type, target_id, details)
  VALUES (
    auth.uid(), 
    'user_created', 
    'user', 
    new_user_id::text,
    jsonb_build_object('created_user_email', p_email, 'created_user_role', p_role)
  );
  
  RETURN new_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to grant module access
CREATE OR REPLACE FUNCTION grant_module_access(
  p_user_id uuid,
  p_module_name text,
  p_can_grant boolean DEFAULT false
) RETURNS boolean AS $$
BEGIN
  -- Check if current user can grant access
  IF NOT (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin') OR
    EXISTS (
      SELECT 1 FROM module_access 
      WHERE user_id = auth.uid() 
      AND module_name = p_module_name 
      AND can_grant_access = true 
      AND is_active = true
    )
  ) THEN
    RAISE EXCEPTION 'Insufficient permissions to grant module access';
  END IF;
  
  -- Grant or update access
  INSERT INTO module_access (user_id, module_name, can_access, can_grant_access, granted_by)
  VALUES (p_user_id, p_module_name, true, p_can_grant, auth.uid())
  ON CONFLICT (user_id, module_name) 
  DO UPDATE SET 
    can_access = true,
    can_grant_access = p_can_grant,
    granted_by = auth.uid(),
    granted_at = now(),
    revoked_at = NULL,
    is_active = true;
  
  -- Log the activity
  INSERT INTO activity_logs (user_id, action, target_type, target_id, details)
  VALUES (
    auth.uid(), 
    'module_access_granted', 
    'module', 
    p_module_name,
    jsonb_build_object('target_user_id', p_user_id, 'can_grant', p_can_grant)
  );
  
  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to revoke module access
CREATE OR REPLACE FUNCTION revoke_module_access(
  p_user_id uuid,
  p_module_name text
) RETURNS boolean AS $$
BEGIN
  -- Check if current user can revoke access
  IF NOT (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin') OR
    EXISTS (
      SELECT 1 FROM module_access 
      WHERE user_id = auth.uid() 
      AND module_name = p_module_name 
      AND can_grant_access = true 
      AND is_active = true
    )
  ) THEN
    RAISE EXCEPTION 'Insufficient permissions to revoke module access';
  END IF;
  
  -- Revoke access
  UPDATE module_access 
  SET 
    can_access = false,
    can_grant_access = false,
    revoked_at = now(),
    is_active = false
  WHERE user_id = p_user_id AND module_name = p_module_name;
  
  -- Log the activity
  INSERT INTO activity_logs (user_id, action, target_type, target_id, details)
  VALUES (
    auth.uid(), 
    'module_access_revoked', 
    'module', 
    p_module_name,
    jsonb_build_object('target_user_id', p_user_id)
  );
  
  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create update triggers for updated_at columns
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

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

-- Insert sample data
-- Insert businesses first
INSERT INTO businesses (id, name, address, phone, email, features, subscription) VALUES
  ('550e8400-e29b-41d4-a716-446655440001', 'ABC Construction Co.', '123 Main Street, City, State 12345', '+1 (555) 123-4567', 'contact@abcconstruction.com', ARRAY['job_management', 'calendar', 'reports', 'camera', 'ar_viewer'], 'premium'),
  ('550e8400-e29b-41d4-a716-446655440002', 'XYZ Electrical Services', '456 Oak Avenue, Town, State 67890', '+1 (555) 987-6543', 'info@xyzelectrical.com', ARRAY['job_management', 'calendar'], 'basic');

-- Insert users with proper relationships
INSERT INTO users (id, email, name, role, business_id, permissions, is_active, email_verified) VALUES
  ('550e8400-e29b-41d4-a716-446655440003', 'admin@platform.com', 'Platform Admin', 'admin', null, ARRAY['all'], true, true),
  ('550e8400-e29b-41d4-a716-446655440004', 'business@company.com', 'Business Manager', 'business', '550e8400-e29b-41d4-a716-446655440001', ARRAY['manage_employees', 'view_dashboard', 'create_jobs'], true, true),
  ('550e8400-e29b-41d4-a716-446655440005', 'employee@company.com', 'Field Employee', 'employee', '550e8400-e29b-41d4-a716-446655440001', ARRAY['create_jobs', 'manage_tasks', 'capture_signatures'], true, true);

-- Update business admin_id references
UPDATE businesses SET admin_id = '550e8400-e29b-41d4-a716-446655440004' WHERE id = '550e8400-e29b-41d4-a716-446655440001';
UPDATE businesses SET admin_id = '550e8400-e29b-41d4-a716-446655440004' WHERE id = '550e8400-e29b-41d4-a716-446655440002';

-- Insert customers
INSERT INTO customers (id, name, email, phone, mobile, address, postcode, business_id) VALUES
  ('550e8400-e29b-41d4-a716-446655440006', 'ABC Corp', 'contact@abccorp.com', '+1 (555) 111-2222', '+1 (555) 111-3333', '123 Business Ave, City, State', '12345', '550e8400-e29b-41d4-a716-446655440001'),
  ('550e8400-e29b-41d4-a716-446655440007', 'XYZ Ltd', 'info@xyzltd.com', '+1 (555) 333-4444', '+1 (555) 333-5555', '456 Commerce St, Town, State', '67890', '550e8400-e29b-41d4-a716-446655440001');

-- Insert products
INSERT INTO products (id, name, category, description, image, specifications, price, is_active) VALUES
  ('550e8400-e29b-41d4-a716-446655440008', 'Industrial HVAC Unit', 'HVAC Systems', 'High-efficiency commercial HVAC system', 'https://images.pexels.com/photos/8293778/pexels-photo-8293778.jpeg?auto=compress&cs=tinysrgb&w=400', ARRAY['Cooling Capacity: 5 Tons', 'Heating Capacity: 120,000 BTU', 'Energy Rating: SEER 16'], 2500, true),
  ('550e8400-e29b-41d4-a716-446655440009', 'Electrical Panel Box', 'Electrical', '200A main electrical panel with breakers', 'https://images.pexels.com/photos/257736/pexels-photo-257736.jpeg?auto=compress&cs=tinysrgb&w=400', ARRAY['Amperage: 200A', 'Voltage: 240V', 'Circuits: 40'], 450, true);

-- Insert jobs
INSERT INTO jobs (id, title, description, status, customer_id, employee_id, business_id, scheduled_date, completed_date, quotation, invoice, checklist) VALUES
  ('JOB-001', 'HVAC Installation', 'Install new HVAC system in office building', 'completed', '550e8400-e29b-41d4-a716-446655440006', '550e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440001', '2024-01-15T09:00:00Z', '2024-01-15T16:30:00Z', 2500, 2500, '[{"id": "1", "text": "Site inspection", "completed": true}, {"id": "2", "text": "Equipment delivery", "completed": true}, {"id": "3", "text": "Installation", "completed": true}, {"id": "4", "text": "Testing", "completed": true}]'),
  ('JOB-002', 'Electrical Maintenance', 'Routine electrical system maintenance', 'in-progress', '550e8400-e29b-41d4-a716-446655440007', '550e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440001', '2024-01-16T14:00:00Z', null, 800, null, '[{"id": "1", "text": "Safety check", "completed": true}, {"id": "2", "text": "Component inspection", "completed": true}, {"id": "3", "text": "Repairs", "completed": false}, {"id": "4", "text": "Final testing", "completed": false}]');

-- Insert notifications
INSERT INTO notifications (id, user_id, title, message, type, read) VALUES
  ('550e8400-e29b-41d4-a716-44665544000a', '550e8400-e29b-41d4-a716-446655440005', 'Welcome to JobManager Pro', 'Your account has been set up successfully!', 'system', false),
  ('550e8400-e29b-41d4-a716-44665544000b', '550e8400-e29b-41d4-a716-446655440005', 'New Job Assignment', 'You have been assigned to JOB-002: Electrical Maintenance', 'job', false);

-- Insert initial module access for admin users
INSERT INTO module_access (user_id, module_name, can_access, can_grant_access, granted_by) 
VALUES 
  ('550e8400-e29b-41d4-a716-446655440003', 'ar-camera', true, true, '550e8400-e29b-41d4-a716-446655440003');

-- Refresh schema cache to ensure PostgREST recognizes all relationships
NOTIFY pgrst, 'reload schema';

-- Verification queries (optional - you can run these to verify setup)
-- SELECT 'Users created:' as info, count(*) as count FROM users;
-- SELECT 'Businesses created:' as info, count(*) as count FROM businesses;
-- SELECT 'Jobs created:' as info, count(*) as count FROM jobs;
-- SELECT 'Customers created:' as info, count(*) as count FROM customers;
-- SELECT 'Products created:' as info, count(*) as count FROM products;

-- Test foreign key relationships
-- SELECT u.name, p.name as parent_name FROM users u LEFT JOIN users p ON u.parent_id = p.id;