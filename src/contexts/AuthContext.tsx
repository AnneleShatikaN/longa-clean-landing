
import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { UserProfile } from '@/types/user';
import { UserRole } from '@/types/auth';
import { toast } from 'sonner';

interface AuthContextType {
  user: UserProfile | null;
  session: Session | null;
  loading: boolean;
  isLoading: boolean;
  isInitialized: boolean;
  signUp: (email: string, password: string, metadata: any) => Promise<{ needsEmailVerification?: boolean }>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Auth cleanup utility
const cleanupAuthState = () => {
  try {
    console.log('🧹 Cleaning up auth state...');
    
    // Remove standard auth tokens and any stale flags
    localStorage.removeItem('supabase.auth.token');
    localStorage.removeItem('admin_setup_completed');
    
    // Remove all Supabase auth keys from localStorage
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
        console.log('🗑️ Removing localStorage key:', key);
        localStorage.removeItem(key);
      }
    });
    
    // Remove from sessionStorage if in use
    if (typeof sessionStorage !== 'undefined') {
      Object.keys(sessionStorage).forEach((key) => {
        if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
          console.log('🗑️ Removing sessionStorage key:', key);
          sessionStorage.removeItem(key);
        }
      });
    }
  } catch (error) {
    console.error('Error cleaning up auth state:', error);
  }
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);

  const fetchUserProfile = async (userId: string): Promise<UserProfile | null> => {
    try {
      console.log('Auth: Fetching user profile for ID:', userId);
      
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Auth: Error fetching user profile:', error);
        return null;
      }

      console.log('Auth: User profile data:', data);

      // Map the database data to UserProfile type
      const userProfile: UserProfile = {
        id: data.id,
        email: data.email,
        full_name: data.full_name,
        name: data.full_name,
        phone: data.phone,
        role: data.role as UserRole,
        avatar_url: data.avatar_url,
        is_active: data.is_active,
        rating: data.rating,
        total_jobs: data.total_jobs,
        created_at: data.created_at,
        updated_at: data.updated_at,
        current_work_location: data.current_work_location,
        status: data.is_active ? 'active' : 'inactive',
        joinDate: data.created_at,
        lastActive: data.updated_at,
        isEmailVerified: true,
        jobsCompleted: data.total_jobs
      };

      console.log('Auth: Mapped user profile:', userProfile);
      return userProfile;
    } catch (error) {
      console.error('Auth: Error in fetchUserProfile:', error);
      return null;
    }
  };

  const refreshUser = async () => {
    if (session?.user?.id) {
      const userProfile = await fetchUserProfile(session.user.id);
      setUser(userProfile);
    }
  };

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        console.log('Auth: Initializing auth state...');
        
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        console.log('Auth: Current session:', currentSession);
        
        setSession(currentSession);

        if (currentSession?.user) {
          console.log('Auth: Session user found:', currentSession.user);
          const userProfile = await fetchUserProfile(currentSession.user.id);
          setUser(userProfile);
        } else {
          console.log('Auth: No session user found');
        }
      } catch (error) {
        console.error('Auth: Error initializing auth:', error);
      } finally {
        setLoading(false);
        setIsInitialized(true);
        console.log('Auth: Initialization complete');
      }
    };

    initializeAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        console.log('Auth: State changed:', event, currentSession?.user?.email);
        setSession(currentSession);

        if (event === 'SIGNED_IN' && currentSession?.user) {
          console.log('Auth: User signed in, fetching profile...');
          setTimeout(async () => {
            const userProfile = await fetchUserProfile(currentSession.user.id);
            setUser(userProfile);
          }, 0);
        } else if (event === 'SIGNED_OUT') {
          console.log('Auth: User signed out');
          setUser(null);
        }

        setLoading(false);
        setIsInitialized(true);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, metadata: any) => {
    try {
      console.log('Starting sign up process with metadata:', metadata);

      // Validate required fields for clients
      if (metadata.role === 'client') {
        if (!metadata.full_name || !metadata.location) {
          throw new Error('Full name and location are required fields');
        }
      }

      // Prevent admin signup in public registration
      if (metadata.role === 'admin') {
        throw new Error('Admin registration is not available through public signup');
      }

      // Clean up any existing auth state before signing up
      cleanupAuthState();
      
      // Sign out any existing session
      try {
        await supabase.auth.signOut();
      } catch (err) {
        console.log('Sign out error during signup (continuing):', err);
      }

      // Get the current origin for email redirect
      const redirectUrl = `${window.location.origin}/auth`;

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            full_name: metadata.full_name,
            phone: metadata.phone,
            role: metadata.role,
            location: metadata.location
          }
        }
      });

      if (error) {
        console.error('Signup error:', error);
        
        // Handle specific error cases
        if (error.message.includes('User already registered')) {
          throw new Error('An account with this email already exists. Please try signing in instead.');
        } else if (error.message.includes('Password should be at least')) {
          throw new Error('Password must be at least 6 characters long.');
        } else if (error.message.includes('Invalid email')) {
          throw new Error('Please enter a valid email address.');
        }
        
        throw error;
      }

      console.log('Signup successful:', data);

      if (data.user) {
        // Check if user needs email verification
        if (!data.session) {
          console.log('User needs email verification');
          return { needsEmailVerification: true };
        } else {
          console.log('User account created and signed in immediately');
          return { needsEmailVerification: false };
        }
      } else {
        throw new Error('Failed to create user account');
      }
    } catch (error: any) {
      console.error('Signup error:', error);
      throw error;
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      console.log('Starting sign in process for:', email);

      // Clean up auth state before signing in
      cleanupAuthState();

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('Sign in error:', error);
        
        // Handle specific error cases
        if (error.message.includes('Invalid login credentials')) {
          throw new Error('Invalid email or password. Please check your credentials and try again.');
        } else if (error.message.includes('Email not confirmed')) {
          throw new Error('Please check your email and click the verification link before signing in.');
        }
        
        throw error;
      }

      if (data.user) {
        console.log('Sign in successful for user:', data.user.id);
        
        // Check if email is verified
        if (!data.user.email_confirmed_at) {
          throw new Error('Please verify your email address before signing in. Check your inbox for the verification link.');
        }
        
        toast.success('Signed in successfully!');
      }
    } catch (error: any) {
      console.error('Signin error:', error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      console.log('🚪 Starting sign out process...');
      
      // Clean up state first
      cleanupAuthState();
      
      // Attempt global sign out
      try {
        await supabase.auth.signOut({ scope: 'global' });
      } catch (err) {
        console.log('Sign out error (continuing anyway):', err);
      }
      
      setUser(null);
      setSession(null);
      toast.success('Signed out successfully');
      
      // Force page refresh for clean state
      setTimeout(() => {
        window.location.href = '/auth';
      }, 100);
    } catch (error: any) {
      console.error('Signout error:', error);
      // Force redirect even if there's an error
      window.location.href = '/auth';
    }
  };

  const logout = signOut;

  return (
    <AuthContext.Provider value={{
      user,
      session,
      loading,
      isLoading: loading,
      isInitialized,
      signUp,
      signIn,
      signOut,
      logout,
      refreshUser,
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
