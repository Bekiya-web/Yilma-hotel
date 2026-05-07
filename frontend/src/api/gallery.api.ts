import { supabase } from './supabase-client';

export interface GalleryImage {
  id: string;
  title: string;
  description: string | null;
  image_url: string;
  category: 'rooms' | 'facilities' | 'dining' | 'events';
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export const getGalleryImages = async (category?: string): Promise<GalleryImage[]> => {
  let query = supabase
    .from('gallery')
    .select('*')
    .eq('is_active', true)
    .order('display_order', { ascending: true })
    .order('created_at', { ascending: false });

  if (category && category !== 'all') {
    query = query.eq('category', category);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching gallery images:', error);
    throw error;
  }

  return data || [];
};

export const createGalleryImage = async (image: Omit<GalleryImage, 'id' | 'created_at' | 'updated_at'>) => {
  const { data, error } = await supabase
    .from('gallery')
    .insert(image)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const updateGalleryImage = async (id: string, updates: Partial<GalleryImage>) => {
  const { data, error } = await supabase
    .from('gallery')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const deleteGalleryImage = async (id: string) => {
  const { error } = await supabase
    .from('gallery')
    .delete()
    .eq('id', id);

  if (error) throw error;
};
