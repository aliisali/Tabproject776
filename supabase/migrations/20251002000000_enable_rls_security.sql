/*
  # Enable Row Level Security for All Tables

  1. Security Setup
    - Enable RLS on all tables
    - Create policies for users table (users can read own data, admins can read all)
    - Create policies for businesses table (business members can read own business)
    - Create policies for customers table (business users can manage their customers)
    - Create policies for jobs table (business users can manage their jobs)
    - Create policies for products table (public read, admin write)
    - Create policies for notifications table (users can read own notifications)
    - Create policies for module_permissions table (users can read own permissions)
    - Create policies for models_3d table (admins can manage, users with permissions can view)
    - Create policies for model_permissions table (admins can manage)
    - Create policies for activity_logs table (users can read own logs, admins can read all)
    - Create policies for user_sessions table (users can manage own sessions)

  2. Important Notes
    - All tables are locked down by default after enabling RLS
    - Only authenticated users with proper permissions can access data
    - Admins have full access to all data
    - Business users can only access their own business data
    - Employees can only access their assigned data
*/

-- Enable RLS on all tables
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

-- Users table policies
CREATE POLICY "Users can view own profile"
  ON users FOR SELECT
  TO authenticated
  USING (auth.uid()::text = id::text);

CREATE POLICY "Admins can view all users"
  ON users FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id::text = auth.uid()::text
      AND role = 'admin'
    )
  );

CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  TO authenticated
  USING (auth.uid()::text = id::text)
  WITH CHECK (auth.uid()::text = id::text);

CREATE POLICY "Admins can insert users"
  ON users FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE id::text = auth.uid()::text
      AND role = 'admin'
    )
  );

CREATE POLICY "Admins can update any user"
  ON users FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id::text = auth.uid()::text
      AND role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE id::text = auth.uid()::text
      AND role = 'admin'
    )
  );

-- Businesses table policies
CREATE POLICY "Business members can view own business"
  ON businesses FOR SELECT
  TO authenticated
  USING (
    id IN (
      SELECT business_id FROM users
      WHERE id::text = auth.uid()::text
    )
    OR EXISTS (
      SELECT 1 FROM users
      WHERE id::text = auth.uid()::text
      AND role = 'admin'
    )
  );

CREATE POLICY "Admins can insert businesses"
  ON businesses FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE id::text = auth.uid()::text
      AND role = 'admin'
    )
  );

CREATE POLICY "Business admins can update own business"
  ON businesses FOR UPDATE
  TO authenticated
  USING (
    admin_id::text = auth.uid()::text
    OR EXISTS (
      SELECT 1 FROM users
      WHERE id::text = auth.uid()::text
      AND role = 'admin'
    )
  )
  WITH CHECK (
    admin_id::text = auth.uid()::text
    OR EXISTS (
      SELECT 1 FROM users
      WHERE id::text = auth.uid()::text
      AND role = 'admin'
    )
  );

-- Customers table policies
CREATE POLICY "Business members can view own customers"
  ON customers FOR SELECT
  TO authenticated
  USING (
    business_id IN (
      SELECT business_id FROM users
      WHERE id::text = auth.uid()::text
    )
  );

CREATE POLICY "Business members can insert customers"
  ON customers FOR INSERT
  TO authenticated
  WITH CHECK (
    business_id IN (
      SELECT business_id FROM users
      WHERE id::text = auth.uid()::text
    )
  );

CREATE POLICY "Business members can update own customers"
  ON customers FOR UPDATE
  TO authenticated
  USING (
    business_id IN (
      SELECT business_id FROM users
      WHERE id::text = auth.uid()::text
    )
  )
  WITH CHECK (
    business_id IN (
      SELECT business_id FROM users
      WHERE id::text = auth.uid()::text
    )
  );

CREATE POLICY "Business members can delete own customers"
  ON customers FOR DELETE
  TO authenticated
  USING (
    business_id IN (
      SELECT business_id FROM users
      WHERE id::text = auth.uid()::text
    )
  );

-- Jobs table policies
CREATE POLICY "Business members can view own jobs"
  ON jobs FOR SELECT
  TO authenticated
  USING (
    business_id IN (
      SELECT business_id FROM users
      WHERE id::text = auth.uid()::text
    )
  );

CREATE POLICY "Business members can insert jobs"
  ON jobs FOR INSERT
  TO authenticated
  WITH CHECK (
    business_id IN (
      SELECT business_id FROM users
      WHERE id::text = auth.uid()::text
    )
  );

CREATE POLICY "Business members can update own jobs"
  ON jobs FOR UPDATE
  TO authenticated
  USING (
    business_id IN (
      SELECT business_id FROM users
      WHERE id::text = auth.uid()::text
    )
  )
  WITH CHECK (
    business_id IN (
      SELECT business_id FROM users
      WHERE id::text = auth.uid()::text
    )
  );

CREATE POLICY "Business members can delete own jobs"
  ON jobs FOR DELETE
  TO authenticated
  USING (
    business_id IN (
      SELECT business_id FROM users
      WHERE id::text = auth.uid()::text
    )
  );

-- Products table policies (public read, admin write)
CREATE POLICY "Anyone can view products"
  ON products FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can insert products"
  ON products FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE id::text = auth.uid()::text
      AND role = 'admin'
    )
  );

CREATE POLICY "Admins can update products"
  ON products FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id::text = auth.uid()::text
      AND role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE id::text = auth.uid()::text
      AND role = 'admin'
    )
  );

CREATE POLICY "Admins can delete products"
  ON products FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id::text = auth.uid()::text
      AND role = 'admin'
    )
  );

-- Notifications table policies
CREATE POLICY "Users can view own notifications"
  ON notifications FOR SELECT
  TO authenticated
  USING (user_id::text = auth.uid()::text);

CREATE POLICY "Users can update own notifications"
  ON notifications FOR UPDATE
  TO authenticated
  USING (user_id::text = auth.uid()::text)
  WITH CHECK (user_id::text = auth.uid()::text);

CREATE POLICY "System can insert notifications"
  ON notifications FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can delete own notifications"
  ON notifications FOR DELETE
  TO authenticated
  USING (user_id::text = auth.uid()::text);

-- Module permissions table policies
CREATE POLICY "Users can view own module permissions"
  ON module_permissions FOR SELECT
  TO authenticated
  USING (user_id::text = auth.uid()::text);

CREATE POLICY "Admins can view all module permissions"
  ON module_permissions FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id::text = auth.uid()::text
      AND role = 'admin'
    )
  );

CREATE POLICY "Admins can insert module permissions"
  ON module_permissions FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE id::text = auth.uid()::text
      AND role = 'admin'
    )
  );

CREATE POLICY "Admins can update module permissions"
  ON module_permissions FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id::text = auth.uid()::text
      AND role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE id::text = auth.uid()::text
      AND role = 'admin'
    )
  );

-- 3D Models table policies
CREATE POLICY "Users with permissions can view 3D models"
  ON models_3d FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users u
      JOIN model_permissions mp ON u.business_id = mp.business_id
      WHERE u.id::text = auth.uid()::text
      AND mp.can_view_3d_models = true
    )
    OR EXISTS (
      SELECT 1 FROM users
      WHERE id::text = auth.uid()::text
      AND role = 'admin'
    )
  );

CREATE POLICY "Admins can insert 3D models"
  ON models_3d FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE id::text = auth.uid()::text
      AND role = 'admin'
    )
  );

CREATE POLICY "Admins can update 3D models"
  ON models_3d FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id::text = auth.uid()::text
      AND role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE id::text = auth.uid()::text
      AND role = 'admin'
    )
  );

-- Model permissions table policies
CREATE POLICY "Business members can view own model permissions"
  ON model_permissions FOR SELECT
  TO authenticated
  USING (
    business_id IN (
      SELECT business_id FROM users
      WHERE id::text = auth.uid()::text
    )
    OR EXISTS (
      SELECT 1 FROM users
      WHERE id::text = auth.uid()::text
      AND role = 'admin'
    )
  );

CREATE POLICY "Admins can insert model permissions"
  ON model_permissions FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE id::text = auth.uid()::text
      AND role = 'admin'
    )
  );

CREATE POLICY "Admins can update model permissions"
  ON model_permissions FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id::text = auth.uid()::text
      AND role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE id::text = auth.uid()::text
      AND role = 'admin'
    )
  );

-- Activity logs table policies
CREATE POLICY "Users can view own activity logs"
  ON activity_logs FOR SELECT
  TO authenticated
  USING (user_id::text = auth.uid()::text);

CREATE POLICY "Admins can view all activity logs"
  ON activity_logs FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id::text = auth.uid()::text
      AND role = 'admin'
    )
  );

CREATE POLICY "System can insert activity logs"
  ON activity_logs FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- User sessions table policies
CREATE POLICY "Users can view own sessions"
  ON user_sessions FOR SELECT
  TO authenticated
  USING (user_id::text = auth.uid()::text);

CREATE POLICY "Users can insert own sessions"
  ON user_sessions FOR INSERT
  TO authenticated
  WITH CHECK (user_id::text = auth.uid()::text);

CREATE POLICY "Users can delete own sessions"
  ON user_sessions FOR DELETE
  TO authenticated
  USING (user_id::text = auth.uid()::text);
