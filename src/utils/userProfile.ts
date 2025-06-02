
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
    const { data, error } = await supabase
      .from('users')
      .select('id')
      .eq('role', 'admin')
      .limit(1);

    if (error) throw error;
    return !data || data.length === 0;
  } catch (error) {
    console.error('Error checking admin setup:', error);
    return true;
  }
};
