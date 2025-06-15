import React, { createContext, useContext, ReactNode, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { LoginData, UserRegistration, PasswordReset, ChangePassword, AdminSetup } from '@/schemas/validation';
import { UserProfile, AuthContextType, UserRole } from '@/types/auth';
import { fetchUserProfile, checkAdminSetup, createUserProfileIfNeeded } from '@/utils/userProfile';
import {
  loginUser,
  signupUser,
  logoutUser,
  requestPasswordResetService,
  resetPasswordService,
  changePasswordService,
  setupAdminService
} from '@/services/authService';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [needsAdminSetup, setNeedsAdminSetup] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        // Set up auth state listener first
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          async (event, session) => {
            if (!mounted) return;

            console.log('Auth state change:', event, session?.user?.id);
            setSession(session);
            setError(null);

            if (session?.user) {
              // Use setTimeout to prevent deadlocks
              setTimeout(async () => {
                if (!mounted) return;

                let profile = await fetchUserProfile(session.user.id);
                
                // If no profile exists, try to create one
                if (!profile) {
                  console.log('No profile found, creating one...');
                  profile = await createUserProfileIfNeeded(session.user.id, session.user);
                }

                if (mounted && profile) {
                  setUser(profile);
                  
                  // Handle automatic redirect after login or admin setup
                  if (event === 'SIGNED_IN') {
                    const currentPath = window.location.pathname;
                    console.log('User signed in, current path:', currentPath, 'User role:', profile.role);
                    
                    // Only redirect if we're on auth or admin-setup pages
                    if (currentPath === '/auth' || currentPath === '/admin-setup') {
                      switch (profile.role) {
                        case 'admin':
                          console.log('Redirecting admin to dashboard');
                          window.location.href = '/dashboard/admin';
                          break;
                        case 'provider':
                          window.location.href = '/dashboard/provider';
                          break;
                        case 'client':
                          window.location.href = '/dashboard/client';
                          break;
                        default:
                          break;
                      }
                    }
                  }
                } else if (mounted) {
                  console.error('Failed to create or fetch user profile');
                  setUser(null);
                }
              }, 0);
            } else {
              setUser(null);
            }

            if (event === 'SIGNED_OUT') {
              setUser(null);
              localStorage.removeItem('admin_setup_completed');
            }

            setIsLoading(false);
          }
        );

        // Get initial session
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          console.error('Session error:', error);
          throw error;
        }

        if (session?.user && mounted) {
          let profile = await fetchUserProfile(session.user.id);
          
          if (!profile) {
            console.log('No profile found during initialization, creating one...');
            profile = await createUserProfileIfNeeded(session.user.id, session.user);
          }
          
          if (profile) {
            setUser(profile);
            setSession(session);
          }
        }

        // Check if admin setup is needed only if no authenticated user
        if (!session?.user) {
          const adminSetupNeeded = await checkAdminSetup();
          setNeedsAdminSetup(adminSetupNeeded);
        } else {
          setNeedsAdminSetup(false);
        }
        
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
    setIsLoading(true);
    setError(null);

    try {
      const success = await loginUser(loginData);
      
      toast({
        title: "Welcome back!",
        description: "You have been logged in successfully.",
      });

      return success;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Login failed';
      setError(errorMessage);
      
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
      const result = await signupUser(userData);

      if (result.needsEmailVerification) {
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

      return result;
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
      await logoutUser(user?.id, user?.email);
      setUser(null);
      setSession(null);
      
      localStorage.removeItem('admin_setup_completed');
      
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
      await requestPasswordResetService(data);

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
      await resetPasswordService(token, newPassword);

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
      await changePasswordService(data);

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
    return true;
  };

  const setupAdmin = async (data: AdminSetup): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      console.log('Setting up admin account...');
      const success = await setupAdminService(data);

      if (success) {
        setNeedsAdminSetup(false);
        
        // Mark admin setup as completed
        localStorage.setItem('admin_setup_completed', 'true');
        
        toast({
          title: "Admin account created!",
          description: "Please check your email and click the verification link to complete setup. You'll then be able to sign in.",
        });

        return true;
      }

      return false;
    } catch (error) {
      console.error('Admin setup error:', error);
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

export type { UserProfile as User, UserRole };
