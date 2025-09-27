/*
  # Complete BlindsCloud Database Schema

  1. New Tables
    - `users` - User management with hierarchy and permissions
    - `businesses` - Business information and settings
    - `customers` - Customer relationship management
    - `jobs` - Job tracking and management
    - `products` - Product catalog with 3D model support
    - `notifications` - Real-time notification system
    - `activity_logs` - Complete audit trail
    - `user_sessions` - Session management
    - `user_permissions` - Granular permission system
    - `module_access` - Module-level access control
    - `user_hierarchy` - Parent-child relationships
    - `models_3d` - 3D model storage and management
    - `model_permissions` - Business-level 3D model access

  2. Security
    - Enable RLS on all tables
    - Add comprehensive policies for all user roles
    - Secure authentication with proper access control

  3. Features
    - Complete user hierarchy system
    - Business management with feature flags
    - Job lifecycle management
    - 3D model conversion and permissions
    - Activity logging for audit compliance
*/

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable RLS
ALTER DATABASE postgres SET row_security = on;

-- Create update trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Users table with hierarchy support
CREATE TABLE IF NOT EXISTS users (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    email text UNIQUE NOT NULL,
    name text NOT NULL,
    role text NOT NULL CHECK (role IN ('admin', 'business', 'employee')),
    business_id uuid,
    parent_id uuid,
    created_by uuid,
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

-- Customers table
CREATE TABLE IF NOT EXISTS customers (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    name text NOT NULL,
    email text,
    phone text,
    mobile text,
    address text NOT NULL,
    postcode text NOT NULL,
    business_id uuid,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Jobs table
CREATE TABLE IF NOT EXISTS jobs (
    id text PRIMARY KEY,
    title text NOT NULL,
    description text NOT NULL,
    status text DEFAULT 'pending' CHECK (status IN ('pending', 'in-progress', 'completed', 'cancelled')),
    customer_id uuid,
    employee_id uuid,
    business_id uuid,
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
    price numeric DEFAULT 0,
    is_active boolean DEFAULT true,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id uuid,
    title text NOT NULL,
    message text NOT NULL,
    type text DEFAULT 'system' CHECK (type IN ('reminder', 'job', 'system')),
    read boolean DEFAULT false,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- User permissions table
CREATE TABLE IF NOT EXISTS user_permissions (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id uuid,
    permission_name text NOT NULL,
    granted_by uuid,
    granted_at timestamptz DEFAULT now(),
    is_active boolean DEFAULT true,
    UNIQUE(user_id, permission_name)
);

-- Module access table
CREATE TABLE IF NOT EXISTS module_access (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id uuid,
    module_name text NOT NULL,
    can_access boolean DEFAULT false,
    can_grant_access boolean DEFAULT false,
    granted_by uuid,
    granted_at timestamptz DEFAULT now(),
    revoked_at timestamptz,
    is_active boolean DEFAULT true,
    UNIQUE(user_id, module_name)
);

-- User hierarchy table
CREATE TABLE IF NOT EXISTS user_hierarchy (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    parent_id uuid,
    child_id uuid,
    relationship_type text NOT NULL CHECK (relationship_type IN ('admin_business', 'admin_employee', 'business_employee')),
    created_by uuid,
    created_at timestamptz DEFAULT now(),
    is_active boolean DEFAULT true,
    UNIQUE(parent_id, child_id)
);

-- Activity logs table
CREATE TABLE IF NOT EXISTS activity_logs (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id uuid,
    action text NOT NULL,
    target_type text,
    target_id text,
    details jsonb DEFAULT '{}',
    ip_address inet,
    user_agent text,
    created_at timestamptz DEFAULT now()
);

-- User sessions table
CREATE TABLE IF NOT EXISTS user_sessions (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id uuid,
    session_token text UNIQUE NOT NULL,
    expires_at timestamptz NOT NULL,
    created_at timestamptz DEFAULT now(),
    last_accessed timestamptz DEFAULT now(),
    ip_address inet,
    user_agent text,
    is_active boolean DEFAULT true
);

-- 3D Models table
CREATE TABLE IF NOT EXISTS models_3d (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    name text NOT NULL,
    original_image text NOT NULL,
    model_url text,
    thumbnail text,
    status text DEFAULT 'processing' CHECK (status IN ('processing', 'completed', 'failed')),
    settings jsonb DEFAULT '{}',
    created_by uuid,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Model permissions table
CREATE TABLE IF NOT EXISTS model_permissions (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_id uuid,
    can_view_3d_models boolean DEFAULT false,
    can_use_in_ar boolean DEFAULT false,
    granted_by uuid,
    granted_at timestamptz DEFAULT now(),
    is_active boolean DEFAULT true,
    UNIQUE(business_id)
);

-- Add foreign key constraints
ALTER TABLE users ADD CONSTRAINT users_business_id_fkey FOREIGN KEY (business_id) REFERENCES businesses(id) ON DELETE SET NULL;
ALTER TABLE users ADD CONSTRAINT users_parent_id_fkey FOREIGN KEY (parent_id) REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE users ADD CONSTRAINT users_created_by_fkey FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL;

ALTER TABLE businesses ADD CONSTRAINT businesses_admin_id_fkey FOREIGN KEY (admin_id) REFERENCES users(id) ON DELETE SET NULL;

ALTER TABLE customers ADD CONSTRAINT customers_business_id_fkey FOREIGN KEY (business_id) REFERENCES businesses(id) ON DELETE CASCADE;

ALTER TABLE jobs ADD CONSTRAINT jobs_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE SET NULL;
ALTER TABLE jobs ADD CONSTRAINT jobs_employee_id_fkey FOREIGN KEY (employee_id) REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE jobs ADD CONSTRAINT jobs_business_id_fkey FOREIGN KEY (business_id) REFERENCES businesses(id) ON DELETE CASCADE;

ALTER TABLE notifications ADD CONSTRAINT notifications_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE user_permissions ADD CONSTRAINT user_permissions_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE user_permissions ADD CONSTRAINT user_permissions_granted_by_fkey FOREIGN KEY (granted_by) REFERENCES users(id) ON DELETE SET NULL;

ALTER TABLE module_access ADD CONSTRAINT module_access_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE module_access ADD CONSTRAINT module_access_granted_by_fkey FOREIGN KEY (granted_by) REFERENCES users(id) ON DELETE SET NULL;

ALTER TABLE user_hierarchy ADD CONSTRAINT user_hierarchy_parent_id_fkey FOREIGN KEY (parent_id) REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE user_hierarchy ADD CONSTRAINT user_hierarchy_child_id_fkey FOREIGN KEY (child_id) REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE user_hierarchy ADD CONSTRAINT user_hierarchy_created_by_fkey FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL;

ALTER TABLE activity_logs ADD CONSTRAINT activity_logs_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL;

ALTER TABLE user_sessions ADD CONSTRAINT user_sessions_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE models_3d ADD CONSTRAINT models_3d_created_by_fkey FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL;

ALTER TABLE model_permissions ADD CONSTRAINT model_permissions_business_id_fkey FOREIGN KEY (business_id) REFERENCES businesses(id) ON DELETE CASCADE;
ALTER TABLE model_permissions ADD CONSTRAINT model_permissions_granted_by_fkey FOREIGN KEY (granted_by) REFERENCES users(id) ON DELETE SET NULL;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_business_id ON users(business_id);
CREATE INDEX IF NOT EXISTS idx_users_parent_id ON users(parent_id);
CREATE INDEX IF NOT EXISTS idx_users_created_by ON users(created_by);

CREATE INDEX IF NOT EXISTS idx_businesses_admin_id ON businesses(admin_id);

CREATE INDEX IF NOT EXISTS idx_customers_business_id ON customers(business_id);

CREATE INDEX IF NOT EXISTS idx_jobs_customer_id ON jobs(customer_id);
CREATE INDEX IF NOT EXISTS idx_jobs_employee_id ON jobs(employee_id);
CREATE INDEX IF NOT EXISTS idx_jobs_business_id ON jobs(business_id);
CREATE INDEX IF NOT EXISTS idx_jobs_status ON jobs(status);

CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);

CREATE INDEX IF NOT EXISTS idx_user_permissions_user_id ON user_permissions(user_id);

CREATE INDEX IF NOT EXISTS idx_module_access_user_id ON module_access(user_id);

CREATE INDEX IF NOT EXISTS idx_user_hierarchy_parent_id ON user_hierarchy(parent_id);
CREATE INDEX IF NOT EXISTS idx_user_hierarchy_child_id ON user_hierarchy(child_id);

CREATE INDEX IF NOT EXISTS idx_activity_logs_user_id ON activity_logs(user_id);

CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE module_access ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_hierarchy ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE models_3d ENABLE ROW LEVEL SECURITY;
ALTER TABLE model_permissions ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can read own data" ON users FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "Users can update own data" ON users FOR UPDATE TO authenticated USING (auth.uid() = id);
CREATE POLICY "Admins can read all users" ON users FOR SELECT TO authenticated USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Admins can insert users" ON users FOR INSERT TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Admins can update all users" ON users FOR UPDATE TO authenticated USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Business users can read employees" ON users FOR SELECT TO authenticated USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'business' AND business_id = users.business_id)
);
CREATE POLICY "Business users can insert employees" ON users FOR INSERT TO authenticated WITH CHECK (
    role = 'employee' AND EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'business' AND business_id = users.business_id)
);

-- Businesses policies
CREATE POLICY "Admins can manage businesses" ON businesses FOR ALL TO authenticated USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Business admins can read own business" ON businesses FOR SELECT TO authenticated USING (
    admin_id = auth.uid() OR EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
);

-- Customers policies
CREATE POLICY "Business users can manage customers" ON customers FOR ALL TO authenticated USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND (role = 'admin' OR (role = 'business' AND business_id = customers.business_id)))
);
CREATE POLICY "Users can read customers in their business" ON customers FOR SELECT TO authenticated USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND (role = 'admin' OR business_id = customers.business_id))
);

-- Jobs policies
CREATE POLICY "Business users can manage jobs" ON jobs FOR ALL TO authenticated USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND (role = 'admin' OR (role IN ('business', 'employee') AND business_id = jobs.business_id)))
);
CREATE POLICY "Users can read jobs in their business" ON jobs FOR SELECT TO authenticated USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND (role = 'admin' OR business_id = jobs.business_id OR id = jobs.employee_id))
);

-- Products policies
CREATE POLICY "Admins can manage products" ON products FOR ALL TO authenticated USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "All authenticated users can read products" ON products FOR SELECT TO authenticated USING (is_active = true);

-- Notifications policies
CREATE POLICY "Users can read own notifications" ON notifications FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users can manage own notifications" ON notifications FOR ALL TO authenticated USING (user_id = auth.uid());

-- User permissions policies
CREATE POLICY "Users can read own permissions" ON user_permissions FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Admins can read all permissions" ON user_permissions FOR SELECT TO authenticated USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Users can manage permissions they granted" ON user_permissions FOR ALL TO authenticated USING (granted_by = auth.uid());

-- Module access policies
CREATE POLICY "Users can read own module access" ON module_access FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Admins can manage all module access" ON module_access FOR ALL TO authenticated USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Users can grant access if they have grant permission" ON module_access FOR INSERT TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM module_access ma WHERE ma.user_id = auth.uid() AND ma.module_name = module_access.module_name AND ma.can_grant_access = true AND ma.is_active = true)
    OR EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
);

-- User hierarchy policies
CREATE POLICY "Users can read their hierarchy" ON user_hierarchy FOR SELECT TO authenticated USING (
    parent_id = auth.uid() OR child_id = auth.uid() OR EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Users can create hierarchy they manage" ON user_hierarchy FOR INSERT TO authenticated WITH CHECK (
    parent_id = auth.uid() OR EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
);

-- Activity logs policies
CREATE POLICY "Users can read own activity logs" ON activity_logs FOR SELECT TO authenticated USING (
    user_id = auth.uid() OR EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "All authenticated users can create activity logs" ON activity_logs FOR INSERT TO authenticated WITH CHECK (true);

-- User sessions policies
CREATE POLICY "Users can read own sessions" ON user_sessions FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users can manage own sessions" ON user_sessions FOR ALL TO authenticated USING (user_id = auth.uid());

-- 3D Models policies
CREATE POLICY "Admins can manage 3D models" ON models_3d FOR ALL TO authenticated USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Users can read 3D models with permission" ON models_3d FOR SELECT TO authenticated USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
    OR EXISTS (
        SELECT 1 FROM model_permissions mp 
        JOIN users u ON u.business_id = mp.business_id 
        WHERE u.id = auth.uid() AND mp.can_view_3d_models = true AND mp.is_active = true
    )
);

-- Model permissions policies
CREATE POLICY "Admins can manage model permissions" ON model_permissions FOR ALL TO authenticated USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Business users can read own model permissions" ON model_permissions FOR SELECT TO authenticated USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND business_id = model_permissions.business_id)
);

-- Add update triggers
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_businesses_updated_at BEFORE UPDATE ON businesses FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON customers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_jobs_updated_at BEFORE UPDATE ON jobs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_notifications_updated_at BEFORE UPDATE ON notifications FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_models_3d_updated_at BEFORE UPDATE ON models_3d FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default data
INSERT INTO users (id, email, name, role, permissions, is_active, email_verified) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'admin@blindscloud.co.uk', 'BlindsCloud Admin', 'admin', ARRAY['all'], true, true),
('550e8400-e29b-41d4-a716-446655440002', 'business@blindscloud.co.uk', 'Blinds Business Manager', 'business', ARRAY['manage_employees', 'view_dashboard', 'create_jobs'], true, true),
('550e8400-e29b-41d4-a716-446655440003', 'employee@blindscloud.co.uk', 'Blinds Installation Specialist', 'employee', ARRAY['create_jobs', 'manage_tasks', 'capture_signatures', 'ar_camera_access'], true, true)
ON CONFLICT (email) DO NOTHING;

INSERT INTO businesses (id, name, address, phone, email, admin_id, features, subscription) VALUES
('550e8400-e29b-41d4-a716-446655440010', 'BlindsCloud Solutions Ltd.', '456 Window Street, Blindfold City, BC 12345', '+1 (555) 123-4567', 'contact@blindscloud.co.uk', '550e8400-e29b-41d4-a716-446655440002', ARRAY['job_management', 'calendar', 'reports', 'camera', 'ar_camera', 'vr_view', '3d_models'], 'premium')
ON CONFLICT (id) DO NOTHING;

-- Update business_id for users
UPDATE users SET business_id = '550e8400-e29b-41d4-a716-446655440010' WHERE email IN ('business@blindscloud.co.uk', 'employee@blindscloud.co.uk');

INSERT INTO customers (id, name, email, phone, mobile, address, postcode, business_id) VALUES
('550e8400-e29b-41d4-a716-446655440020', 'Luxury Homes Ltd.', 'contact@luxuryhomes.com', '+1 (555) 111-2222', '+1 (555) 111-3333', '789 Luxury Lane, Premium District', '12345', '550e8400-e29b-41d4-a716-446655440010'),
('550e8400-e29b-41d4-a716-446655440021', 'Modern Office Complex', 'facilities@modernoffice.com', '+1 (555) 222-3333', '+1 (555) 222-4444', '321 Corporate Plaza, Business District', '54321', '550e8400-e29b-41d4-a716-446655440010')
ON CONFLICT (id) DO NOTHING;

INSERT INTO products (id, name, category, description, image, specifications, price, is_active) VALUES
('550e8400-e29b-41d4-a716-446655440030', 'Premium Blackout Blinds', 'Window Blinds', 'High-quality blackout blinds for complete light control and privacy', 'https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=400', ARRAY['100% Light Blocking', 'Thermal Insulation', 'Easy Installation', 'Custom Sizing Available'], 299, true),
('550e8400-e29b-41d4-a716-446655440031', 'Smart Motorized Blinds', 'Smart Blinds', 'App-controlled motorized blinds with scheduling and automation features', 'https://images.pexels.com/photos/6969831/pexels-photo-6969831.jpeg?auto=compress&cs=tinysrgb&w=400', ARRAY['WiFi Connectivity', 'Voice Control Compatible', 'Solar Panel Option', 'Smartphone App'], 599, true),
('550e8400-e29b-41d4-a716-446655440032', 'Venetian Blinds Collection', 'Venetian Blinds', 'Classic venetian blinds in various materials and colors', 'https://images.pexels.com/photos/1571453/pexels-photo-1571453.jpeg?auto=compress&cs=tinysrgb&w=400', ARRAY['Aluminum Slats', 'Tilt Control', 'Multiple Colors', 'Durable Construction'], 149, true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO jobs (id, title, description, status, customer_id, employee_id, business_id, scheduled_date, quotation, checklist) VALUES
('JOB-001', 'Premium Blackout Blinds Installation', 'Install premium blackout blinds in luxury home master bedroom', 'completed', '550e8400-e29b-41d4-a716-446655440020', '550e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440010', '2024-01-15 09:00:00+00', 899, '[{"id": "1", "text": "Window measurements", "completed": true}, {"id": "2", "text": "Blinds delivery", "completed": true}, {"id": "3", "text": "Professional installation", "completed": true}, {"id": "4", "text": "Quality check & demo", "completed": true}]'),
('JOB-002', 'Smart Motorized Blinds Setup', 'Install and configure smart motorized blinds with app integration', 'in-progress', '550e8400-e29b-41d4-a716-446655440021', '550e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440010', '2024-01-18 10:00:00+00', 1299, '[{"id": "1", "text": "Site survey and WiFi check", "completed": true}, {"id": "2", "text": "Smart blinds delivery", "completed": true}, {"id": "3", "text": "Motor installation", "completed": false}, {"id": "4", "text": "App setup and testing", "completed": false}]')
ON CONFLICT (id) DO NOTHING;

INSERT INTO notifications (id, user_id, title, message, type, read) VALUES
('550e8400-e29b-41d4-a716-446655440040', '550e8400-e29b-41d4-a716-446655440003', 'Welcome to BlindsCloud', 'Your blinds specialist account has been set up successfully! Start managing installations and AR demonstrations.', 'system', false),
('550e8400-e29b-41d4-a716-446655440041', '550e8400-e29b-41d4-a716-446655440003', 'New Blinds Installation Job', 'Premium blackout blinds installation scheduled for Luxury Homes Ltd.', 'job', false)
ON CONFLICT (id) DO NOTHING;