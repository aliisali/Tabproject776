/*
  # Integrate Supabase Authentication with Custom Users Table

  1. Extensions
    - Enable uuid-ossp extension for UUID generation

  2. Users Table Integration
    - Link custom users table to auth.users
    - Add foreign key constraint for data integrity
    - Set default role for new users

  3. Authentication Triggers
    - Automatically create users row when auth user is created
    - Handle user creation seamlessly
    - Maintain data consistency between auth and custom tables

  4. Security
    - Proper foreign key relationships
    - Cascade delete for data cleanup
    - Security definer for trigger function
*/

-- Ensure auth extension is enabled
create extension if not exists "uuid-ossp";

-- Link your custom users table to Supabase auth.users
alter table public.users
drop constraint if exists users_pkey;

alter table public.users
add constraint users_pkey primary key (id);

-- Ensure `id` matches auth.users.id
alter table public.users
drop constraint if exists users_id_fkey;

alter table public.users
add constraint users_id_fkey
foreign key (id) references auth.users(id)
on delete cascade;

-- Default values for safety
alter table public.users
alter column role set default 'user';

-- Trigger function: create public.users row when auth.users is created
create or replace function public.handle_new_auth_user()
returns trigger as $$
begin
  insert into public.users (id, email, name, role, is_active, email_verified)
  values (new.id, new.email, '', 'user', true, false)
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

-- Drop old trigger if exists
drop trigger if exists on_auth_user_created on auth.users;

-- Create new trigger
create trigger on_auth_user_created
after insert on auth.users
for each row
execute function public.handle_new_auth_user();

-- Update existing users to ensure they have proper auth entries
-- This is safe to run multiple times
DO $$
DECLARE
    user_record RECORD;
BEGIN
    -- For each user in public.users, ensure they have an auth.users entry
    FOR user_record IN SELECT * FROM public.users LOOP
        -- This would typically be handled by your application
        -- when migrating existing users to Supabase auth
        RAISE NOTICE 'User % exists in public.users', user_record.email;
    END LOOP;
END $$;

-- Add helpful comments
COMMENT ON FUNCTION public.handle_new_auth_user() IS 'Automatically creates a row in public.users when a new user signs up via Supabase auth';
COMMENT ON TRIGGER on_auth_user_created ON auth.users IS 'Trigger to create public.users row when auth.users row is created';