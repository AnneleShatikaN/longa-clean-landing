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

  // Clear any stale localStorage flags that might be causing issues
  const clearStaleFlags = () => {
    try {
      const adminSetupFlag = localStorage.getItem('admin_setup_completed');
      console.log('🧹 Clearing stale flags, admin_setup_completed was:', adminSetupFlag);
      localStorage.removeItem('admin_setup_completed');
    } catch (error) {
      console.error('Error clearing localStorage flags:', error);
    }
  };

  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        console.log('🔄 Initializing authentication...');
        
        // Clear any stale flags first
        clearStaleFlags();

        // Get initial session FIRST before setting up listeners
        console.log('🔍 Checking for existing session...');
        const { data: { session: initialSession }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('❌ Session error:', sessionError);
          throw sessionError;
        }

        // If we have an initial session, process it immediately
        if (initialSession?.user?.email_confirmed_at) {
          console.log('💾 Found existing verified session for user:', initialSession.user.id);
          
          let profile = await fetchUserProfile(initialSession.user.id);
          
          if (!profile) {
            console.log('📝 Creating profile for existing session...');
            profile = await createUserProfileIfNeeded(initialSession.user.id, initialSession.user);
          }
          
          if (profile && mounted) {
            console.log('👤 Profile restored from session:', profile.role, profile.email);
            setUser(profile);
            setSession(initialSession);
            
            // If we have an admin user, setup is definitely not needed
            if (profile.role === 'admin') {
              console.log('✅ Admin user detected, no setup needed');
              setNeedsAdminSetup(false);
            }
            
            // Handle redirect for existing admin session
            const currentPath = window.location.pathname;
            if (currentPath === '/auth' && profile.role === 'admin') {
              console.log('🚀 Redirecting existing admin session to dashboard');
              setTimeout(() => {
                window.location.href = '/dashboard/admin';
              }, 100);
            }
          }
        } else if (!initialSession) {
          // Only check for admin setup if no authenticated user exists
          console.log('🔍 No existing session, checking if admin setup is needed...');
          const adminSetupNeeded = await checkAdminSetup();
          console.log('🔧 Admin setup needed:', adminSetupNeeded);
          if (mounted) {
            setNeedsAdminSetup(adminSetupNeeded);
          }
        }

        // Set up auth state listener AFTER initial session processing
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          async (event, session) => {
            if (!mounted) return;

            console.log('🔑 Auth state change:', event, 'User ID:', session?.user?.id);
            console.log('📧 Email confirmed:', session?.user?.email_confirmed_at ? 'Yes' : 'No');
            
            setSession(session);
            setError(null);

            if (session?.user && session.user.email_confirmed_at) {
              console.log('✅ User authenticated with confirmed email, fetching profile...');
              
              // Use setTimeout to prevent deadlocks during auth state changes
              setTimeout(async () => {
                if (!mounted) return;

                let profile = await fetchUserProfile(session.user.id);
                
                if (!profile) {
                  console.log('📝 No profile found, creating one...');
                  profile = await createUserProfileIfNeeded(session.user.id, session.user);
                }

                if (mounted && profile) {
                  console.log('👤 Profile loaded:', profile.role, profile.email);
                  setUser(profile);
                  
                  // Admin setup is not needed if we have an authenticated admin user
                  if (profile.role === 'admin') {
                    console.log('🔧 Admin user detected, setup not needed');
                    setNeedsAdminSetup(false);
                  }
                  
                  // Handle automatic redirect after successful auth
                  if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
                    const currentPath = window.location.pathname;
                    console.log('🔀 Current path:', currentPath, 'User role:', profile.role);
                    
                    // Redirect from auth pages to appropriate dashboard
                    if (currentPath === '/auth' || currentPath === '/admin-setup') {
                      let redirectPath = '/';
                      
                      switch (profile.role) {
                        case 'admin':
                          redirectPath = '/dashboard/admin';
                          break;
                        case 'provider':
                          redirectPath = '/dashboard/provider';
                          break;
                        case 'client':
                          redirectPath = '/dashboard/client';
                          break;
                      }
                      
                      console.log('🚀 Redirecting to:', redirectPath);
                      // Use setTimeout to ensure state updates complete first
                      setTimeout(() => {
                        window.location.href = redirectPath;
                      }, 100);
                    }
                  }
                } else if (mounted) {
                  console.error('❌ Failed to create or fetch user profile');
                  setUser(null);
                }
              }, 0);
            } else if (session?.user && !session.user.email_confirmed_at) {
              console.log('📧 User authenticated but email not confirmed');
              setUser(null);
            } else {
              console.log('🚪 No authenticated user');
              setUser(null);
              
              // Only check admin setup if we truly have no user
              if (event === 'SIGNED_OUT') {
                console.log('👋 User signed out, checking admin setup');
                const adminSetupNeeded = await checkAdminSetup();
                if (mounted) {
                  setNeedsAdminSetup(adminSetupNeeded);
                }
              }
            }

            if (event === 'SIGNED_OUT') {
              console.log('👋 User signed out');
              setUser(null);
              clearStaleFlags();
            }

            setIsLoading(false);
          }
        );
        
        setIsInitialized(true);
        setIsLoading(false);

        return () => {
          mounted = false;
          subscription.unsubscribe();
        };
      } catch (error) {
        console.error('💥 Auth initialization error:', error);
        if (mounted) {
          setError(error instanceof Error ? error.message : 'Authentication initialization failed');
          setIsLoading(false);
          setIsInitialized(true);
        }
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
      
      clearStaleFlags();
      
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
      console.log('🔧 Setting up admin account...');
      const success = await setupAdminService(data);

      if (success) {
        setNeedsAdminSetup(false);
        
        toast({
          title: "Admin account created!",
          description: "Please check your email and click the verification link to complete setup. You'll then be able to sign in.",
        });

        return true;
      }

      return false;
    } catch (error) {
      console.error('💥 Admin setup error:', error);
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
