import React, { createContext, useContext, ReactNode, useEffect } from 'react';
import { useUsers, User, UserRole } from '@/contexts/UserContext';
import { LoginData, UserRegistration, PasswordReset, ChangePassword, AdminSetup } from '@/schemas/validation';
import { useSessionManagement } from '@/hooks/useSessionManagement';
import { logSecurityEvent, detectSuspiciousActivity, checkRateLimit } from '@/utils/security';

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

  // Initialize session management
  useSessionManagement();

  const login = async (loginData: LoginData): Promise<boolean> => {
    // Check rate limiting
    const rateLimitKey = `login_${loginData.email}`;
    if (!checkRateLimit(rateLimitKey, 5, 15 * 60 * 1000)) { // 5 attempts per 15 minutes
      logSecurityEvent({
        type: 'failed_login',
        details: { email: loginData.email, reason: 'rate_limited' }
      });
      throw new Error('Too many login attempts. Please try again later.');
    }

    try {
      const user = await loginUser(loginData);
      
      // Log successful login
      logSecurityEvent({
        type: 'login',
        userId: user.id,
        details: { email: loginData.email, role: loginData.role }
      });

      // Check for suspicious activity
      const suspiciousCheck = detectSuspiciousActivity({
        userId: user.id,
        action: 'login',
        timestamp: Date.now(),
        metadata: { email: loginData.email }
      });

      if (suspiciousCheck.isSuspicious) {
        logSecurityEvent({
          type: 'suspicious_activity',
          userId: user.id,
          details: { reasons: suspiciousCheck.reasons, action: 'login' }
        });
      }

      return true;
    } catch (error) {
      // Log failed login
      logSecurityEvent({
        type: 'failed_login',
        details: { 
          email: loginData.email, 
          reason: error instanceof Error ? error.message : 'unknown' 
        }
      });
      return false;
    }
  };

  const signup = async (userData: UserRegistration): Promise<{ success: boolean; needsEmailVerification: boolean }> => {
    try {
      const result = await registerUser(userData);
      
      // Log new user registration
      logSecurityEvent({
        type: 'login', // Using login type for new registrations
        userId: result.user.id,
        details: { 
          action: 'registration',
          email: userData.email, 
          role: userData.role 
        }
      });

      return { success: true, needsEmailVerification: result.needsEmailVerification };
    } catch {
      return { success: false, needsEmailVerification: false };
    }
  };

  const logout = () => {
    if (currentUser) {
      logSecurityEvent({
        type: 'logout',
        userId: currentUser.id,
        details: { email: currentUser.email }
      });
    }
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
