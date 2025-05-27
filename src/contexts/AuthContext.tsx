
import React, { createContext, useContext, useState, ReactNode } from 'react';

export type UserRole = 'client' | 'provider' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string, role: UserRole) => Promise<boolean>;
  signup: (name: string, email: string, phone: string, password: string, role: UserRole) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Demo accounts for testing
const DEMO_ACCOUNTS = {
  'john@email.com': { id: '1', name: 'John Doe', email: 'john@email.com', phone: '+264 81 234 5678', role: 'client' as UserRole },
  'mary@email.com': { id: '2', name: 'Mary Smith', email: 'mary@email.com', phone: '+264 81 345 6789', role: 'provider' as UserRole },
  'admin@longa.com': { id: '3', name: 'Admin User', email: 'admin@longa.com', phone: '+264 81 456 7890', role: 'admin' as UserRole },
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = async (email: string, password: string, role: UserRole): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    const demoUser = DEMO_ACCOUNTS[email as keyof typeof DEMO_ACCOUNTS];
    
    if (demoUser && demoUser.role === role) {
      setUser(demoUser);
      setIsLoading(false);
      return true;
    } else {
      setError('Invalid credentials or role mismatch');
      setIsLoading(false);
      return false;
    }
  };

  const signup = async (name: string, email: string, phone: string, password: string, role: UserRole): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Check if email already exists
    if (DEMO_ACCOUNTS[email as keyof typeof DEMO_ACCOUNTS]) {
      setError('Email already exists');
      setIsLoading(false);
      return false;
    }

    // Create new user (in real app, this would be sent to backend)
    const newUser: User = {
      id: Date.now().toString(),
      name,
      email,
      phone,
      role,
    };

    setUser(newUser);
    setIsLoading(false);
    return true;
  };

  const logout = () => {
    setUser(null);
    setError(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, isLoading, error }}>
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
