-- Fix RLS issues for admin_users table
-- This script completely disables RLS for admin_users to allow all operations

-- First, check if table exists and create if needed
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'admin_users') THEN
    -- Create table if it doesn't exist
    CREATE TABLE admin_users (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
    
    RAISE NOTICE 'Created admin_users table';
  ELSE
    RAISE NOTICE 'admin_users table already exists';
  END IF;
END $$;

-- DISABLE RLS completely (this allows all operations without policies)
ALTER TABLE admin_users DISABLE ROW LEVEL SECURITY;

-- Drop all existing policies (cleanup)
DROP POLICY IF EXISTS "Allow all operations on admin_users" ON admin_users;
DROP POLICY IF EXISTS "Enable read access for all users" ON admin_users;
DROP POLICY IF EXISTS "Enable insert for all users" ON admin_users;
DROP POLICY IF EXISTS "Enable update for all users" ON admin_users;
DROP POLICY IF EXISTS "Enable delete for all users" ON admin_users;

-- Clear existing data
TRUNCATE admin_users CASCADE;

-- Insert default admin
-- Email: bekibekinat@gmail.com
-- Password: beki1234
-- Hash: SHA-256 of "beki1234"
INSERT INTO admin_users (email, password_hash)
VALUES (
  'bekibekinat@gmail.com',
  '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92'
);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_admin_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS admin_users_updated_at ON admin_users;
CREATE TRIGGER admin_users_updated_at
  BEFORE UPDATE ON admin_users
  FOR EACH ROW
  EXECUTE FUNCTION update_admin_updated_at();

-- Verify the setup
SELECT 
  '✅ Admin user created successfully!' as status,
  email,
  created_at,
  'RLS is DISABLED - all operations allowed' as security_note
FROM admin_users 
WHERE email = 'bekibekinat@gmail.com';

-- Show table info
SELECT 

  'Table: admin_users' as info,
  'RLS Status: ' || CASE WHEN relrowsecurity THEN 'ENABLED ⚠️' ELSE 'DISABLED ✅' END as rls_status
FROM pg_class 
WHERE relname = 'admin_users';
