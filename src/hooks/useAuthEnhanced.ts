
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface AuthState {
  isLoading: boolean;
  user: any;
  session: any;
  isEmailVerified: boolean;
  needsVerification: boolean;
}

export const useAuthEnhanced = () => {
  const [authState, setAuthState] = useState<AuthState>({
    isLoading: true,
    user: null,
    session: null,
    isEmailVerified: false,
    needsVerification: false
  });

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setAuthState(prev => ({
        ...prev,
        session,
        user: session?.user || null,
        isEmailVerified: session?.user?.email_confirmed_at ? true : false,
        needsVerification: session?.user && !session?.user?.email_confirmed_at,
        isLoading: false
      }));
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setAuthState(prev => ({
          ...prev,
          session,
          user: session?.user || null,
          isEmailVerified: session?.user?.email_confirmed_at ? true : false,
          needsVerification: session?.user && !session?.user?.email_confirmed_at,
          isLoading: false
        }));

        if (event === 'SIGNED_IN') {
          toast.success('Welcome back!');
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, userData: any) => {
    try {
      // Prevent admin role in public signup
      if (userData.role === 'admin') {
        throw new Error('Admin registration is not available through public signup');
      }

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/verify`,
          data: {
            ...userData,
            role: userData.role || 'client'
          }
        }
      });

      if (error) throw error;

      if (data.user && !data.session) {
        toast.success('Please check your email to verify your account');
        return { success: true, needsVerification: true };
      }

      return { success: true, needsVerification: false };
    } catch (error: any) {
      toast.error(error.message);
      throw error;
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;

      if (data.user && !data.user.email_confirmed_at) {
        toast.warning('Please verify your email address to continue');
        return { success: false, needsVerification: true };
      }

      return { success: true, needsVerification: false };
    } catch (error: any) {
      toast.error(error.message);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      toast.success('Signed out successfully');
    } catch (error: any) {
      toast.error(error.message);
      throw error;
    }
  };

  const requestPasswordReset = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`
      });

      if (error) throw error;
      toast.success('Password reset email sent');
      return { success: true };
    } catch (error: any) {
      toast.error(error.message);
      throw error;
    }
  };

  const resetPassword = async (newPassword: string) => {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;
      toast.success('Password updated successfully');
      return { success: true };
    } catch (error: any) {
      toast.error(error.message);
      throw error;
    }
  };

  const resendVerificationEmail = async () => {
    try {
      if (!authState.user?.email) {
        throw new Error('No email address found');
      }

      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: authState.user.email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/verify`
        }
      });

      if (error) throw error;
      toast.success('Verification email sent');
    } catch (error: any) {
      toast.error(error.message);
      throw error;
    }
  };

  return {
    ...authState,
    signUp,
    signIn,
    signOut,
    requestPasswordReset,
    resetPassword,
    resendVerificationEmail
  };
};
