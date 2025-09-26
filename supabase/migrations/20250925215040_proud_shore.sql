/*
  # Fix Foreign Key Relationships in Users Table

  1. Changes
    - Add proper foreign key constraints for parent_id and created_by columns
    - Ensure Supabase can recognize the relationships for PostgREST queries
    - Add indexes for better performance

  2. Security
    - Maintain existing RLS policies
    - No changes to security model
*/

-- First, ensure the columns exist (they should from previous migration)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'users' AND column_name = 'parent_id'
  ) THEN
    ALTER TABLE users ADD COLUMN parent_id uuid;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'users' AND column_name = 'created_by'
  ) THEN
    ALTER TABLE users ADD COLUMN created_by uuid;
  END IF;
END $$;

-- Drop existing foreign key constraints if they exist (to recreate them properly)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'users_parent_id_fkey' 
    AND table_name = 'users'
  ) THEN
    ALTER TABLE users DROP CONSTRAINT users_parent_id_fkey;
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'users_created_by_fkey' 
    AND table_name = 'users'
  ) THEN
    ALTER TABLE users DROP CONSTRAINT users_created_by_fkey;
  END IF;
END $$;

-- Add the foreign key constraints properly
ALTER TABLE users 
ADD CONSTRAINT users_parent_id_fkey 
FOREIGN KEY (parent_id) REFERENCES users(id) ON DELETE SET NULL;

ALTER TABLE users 
ADD CONSTRAINT users_created_by_fkey 
FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_parent_id ON users(parent_id);
CREATE INDEX IF NOT EXISTS idx_users_created_by ON users(created_by);

-- Refresh the schema cache to ensure PostgREST recognizes the relationships
NOTIFY pgrst, 'reload schema';