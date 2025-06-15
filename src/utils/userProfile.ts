
import { supabase } from '@/integrations/supabase/client';
import { UserProfile, UserRole } from '@/types/auth';

export const fetchUserProfile = async (userId: string): Promise<UserProfile | null> => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) throw error;
    
    // Transform data to match UserProfile interface with proper type conversion
    const profile: UserProfile = {
      id: data.id,
      email: data.email,
      full_name: data.full_name,
      name: data.full_name, // Map full_name to name for compatibility
      phone: data.phone,
      role: data.role as UserRole,
      avatar_url: data.avatar_url,
      is_active: data.is_active,
      rating: typeof data.rating === 'string' ? parseFloat(data.rating) || 0 : (data.rating || 0),
      total_jobs: typeof data.total_jobs === 'string' ? parseInt(data.total_jobs, 10) || 0 : (data.total_jobs || 0),
      created_at: data.created_at,
      updated_at: data.updated_at,
      status: data.is_active ? 'active' : 'inactive',
      joinDate: data.created_at?.split('T')[0] || new Date().toISOString().split('T')[0],
      lastActive: data.updated_at || new Date().toISOString(),
      isEmailVerified: true, // Assume verified if in database
      jobsCompleted: typeof data.total_jobs === 'string' ? parseInt(data.total_jobs, 10) || 0 : (data.total_jobs || 0),
      totalEarnings: 0,
      available: true
    };
    
    return profile;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }
};

export const checkAdminSetup = async (): Promise<boolean> => {
  try {
    // First check if there are any admin users in the public.users table
    const { data: adminUsers, error: dbError } = await supabase
      .from('users')
      .select('id')
      .eq('role', 'admin')
      .limit(1);

    if (dbError) {
      console.error('Error checking admin setup in users table:', dbError);
    }

    // If we found admin users in the database, no setup needed
    if (adminUsers && adminUsers.length > 0) {
      return false;
    }

    // Also check if admin setup was completed but user verification is pending
    const adminSetupCompleted = localStorage.getItem('admin_setup_completed');
    if (adminSetupCompleted === 'true') {
      return false; // Setup was completed, just waiting for verification
    }

    // No admin users found and no completed setup, need admin setup
    return true;
  } catch (error) {
    console.error('Error checking admin setup:', error);
    return true; // Default to requiring setup if there's an error
  }
};

export const createUserProfileIfNeeded = async (userId: string, userData: any): Promise<UserProfile | null> => {
  try {
    // Check if user profile already exists
    const existingProfile = await fetchUserProfile(userId);
    if (existingProfile) {
      return existingProfile;
    }

    // Try to create new user profile using upsert to handle conflicts
    const { data, error } = await supabase
      .from('users')
      .upsert({
        id: userId,
        email: userData.email,
        password_hash: 'managed_by_supabase_auth',
        full_name: userData.user_metadata?.full_name || userData.email,
        phone: userData.user_metadata?.phone || null,
        role: userData.user_metadata?.role || 'client',
        is_active: true,
        rating: 0,
        total_jobs: 0
      }, {
        onConflict: 'id'
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating user profile:', error);
      // If upsert failed, try to fetch existing profile one more time
      return await fetchUserProfile(userId);
    }

    return await fetchUserProfile(userId);
  } catch (error) {
    console.error('Error in createUserProfileIfNeeded:', error);
    // As a last resort, try to fetch existing profile
    return await fetchUserProfile(userId);
  }
};
