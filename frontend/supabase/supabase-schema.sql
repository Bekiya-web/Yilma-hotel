-- Hotel Booking System Database Schema
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Rooms Table
CREATE TABLE rooms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  room_id TEXT UNIQUE NOT NULL, -- e.g., "classic-king"
  name TEXT NOT NULL,
  tagline TEXT,
  description TEXT,
  long_description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  image TEXT,
  gallery JSONB DEFAULT '[]'::jsonb,
  bed TEXT,
  size TEXT,
  guests INTEGER DEFAULT 2,
  rating DECIMAL(2, 1) DEFAULT 0,
  reviews_count INTEGER DEFAULT 0,
  amenities JSONB DEFAULT '[]'::jsonb,
  available INTEGER DEFAULT 0,
  view TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Guests Table
CREATE TABLE guests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  country TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Bookings Table
CREATE TABLE bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id TEXT UNIQUE NOT NULL, -- e.g., "BK-2401"
  guest_id UUID REFERENCES guests(id) ON DELETE CASCADE,
  room_id UUID REFERENCES rooms(id) ON DELETE CASCADE,
  check_in DATE NOT NULL,
  check_out DATE NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')),
  amount DECIMAL(10, 2) NOT NULL,
  guests_count INTEGER DEFAULT 1,
  special_requests TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Reviews Table (User-submitted after booking, requires admin approval)
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
  guest_id UUID REFERENCES guests(id) ON DELETE CASCADE,
  guest_name TEXT NOT NULL,
  country TEXT,
  review_date DATE DEFAULT CURRENT_DATE,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  room_type TEXT,
  text TEXT NOT NULL,
  verified BOOLEAN DEFAULT true,
  approved BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Room Status Table (for admin dashboard)
CREATE TABLE room_status (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  room_number TEXT UNIQUE NOT NULL,
  room_type TEXT NOT NULL,
  status TEXT DEFAULT 'available' CHECK (status IN ('available', 'occupied', 'cleaning', 'maintenance')),
  current_guest TEXT,
  checkout_date DATE,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_bookings_guest_id ON bookings(guest_id);
CREATE INDEX idx_bookings_room_id ON bookings(room_id);
CREATE INDEX idx_bookings_check_in ON bookings(check_in);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_reviews_rating ON reviews(rating);
CREATE INDEX idx_reviews_approved ON reviews(approved);
CREATE INDEX idx_reviews_booking_id ON reviews(booking_id);
CREATE INDEX idx_room_status_status ON room_status(status);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers for updated_at
CREATE TRIGGER update_rooms_updated_at BEFORE UPDATE ON rooms
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_guests_updated_at BEFORE UPDATE ON guests
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON bookings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_room_status_updated_at BEFORE UPDATE ON room_status
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- NO MOCK DATA - All data must be created through the admin panel or user submissions
-- Rooms: Created by admin through /admin/rooms
-- Guests: Created when users make bookings
-- Bookings: Created when users book rooms
-- Reviews: Submitted by users after booking, approved by admin
-- Room Status: Managed by admin through dashboard

-- Enable Row Level Security (RLS)
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE guests ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE room_status ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access (only approved reviews visible)
CREATE POLICY "Public can view rooms" ON rooms FOR SELECT USING (true);
CREATE POLICY "Public can view approved reviews" ON reviews FOR SELECT USING (approved = true);

-- Create policies for public write access (for admin operations using anon key)
CREATE POLICY "Public can insert rooms" ON rooms FOR INSERT WITH CHECK (true);
CREATE POLICY "Public can update rooms" ON rooms FOR UPDATE USING (true);
CREATE POLICY "Public can delete rooms" ON rooms FOR DELETE USING (true);

-- Create policies for authenticated users (admin)
CREATE POLICY "Authenticated users can manage guests" ON guests FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can manage bookings" ON bookings FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can manage reviews" ON reviews FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can manage room status" ON room_status FOR ALL USING (auth.role() = 'authenticated');

-- Allow public to create bookings, guests, and submit reviews
CREATE POLICY "Public can create guests" ON guests FOR INSERT WITH CHECK (true);
CREATE POLICY "Public can create bookings" ON bookings FOR INSERT WITH CHECK (true);
CREATE POLICY "Public can view their bookings" ON bookings FOR SELECT USING (true);
CREATE POLICY "Public can submit reviews" ON reviews FOR INSERT WITH CHECK (true);
