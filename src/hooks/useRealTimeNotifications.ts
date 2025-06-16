
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export const useRealTimeNotifications = () => {
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (!user) return;

    // Subscribe to real-time notifications
    const channel = supabase
      .channel('user-notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          const notification = payload.new;
          
          // Show toast notification for high priority items
          if (notification.priority === 'high' || notification.priority === 'urgent') {
            toast({
              title: notification.title,
              description: notification.message,
              variant: notification.type.includes('error') || notification.type.includes('failed') 
                ? 'destructive' 
                : 'default',
            });
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'bookings',
          filter: `client_id=eq.${user.id}`
        },
        (payload) => {
          const booking = payload.new;
          const oldBooking = payload.old;
          
          // Notify on status changes
          if (booking.status !== oldBooking.status) {
            const statusMessages = {
              accepted: '✅ Your booking has been accepted!',
              in_progress: '🔄 Your service provider has started working',
              completed: '✅ Service completed successfully',
              cancelled: '❌ Booking has been cancelled'
            };
            
            const message = statusMessages[booking.status as keyof typeof statusMessages];
            if (message) {
              toast({
                title: 'Booking Update',
                description: message,
              });
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, toast]);

  return null; // This hook only sets up listeners
};
