-- Simple settings table creation (no RLS for testing)
CREATE TABLE IF NOT EXISTS settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key TEXT UNIQUE NOT NULL,
  value JSONB NOT NULL,
  category TEXT NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default settings
INSERT INTO settings (key, value, category) VALUES
  ('hotel_info', '{"name": "Auréa Grand Hotel", "email": "info@aureagrand.com", "phone": "+251 912 345 678", "address": "Addis Ababa, Ethiopia", "description": "Experience luxury and comfort at Auréa Grand Hotel", "website": "https://aureagrand.com"}'::jsonb, 'hotel'),
  ('payment_settings', '{"telebirrEnabled": true, "telebirrPhone": "+251 912 345 678", "telebirrAccountName": "Auréa Grand Hotel", "bankEnabled": true, "bankName": "Commercial Bank of Ethiopia", "bankAccountNumber": "1000123456789", "bankAccountName": "Auréa Grand Hotel PLC", "bankSwiftCode": "CBETETAA", "payAtHotelEnabled": true, "currency": "USD", "taxRate": 15}'::jsonb, 'payment'),
  ('booking_settings', '{"minAdvanceBookingDays": 1, "maxAdvanceBookingDays": 365, "cancellationHours": 48, "checkInTime": "14:00", "checkOutTime": "12:00", "requirePaymentProof": true, "autoApprovePayAtHotel": false}'::jsonb, 'booking'),
  ('notification_settings', '{"emailNotifications": true, "smsNotifications": false, "adminEmail": "admin@aureagrand.com", "bookingNotificationEmail": "bookings@aureagrand.com"}'::jsonb, 'notification')
ON CONFLICT (key) DO NOTHING;

-- Disable RLS temporarily for testing
ALTER TABLE settings DISABLE ROW LEVEL SECURITY;
