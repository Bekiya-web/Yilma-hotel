import { supabase } from './supabase-client';

// Simple password hashing for demo (in production, use backend hashing)
const hashPassword = async (password: string): Promise<string> => {
  // For demo purposes, we'll use a simple hash
  // In production, use bcrypt on the backend
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
};

export interface AdminUser {
  id: string;
  email: string;
  created_at: string;
  updated_at: string;
}

export const loginAdmin = async (email: string, password: string): Promise<AdminUser> => {
  // Hardcoded fallback for default admin (works without database)
  const DEFAULT_EMAIL = 'bekibekinat@gmail.com';
  const DEFAULT_PASSWORD = 'beki1234';
  
  // Check hardcoded credentials FIRST (before any hashing or database calls)
  if (email === DEFAULT_EMAIL && password === DEFAULT_PASSWORD) {
    const adminUser: AdminUser = {
      id: 'default-admin-id',
      email: DEFAULT_EMAIL,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    // Store admin session in localStorage
    localStorage.setItem('admin_user', JSON.stringify(adminUser));
    localStorage.setItem('admin_logged_in', 'true');
    
    console.log('✅ Login successful with hardcoded credentials');
    return adminUser;
  }
  
  // If not hardcoded credentials, try database authentication
  try {
    // Hash the password for database lookup
    const passwordHash = await hashPassword(password);
    console.log('Password hash:', passwordHash);
    
    const { data, error } = await supabase
      .from('admin_users')
      .select('id, email, created_at, updated_at')
      .eq('email', email)
      .eq('password_hash', passwordHash)
      .single();
    
    if (error || !data) {
      console.error('Database authentication failed:', error);
      throw new Error('Invalid email or password');
    }
    
    // Store admin session in localStorage
    localStorage.setItem('admin_user', JSON.stringify(data));
    localStorage.setItem('admin_logged_in', 'true');
    
    console.log('✅ Login successful with database credentials');
    return data;
  } catch (error) {
    console.error('Login error:', error);
    throw new Error('Invalid email or password');
  }
};

export const changePassword = async (email: string, oldPassword: string, newPassword: string): Promise<void> => {
  // Hash passwords
  const oldPasswordHash = await hashPassword(oldPassword);
  const newPasswordHash = await hashPassword(newPassword);
  
  const DEFAULT_EMAIL = 'bekibekinat@gmail.com';
  const DEFAULT_PASSWORD_HASH = '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92'; // SHA-256 of "beki1234"
  
  // Check if using hardcoded admin
  if (email === DEFAULT_EMAIL && oldPasswordHash === DEFAULT_PASSWORD_HASH) {
    // Try to update in database, but don't fail if table doesn't exist
    try {
      // First, check if admin exists in database
      const { data: existingAdmin } = await supabase
        .from('admin_users')
        .select('id')
        .eq('email', email)
        .single();
      
      if (existingAdmin) {
        // Update existing admin
        const { error: updateError } = await supabase
          .from('admin_users')
          .update({ password_hash: newPasswordHash })
          .eq('email', email);
        
        if (updateError) throw updateError;
      } else {
        // Create admin in database
        const { error: insertError } = await supabase
          .from('admin_users')
          .insert({
            email: email,
            password_hash: newPasswordHash
          });
        
        if (insertError) throw insertError;
      }
      
      return;
    } catch (error) {
      // If database operations fail, just show a warning
      console.warn('Could not update password in database:', error);
      throw new Error('Password change requires database setup. Please run the SQL migration first.');
    }
  }
  
  // Verify old password in database
  const { data: user, error: verifyError } = await supabase
    .from('admin_users')
    .select('id')
    .eq('email', email)
    .eq('password_hash', oldPasswordHash)
    .single();
  
  if (verifyError || !user) {
    throw new Error('Current password is incorrect');
  }
  
  // Update to new password
  const { error: updateError } = await supabase
    .from('admin_users')
    .update({ password_hash: newPasswordHash })
    .eq('email', email);
  
  if (updateError) {
    throw new Error('Failed to update password');
  }
};

export const logoutAdmin = (): void => {
  localStorage.removeItem('admin_user');
  localStorage.removeItem('admin_logged_in');
};

export const isAdminLoggedIn = (): boolean => {
  return localStorage.getItem('admin_logged_in') === 'true';
};

export const getCurrentAdmin = (): AdminUser | null => {
  const adminData = localStorage.getItem('admin_user');
  if (!adminData) return null;
  
  try {
    return JSON.parse(adminData);
  } catch {
    return null;
  }
};

// Initialize default admin if table is empty
export const initializeDefaultAdmin = async (): Promise<void> => {
  try {
    // Check if any admin exists
    const { data: admins, error } = await supabase
      .from('admin_users')
      .select('id')
      .limit(1);
    
    if (error) {
      console.error('Error checking admin users:', error);
      return;
    }
    
    // If no admins exist, create default admin
    if (!admins || admins.length === 0) {
      const defaultEmail = 'bekibekinat@gmail.com';
      const defaultPassword = 'beki1234';
      const passwordHash = await hashPassword(defaultPassword);
      
      const { error: insertError } = await supabase
        .from('admin_users')
        .insert({
          email: defaultEmail,
          password_hash: passwordHash
        });
      
      if (insertError) {
        console.error('Error creating default admin:', insertError);
      } else {
        console.log('Default admin created successfully');
      }
    }
  } catch (error) {
    console.error('Error initializing default admin:', error);
  }
};
