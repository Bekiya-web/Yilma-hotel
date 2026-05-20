import { supabase } from './supabase-client';
import type { Booking, Guest } from '@/types/database';

export const getBookings = async (): Promise<Booking[]> => {
  const { data, error } = await supabase
    .from('bookings')
    .select(`
      *,
      guest:guests(*),
      room:rooms(*)
    `)
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data || [];
};

export const getBooking = async (id: string): Promise<Booking | null> => {
  const { data, error } = await supabase
    .from('bookings')
    .select(`
      *,
      guest:guests(*),
      room:rooms(*)
    `)
    .eq('id', id)
    .single();
  
  if (error) throw error;
  return data;
};

export const createBooking = async (booking: {
  guest: Omit<Guest, 'id' | 'created_at' | 'updated_at'>;
  room_id: string;
  check_in: string;
  check_out: string;
  guests_count: number;
  special_requests?: string;
  payment_method?: string;
  payment_proof_url?: string;
  id_type?: string;
  id_front_url?: string;
  id_back_url?: string;
  selfie_url?: string;
}) => {
  // First, create or get guest
  const { data: existingGuests } = await supabase
    .from('guests')
    .select('*')
    .eq('email', booking.guest.email)
    .limit(1);

  let guestId: string;
  
  if (existingGuests && existingGuests.length > 0) {
    const existingGuest = existingGuests[0];
    // Update existing guest with new information
    const { data: updatedGuest, error: updateError } = await supabase
      .from('guests')
      .update({
        first_name: booking.guest.first_name,
        last_name: booking.guest.last_name,
        phone: booking.guest.phone
      })
      .eq('id', existingGuest.id)
      .select()
      .single();
    
    if (updateError) throw updateError;
    guestId = updatedGuest.id;
  } else {
    const { data: newGuest, error: guestError } = await supabase
      .from('guests')
      .insert(booking.guest)
      .select()
      .single();
    
    if (guestError) throw guestError;
    guestId = newGuest.id;
  }

  // Get room to calculate amount
  const { data: room } = await supabase
    .from('rooms')
    .select('price, available')
    .eq('id', booking.room_id)
    .single();

  if (!room) throw new Error('Room not found');
  
  // Check if room is available
  if (room.available <= 0) {
    throw new Error('This room type is fully booked. Please select another room or different dates.');
  }

  // Calculate nights
  const checkIn = new Date(booking.check_in);
  const checkOut = new Date(booking.check_out);
  const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
  const amount = room.price * nights;

  // Generate booking ID
  const bookingCount = await supabase.from('bookings').select('id', { count: 'exact', head: true });
  const bookingId = `BK-${String((bookingCount.count || 0) + 2401).padStart(4, '0')}`;

  // Determine payment status based on payment method
  const paymentStatus = booking.payment_method === 'hotel' ? 'pending' : 'pending';

  // Create booking with payment and ID information
  const { data, error } = await supabase
    .from('bookings')
    .insert({
      booking_id: bookingId,
      guest_id: guestId,
      room_id: booking.room_id,
      check_in: booking.check_in,
      check_out: booking.check_out,
      guests_count: booking.guests_count,
      special_requests: booking.special_requests,
      amount,
      status: 'pending',
      payment_method: booking.payment_method || 'hotel',
      payment_proof_url: booking.payment_proof_url,
      payment_status: paymentStatus,
      id_type: booking.id_type,
      id_front_url: booking.id_front_url,
      id_back_url: booking.id_back_url,
      selfie_url: booking.selfie_url,
      id_verified: false
    })
    .select(`
      *,
      guest:guests(*),
      room:rooms(*)
    `)
    .single();
  
  if (error) throw error;

  // Decrease available room count
  const { error: updateError } = await supabase
    .from('rooms')
    .update({ available: room.available - 1 })
    .eq('id', booking.room_id);
  
  if (updateError) {
    console.error('Error updating room availability:', updateError);
    // Don't throw error here as booking is already created
  }

  return data;
};

export const updateBooking = async (id: string, updates: Partial<Booking>) => {
  // Get the current booking to check status changes
  const { data: currentBooking } = await supabase
    .from('bookings')
    .select('status, room_id')
    .eq('id', id)
    .single();

  const { data, error } = await supabase
    .from('bookings')
    .update(updates)
    .eq('id', id)
    .select(`
      *,
      guest:guests(*),
      room:rooms(*)
    `)
    .single();
  
  if (error) throw error;

  // If status changed to cancelled, increase available room count
  if (currentBooking && updates.status === 'cancelled' && currentBooking.status !== 'cancelled') {
    const { data: room } = await supabase
      .from('rooms')
      .select('available')
      .eq('id', currentBooking.room_id)
      .single();

    if (room) {
      await supabase
        .from('rooms')
        .update({ available: room.available + 1 })
        .eq('id', currentBooking.room_id);
    }
  }

  return data;
};

export const deleteBooking = async (id: string) => {
  // Get the booking first to get room_id and status
  const { data: booking } = await supabase
    .from('bookings')
    .select('room_id, status')
    .eq('id', id)
    .single();

  const { error } = await supabase
    .from('bookings')
    .delete()
    .eq('id', id);
  
  if (error) throw error;

  // If booking was not cancelled, increase available room count
  if (booking && booking.status !== 'cancelled') {
    const { data: room } = await supabase
      .from('rooms')
      .select('available')
      .eq('id', booking.room_id)
      .single();

    if (room) {
      await supabase
        .from('rooms')
        .update({ available: room.available + 1 })
        .eq('id', booking.room_id);
    }
  }
};

// Get bookings by guest email for customer dashboard
export const getBookingsByEmail = async (email: string): Promise<Booking[]> => {
  // First, get the guest by email
  const { data: guests, error: guestError } = await supabase
    .from('guests')
    .select('id')
    .eq('email', email)
    .limit(1);

  if (guestError) {
    console.error('Error fetching guest:', guestError);
    return [];
  }

  if (!guests || guests.length === 0) {
    // No guest found with this email, return empty array
    return [];
  }

  const guest = guests[0];

  // Get all bookings for this guest
  const { data, error } = await supabase
    .from('bookings')
    .select(`
      *,
      guest:guests(*),
      room:rooms(*)
    `)
    .eq('guest_id', guest.id)
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data || [];
};

// Get guest profile by email
export const getGuestByEmail = async (email: string): Promise<Guest | null> => {
  const { data, error } = await supabase
    .from('guests')
    .select('*')
    .eq('email', email)
    .single();
  
  if (error) {
    if (error.code === 'PGRST116') {
      // No guest found
      return null;
    }
    throw error;
  }
  return data;
};

// Update guest profile
export const updateGuestProfile = async (email: string, updates: Partial<Guest>) => {
  const { data, error } = await supabase
    .from('guests')
    .update(updates)
    .eq('email', email)
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

// Cancel booking (customer-initiated)
export const cancelBooking = async (bookingId: string) => {
  // Get the booking first to get room_id
  const { data: booking } = await supabase
    .from('bookings')
    .select('room_id, status')
    .eq('id', bookingId)
    .single();

  if (!booking) throw new Error('Booking not found');

  // Update booking status
  const { data, error } = await supabase
    .from('bookings')
    .update({ 
      status: 'cancelled',
      updated_at: new Date().toISOString()
    })
    .eq('id', bookingId)
    .select(`
      *,
      guest:guests(*),
      room:rooms(*)
    `)
    .single();
  
  if (error) throw error;

  // If booking was not already cancelled, increase available room count
  if (booking.status !== 'cancelled') {
    const { data: room } = await supabase
      .from('rooms')
      .select('available')
      .eq('id', booking.room_id)
      .single();

    if (room) {
      const { error: updateError } = await supabase
        .from('rooms')
        .update({ available: room.available + 1 })
        .eq('id', booking.room_id);
      
      if (updateError) {
        console.error('Error updating room availability:', updateError);
      }
    }
  }

  return data;
};
