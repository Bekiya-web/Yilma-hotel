-- Create settings table
CREATE TABLE IF NOT EXISTS settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key TEXT UNIQUE NOT NULL,
  value JSONB NOT NULL,
  category TEXT NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_settings_key ON settings(key);
CREATE INDEX IF NOT EXISTS idx_settings_category ON settings(category);

-- Enable RLS
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- Allow public read access to settings
CREATE POLICY "Allow public read access to settings"
  ON settings FOR SELECT
  TO public
  USING (true);

-- Allow authenticated users to update settings (admin only in production)
CREATE POLICY "Allow authenticated users to update settings"
  ON settings FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Insert default settings
INSERT INTO settings (key, value, category) VALUES
  ('hotel_info', '{
    "name": "Auréa Grand Hotel",
    "email": "info@aureagrand.com",
    "phone": "+251 912 345 678",
    "address": "Addis Ababa, Ethiopia",
    "description": "Experience luxury and comfort at Auréa Grand Hotel",
    "website": "https://aureagrand.com"
  }'::jsonb, 'hotel'),
  
  ('payment_settings', '{
    "telebirrEnabled": true,
    "telebirrPhone": "+251 912 345 678",
    "telebirrAccountName": "Auréa Grand Hotel",
    "bankEnabled": true,
    "bankName": "Commercial Bank of Ethiopia",
    "bankAccountNumber": "1000123456789",
    "bankAccountName": "Auréa Grand Hotel PLC",
    "bankSwiftCode": "CBETETAA",
    "payAtHotelEnabled": true,
    "currency": "ETB",
    "taxRate": 15
  }'::jsonb, 'payment'),
  
  ('booking_settings', '{
    "minAdvanceBookingDays": 1,
    "maxAdvanceBookingDays": 365,
    "cancellationHours": 48,
    "checkInTime": "14:00",
    "checkOutTime": "12:00",
    "requirePaymentProof": true,
    "autoApprovePayAtHotel": false
  }'::jsonb, 'booking'),
  
  ('notification_settings', '{
    "emailNotifications": true,
    "smsNotifications": false,
    "adminEmail": "admin@aureagrand.com",
    "bookingNotificationEmail": "bookings@aureagrand.com"
  }'::jsonb, 'notification')
ON CONFLICT (key) DO NOTHING;

-- Create function to update settings timestamp
CREATE OR REPLACE FUNCTION update_settings_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS settings_updated_at ON settings;
CREATE TRIGGER settings_updated_at
  BEFORE UPDATE ON settings
  FOR EACH ROW
  EXECUTE FUNCTION update_settings_timestamp();

COMMENT ON TABLE settings IS 'System-wide settings for the hotel booking system';
COMMENT ON COLUMN settings.key IS 'Unique identifier for the setting';
COMMENT ON COLUMN settings.value IS 'JSON value of the setting';
COMMENT ON COLUMN settings.category IS 'Category of the setting (hotel, payment, booking, notification)';
