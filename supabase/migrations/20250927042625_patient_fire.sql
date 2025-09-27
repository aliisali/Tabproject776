-- BlindsCloud Database Schema
-- PostgreSQL database schema for the complete business management platform

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table with hierarchy support
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('admin', 'business', 'employee')),
    business_id UUID,
    parent_id UUID REFERENCES users(id) ON DELETE SET NULL,
    permissions TEXT[] DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    email_verified BOOLEAN DEFAULT false,
    verification_token VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES users(id)
);

-- Businesses table
CREATE TABLE IF NOT EXISTS businesses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    address TEXT NOT NULL,
    phone VARCHAR(50),
    email VARCHAR(255),
    admin_id UUID REFERENCES users(id),
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
    business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Jobs table
CREATE TABLE IF NOT EXISTS jobs (
    id VARCHAR(50) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'in-progress', 'completed', 'cancelled')),
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    employee_id UUID REFERENCES users(id),
    business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
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
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) DEFAULT 'system' CHECK (type IN ('reminder', 'job', 'system')),
    read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Module permissions table
CREATE TABLE IF NOT EXISTS module_permissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    module_id VARCHAR(100) NOT NULL,
    can_access BOOLEAN DEFAULT false,
    can_grant_access BOOLEAN DEFAULT false,
    granted_by UUID REFERENCES users(id),
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
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Model permissions table
CREATE TABLE IF NOT EXISTS model_permissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    can_view_3d_models BOOLEAN DEFAULT false,
    can_use_in_ar BOOLEAN DEFAULT false,
    granted_by UUID REFERENCES users(id),
    granted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Activity logs table
CREATE TABLE IF NOT EXISTS activity_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
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
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    session_token VARCHAR(255) UNIQUE NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add foreign key constraints
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_users_business' 
        AND table_name = 'users'
    ) THEN
        ALTER TABLE users ADD CONSTRAINT fk_users_business 
        FOREIGN KEY (business_id) REFERENCES businesses(id) ON DELETE SET NULL;
    END IF;
END $$;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_business_id ON users(business_id);
CREATE INDEX IF NOT EXISTS idx_users_parent_id ON users(parent_id);
CREATE INDEX IF NOT EXISTS idx_jobs_customer_id ON jobs(customer_id);
CREATE INDEX IF NOT EXISTS idx_jobs_employee_id ON jobs(employee_id);
CREATE INDEX IF NOT EXISTS idx_jobs_business_id ON jobs(business_id);
CREATE INDEX IF NOT EXISTS idx_jobs_status ON jobs(status);
CREATE INDEX IF NOT EXISTS idx_jobs_scheduled_date ON jobs(scheduled_date);
CREATE INDEX IF NOT EXISTS idx_customers_business_id ON customers(business_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_user_id ON activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_token ON user_sessions(session_token);

-- Insert default admin user (password: 'password')
INSERT INTO users (id, email, name, password_hash, role, permissions, is_active, email_verified) 
VALUES (
    '550e8400-e29b-41d4-a716-446655440000',
    'admin@blindscloud.co.uk',
    'BlindsCloud Admin',
    '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', -- password: 'password'
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
) ON CONFLICT DO NOTHING;

-- Insert default business user
INSERT INTO users (id, email, name, password_hash, role, business_id, permissions, is_active, email_verified)
VALUES (
    '550e8400-e29b-41d4-a716-446655440002',
    'business@blindscloud.co.uk',
    'Business Manager',
    '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
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
    '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
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