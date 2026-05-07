import { supabase } from './supabase-client';
import type { DashboardStats, RoomStatus } from '@/types/database';

export const getRoomStatuses = async (): Promise<RoomStatus[]> => {
  const { data, error } = await supabase
    .from('room_status')
    .select('*')
    .order('room_number', { ascending: true });
  
  if (error) throw error;
  return data || [];
};

export const updateRoomStatus = async (id: string, updates: Partial<RoomStatus>) => {
  const { data, error } = await supabase
    .from('room_status')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

export const getDashboardStats = async (): Promise<DashboardStats> => {
  // Get total revenue from confirmed bookings
  const { data: bookings } = await supabase
    .from('bookings')
    .select('amount, status, created_at')
    .in('status', ['confirmed', 'completed']);

  const totalRevenue = bookings?.reduce((sum, b) => sum + Number(b.amount), 0) || 0;

  // Get today's bookings
  const today = new Date().toISOString().split('T')[0];
  const { data: todayBookings } = await supabase
    .from('bookings')
    .select('id')
    .gte('created_at', today);

  const bookingsToday = todayBookings?.length || 0;

  // Get occupancy rate
  const { data: roomStatuses } = await supabase
    .from('room_status')
    .select('status');

  const occupiedRooms = roomStatuses?.filter(r => r.status === 'occupied').length || 0;
  const totalRooms = roomStatuses?.length || 1;
  const occupancyRate = Math.round((occupiedRooms / totalRooms) * 100);

  // Get average rating
  const { data: reviews } = await supabase
    .from('reviews')
    .select('rating');

  const avgRating = reviews?.length 
    ? Number((reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1))
    : 0;

  return {
    totalRevenue,
    revenueChange: '+12.5%', // TODO: Calculate actual change
    bookingsToday,
    bookingsChange: '+8.2%', // TODO: Calculate actual change
    occupancyRate,
    occupancyChange: '+5.1%', // TODO: Calculate actual change
    guestRating: avgRating,
    ratingChange: '+0.2' // TODO: Calculate actual change
  };
};
