-- ============================================
-- ADD PAYMENT FIELDS TO BOOKINGS TABLE
-- Run this in your Supabase SQL Editor
-- ============================================

-- Add payment-related columns to bookings table
ALTER TABLE bookings 
ADD COLUMN IF NOT EXISTS payment_method TEXT DEFAULT 'hotel' CHECK (payment_method IN ('telebirr', 'bank', 'hotel')),
ADD COLUMN IF NOT EXISTS payment_proof_url TEXT,
ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'verified', 'failed'));

-- Update existing bookings to have default payment method
UPDATE bookings SET payment_method = 'hotel' WHERE payment_method IS NULL;
UPDATE bookings SET payment_status = 'pending' WHERE payment_status IS NULL;

-- Create index for payment status
CREATE INDEX IF NOT EXISTS idx_bookings_payment_status ON bookings(payment_status);

-- Verify the changes
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'bookings' 
  AND column_name IN ('payment_method', 'payment_proof_url', 'payment_status')
ORDER BY ordinal_position;
