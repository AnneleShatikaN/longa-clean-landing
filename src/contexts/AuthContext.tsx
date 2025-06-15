import React, { createContext, useContext, ReactNode, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { LoginData, UserRegistration, PasswordReset, ChangePassword } from '@/schemas/validation';
import { UserProfile, AuthContextType, UserRole } from '@/types/auth';
import { fetchUserProfile, createUserProfileIfNeeded } from '@/utils/userProfile';
import {
  loginUser,
  signupUser,
  logoutUser,
  requestPasswordResetService,
  resetPasswordService,
  changePasswordService
} from '@/services/authService';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        console.log('🔄 Initializing authentication...');

        // Set up auth state listener first
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          async (event, session) => {
            if (!mounted) return;

            console.log('🔑 Auth state change:', event, 'User ID:', session?.user?.id);
            
            setSession(session);
            setError(null);

            if (session?.user && mounted) {
              console.log('✅ User authenticated, fetching profile...');
              
              // Defer profile fetching to prevent deadlocks
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
                } else if (mounted) {
                  console.error('❌ Failed to create or fetch user profile');
                  setUser(null);
                }
              }, 0);
            } else {
              console.log('🚪 No authenticated user');
              setUser(null);
            }

            if (event === 'SIGNED_OUT') {
              console.log('👋 User signed out');
              setUser(null);
            }

            setIsLoading(false);
          }
        );

        // Get initial session
        const { data: { session: initialSession }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('❌ Session error:', sessionError);
          throw sessionError;
        }

        // Process initial session if it exists
        if (initialSession?.user && mounted) {
          console.log('💾 Found existing session for user:', initialSession.user.id);
          
          let profile = await fetchUserProfile(initialSession.user.id);
          
          if (!profile) {
            console.log('📝 Creating profile for existing session...');
            profile = await createUserProfileIfNeeded(initialSession.user.id, initialSession.user);
          }
          
          if (profile && mounted) {
            console.log('👤 Profile restored from session:', profile.role, profile.email);
            setUser(profile);
            setSession(initialSession);
          }
        }
        
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
      console.log('🔑 Login attempt for:', loginData.email);
      const success = await loginUser(loginData);
      
      if (success) {
        toast({
          title: "Welcome back!",
          description: "You have been logged in successfully.",
        });
      }

      return success;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Login failed';
      console.error('❌ Login error:', errorMessage);
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

      toast({
        title: "Account created!",
        description: "Your account has been created successfully.",
      });

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

  const setupAdmin = async (): Promise<boolean> => {
    return true;
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
      needsAdminSetup: false, // Always false - no admin setup needed
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
