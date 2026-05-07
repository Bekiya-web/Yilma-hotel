import { supabase } from './supabase-client';
import type { Review } from '@/types/database';

export const getReviews = async (): Promise<Review[]> => {
  const { data, error } = await supabase
    .from('reviews')
    .select('*')
    .order('review_date', { ascending: false });
  
  if (error) throw error;
  return data || [];
};

export const createReview = async (review: Omit<Review, 'id' | 'created_at'>) => {
  const { data, error } = await supabase
    .from('reviews')
    .insert(review)
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

export const updateReview = async (id: string, updates: Partial<Review>) => {
  const { data, error } = await supabase
    .from('reviews')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

export const deleteReview = async (id: string) => {
  const { error } = await supabase
    .from('reviews')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
};
