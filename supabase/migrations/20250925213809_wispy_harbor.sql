/*
  # Enhanced User Management with Hierarchy and Permissions

  1. New Tables
    - Enhanced `users` table with parent relationships
    - `user_permissions` - Individual user permissions
    - `module_access` - Module-specific access control
    - `user_hierarchy` - Parent-child relationships
    - `activity_logs` - User activity tracking

  2. Security
    - Enable RLS on all tables
    - Add policies for hierarchical access control
    - Secure parent-child relationships

  3. Features
    - Parent-child user relationships
    - Granular permission system
    - Module access control
    - Activity logging
    - Secure role-based access
*/

-- User Permissions Table
CREATE TABLE IF NOT EXISTS user_permissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  permission_name text NOT NULL,
  granted_by uuid REFERENCES users(id),
  granted_at timestamptz DEFAULT now(),
  is_active boolean DEFAULT true,
  UNIQUE(user_id, permission_name)
);

-- Module Access Control
CREATE TABLE IF NOT EXISTS module_access (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  module_name text NOT NULL,
  can_access boolean DEFAULT false,
  can_grant_access boolean DEFAULT false,
  granted_by uuid REFERENCES users(id),
  granted_at timestamptz DEFAULT now(),
  revoked_at timestamptz,
  is_active boolean DEFAULT true,
  UNIQUE(user_id, module_name)
);

-- User Hierarchy Table
CREATE TABLE IF NOT EXISTS user_hierarchy (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id uuid REFERENCES users(id) ON DELETE CASCADE,
  child_id uuid REFERENCES users(id) ON DELETE CASCADE,
  relationship_type text NOT NULL CHECK (relationship_type IN ('admin_business', 'admin_employee', 'business_employee')),
  created_by uuid REFERENCES users(id),
  created_at timestamptz DEFAULT now(),
  is_active boolean DEFAULT true,
  UNIQUE(parent_id, child_id)
);

-- Activity Logs Table
CREATE TABLE IF NOT EXISTS activity_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE SET NULL,
  action text NOT NULL,
  target_type text, -- 'user', 'job', 'module', etc.
  target_id text,
  details jsonb DEFAULT '{}',
  ip_address inet,
  user_agent text,
  created_at timestamptz DEFAULT now()
);

-- User Sessions Table
CREATE TABLE IF NOT EXISTS user_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  session_token text UNIQUE NOT NULL,
  expires_at timestamptz NOT NULL,
  created_at timestamptz DEFAULT now(),
  last_accessed timestamptz DEFAULT now(),
  ip_address inet,
  user_agent text,
  is_active boolean DEFAULT true
);

-- Add parent_id to users table if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'users' AND column_name = 'parent_id'
  ) THEN
    ALTER TABLE users ADD COLUMN parent_id uuid REFERENCES users(id);
  END IF;
END $$;

-- Add created_by to users table if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'users' AND column_name = 'created_by'
  ) THEN
    ALTER TABLE users ADD COLUMN created_by uuid REFERENCES users(id);
  END IF;
END $$;

-- Enable RLS on new tables
ALTER TABLE user_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE module_access ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_hierarchy ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;

-- User Permissions Policies
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

-- Module Access Policies
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

-- User Hierarchy Policies
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

-- Activity Logs Policies
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

-- User Sessions Policies
CREATE POLICY "Users can read own sessions" ON user_sessions
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can manage own sessions" ON user_sessions
  FOR ALL TO authenticated
  USING (user_id = auth.uid());

-- Functions for user management
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

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_permissions_user_id ON user_permissions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_permissions_permission_name ON user_permissions(permission_name);
CREATE INDEX IF NOT EXISTS idx_module_access_user_id ON module_access(user_id);
CREATE INDEX IF NOT EXISTS idx_module_access_module_name ON module_access(module_name);
CREATE INDEX IF NOT EXISTS idx_user_hierarchy_parent_id ON user_hierarchy(parent_id);
CREATE INDEX IF NOT EXISTS idx_user_hierarchy_child_id ON user_hierarchy(child_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_user_id ON activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created_at ON activity_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_session_token ON user_sessions(session_token);

-- Insert some initial module access for existing users
INSERT INTO module_access (user_id, module_name, can_access, can_grant_access, granted_by) 
SELECT 
  id,
  'ar-camera',
  true,
  true,
  id
FROM users 
WHERE role = 'admin'
ON CONFLICT (user_id, module_name) DO NOTHING;