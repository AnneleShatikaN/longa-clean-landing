
import { UserProfile, UserRole } from '@/types/auth';

export const searchUsers = (users: UserProfile[], query: string, role?: UserRole): UserProfile[] => {
  return users.filter(user => {
    const matchesQuery = query === '' || 
      user.name.toLowerCase().includes(query.toLowerCase()) ||
      user.email.toLowerCase().includes(query.toLowerCase()) ||
      user.phone.includes(query);
    
    const matchesRole = !role || user.role === role;
    
    return matchesQuery && matchesRole;
  });
};

export const getUserById = (users: UserProfile[], userId: string): UserProfile | undefined => {
  return users.find(user => user.id === userId);
};

export const getUsersByRole = (users: UserProfile[], role: UserRole): UserProfile[] => {
  return users.filter(user => user.role === role);
};

export const getActiveProviders = (users: UserProfile[]): UserProfile[] => {
  return users.filter(user => user.role === 'provider' && user.status === 'active' && user.available);
};
