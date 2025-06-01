
import React, { createContext, useContext, ReactNode } from 'react';
import { useUsers, User, UserRole } from '@/contexts/UserContext';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string, role: UserRole) => Promise<boolean>;
  signup: (name: string, email: string, phone: string, password: string, role: UserRole) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const { 
    currentUser, 
    isLoading, 
    error, 
    loginUser, 
    registerUser, 
    logoutUser 
  } = useUsers();

  const login = async (email: string, password: string, role: UserRole): Promise<boolean> => {
    try {
      await loginUser(email, password, role);
      return true;
    } catch {
      return false;
    }
  };

  const signup = async (name: string, email: string, phone: string, password: string, role: UserRole): Promise<boolean> => {
    try {
      await registerUser({ name, email, phone, password, role });
      return true;
    } catch {
      return false;
    }
  };

  const logout = () => {
    logoutUser();
  };

  return (
    <AuthContext.Provider value={{ 
      user: currentUser, 
      login, 
      signup, 
      logout, 
      isLoading, 
      error 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Re-export types for backward compatibility
export type { UserRole, User };
