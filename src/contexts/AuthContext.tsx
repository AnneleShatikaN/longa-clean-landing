
import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User, Session } from '@supabase/supabase-js';

export interface UserProfile {
  id: string;
  email: string;
  full_name?: string;
  name?: string;
  phone?: string;
  role?: string;
  avatar_url?: string;
  rating?: number;
  total_jobs?: number;
  current_work_location?: string;
  service_coverage_areas?: string[];
  is_active?: boolean;
  is_available?: boolean;
  available?: boolean;
  verification_status?: string;
  background_check_consent?: boolean;
  banking_details_verified?: boolean;
  verification_submitted_at?: string;
  verified_at?: string;
  verification_notes?: string;
  created_at?: string;
  updated_at?: string;
  provider_category?: string;
  town?: string;
  suburb?: string;
  max_distance?: number;
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
  status?: 'active' | 'inactive' | 'pending';
  jobsCompleted?: number;
  totalEarnings?: number;
  joinDate?: string;
  lastActive?: string;
  isEmailVerified?: boolean;
  app_metadata?: any;
  user_metadata?: any;
  aud?: string;
}

interface AuthContextType {
  user: UserProfile | null;
  session: Session | null;
  loading: boolean;
  isLoading: boolean;
  isInitialized: boolean;
  needsEmailVerification: boolean;
  signIn: (email: string, password: string) => Promise<any>;
  signUp: (email: string, password: string, userData: any) => Promise<any>;
  signOut: () => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  refreshUser: () => Promise<void>;
  resendVerificationEmail: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);
  const [needsEmailVerification, setNeedsEmailVerification] = useState(false);
  const [signupEmail, setSignupEmail] = useState<string>('');

  useEffect(() => {
    console.log('AuthProvider - Initializing auth state');
    
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('AuthProvider - Auth state change:', { event, userEmail: session?.user?.email || 'none' });
      setSession(session);
      
      if (event === 'SIGNED_UP') {
        // User just signed up - check if email is confirmed
        if (session?.user && !session.user.email_confirmed_at) {
          console.log('AuthProvider - User signed up but email not confirmed');
          setNeedsEmailVerification(true);
          setSignupEmail(session.user.email || '');
          setUser(null);
          setLoading(false);
          setIsInitialized(true);
          return;
        }
      }
      
      if (event === 'SIGNED_IN') {
        // Check if email is verified for existing users
        if (session?.user && !session.user.email_confirmed_at) {
          console.log('AuthProvider - User signed in but email not verified');
          setNeedsEmailVerification(true);
          setSignupEmail(session.user.email || '');
          setUser(null);
          setLoading(false);
          setIsInitialized(true);
          return;
        }
      }
      
      if (session?.user && session.user.email_confirmed_at) {
        // Email is verified, fetch user profile
        setNeedsEmailVerification(false);
        setTimeout(() => {
          fetchUserProfile(session.user.id);
        }, 0);
      } else {
        setUser(null);
        setNeedsEmailVerification(false);
        setLoading(false);
      }
      
      setIsInitialized(true);
    });

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      console.log('AuthProvider - Initial session:', { session: session?.user?.email || 'none', error });
      setSession(session);
      
      if (session?.user) {
        if (!session.user.email_confirmed_at) {
          setNeedsEmailVerification(true);
          setSignupEmail(session.user.email || '');
          setUser(null);
          setLoading(false);
        } else {
          setNeedsEmailVerification(false);
          fetchUserProfile(session.user.id);
        }
      } else {
        setLoading(false);
      }
      
      setIsInitialized(true);
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserProfile = async (userId: string) => {
    try {
      console.log('AuthProvider - Fetching user profile for:', userId);
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('AuthProvider - Error fetching user profile:', error);
        throw error;
      }

      if (!data) {
        console.warn('AuthProvider - No user profile found for:', userId);
        setUser(null);
        setLoading(false);
        setIsInitialized(true);
        return;
      }

      const userProfile: UserProfile = {
        ...data,
        name: data.full_name,
        available: data.is_available,
        status: data.is_active ? 'active' : 'inactive',
        joinDate: data.created_at,
        lastActive: data.updated_at || new Date().toISOString(),
        isEmailVerified: true,
        jobsCompleted: data.total_jobs || 0,
        totalEarnings: 0,
        town: data.town,
        suburb: data.suburb,
        max_distance: data.max_distance,
        app_metadata: {},
        user_metadata: {},
        aud: 'authenticated'
      };

      console.log('AuthProvider - User profile loaded:', { 
        id: userProfile.id, 
        email: userProfile.email, 
        role: userProfile.role,
        name: userProfile.name,
        town: userProfile.town,
        suburb: userProfile.suburb
      });

      setUser(userProfile);
    } catch (error) {
      console.error('AuthProvider - Error in fetchUserProfile:', error);
      setUser(null);
    } finally {
      setLoading(false);
      setIsInitialized(true);
    }
  };

  const refreshUser = async () => {
    if (session?.user) {
      setLoading(true);
      await fetchUserProfile(session.user.id);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        console.error('SignIn error:', error);
        throw new Error(error.message);
      }
      
      // Check if email is verified
      if (data.user && !data.user.email_confirmed_at) {
        setNeedsEmailVerification(true);
        setSignupEmail(email);
        return { data: null, error: new Error('Please verify your email address before signing in') };
      }
      
      return { data, error: null };
    } catch (error: any) {
      console.error('SignIn failed:', error);
      return { data: null, error };
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, userData: any) => {
    try {
      setLoading(true);
      console.log('Creating account with data:', {
        email: email,
        role: userData.role,
        fullName: userData.full_name,
        location: userData.current_work_location,
        providerCategory: userData.provider_category
      });

      // Use consistent redirect URL for email verification
      const redirectUrl = `${window.location.origin}/auth/callback`;

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            full_name: userData.full_name,
            phone: userData.phone,
            role: userData.role,
            current_work_location: userData.current_work_location,
            provider_category: userData.role === 'provider' ? userData.provider_category : null
          }
        },
      });

      if (error) {
        console.error('SignUp error:', error);
        throw new Error(error.message);
      }

      // Check if user needs email verification
      const needsEmailVerification = data.user && !data.session;
      
      console.log('SignUp result:', { 
        user: data.user?.email, 
        needsEmailVerification,
        session: !!data.session 
      });

      if (needsEmailVerification) {
        setNeedsEmailVerification(true);
        setSignupEmail(email);
      }

      return { 
        data, 
        error: null, 
        needsEmailVerification 
      };
    } catch (error: any) {
      console.error('SignUp failed:', error);
      return { 
        data: null, 
        error, 
        needsEmailVerification: false 
      };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    setLoading(true);
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setNeedsEmailVerification(false);
    setSignupEmail('');
    setLoading(false);
  };

  const logout = async () => {
    await signOut();
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user) return;

    const { error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', user.id);

    if (error) throw error;

    setUser({ ...user, ...updates });
  };

  const resendVerificationEmail = async () => {
    try {
      if (!signupEmail) {
        throw new Error('No email address found');
      }

      const redirectUrl = `${window.location.origin}/auth/callback`;

      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: signupEmail,
        options: {
          emailRedirectTo: redirectUrl
        }
      });

      if (error) throw error;
      
      return { success: true };
    } catch (error: any) {
      console.error('Error resending verification email:', error);
      throw error;
    }
  };

  const value = {
    user,
    session,
    loading,
    isLoading: loading,
    isInitialized,
    needsEmailVerification,
    signIn,
    signUp,
    signOut,
    logout,
    updateProfile,
    refreshUser,
    resendVerificationEmail,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
