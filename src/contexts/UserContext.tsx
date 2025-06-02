import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { UserRole } from '@/types/auth';

interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  profilePicture?: string;
  address?: string;
  bankMobileNumber?: string;
  paymentMethod?: 'bank_transfer' | 'mobile_money';
  bankDetails?: {
    accountNumber?: string;
    bankName?: string;
    accountHolder?: string;
  };
  servicesOffered?: string[];
  available?: boolean;
  status: 'active' | 'inactive' | 'pending';
  rating: number;
  jobsCompleted?: number;
  totalEarnings?: number;
  joinDate: string;
  lastActive: string;
  isEmailVerified: boolean;
}

interface UserContextType {
  users: UserProfile[];
  providers: UserProfile[];
  clients: UserProfile[];
  admins: UserProfile[];
  isLoading: boolean;
  error: string | null;
  fetchUsers: () => Promise<void>;
  updateUserStatus: (userId: string, status: 'active' | 'inactive' | 'pending') => Promise<void>;
  updateUserProfile: (userId: string, updates: Partial<UserProfile>) => Promise<void>;
  deleteUser: (userId: string) => Promise<void>;
  searchUsers: (query: string, role?: UserRole) => UserProfile[];
  getUserById: (userId: string) => UserProfile | undefined;
  getUsersByRole: (role: UserRole) => UserProfile[];
  getActiveProviders: () => UserProfile[];
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchUsers = async () => {
    setIsLoading(true);
    setError(null);

    try {
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
        available: user.is_active
      }));

      setUsers(formattedUsers);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch users';
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updateUserStatus = async (userId: string, status: 'active' | 'inactive' | 'pending') => {
    try {
      const { error } = await supabase
        .from('users')
        .update({ 
          is_active: status === 'active',
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);

      if (error) throw error;

      setUsers(prevUsers =>
        prevUsers.map(user =>
          user.id === userId ? { ...user, status } : user
        )
      );

      toast({
        title: "User updated",
        description: `User status changed to ${status}`,
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update user status';
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const updateUserProfile = async (userId: string, updates: Partial<UserProfile>) => {
    try {
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

      setUsers(prevUsers =>
        prevUsers.map(user =>
          user.id === userId ? { ...user, ...updates } : user
        )
      );

      toast({
        title: "Profile updated",
        description: "User profile has been updated successfully",
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update user profile';
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const deleteUser = async (userId: string) => {
    try {
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', userId);

      if (error) throw error;

      setUsers(prevUsers => prevUsers.filter(user => user.id !== userId));

      toast({
        title: "User deleted",
        description: "User has been permanently deleted",
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete user';
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const searchUsers = (query: string, role?: UserRole): UserProfile[] => {
    return users.filter(user => {
      const matchesQuery = query === '' || 
        user.name.toLowerCase().includes(query.toLowerCase()) ||
        user.email.toLowerCase().includes(query.toLowerCase()) ||
        user.phone.includes(query);
      
      const matchesRole = !role || user.role === role;
      
      return matchesQuery && matchesRole;
    });
  };

  const getUserById = (userId: string): UserProfile | undefined => {
    return users.find(user => user.id === userId);
  };

  const getUsersByRole = (role: UserRole): UserProfile[] => {
    return users.filter(user => user.role === role);
  };

  const getActiveProviders = (): UserProfile[] => {
    return users.filter(user => user.role === 'provider' && user.status === 'active' && user.available);
  };

  // Computed values
  const providers = getUsersByRole('provider');
  const clients = getUsersByRole('client');
  const admins = getUsersByRole('admin');

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <UserContext.Provider value={{
      users,
      providers,
      clients,
      admins,
      isLoading,
      error,
      fetchUsers,
      updateUserStatus,
      updateUserProfile,
      deleteUser,
      searchUsers,
      getUserById,
      getUsersByRole,
      getActiveProviders
    }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUsers = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUsers must be used within a UserProvider');
  }
  return context;
};
