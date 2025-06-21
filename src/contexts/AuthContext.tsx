import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User, Session } from '@supabase/supabase-js';

export interface UserProfile {
  id: string;
  email: string;
  full_name?: string;
  name?: string; // Add for compatibility
  phone?: string;
  role?: string;
  avatar_url?: string;
  rating?: number;
  total_jobs?: number;
  current_work_location?: string;
  service_coverage_areas?: string[];
  is_active?: boolean;
  is_available?: boolean;
  available?: boolean; // Add for compatibility
  verification_status?: string;
  background_check_consent?: boolean;
  banking_details_verified?: boolean;
  verification_submitted_at?: string;
  verified_at?: string;
  verification_notes?: string;
  created_at?: string;
  updated_at?: string;
  provider_category?: string; // Add provider category
  // Location fields
  town?: string;
  suburb?: string;
  max_distance?: number;
  // Additional compatibility properties
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
  signIn: (email: string, password: string) => Promise<any>;
  signUp: (email: string, password: string, userData: any) => Promise<any>;
  signOut: () => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  refreshUser: () => Promise<void>;
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

  useEffect(() => {
    console.log('AuthProvider - Initializing auth state');
    
    // Get initial session
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      console.log('AuthProvider - Initial session:', { session: session?.user?.email || 'none', error });
      setSession(session);
      
      if (session?.user) {
        fetchUserProfile(session.user.id);
      } else {
        setLoading(false);
      }
      
      // Always set initialized to true after initial session check
      setIsInitialized(true);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('AuthProvider - Auth state change:', { event, userEmail: session?.user?.email || 'none' });
      setSession(session);
      
      if (session?.user) {
        // Use setTimeout to prevent deadlock
        setTimeout(() => {
          fetchUserProfile(session.user.id);
        }, 0);
      } else {
        setUser(null);
        setLoading(false);
      }
      
      // Ensure initialized is always true after auth state changes
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

      // Transform the data to match our UserProfile interface
      const userProfile: UserProfile = {
        ...data,
        name: data.full_name, // Map full_name to name for compatibility
        available: data.is_available, // Map is_available to available
        status: data.is_active ? 'active' : 'inactive',
        joinDate: data.created_at,
        lastActive: data.updated_at || new Date().toISOString(),
        isEmailVerified: true, // Assume verified if they can log in
        jobsCompleted: data.total_jobs || 0,
        totalEarnings: 0, // Default value
        // Include location fields
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
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        console.error('SignIn error:', error);
        throw new Error(error.message);
      }
      
      return { data, error: null };
    } catch (error: any) {
      console.error('SignIn failed:', error);
      return { data: null, error };
    }
  };

  const signUp = async (email: string, password: string, userData: any) => {
    try {
      console.log('Creating account with data:', {
        email: email,
        role: userData.role,
        fullName: userData.full_name,
        location: userData.current_work_location,
        providerCategory: userData.provider_category
      });

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
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
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
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

  const value = {
    user,
    session,
    loading,
    isLoading: loading,
    isInitialized,
    signIn,
    signUp,
    signOut,
    logout,
    updateProfile,
    refreshUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
