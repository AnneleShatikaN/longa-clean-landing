
import { supabase } from '@/integrations/supabase/client';

export const cleanupAuthState = () => {
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

export const signOutAndCleanup = async () => {
  try {
    console.log('🚪 Signing out and cleaning up...');
    
    // Clean up state first
    cleanupAuthState();
    
    // Attempt global sign out
    try {
      await supabase.auth.signOut({ scope: 'global' });
    } catch (err) {
      console.log('Sign out error (continuing anyway):', err);
    }
    
    // Force page refresh for clean state
    window.location.href = '/auth';
  } catch (error) {
    console.error('Error during sign out and cleanup:', error);
    // Force redirect even if there's an error
    window.location.href = '/auth';
  }
};
