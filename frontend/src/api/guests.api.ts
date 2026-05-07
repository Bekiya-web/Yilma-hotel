import { supabase } from './supabase-client';
import type { Guest } from '@/types/database';

export const getGuests = async (): Promise<Guest[]> => {
  const { data, error } = await supabase
    .from('guests')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data || [];
};

export const getGuest = async (id: string): Promise<Guest | null> => {
  const { data, error } = await supabase
    .from('guests')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error) throw error;
  return data;
};

export const createGuest = async (guest: Omit<Guest, 'id' | 'created_at' | 'updated_at'>) => {
  const { data, error } = await supabase
    .from('guests')
    .insert(guest)
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

export const updateGuest = async (id: string, updates: Partial<Guest>) => {
  const { data, error } = await supabase
    .from('guests')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

export const deleteGuest = async (id: string) => {
  const { error } = await supabase
    .from('guests')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
};
