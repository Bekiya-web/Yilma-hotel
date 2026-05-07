-- ============================================
-- MIGRATE REVIEWS TABLE TO ADD APPROVAL SYSTEM
-- Run this in your Supabase SQL Editor BEFORE deleting mock data
-- ============================================

-- Add new columns to reviews table if they don't exist
ALTER TABLE reviews 
ADD COLUMN IF NOT EXISTS booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS guest_id UUID REFERENCES guests(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS approved BOOLEAN DEFAULT false;

-- Update existing reviews to be unapproved (they are mock data anyway)
UPDATE reviews SET approved = false WHERE approved IS NULL;

-- Create index for approved column
CREATE INDEX IF NOT EXISTS idx_reviews_approved ON reviews(approved);
CREATE INDEX IF NOT EXISTS idx_reviews_booking_id ON reviews(booking_id);

-- Drop old policy and create new one for approved reviews only
DROP POLICY IF EXISTS "Public can view reviews" ON reviews;
DROP POLICY IF EXISTS "Public can view approved reviews" ON reviews;

CREATE POLICY "Public can view approved reviews" ON reviews 
FOR SELECT USING (approved = true);

-- Allow public to submit reviews (they will be unapproved by default)
DROP POLICY IF EXISTS "Public can submit reviews" ON reviews;
CREATE POLICY "Public can submit reviews" ON reviews 
FOR INSERT WITH CHECK (true);

-- Allow authenticated users (admin) to manage all reviews
DROP POLICY IF EXISTS "Authenticated users can manage reviews" ON reviews;
CREATE POLICY "Authenticated users can manage reviews" ON reviews 
FOR ALL USING (auth.role() = 'authenticated');

-- Allow public (using anon key) to manage reviews for admin operations
DROP POLICY IF EXISTS "Public can manage reviews" ON reviews;
CREATE POLICY "Public can manage reviews" ON reviews 
FOR ALL USING (true);

-- ============================================
-- VERIFICATION
-- ============================================
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'reviews'
ORDER BY ordinal_position;
