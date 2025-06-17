
import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { UserProfile } from '@/types/user';
import { toast } from 'sonner';

interface AuthContextType {
  user: UserProfile | null;
  session: Session | null;
  loading: boolean;
  isLoading: boolean; // Add this for ProtectedRoute compatibility
  isInitialized: boolean; // Add this for ProtectedRoute compatibility
  signUp: (email: string, password: string, metadata: any) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  logout: () => Promise<void>; // Add this for component compatibility
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);

  const fetchUserProfile = async (userId: string): Promise<UserProfile | null> => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching user profile:', error);
        return null;
      }

      // Map the database data to UserProfile type
      const userProfile: UserProfile = {
        id: data.id,
        email: data.email,
        full_name: data.full_name,
        name: data.full_name, // Map full_name to name
        phone: data.phone,
        role: data.role,
        avatar_url: data.avatar_url,
        is_active: data.is_active,
        rating: data.rating,
        total_jobs: data.total_jobs,
        created_at: data.created_at,
        updated_at: data.updated_at,
        current_work_location: data.current_work_location,
        status: data.is_active ? 'active' : 'inactive', // Map is_active to status
        joinDate: data.created_at, // Map created_at to joinDate
        lastActive: data.updated_at, // Map updated_at to lastActive
        isEmailVerified: true, // Default to true for now
        jobsCompleted: data.total_jobs
      };

      return userProfile;
    } catch (error) {
      console.error('Error in fetchUserProfile:', error);
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
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        setSession(currentSession);

        if (currentSession?.user) {
          const userProfile = await fetchUserProfile(currentSession.user.id);
          setUser(userProfile);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
      } finally {
        setLoading(false);
        setIsInitialized(true);
      }
    };

    initializeAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        console.log('Auth state changed:', event, currentSession?.user?.email);
        setSession(currentSession);

        if (event === 'SIGNED_IN' && currentSession?.user) {
          setTimeout(async () => {
            const userProfile = await fetchUserProfile(currentSession.user.id);
            setUser(userProfile);
          }, 0);
        } else if (event === 'SIGNED_OUT') {
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
      // Validate required fields for clients
      if (metadata.role === 'client') {
        if (!metadata.full_name || !metadata.location) {
          throw new Error('Full name and location are required fields');
        }
      }

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            ...metadata,
            work_location: metadata.location // Map location to work_location for consistency
          }
        }
      });

      if (error) throw error;

      if (data.user && !data.session) {
        toast.success('Please check your email to confirm your account');
      } else if (data.session) {
        toast.success('Account created successfully!');
      }
    } catch (error: any) {
      console.error('Signup error:', error);
      throw error;
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (data.user) {
        toast.success('Signed in successfully!');
      }
    } catch (error: any) {
      console.error('Signin error:', error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      setUser(null);
      setSession(null);
      toast.success('Signed out successfully');
    } catch (error: any) {
      console.error('Signout error:', error);
      throw error;
    }
  };

  // Add logout as an alias to signOut for component compatibility
  const logout = signOut;

  return (
    <AuthContext.Provider value={{
      user,
      session,
      loading,
      isLoading: loading, // Provide isLoading as alias to loading
      isInitialized,
      signUp,
      signIn,
      signOut,
      logout, // Add logout method
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
