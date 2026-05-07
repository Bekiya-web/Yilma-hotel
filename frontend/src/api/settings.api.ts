import { supabase } from './supabase-client';

export interface HotelInfo {
  name: string;
  email: string;
  phone: string;
  address: string;
  description: string;
  website: string;
}

export interface PaymentSettings {
  telebirrEnabled: boolean;
  telebirrPhone: string;
  telebirrAccountName: string;
  bankEnabled: boolean;
  bankName: string;
  bankAccountNumber: string;
  bankAccountName: string;
  bankSwiftCode: string;
  payAtHotelEnabled: boolean;
  currency: string;
  taxRate: number;
}

export interface BookingSettings {
  minAdvanceBookingDays: number;
  maxAdvanceBookingDays: number;
  cancellationHours: number;
  checkInTime: string;
  checkOutTime: string;
  requirePaymentProof: boolean;
  autoApprovePayAtHotel: boolean;
}

export interface NotificationSettings {
  emailNotifications: boolean;
  smsNotifications: boolean;
  adminEmail: string;
  bookingNotificationEmail: string;
}

export type SettingsKey = 'hotel_info' | 'payment_settings' | 'booking_settings' | 'notification_settings';

export const getSettings = async <T>(key: SettingsKey): Promise<T | null> => {
  const { data, error } = await supabase
    .from('settings')
    .select('value')
    .eq('key', key)
    .single();
  
  if (error) {
    console.error(`Error fetching ${key}:`, error);
    return null;
  }
  
  return data?.value as T;
};

export const getAllSettings = async () => {
  const { data, error } = await supabase
    .from('settings')
    .select('*')
    .order('category');
  
  if (error) {
    console.error('Error fetching all settings:', error);
    return null;
  }
  
  return data;
};

export const updateSettings = async <T>(key: SettingsKey, value: T) => {
  const { data, error } = await supabase
    .from('settings')
    .update({ value: value as any })
    .eq('key', key)
    .select()
    .single();
  
  if (error) {
    console.error(`Error updating ${key}:`, error);
    throw error;
  }
  
  return data;
};

// Convenience functions for specific settings
export const getHotelInfo = () => getSettings<HotelInfo>('hotel_info');
export const getPaymentSettings = () => getSettings<PaymentSettings>('payment_settings');
export const getBookingSettings = () => getSettings<BookingSettings>('booking_settings');
export const getNotificationSettings = () => getSettings<NotificationSettings>('notification_settings');

export const updateHotelInfo = (value: HotelInfo) => updateSettings('hotel_info', value);
export const updatePaymentSettings = (value: PaymentSettings) => updateSettings('payment_settings', value);
export const updateBookingSettings = (value: BookingSettings) => updateSettings('booking_settings', value);
export const updateNotificationSettings = (value: NotificationSettings) => updateSettings('notification_settings', value);
