-- Add ID verification fields to bookings table
ALTER TABLE bookings 
ADD COLUMN IF NOT EXISTS id_type TEXT CHECK (id_type IN ('national_id', 'drivers_license', 'regional_id')),
ADD COLUMN IF NOT EXISTS id_front_url TEXT,
ADD COLUMN IF NOT EXISTS id_back_url TEXT,
ADD COLUMN IF NOT EXISTS selfie_url TEXT,
ADD COLUMN IF NOT EXISTS id_verified BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS id_verified_at TIMESTAMP WITH TIME ZONE;

-- Add comment
COMMENT ON COLUMN bookings.id_type IS 'Type of ID: national_id, drivers_license, or regional_id';
COMMENT ON COLUMN bookings.id_front_url IS 'URL of ID front image';
COMMENT ON COLUMN bookings.id_back_url IS 'URL of ID back image';
COMMENT ON COLUMN bookings.selfie_url IS 'URL of selfie image for face verification';
COMMENT ON COLUMN bookings.id_verified IS 'Whether ID has been verified by admin';
COMMENT ON COLUMN bookings.id_verified_at IS 'When ID was verified';