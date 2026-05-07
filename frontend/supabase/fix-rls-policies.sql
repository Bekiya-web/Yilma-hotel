-- ============================================
-- FIX ROW LEVEL SECURITY POLICIES
-- Run this in your Supabase SQL Editor to fix 406 errors
-- ============================================

-- Drop all existing policies for rooms
DROP POLICY IF EXISTS "Public can view rooms" ON rooms;
DROP POLICY IF EXISTS "Public can insert rooms" ON rooms;
DROP POLICY IF EXISTS "Public can update rooms" ON rooms;
DROP POLICY IF EXISTS "Public can delete rooms" ON rooms;
DROP POLICY IF EXISTS "Authenticated users can manage rooms" ON rooms;

-- Create new policies that allow public read access
CREATE POLICY "Enable read access for all users" ON rooms
FOR SELECT USING (true);

-- Allow public (anon key) to manage rooms for admin operations
CREATE POLICY "Enable insert for all users" ON rooms
FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable update for all users" ON rooms
FOR UPDATE USING (true);

CREATE POLICY "Enable delete for all users" ON rooms
FOR DELETE USING (true);

-- ============================================
-- Fix other tables policies
-- ============================================

-- Guests policies
DROP POLICY IF EXISTS "Public can create guests" ON guests;
DROP POLICY IF EXISTS "Authenticated users can manage guests" ON guests;

CREATE POLICY "Enable all access for guests" ON guests
FOR ALL USING (true);

-- Bookings policies
DROP POLICY IF EXISTS "Public can create bookings" ON bookings;
DROP POLICY IF EXISTS "Public can view their bookings" ON bookings;
DROP POLICY IF EXISTS "Authenticated users can manage bookings" ON bookings;

CREATE POLICY "Enable all access for bookings" ON bookings
FOR ALL USING (true);

-- Reviews policies (keep approved-only for public read)
DROP POLICY IF EXISTS "Public can view reviews" ON reviews;
DROP POLICY IF EXISTS "Public can view approved reviews" ON reviews;
DROP POLICY IF EXISTS "Public can submit reviews" ON reviews;
DROP POLICY IF EXISTS "Public can manage reviews" ON reviews;
DROP POLICY IF EXISTS "Authenticated users can manage reviews" ON reviews;

CREATE POLICY "Enable read approved reviews" ON reviews
FOR SELECT USING (approved = true);

CREATE POLICY "Enable insert for reviews" ON reviews
FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable update for reviews" ON reviews
FOR UPDATE USING (true);

CREATE POLICY "Enable delete for reviews" ON reviews
FOR DELETE USING (true);

-- Room status policies
DROP POLICY IF EXISTS "Authenticated users can manage room status" ON room_status;

CREATE POLICY "Enable all access for room_status" ON room_status
FOR ALL USING (true);

-- ============================================
-- VERIFICATION
-- ============================================
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
