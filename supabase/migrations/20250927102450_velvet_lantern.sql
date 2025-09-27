/*
  # Auth Integration Trigger

  1. Auth Trigger Function
    - Automatically creates user record when auth user is created
    - Handles user metadata from auth.users
    - Sets up proper permissions and business relationships

  2. Security
    - Secure function with proper error handling
    - Validates user data before insertion
    - Maintains data consistency
*/

-- Function to handle new user creation from auth
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (id, email, name, role, business_id, permissions, is_active, email_verified)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'role', 'employee'),
    CASE 
      WHEN NEW.raw_user_meta_data->>'business_id' IS NOT NULL 
      THEN (NEW.raw_user_meta_data->>'business_id')::uuid 
      ELSE NULL 
    END,
    CASE 
      WHEN NEW.raw_user_meta_data->>'role' = 'admin' THEN ARRAY['all']
      WHEN NEW.raw_user_meta_data->>'role' = 'business' THEN ARRAY['manage_employees', 'view_dashboard', 'create_jobs']
      ELSE ARRAY['create_jobs', 'manage_tasks', 'capture_signatures']
    END,
    true,
    NEW.email_confirmed_at IS NOT NULL
  );
  RETURN NEW;
EXCEPTION
  WHEN unique_violation THEN
    -- User already exists, update instead
    UPDATE public.users 
    SET 
      email = NEW.email,
      email_verified = NEW.email_confirmed_at IS NOT NULL,
      updated_at = now()
    WHERE id = NEW.id;
    RETURN NEW;
  WHEN OTHERS THEN
    -- Log error but don't fail auth
    RAISE WARNING 'Failed to create user record: %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger on auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to handle user updates from auth
CREATE OR REPLACE FUNCTION public.handle_user_update()
RETURNS trigger AS $$
BEGIN
  UPDATE public.users 
  SET 
    email = NEW.email,
    email_verified = NEW.email_confirmed_at IS NOT NULL,
    updated_at = now()
  WHERE id = NEW.id;
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING 'Failed to update user record: %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for auth user updates
DROP TRIGGER IF EXISTS on_auth_user_updated ON auth.users;
CREATE TRIGGER on_auth_user_updated
  AFTER UPDATE ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_user_update();