/*
  # BlindsCloud Database Schema

  1. Core Tables
    - `users` - User management with hierarchy and roles
    - `businesses` - Business information and settings
    - `customers` - Customer data linked to businesses
    - `jobs` - Job tracking with complete lifecycle
    - `products` - Product catalog with 3D model support
    - `notifications` - Real-time notification system

  2. Advanced Features
    - `models_3d` - 3D model storage and metadata
    - `model_permissions` - Business-level 3D model access
    - `module_permissions` - Feature-level access control
    - `activity_logs` - Complete audit trail
    - `user_sessions` - Authentication session management

  3. Security
    - Row Level Security (RLS) enabled on all tables
    - Role-based access policies
    - Secure authentication with JWT
    - Data isolation between businesses
*/

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Users table with hierarchy support
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('admin', 'business', 'employee')),
    business_id UUID,
    parent_id UUID,
    created_by UUID,
    permissions TEXT[] DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    email_verified BOOLEAN DEFAULT false,
    verification_token TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Businesses table
CREATE TABLE IF NOT EXISTS businesses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    address TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT NOT NULL,
    admin_id UUID,
    features TEXT[] DEFAULT '{}',
    subscription TEXT DEFAULT 'basic' CHECK (subscription IN ('basic', 'premium', 'enterprise')),
    vr_view_enabled BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Customers table
CREATE TABLE IF NOT EXISTS customers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    mobile TEXT,
    address TEXT NOT NULL,
    postcode TEXT NOT NULL,
    business_id UUID,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Jobs table
CREATE TABLE IF NOT EXISTS jobs (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in-progress', 'completed', 'cancelled')),
    customer_id UUID,
    employee_id UUID,
    business_id UUID,
    scheduled_date TIMESTAMPTZ NOT NULL,
    completed_date TIMESTAMPTZ,
    quotation DECIMAL DEFAULT 0,
    invoice DECIMAL DEFAULT 0,
    signature TEXT,
    images TEXT[] DEFAULT '{}',
    documents TEXT[] DEFAULT '{}',
    checklist JSONB DEFAULT '[]',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Products table
CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    description TEXT NOT NULL,
    image TEXT NOT NULL,
    model_3d TEXT,
    ar_model TEXT,
    specifications TEXT[] DEFAULT '{}',
    price DECIMAL DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT DEFAULT 'system' CHECK (type IN ('reminder', 'job', 'system')),
    read BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3D Models table
CREATE TABLE IF NOT EXISTS models_3d (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    original_image TEXT NOT NULL,
    model_url TEXT,
    thumbnail TEXT,
    status TEXT DEFAULT 'processing' CHECK (status IN ('processing', 'completed', 'failed')),
    settings JSONB DEFAULT '{}',
    created_by UUID,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Model Permissions table
CREATE TABLE IF NOT EXISTS model_permissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_id UUID NOT NULL,
    can_view_3d_models BOOLEAN DEFAULT false,
    can_use_in_ar BOOLEAN DEFAULT false,
    granted_by UUID,
    granted_at TIMESTAMPTZ DEFAULT NOW(),
    is_active BOOLEAN DEFAULT true
);

-- Module Permissions table
CREATE TABLE IF NOT EXISTS module_permissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    module_name TEXT NOT NULL,
    can_access BOOLEAN DEFAULT false,
    can_grant_access BOOLEAN DEFAULT false,
    granted_by UUID,
    granted_at TIMESTAMPTZ DEFAULT NOW(),
    is_active BOOLEAN DEFAULT true,
    UNIQUE(user_id, module_name)
);

-- Activity Logs table
CREATE TABLE IF NOT EXISTS activity_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID,
    action TEXT NOT NULL,
    target_type TEXT,
    target_id TEXT,
    details JSONB DEFAULT '{}',
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User Sessions table
CREATE TABLE IF NOT EXISTS user_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID,
    session_token TEXT UNIQUE NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    last_accessed TIMESTAMPTZ DEFAULT NOW(),
    ip_address INET,
    user_agent TEXT,
    is_active BOOLEAN DEFAULT true
);

-- Add foreign key constraints
ALTER TABLE users ADD CONSTRAINT users_business_id_fkey 
    FOREIGN KEY (business_id) REFERENCES businesses(id) ON DELETE SET NULL;
ALTER TABLE users ADD CONSTRAINT users_parent_id_fkey 
    FOREIGN KEY (parent_id) REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE users ADD CONSTRAINT users_created_by_fkey 
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL;

ALTER TABLE businesses ADD CONSTRAINT businesses_admin_id_fkey 
    FOREIGN KEY (admin_id) REFERENCES users(id) ON DELETE SET NULL;

ALTER TABLE customers ADD CONSTRAINT customers_business_id_fkey 
    FOREIGN KEY (business_id) REFERENCES businesses(id) ON DELETE CASCADE;

ALTER TABLE jobs ADD CONSTRAINT jobs_customer_id_fkey 
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE SET NULL;
ALTER TABLE jobs ADD CONSTRAINT jobs_employee_id_fkey 
    FOREIGN KEY (employee_id) REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE jobs ADD CONSTRAINT jobs_business_id_fkey 
    FOREIGN KEY (business_id) REFERENCES businesses(id) ON DELETE CASCADE;

ALTER TABLE notifications ADD CONSTRAINT notifications_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE models_3d ADD CONSTRAINT models_3d_created_by_fkey 
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL;

ALTER TABLE model_permissions ADD CONSTRAINT model_permissions_business_id_fkey 
    FOREIGN KEY (business_id) REFERENCES businesses(id) ON DELETE CASCADE;
ALTER TABLE model_permissions ADD CONSTRAINT model_permissions_granted_by_fkey 
    FOREIGN KEY (granted_by) REFERENCES users(id) ON DELETE SET NULL;

ALTER TABLE module_permissions ADD CONSTRAINT module_permissions_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE module_permissions ADD CONSTRAINT module_permissions_granted_by_fkey 
    FOREIGN KEY (granted_by) REFERENCES users(id) ON DELETE SET NULL;

ALTER TABLE activity_logs ADD CONSTRAINT activity_logs_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL;

ALTER TABLE user_sessions ADD CONSTRAINT user_sessions_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_business_id ON users(business_id);
CREATE INDEX IF NOT EXISTS idx_users_parent_id ON users(parent_id);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_created_by ON users(created_by);

CREATE INDEX IF NOT EXISTS idx_businesses_admin_id ON businesses(admin_id);

CREATE INDEX IF NOT EXISTS idx_customers_business_id ON customers(business_id);

CREATE INDEX IF NOT EXISTS idx_jobs_customer_id ON jobs(customer_id);
CREATE INDEX IF NOT EXISTS idx_jobs_employee_id ON jobs(employee_id);
CREATE INDEX IF NOT EXISTS idx_jobs_business_id ON jobs(business_id);
CREATE INDEX IF NOT EXISTS idx_jobs_status ON jobs(status);

CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);

CREATE INDEX IF NOT EXISTS idx_models_3d_created_by ON models_3d(created_by);

CREATE INDEX IF NOT EXISTS idx_model_permissions_business_id ON model_permissions(business_id);

CREATE INDEX IF NOT EXISTS idx_module_permissions_user_id ON module_permissions(user_id);

CREATE INDEX IF NOT EXISTS idx_activity_logs_user_id ON activity_logs(user_id);

CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE models_3d ENABLE ROW LEVEL SECURITY;
ALTER TABLE model_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE module_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Users
CREATE POLICY "Users can read own data" ON users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Admins can read all users" ON users
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Users can update own data" ON users
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can update all users" ON users
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Admins can insert users" ON users
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Business users can insert employees" ON users
    FOR INSERT WITH CHECK (
        role = 'employee' AND
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() AND role = 'business' AND business_id = NEW.business_id
        )
    );

-- RLS Policies for Businesses
CREATE POLICY "Admins can manage businesses" ON businesses
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Business admins can read own business" ON businesses
    FOR SELECT USING (
        admin_id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- RLS Policies for Customers
CREATE POLICY "Users can read customers in their business" ON customers
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() AND 
            (role = 'admin' OR business_id = customers.business_id)
        )
    );

CREATE POLICY "Business users can manage customers" ON customers
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() AND 
            (role = 'admin' OR (role = 'business' AND business_id = customers.business_id))
        )
    );

-- RLS Policies for Jobs
CREATE POLICY "Users can read jobs in their business" ON jobs
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() AND 
            (role = 'admin' OR business_id = jobs.business_id OR id = jobs.employee_id)
        )
    );

CREATE POLICY "Business users can manage jobs" ON jobs
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() AND 
            (role = 'admin' OR 
             (role IN ('business', 'employee') AND business_id = jobs.business_id))
        )
    );

-- RLS Policies for Products
CREATE POLICY "All authenticated users can read products" ON products
    FOR SELECT TO authenticated USING (is_active = true);

CREATE POLICY "Admins can manage products" ON products
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- RLS Policies for Notifications
CREATE POLICY "Users can read own notifications" ON notifications
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can manage own notifications" ON notifications
    FOR ALL USING (user_id = auth.uid());

-- RLS Policies for 3D Models
CREATE POLICY "Admins can manage 3D models" ON models_3d
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Users can read 3D models with permission" ON models_3d
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users u
            LEFT JOIN model_permissions mp ON u.business_id = mp.business_id
            WHERE u.id = auth.uid() AND 
            (u.role = 'admin' OR mp.can_view_3d_models = true)
        )
    );

-- RLS Policies for Model Permissions
CREATE POLICY "Admins can manage model permissions" ON model_permissions
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- RLS Policies for Module Permissions
CREATE POLICY "Users can read own permissions" ON module_permissions
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Admins can read all permissions" ON module_permissions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Users can manage permissions they granted" ON module_permissions
    FOR ALL USING (granted_by = auth.uid());

-- RLS Policies for Activity Logs
CREATE POLICY "Users can read own activity logs" ON activity_logs
    FOR SELECT USING (
        user_id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "All authenticated users can create activity logs" ON activity_logs
    FOR INSERT WITH CHECK (true);

-- RLS Policies for User Sessions
CREATE POLICY "Users can read own sessions" ON user_sessions
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can manage own sessions" ON user_sessions
    FOR ALL USING (user_id = auth.uid());

-- Add triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_businesses_updated_at BEFORE UPDATE ON businesses
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON customers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_jobs_updated_at BEFORE UPDATE ON jobs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_notifications_updated_at BEFORE UPDATE ON notifications
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_models_3d_updated_at BEFORE UPDATE ON models_3d
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default data
DO $$
BEGIN
    -- Insert default admin user
    INSERT INTO users (id, email, name, password_hash, role, permissions, is_active, email_verified)
    VALUES (
        '550e8400-e29b-41d4-a716-446655440003',
        'admin@blindscloud.co.uk',
        'BlindsCloud Admin',
        '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', -- password
        'admin',
        ARRAY['all'],
        true,
        true
    ) ON CONFLICT (email) DO NOTHING;

    -- Insert default business
    INSERT INTO businesses (id, name, address, phone, email, admin_id, features, subscription, vr_view_enabled)
    VALUES (
        '550e8400-e29b-41d4-a716-446655440001',
        'BlindsCloud Solutions Ltd.',
        '456 Window Street, Blindfold City, BC 12345',
        '+1 (555) 123-4567',
        'contact@blindscloud.co.uk',
        '550e8400-e29b-41d4-a716-446655440004',
        ARRAY['job_management', 'calendar', 'reports', 'camera', 'ar_camera', 'vr_view', '3d_models'],
        'premium',
        true
    ) ON CONFLICT (id) DO NOTHING;

    -- Insert business user
    INSERT INTO users (id, email, name, password_hash, role, business_id, permissions, is_active, email_verified)
    VALUES (
        '550e8400-e29b-41d4-a716-446655440004',
        'business@blindscloud.co.uk',
        'Blinds Business Manager',
        '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', -- password
        'business',
        '550e8400-e29b-41d4-a716-446655440001',
        ARRAY['manage_employees', 'view_dashboard', 'create_jobs'],
        true,
        true
    ) ON CONFLICT (email) DO NOTHING;

    -- Insert employee user
    INSERT INTO users (id, email, name, password_hash, role, business_id, permissions, is_active, email_verified)
    VALUES (
        '550e8400-e29b-41d4-a716-446655440005',
        'employee@blindscloud.co.uk',
        'Blinds Installation Specialist',
        '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', -- password
        'employee',
        '550e8400-e29b-41d4-a716-446655440001',
        ARRAY['create_jobs', 'manage_tasks', 'capture_signatures', 'ar_camera_access'],
        true,
        true
    ) ON CONFLICT (email) DO NOTHING;

    -- Insert sample customers
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

    -- Insert sample products
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
    ) ON CONFLICT (id) DO NOTHING;

    -- Insert sample jobs
    INSERT INTO jobs (id, title, description, status, customer_id, employee_id, business_id, scheduled_date, quotation, checklist)
    VALUES 
    (
        'JOB-001',
        'Premium Blackout Blinds Installation',
        'Install premium blackout blinds in luxury home master bedroom',
        'completed',
        '550e8400-e29b-41d4-a716-446655440006',
        '550e8400-e29b-41d4-a716-446655440005',
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
        '550e8400-e29b-41d4-a716-446655440005',
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

    -- Insert sample notifications
    INSERT INTO notifications (id, user_id, title, message, type, read)
    VALUES 
    (
        '550e8400-e29b-41d4-a716-44665544000a',
        '550e8400-e29b-41d4-a716-446655440005',
        'Welcome to BlindsCloud',
        'Your blinds specialist account has been set up successfully! Start managing installations and AR demonstrations.',
        'system',
        false
    ),
    (
        '550e8400-e29b-41d4-a716-44665544000b',
        '550e8400-e29b-41d4-a716-446655440005',
        'New Blinds Installation Job',
        'Premium blackout blinds installation scheduled for Luxury Homes Ltd.',
        'job',
        false
    ) ON CONFLICT (id) DO NOTHING;

END $$;