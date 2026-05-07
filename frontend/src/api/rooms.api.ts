import { supabase } from './supabase-client';
import type { Room } from '@/types/database';

export const getRooms = async (): Promise<Room[]> => {
  const { data, error } = await supabase
    .from('rooms')
    .select('*')
    .order('price', { ascending: true });
  
  if (error) throw error;
  return data || [];
};

export const getRoom = async (roomId: string): Promise<Room | null> => {
  console.log('Fetching room with ID:', roomId);
  
  const { data, error } = await supabase
    .from('rooms')
    .select('*')
    .eq('room_id', roomId)
    .maybeSingle();
  
  console.log('Room data:', data);
  console.log('Room error:', error);
  
  if (error) {
    console.error('Error fetching room:', error);
    throw error;
  }
  return data;
};

export const createRoom = async (room: Omit<Room, 'id' | 'created_at' | 'updated_at'>) => {
  const { data, error } = await supabase
    .from('rooms')
    .insert(room)
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

export const updateRoom = async (id: string, updates: Partial<Room>) => {
  const { data, error } = await supabase
    .from('rooms')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

export const deleteRoom = async (id: string) => {
  const { error } = await supabase
    .from('rooms')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
};
