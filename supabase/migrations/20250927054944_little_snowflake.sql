/*
  # BlindsCloud Database Schema Setup

  1. New Tables
    - `users` - User management with hierarchy and authentication
    - `businesses` - Business information and settings
    - `customers` - Customer relationship management
    - `jobs` - Job tracking and management
    - `products` - Product catalog with 3D model support
    - `notifications` - Real-time notification system
    - `module_permissions` - Granular feature access control
    - `models_3d` - 3D model storage and metadata
    - `model_permissions` - Business-level 3D model access
    - `activity_logs` - Complete audit trail
    - `user_sessions` - Authentication session management

  2. Security
    - Enable RLS on all tables
    - Add policies for role-based access control
    - Secure authentication with proper session management

  3. Features
    - User hierarchy with parent-child relationships
    - Business-level feature toggles
    - 3D model conversion and permissions
    - Activity logging for audit trails
    - Module-based access control
*/

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Users table with hierarchy support
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('admin', 'business', 'employee')),
    business_id UUID,
    parent_id UUID,
    permissions TEXT[] DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    email_verified BOOLEAN DEFAULT false,
    verification_token VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID
);

-- Businesses table
CREATE TABLE IF NOT EXISTS businesses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    address TEXT NOT NULL,
    phone VARCHAR(50),
    email VARCHAR(255),
    admin_id UUID,
    features TEXT[] DEFAULT '{}',
    subscription VARCHAR(50) DEFAULT 'basic' CHECK (subscription IN ('basic', 'premium', 'enterprise')),
    vr_view_enabled BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Customers table
CREATE TABLE IF NOT EXISTS customers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(50),
    mobile VARCHAR(50),
    address TEXT NOT NULL,
    postcode VARCHAR(20),
    business_id UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Jobs table
CREATE TABLE IF NOT EXISTS jobs (
    id VARCHAR(50) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'in-progress', 'completed', 'cancelled')),
    customer_id UUID NOT NULL,
    employee_id UUID,
    business_id UUID NOT NULL,
    scheduled_date TIMESTAMP WITH TIME ZONE NOT NULL,
    completed_date TIMESTAMP WITH TIME ZONE,
    quotation DECIMAL(10,2),
    invoice DECIMAL(10,2),
    signature TEXT,
    images TEXT[] DEFAULT '{}',
    documents TEXT[] DEFAULT '{}',
    checklist JSONB DEFAULT '[]',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Products table
CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    description TEXT,
    image VARCHAR(500),
    model_3d VARCHAR(500),
    ar_model VARCHAR(500),
    specifications TEXT[] DEFAULT '{}',
    price DECIMAL(10,2) NOT NULL DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) DEFAULT 'system' CHECK (type IN ('reminder', 'job', 'system')),
    read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Module permissions table
CREATE TABLE IF NOT EXISTS module_permissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    module_id VARCHAR(100) NOT NULL,
    can_access BOOLEAN DEFAULT false,
    can_grant_access BOOLEAN DEFAULT false,
    granted_by UUID,
    granted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3D Models table
CREATE TABLE IF NOT EXISTS models_3d (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    original_image VARCHAR(500),
    model_url VARCHAR(500),
    thumbnail VARCHAR(500),
    status VARCHAR(50) DEFAULT 'processing' CHECK (status IN ('processing', 'completed', 'failed')),
    settings JSONB DEFAULT '{}',
    created_by UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Model permissions table
CREATE TABLE IF NOT EXISTS model_permissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_id UUID NOT NULL,
    can_view_3d_models BOOLEAN DEFAULT false,
    can_use_in_ar BOOLEAN DEFAULT false,
    granted_by UUID,
    granted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Activity logs table
CREATE TABLE IF NOT EXISTS activity_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    action VARCHAR(100) NOT NULL,
    target_type VARCHAR(50),
    target_id VARCHAR(255),
    details JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User sessions table
CREATE TABLE IF NOT EXISTS user_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    session_token VARCHAR(255) UNIQUE NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add foreign key constraints after all tables are created
ALTER TABLE users ADD CONSTRAINT IF NOT EXISTS fk_users_business FOREIGN KEY (business_id) REFERENCES businesses(id) ON DELETE SET NULL;
ALTER TABLE users ADD CONSTRAINT IF NOT EXISTS fk_users_parent FOREIGN KEY (parent_id) REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE users ADD CONSTRAINT IF NOT EXISTS fk_users_created_by FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE businesses ADD CONSTRAINT IF NOT EXISTS fk_businesses_admin FOREIGN KEY (admin_id) REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE customers ADD CONSTRAINT IF NOT EXISTS fk_customers_business FOREIGN KEY (business_id) REFERENCES businesses(id) ON DELETE CASCADE;
ALTER TABLE jobs ADD CONSTRAINT IF NOT EXISTS fk_jobs_customer FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE;
ALTER TABLE jobs ADD CONSTRAINT IF NOT EXISTS fk_jobs_employee FOREIGN KEY (employee_id) REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE jobs ADD CONSTRAINT IF NOT EXISTS fk_jobs_business FOREIGN KEY (business_id) REFERENCES businesses(id) ON DELETE CASCADE;
ALTER TABLE notifications ADD CONSTRAINT IF NOT EXISTS fk_notifications_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE module_permissions ADD CONSTRAINT IF NOT EXISTS fk_module_permissions_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE module_permissions ADD CONSTRAINT IF NOT EXISTS fk_module_permissions_granted_by FOREIGN KEY (granted_by) REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE models_3d ADD CONSTRAINT IF NOT EXISTS fk_models_3d_created_by FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE model_permissions ADD CONSTRAINT IF NOT EXISTS fk_model_permissions_business FOREIGN KEY (business_id) REFERENCES businesses(id) ON DELETE CASCADE;
ALTER TABLE model_permissions ADD CONSTRAINT IF NOT EXISTS fk_model_permissions_granted_by FOREIGN KEY (granted_by) REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE activity_logs ADD CONSTRAINT IF NOT EXISTS fk_activity_logs_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE user_sessions ADD CONSTRAINT IF NOT EXISTS fk_user_sessions_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_business_id ON users(business_id);
CREATE INDEX IF NOT EXISTS idx_users_parent_id ON users(parent_id);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_jobs_customer_id ON jobs(customer_id);
CREATE INDEX IF NOT EXISTS idx_jobs_employee_id ON jobs(employee_id);
CREATE INDEX IF NOT EXISTS idx_jobs_business_id ON jobs(business_id);
CREATE INDEX IF NOT EXISTS idx_jobs_status ON jobs(status);
CREATE INDEX IF NOT EXISTS idx_jobs_scheduled_date ON jobs(scheduled_date);
CREATE INDEX IF NOT EXISTS idx_customers_business_id ON customers(business_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);
CREATE INDEX IF NOT EXISTS idx_activity_logs_user_id ON activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created_at ON activity_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_user_sessions_token ON user_sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_user_sessions_expires_at ON user_sessions(expires_at);

-- Enable Row Level Security on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE module_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE models_3d ENABLE ROW LEVEL SECURITY;
ALTER TABLE model_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users table
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

CREATE POLICY "Business users can read their employees" ON users
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND role = 'business' 
      AND business_id = users.business_id
    )
  );

CREATE POLICY "Admins can manage all users" ON users
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- RLS Policies for businesses table
CREATE POLICY "Admins can manage all businesses" ON businesses
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Business users can read own business" ON businesses
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND business_id = businesses.id
    )
  );

-- RLS Policies for customers table
CREATE POLICY "Users can read customers in their business" ON customers
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND (role = 'admin' OR business_id = customers.business_id)
    )
  );

CREATE POLICY "Business and admin users can manage customers" ON customers
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND (role = 'admin' OR (role IN ('business', 'employee') AND business_id = customers.business_id))
    )
  );

-- RLS Policies for jobs table
CREATE POLICY "Users can read jobs in their business" ON jobs
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND (role = 'admin' OR business_id = jobs.business_id OR id = jobs.employee_id)
    )
  );

CREATE POLICY "Users can manage jobs in their business" ON jobs
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND (role = 'admin' OR business_id = jobs.business_id)
    )
  );

-- RLS Policies for products table
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

-- RLS Policies for notifications table
CREATE POLICY "Users can read own notifications" ON notifications
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications" ON notifications
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policies for module_permissions table
CREATE POLICY "Users can read own module permissions" ON module_permissions
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all module permissions" ON module_permissions
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- RLS Policies for models_3d table
CREATE POLICY "Admins can manage all 3D models" ON models_3d
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Users can read 3D models" ON models_3d
  FOR SELECT TO authenticated
  USING (true);

-- RLS Policies for model_permissions table
CREATE POLICY "Admins can manage model permissions" ON model_permissions
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Business users can read their model permissions" ON model_permissions
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND business_id = model_permissions.business_id
    )
  );

-- RLS Policies for activity_logs table
CREATE POLICY "Users can read own activity logs" ON activity_logs
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can read all activity logs" ON activity_logs
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- RLS Policies for user_sessions table
CREATE POLICY "Users can read own sessions" ON user_sessions
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own sessions" ON user_sessions
  FOR ALL TO authenticated
  USING (auth.uid() = user_id);

-- Insert default admin user (password: 'password')
INSERT INTO users (id, email, name, password_hash, role, permissions, is_active, email_verified) 
VALUES (
    '550e8400-e29b-41d4-a716-446655440000',
    'admin@blindscloud.co.uk',
    'BlindsCloud Admin',
    crypt('password', gen_salt('bf')),
    'admin',
    ARRAY['all'],
    true,
    true
) ON CONFLICT (email) DO NOTHING;

-- Insert default business
INSERT INTO businesses (id, name, address, phone, email, features, subscription, vr_view_enabled)
VALUES (
    '550e8400-e29b-41d4-a716-446655440001',
    'BlindsCloud Solutions Ltd.',
    '456 Window Street, Blindfold City, BC 12345',
    '+1 (555) 123-4567',
    'contact@blindscloud.co.uk',
    ARRAY['job_management', 'calendar', 'reports', 'vr_view', '3d_models'],
    'premium',
    true
) ON CONFLICT (id) DO NOTHING;

-- Insert default business user
INSERT INTO users (id, email, name, password_hash, role, business_id, permissions, is_active, email_verified)
VALUES (
    '550e8400-e29b-41d4-a716-446655440002',
    'business@blindscloud.co.uk',
    'Business Manager',
    crypt('password', gen_salt('bf')),
    'business',
    '550e8400-e29b-41d4-a716-446655440001',
    ARRAY['manage_employees', 'view_dashboard', 'create_jobs'],
    true,
    true
) ON CONFLICT (email) DO NOTHING;

-- Insert default employee user
INSERT INTO users (id, email, name, password_hash, role, business_id, permissions, is_active, email_verified)
VALUES (
    '550e8400-e29b-41d4-a716-446655440003',
    'employee@blindscloud.co.uk',
    'Installation Specialist',
    crypt('password', gen_salt('bf')),
    'employee',
    '550e8400-e29b-41d4-a716-446655440001',
    ARRAY['create_jobs', 'manage_tasks', 'ar_camera_access'],
    true,
    true
) ON CONFLICT (email) DO NOTHING;

-- Insert default customers
INSERT INTO customers (id, name, email, phone, mobile, address, postcode, business_id)
VALUES 
(
    '550e8400-e29b-41d4-a716-446655440006',
    'Luxury Homes Ltd.',
    'contact@luxuryhomes.com',
    '+1 (555) 111-2222',
    '+1 (555) 111-3333',
    '789 Luxury Lane, Premium District',
    '12345',
    '550e8400-e29b-41d4-a716-446655440001'
),
(
    '550e8400-e29b-41d4-a716-446655440007',
    'Modern Office Complex',
    'facilities@modernoffice.com',
    '+1 (555) 222-3333',
    '+1 (555) 222-4444',
    '321 Corporate Plaza, Business District',
    '54321',
    '550e8400-e29b-41d4-a716-446655440001'
) ON CONFLICT (id) DO NOTHING;

-- Insert default products
INSERT INTO products (id, name, category, description, image, specifications, price, is_active)
VALUES 
(
    '550e8400-e29b-41d4-a716-446655440008',
    'Premium Blackout Blinds',
    'Window Blinds',
    'High-quality blackout blinds for complete light control and privacy',
    'https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=400',
    ARRAY['100% Light Blocking', 'Thermal Insulation', 'Easy Installation', 'Custom Sizing Available'],
    299,
    true
),
(
    '550e8400-e29b-41d4-a716-446655440009',
    'Smart Motorized Blinds',
    'Smart Blinds',
    'App-controlled motorized blinds with scheduling and automation features',
    'https://images.pexels.com/photos/6969831/pexels-photo-6969831.jpeg?auto=compress&cs=tinysrgb&w=400',
    ARRAY['WiFi Connectivity', 'Voice Control Compatible', 'Solar Panel Option', 'Smartphone App'],
    599,
    true
),
(
    '550e8400-e29b-41d4-a716-44665544000a',
    'Venetian Blinds Collection',
    'Venetian Blinds',
    'Classic venetian blinds in various materials and colors',
    'https://images.pexels.com/photos/1571453/pexels-photo-1571453.jpeg?auto=compress&cs=tinysrgb&w=400',
    ARRAY['Aluminum Slats', 'Tilt Control', 'Multiple Colors', 'Durable Construction'],
    149,
    true
),
(
    '550e8400-e29b-41d4-a716-44665544000b',
    'Roller Blinds Pro',
    'Roller Blinds',
    'Professional roller blinds for offices and commercial spaces',
    'https://images.pexels.com/photos/6969832/pexels-photo-6969832.jpeg?auto=compress&cs=tinysrgb&w=400',
    ARRAY['Fire Retardant Fabric', 'Commercial Grade', 'Chain Control', 'UV Protection'],
    199,
    true
) ON CONFLICT (id) DO NOTHING;

-- Insert default jobs
INSERT INTO jobs (id, title, description, status, customer_id, employee_id, business_id, scheduled_date, quotation, checklist)
VALUES 
(
    'JOB-001',
    'Premium Blackout Blinds Installation',
    'Install premium blackout blinds in luxury home master bedroom',
    'completed',
    '550e8400-e29b-41d4-a716-446655440006',
    '550e8400-e29b-41d4-a716-446655440003',
    '550e8400-e29b-41d4-a716-446655440001',
    '2024-01-15T09:00:00Z',
    899,
    '[
        {"id": "1", "text": "Window measurements", "completed": true},
        {"id": "2", "text": "Blinds delivery", "completed": true},
        {"id": "3", "text": "Professional installation", "completed": true},
        {"id": "4", "text": "Quality check & demo", "completed": true}
    ]'::jsonb
),
(
    'JOB-002',
    'Smart Motorized Blinds Setup',
    'Install and configure smart motorized blinds with app integration',
    'in-progress',
    '550e8400-e29b-41d4-a716-446655440007',
    '550e8400-e29b-41d4-a716-446655440003',
    '550e8400-e29b-41d4-a716-446655440001',
    '2024-01-18T10:00:00Z',
    1299,
    '[
        {"id": "1", "text": "Site survey and WiFi check", "completed": true},
        {"id": "2", "text": "Smart blinds delivery", "completed": true},
        {"id": "3", "text": "Motor installation", "completed": false},
        {"id": "4", "text": "App setup and testing", "completed": false}
    ]'::jsonb
) ON CONFLICT (id) DO NOTHING;

-- Insert default notifications
INSERT INTO notifications (id, user_id, title, message, type, read)
VALUES 
(
    '550e8400-e29b-41d4-a716-44665544000a',
    '550e8400-e29b-41d4-a716-446655440003',
    'Welcome to BlindsCloud',
    'Your blinds specialist account has been set up successfully! Start managing installations and AR demonstrations.',
    'system',
    false
),
(
    '550e8400-e29b-41d4-a716-44665544000b',
    '550e8400-e29b-41d4-a716-446655440003',
    'New Blinds Installation Job',
    'Premium blackout blinds installation scheduled for Luxury Homes Ltd.',
    'job',
    false
) ON CONFLICT (id) DO NOTHING;