-- Create admin users table
CREATE TABLE IF NOT EXISTS admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
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

-- Enable RLS but allow all operations (for admin authentication)
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow all operations on admin_users" ON admin_users;

-- Create policy to allow all operations
CREATE POLICY "Allow all operations on admin_users"
  ON admin_users
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Delete any existing admin users (for clean setup)
DELETE FROM admin_users;

-- Insert default admin user
-- Email: bekibekinat@gmail.com
-- Password: beki1234
-- Hash is SHA-256 of "beki1234"
INSERT INTO admin_users (email, password_hash)
VALUES (
  'bekibekinat@gmail.com', 
  '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92'
);

-- Add comment
COMMENT ON TABLE admin_users IS 'Admin users for authentication';
COMMENT ON COLUMN admin_users.email IS 'Admin email address (unique)';
COMMENT ON COLUMN admin_users.password_hash IS 'Hashed password (SHA-256)';

-- Verify the admin was created
SELECT email, created_at FROM admin_users;
