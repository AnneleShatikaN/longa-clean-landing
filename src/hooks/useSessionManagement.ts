
import { useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useEnhancedToast } from './useEnhancedToast';
import { 
  isSessionExpired, 
  updateLastActivity, 
  ACTIVITY_CHECK_INTERVAL,
  logSecurityEvent
} from '@/utils/security';

export const useSessionManagement = () => {
  const { user, logout, session } = useAuth();
  const { toast } = useEnhancedToast();

  const handleActivity = useCallback(() => {
    if (user && session) {
      updateLastActivity();
    }
  }, [user, session]);

  const checkSession = useCallback(() => {
    if (user && session && isSessionExpired()) {
      toast.warning('Session Expired', 'You have been logged out due to inactivity');
      logSecurityEvent({
        type: 'logout',
        userId: user.id, // user.id is now correctly typed as string
        details: { reason: 'session_timeout' }
      });
      logout();
    }
  }, [user, session, logout, toast]);

  useEffect(() => {
    if (!user || !session) return;

    // Add activity listeners
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    events.forEach(event => {
      document.addEventListener(event, handleActivity, true);
    });

    // Set up session check interval
    const interval = setInterval(checkSession, ACTIVITY_CHECK_INTERVAL);

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, handleActivity, true);
      });
      clearInterval(interval);
    };
  }, [user, session, handleActivity, checkSession]);

  return { handleActivity };
};
