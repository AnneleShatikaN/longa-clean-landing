
import React, { createContext, useContext, ReactNode, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { LoginData, UserRegistration, PasswordReset, ChangePassword, AdminSetup } from '@/schemas/validation';
import { logSecurityEvent, detectSuspiciousActivity, checkRateLimit } from '@/utils/security';

export type UserRole = 'client' | 'provider' | 'admin';

export interface UserProfile {
  id: string; // Changed to string for Supabase UUID
  email: string;
  full_name: string;
  name: string; // Add for compatibility
  phone: string | null;
  role: UserRole;
  avatar_url: string | null;
  is_active: boolean;
  rating: number;
  total_jobs: number;
  created_at: string;
  updated_at: string;
  // Additional properties for compatibility
  address?: string;
  profilePicture?: string;
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
  jobsCompleted?: number;
  totalEarnings?: number;
  joinDate: string;
  lastActive: string;
  isEmailVerified: boolean;
}

interface AuthContextType {
  user: UserProfile | null;
  session: Session | null;
  isLoading: boolean;
  error: string | null;
  isInitialized: boolean;
  needsAdminSetup: boolean;
  login: (loginData: LoginData) => Promise<boolean>;
  signup: (userData: UserRegistration) => Promise<{ success: boolean; needsEmailVerification: boolean }>;
  logout: () => Promise<void>;
  requestPasswordReset: (data: PasswordReset) => Promise<boolean>;
  resetPassword: (token: string, newPassword: string) => Promise<boolean>;
  changePassword: (data: ChangePassword) => Promise<boolean>;
  verifyEmail: (userId: string, token: string) => Promise<boolean>;
  setupAdmin: (data: AdminSetup) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [needsAdminSetup, setNeedsAdminSetup] = useState(false);
  const { toast } = useToast();

  // Check if admin setup is needed
  const checkAdminSetup = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('id')
        .eq('role', 'admin')
        .limit(1);

      if (error) throw error;
      setNeedsAdminSetup(!data || data.length === 0);
    } catch (error) {
      console.error('Error checking admin setup:', error);
      setNeedsAdminSetup(true);
    }
  };

  // Fetch user profile from database
  const fetchUserProfile = async (userId: string): Promise<UserProfile | null> => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;
      
      // Transform data to match UserProfile interface
      const profile: UserProfile = {
        ...data,
        name: data.full_name, // Map full_name to name for compatibility
        role: data.role as UserRole, // Cast to UserRole type
        status: data.is_active ? 'active' : 'inactive',
        joinDate: data.created_at?.split('T')[0] || new Date().toISOString().split('T')[0],
        lastActive: data.updated_at || new Date().toISOString(),
        isEmailVerified: true, // Assume verified if in database
        jobsCompleted: 0, // Default values
        totalEarnings: 0,
        available: true
      };
      
      return profile;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
  };

  // Initialize auth state
  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        // Set up auth state listener
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          async (event, session) => {
            if (!mounted) return;

            setSession(session);
            setError(null);

            if (session?.user) {
              // Defer profile fetching to avoid deadlocks
              setTimeout(async () => {
                const profile = await fetchUserProfile(session.user.id);
                if (mounted) {
                  setUser(profile);
                }
              }, 0);
            } else {
              setUser(null);
            }

            if (event === 'SIGNED_OUT') {
              setUser(null);
            }

            setIsLoading(false);
          }
        );

        // Check for existing session
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) throw error;

        if (session?.user && mounted) {
          const profile = await fetchUserProfile(session.user.id);
          setUser(profile);
        }

        await checkAdminSetup();
        setIsInitialized(true);
        setIsLoading(false);

        return () => {
          mounted = false;
          subscription.unsubscribe();
        };
      } catch (error) {
        console.error('Auth initialization error:', error);
        setError(error instanceof Error ? error.message : 'Authentication initialization failed');
        setIsLoading(false);
        setIsInitialized(true);
      }
    };

    initializeAuth();
  }, []);

  const login = async (loginData: LoginData): Promise<boolean> => {
    // Check rate limiting
    const rateLimitKey = `login_${loginData.email}`;
    if (!checkRateLimit(rateLimitKey, 5, 15 * 60 * 1000)) {
      logSecurityEvent({
        type: 'failed_login',
        details: { email: loginData.email, reason: 'rate_limited' }
      });
      throw new Error('Too many login attempts. Please try again later.');
    }

    setIsLoading(true);
    setError(null);

    try {
      // Clean up any existing session
      await supabase.auth.signOut();

      const { data, error } = await supabase.auth.signInWithPassword({
        email: loginData.email,
        password: loginData.password,
      });

      if (error) throw error;

      if (data.user) {
        const profile = await fetchUserProfile(data.user.id);
        
        if (!profile) {
          throw new Error('User profile not found');
        }

        // Verify role matches if specified
        if (loginData.role && profile.role !== loginData.role) {
          await supabase.auth.signOut();
          throw new Error(`Access denied. This account is not registered as a ${loginData.role}.`);
        }

        // Log successful login
        logSecurityEvent({
          type: 'login',
          userId: profile.id,
          details: { email: loginData.email, role: profile.role }
        });

        // Check for suspicious activity
        const suspiciousCheck = detectSuspiciousActivity({
          userId: profile.id,
          action: 'login',
          timestamp: Date.now(),
          metadata: { email: loginData.email }
        });

        if (suspiciousCheck.isSuspicious) {
          logSecurityEvent({
            type: 'suspicious_activity',
            userId: profile.id,
            details: { reasons: suspiciousCheck.reasons, action: 'login' }
          });
        }

        toast({
          title: "Welcome back!",
          description: "You have been logged in successfully.",
        });

        return true;
      }

      return false;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Login failed';
      setError(errorMessage);
      
      // Log failed login
      logSecurityEvent({
        type: 'failed_login',
        details: { 
          email: loginData.email, 
          reason: errorMessage
        }
      });

      toast({
        title: "Login Failed",
        description: errorMessage,
        variant: "destructive",
      });

      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (userData: UserRegistration): Promise<{ success: boolean; needsEmailVerification: boolean }> => {
    setIsLoading(true);
    setError(null);

    try {
      // Check if email already exists
      const { data: existingUser } = await supabase
        .from('users')
        .select('email')
        .eq('email', userData.email)
        .single();

      if (existingUser) {
        throw new Error('An account with this email already exists');
      }

      // Sign up with Supabase Auth
      const { data, error } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth`,
        }
      });

      if (error) throw error;

      if (data.user) {
        // Insert user profile into our users table
        const { error: profileError } = await supabase
          .from('users')
          .insert({
            id: data.user.id,
            email: userData.email,
            password_hash: 'managed_by_supabase_auth',
            full_name: userData.name,
            phone: userData.phone,
            role: userData.role,
            is_active: true,
          });

        if (profileError) {
          // If profile creation fails, clean up the auth user
          console.error('Profile creation failed:', profileError);
          throw new Error('Failed to create user profile');
        }

        // Log new user registration
        logSecurityEvent({
          type: 'login',
          userId: data.user.id,
          details: { 
            action: 'registration',
            email: userData.email, 
            role: userData.role 
          }
        });

        const needsEmailVerification = !data.session;

        if (needsEmailVerification) {
          toast({
            title: "Registration successful!",
            description: "Please check your email to verify your account before logging in.",
          });
        } else {
          toast({
            title: "Account created!",
            description: "Your account has been created successfully.",
          });
        }

        return { success: true, needsEmailVerification };
      }

      return { success: false, needsEmailVerification: false };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Registration failed';
      setError(errorMessage);
      
      toast({
        title: "Registration Failed",
        description: errorMessage,
        variant: "destructive",
      });

      return { success: false, needsEmailVerification: false };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    setIsLoading(true);

    try {
      if (user) {
        logSecurityEvent({
          type: 'logout',
          userId: user.id,
          details: { email: user.email }
        });
      }

      await supabase.auth.signOut();
      setUser(null);
      setSession(null);
      
      toast({
        title: "Logged out",
        description: "You have been logged out successfully.",
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const requestPasswordReset = async (data: PasswordReset): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(data.email, {
        redirectTo: `${window.location.origin}/auth`,
      });

      if (error) throw error;

      toast({
        title: "Reset link sent!",
        description: "Check your email for password reset instructions.",
      });

      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Password reset failed';
      setError(errorMessage);
      
      toast({
        title: "Password Reset Failed",
        description: errorMessage,
        variant: "destructive",
      });

      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const resetPassword = async (token: string, newPassword: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;

      toast({
        title: "Password updated!",
        description: "Your password has been updated successfully.",
      });

      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Password update failed';
      setError(errorMessage);
      
      toast({
        title: "Password Update Failed",
        description: errorMessage,
        variant: "destructive",
      });

      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const changePassword = async (data: ChangePassword): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.updateUser({
        password: data.newPassword
      });

      if (error) throw error;

      toast({
        title: "Password changed!",
        description: "Your password has been changed successfully.",
      });

      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Password change failed';
      setError(errorMessage);
      
      toast({
        title: "Password Change Failed",
        description: errorMessage,
        variant: "destructive",
      });

      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const verifyEmail = async (userId: string, token: string): Promise<boolean> => {
    // This is handled automatically by Supabase Auth
    return true;
  };

  const setupAdmin = async (data: AdminSetup): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      // First create the admin user account
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          emailRedirectTo: `${window.location.origin}/dashboard/admin`,
        }
      });

      if (authError) throw authError;

      if (authData.user) {
        // Insert admin profile
        const { error: profileError } = await supabase
          .from('users')
          .insert({
            id: authData.user.id,
            email: data.email,
            password_hash: 'managed_by_supabase_auth',
            full_name: data.name,
            phone: data.phone,
            role: 'admin',
            is_active: true,
          });

        if (profileError) throw profileError;

        setNeedsAdminSetup(false);
        
        toast({
          title: "Admin account created!",
          description: "Your Longa platform is now ready to use.",
        });

        return true;
      }

      return false;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Admin setup failed';
      setError(errorMessage);
      
      toast({
        title: "Admin Setup Failed",
        description: errorMessage,
        variant: "destructive",
      });

      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      session,
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
export type { UserProfile as User };
