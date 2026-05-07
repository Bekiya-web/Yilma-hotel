// Database types for Supabase tables

export interface Room {
  id: string;
  room_id: string;
  name: string;
  tagline: string;
  description: string;
  long_description: string;
  price: number;
  image: string;
  gallery: string[];
  bed: string;
  size: string;
  guests: number;
  rating: number;
  reviews_count: number;
  amenities: string[];
  available: number;
  view: string;
  created_at?: string;
  updated_at?: string;
}

export interface Guest {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  phone_verified?: boolean;
  country?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Booking {
  id: string;
  booking_id: string;
  guest_id: string;
  room_id: string;
  check_in: string;
  check_out: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  amount: number;
  guests_count: number;
  special_requests?: string;
  payment_method: 'telebirr' | 'bank' | 'hotel';
  payment_proof_url?: string;
  payment_status: 'pending' | 'verified' | 'failed';
  id_type?: 'national_id' | 'drivers_license' | 'regional_id';
  id_front_url?: string;
  id_back_url?: string;
  selfie_url?: string;
  id_verified?: boolean;
  created_at?: string;
  updated_at?: string;
  // Joined data
  guest?: Guest;
  room?: Room;
}

export interface Review {
  id: string;
  booking_id?: string;
  guest_id?: string;
  guest_name: string;
  country?: string;
  review_date: string;
  rating: number;
  room_type?: string;
  text: string;
  verified: boolean;
  approved: boolean;
  created_at?: string;
}

export interface RoomStatus {
  id: string;
  room_number: string;
  room_type: string;
  status: 'available' | 'occupied' | 'cleaning' | 'maintenance';
  current_guest?: string;
  checkout_date?: string;
  updated_at?: string;
}

export interface DashboardStats {
  totalRevenue: number;
  revenueChange: string;
  bookingsToday: number;
  bookingsChange: string;
  occupancyRate: number;
  occupancyChange: string;
  guestRating: number;
  ratingChange: string;
}
