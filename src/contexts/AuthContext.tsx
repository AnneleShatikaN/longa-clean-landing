
import React, { createContext, useContext, ReactNode } from 'react';
import { useUsers, User, UserRole } from '@/contexts/UserContext';
import { LoginData, UserRegistration, PasswordReset, ChangePassword, AdminSetup } from '@/schemas/validation';

interface AuthContextType {
  user: User | null;
  login: (loginData: LoginData) => Promise<boolean>;
  signup: (userData: UserRegistration) => Promise<{ success: boolean; needsEmailVerification: boolean }>;
  logout: () => void;
  requestPasswordReset: (data: PasswordReset) => Promise<boolean>;
  resetPassword: (token: string, newPassword: string) => Promise<boolean>;
  changePassword: (data: ChangePassword) => Promise<boolean>;
  verifyEmail: (userId: number, token: string) => Promise<boolean>;
  setupAdmin: (data: AdminSetup) => Promise<boolean>;
  isLoading: boolean;
  error: string | null;
  needsAdminSetup: boolean;
  isInitialized: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const { 
    currentUser, 
    isLoading, 
    error, 
    needsAdminSetup,
    isInitialized,
    loginUser, 
    registerUser, 
    logoutUser,
    requestPasswordReset: requestReset,
    resetPassword: resetPass,
    changePassword: changePass,
    verifyEmail: verifyUserEmail,
    setupAdmin: setupAdminUser
  } = useUsers();

  const login = async (loginData: LoginData): Promise<boolean> => {
    try {
      await loginUser(loginData);
      return true;
    } catch {
      return false;
    }
  };

  const signup = async (userData: UserRegistration): Promise<{ success: boolean; needsEmailVerification: boolean }> => {
    try {
      const result = await registerUser(userData);
      return { success: true, needsEmailVerification: result.needsEmailVerification };
    } catch {
      return { success: false, needsEmailVerification: false };
    }
  };

  const logout = () => {
    logoutUser();
  };

  const requestPasswordReset = async (data: PasswordReset): Promise<boolean> => {
    try {
      await requestReset(data);
      return true;
    } catch {
      return false;
    }
  };

  const resetPassword = async (token: string, newPassword: string): Promise<boolean> => {
    try {
      await resetPass(token, newPassword);
      return true;
    } catch {
      return false;
    }
  };

  const changePassword = async (data: ChangePassword): Promise<boolean> => {
    try {
      if (!currentUser) return false;
      await changePass(currentUser.id, data);
      return true;
    } catch {
      return false;
    }
  };

  const verifyEmail = async (userId: number, token: string): Promise<boolean> => {
    try {
      await verifyUserEmail(userId, token);
      return true;
    } catch {
      return false;
    }
  };

  const setupAdmin = async (data: AdminSetup): Promise<boolean> => {
    try {
      await setupAdminUser(data);
      return true;
    } catch {
      return false;
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user: currentUser, 
      login, 
      signup, 
      logout, 
      requestPasswordReset,
      resetPassword,
      changePassword,
      verifyEmail,
      setupAdmin,
      isLoading, 
      error,
      needsAdminSetup,
      isInitialized
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
