
import { supabase } from '@/integrations/supabase/client';
import { UserProfile, UserRole } from '@/types/auth';

export const fetchUsersFromDatabase = async (): Promise<UserProfile[]> => {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;

  const formattedUsers: UserProfile[] = data.map(user => ({
    id: user.id,
    name: user.full_name || user.email,
    email: user.email,
    phone: user.phone || '',
    role: user.role as UserRole,
    status: user.is_active ? 'active' : 'inactive',
    rating: typeof user.rating === 'string' ? parseFloat(user.rating) || 0 : (user.rating || 0),
    jobsCompleted: typeof user.total_jobs === 'string' ? parseInt(user.total_jobs, 10) || 0 : (user.total_jobs || 0),
    totalEarnings: 0,
    joinDate: user.created_at?.split('T')[0] || new Date().toISOString().split('T')[0],
    lastActive: user.updated_at || new Date().toISOString(),
    isEmailVerified: true,
    available: user.is_active,
    // Database compatibility properties
    full_name: user.full_name,
    avatar_url: user.avatar_url,
    is_active: user.is_active,
    total_jobs: typeof user.total_jobs === 'string' ? parseInt(user.total_jobs, 10) || 0 : (user.total_jobs || 0),
    created_at: user.created_at,
    updated_at: user.updated_at
  }));

  return formattedUsers;
};

export const updateUserStatusInDatabase = async (userId: string, status: 'active' | 'inactive' | 'pending') => {
  const { error } = await supabase
    .from('users')
    .update({ 
      is_active: status === 'active',
      updated_at: new Date().toISOString()
    })
    .eq('id', userId);

  if (error) throw error;
};

export const updateUserProfileInDatabase = async (userId: string, updates: Partial<UserProfile>) => {
  const dbUpdates: any = {};
  
  if (updates.name) dbUpdates.full_name = updates.name;
  if (updates.email) dbUpdates.email = updates.email;
  if (updates.phone) dbUpdates.phone = updates.phone;
  if (updates.role) dbUpdates.role = updates.role;
  if (updates.status !== undefined) dbUpdates.is_active = updates.status === 'active';
  
  dbUpdates.updated_at = new Date().toISOString();

  const { error } = await supabase
    .from('users')
    .update(dbUpdates)
    .eq('id', userId);

  if (error) throw error;
};

export const deleteUserFromDatabase = async (userId: string) => {
  const { error } = await supabase
    .from('users')
    .delete()
    .eq('id', userId);

  if (error) throw error;
};
