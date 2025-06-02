
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useToast } from '@/hooks/use-toast';
import { UserRole } from '@/types/auth';
import { UserProfile, UserContextType } from '@/types/user';
import { 
  fetchUsersFromDatabase, 
  updateUserStatusInDatabase, 
  updateUserProfileInDatabase, 
  deleteUserFromDatabase 
} from '@/services/userService';
import { 
  searchUsers as searchUsersUtil, 
  getUserById as getUserByIdUtil, 
  getUsersByRole as getUsersByRoleUtil, 
  getActiveProviders as getActiveProvidersUtil 
} from '@/utils/userUtils';

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
      const formattedUsers = await fetchUsersFromDatabase();
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
      await updateUserStatusInDatabase(userId, status);

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
      await updateUserProfileInDatabase(userId, updates);

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
      await deleteUserFromDatabase(userId);

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
    return searchUsersUtil(users, query, role);
  };

  const getUserById = (userId: string): UserProfile | undefined => {
    return getUserByIdUtil(users, userId);
  };

  const getUsersByRole = (role: UserRole): UserProfile[] => {
    return getUsersByRoleUtil(users, role);
  };

  const getActiveProviders = (): UserProfile[] => {
    return getActiveProvidersUtil(users);
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
