-- Fix RLS policies for settings table to allow updates

-- Drop existing policies
DROP POLICY IF EXISTS "Allow public read access to settings" ON settings;
DROP POLICY IF EXISTS "Allow authenticated users to update settings" ON settings;

-- Disable RLS temporarily for testing
ALTER TABLE settings DISABLE ROW LEVEL SECURITY;

-- Or if you want to keep RLS enabled, use these policies instead:
-- ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- CREATE POLICY "Allow all access to settings"
--   ON settings FOR ALL
--   TO public
--   USING (true)
--   WITH CHECK (true);
