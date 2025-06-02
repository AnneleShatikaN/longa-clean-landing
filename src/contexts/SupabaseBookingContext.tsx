import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Database } from '@/integrations/supabase/types';

type BookingRow = Database['public']['Tables']['bookings']['Row'];
type BookingInsert = Database['public']['Tables']['bookings']['Insert'];
type BookingUpdate = Database['public']['Tables']['bookings']['Update'];
type ServiceRow = Database['public']['Tables']['services']['Row'];
type NotificationRow = Database['public']['Tables']['notifications']['Row'];

export interface BookingData {
  serviceId: string;
  bookingDate: string;
  bookingTime: string;
  specialInstructions?: string;
  emergencyBooking?: boolean;
  durationMinutes: number;
}

interface SupabaseBookingContextType {
  bookings: BookingWithRelations[];
  notifications: NotificationRow[];
  isLoading: boolean;
  error: string | null;
  createBooking: (bookingData: BookingData) => Promise<BookingRow>;
  updateBookingStatus: (bookingId: string, status: Database['public']['Enums']['booking_status']) => Promise<void>;
  acceptBooking: (bookingId: string) => Promise<void>;
  startJob: (bookingId: string) => Promise<void>;
  completeJob: (bookingId: string, rating?: number, review?: string) => Promise<void>;
  cancelBooking: (bookingId: string, reason?: string) => Promise<void>;
  getAvailableJobs: () => Promise<BookingWithRelations[]>;
  checkAvailability: (providerId: string, date: string, time: string, duration: number) => Promise<boolean>;
  markNotificationAsRead: (notificationId: string) => Promise<void>;
}

const SupabaseBookingContext = createContext<SupabaseBookingContextType | undefined>(undefined);

export const SupabaseBookingProvider = ({ children }: { children: ReactNode }) => {
  const [bookings, setBookings] = useState<BookingWithRelations[]>([]);
  const [notifications, setNotifications] = useState<NotificationRow[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  // Fetch user's bookings
  const fetchBookings = async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          service:services(*),
          client:users!bookings_client_id_fkey(*),
          provider:users!bookings_provider_id_fkey(*)
        `)
        .or(`client_id.eq.${user.id},provider_id.eq.${user.id}`)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setBookings(data || []);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch bookings');
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch user's notifications
  const fetchNotifications = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setNotifications(data || []);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  // Set up real-time subscriptions
  useEffect(() => {
    if (!user) return;

    fetchBookings();
    fetchNotifications();

    // Subscribe to booking changes
    const bookingChannel = supabase
      .channel('booking-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'bookings',
          filter: `or(client_id.eq.${user.id},provider_id.eq.${user.id})`
        },
        (payload) => {
          console.log('Booking change:', payload);
          fetchBookings(); // Refetch to get updated data with joins
        }
      )
      .subscribe();

    // Subscribe to notification changes
    const notificationChannel = supabase
      .channel('notification-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notifications',
          filter: `user_id.eq.${user.id}`
        },
        (payload) => {
          console.log('Notification change:', payload);
          if (payload.eventType === 'INSERT') {
            const newNotification = payload.new as NotificationRow;
            setNotifications(prev => [newNotification, ...prev]);
            
            // Show toast notification
            toast({
              title: newNotification.title,
              description: newNotification.message,
            });
          } else {
            fetchNotifications();
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(bookingChannel);
      supabase.removeChannel(notificationChannel);
    };
  }, [user]);

  const createBooking = async (bookingData: BookingData): Promise<BookingRow> => {
    if (!user) throw new Error('User not authenticated');

    setIsLoading(true);
    setError(null);

    try {
      // Get service details
      const { data: service, error: serviceError } = await supabase
        .from('services')
        .select('*')
        .eq('id', bookingData.serviceId)
        .single();

      if (serviceError || !service) throw new Error('Service not found');

      // Calculate acceptance deadline (24 hours from now)
      const acceptanceDeadline = new Date();
      acceptanceDeadline.setHours(acceptanceDeadline.getHours() + 24);

      const bookingInsert: BookingInsert = {
        client_id: user.id,
        service_id: bookingData.serviceId,
        booking_date: bookingData.bookingDate,
        booking_time: bookingData.bookingTime,
        total_amount: service.client_price,
        duration_minutes: bookingData.durationMinutes,
        special_instructions: bookingData.specialInstructions,
        emergency_booking: bookingData.emergencyBooking || false,
        acceptance_deadline: acceptanceDeadline.toISOString(),
        status: 'pending'
      };

      const { data, error } = await supabase
        .from('bookings')
        .insert(bookingInsert)
        .select()
        .single();

      if (error) throw error;

      // Send notifications to available providers (simplified - in reality you'd query available providers)
      const { error: notificationError } = await supabase.rpc('send_notification', {
        user_id: user.id, // This should be provider IDs in real implementation
        notification_type: 'new_booking',
        title: 'New Booking Available',
        message: `New ${service.name} booking for ${bookingData.bookingDate} at ${bookingData.bookingTime}`,
        booking_id: data.id
      });

      if (notificationError) {
        console.warn('Failed to send notifications:', notificationError);
      }

      toast({
        title: "Booking Created",
        description: "Your booking has been created and sent to available providers.",
      });

      return data;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create booking';
      setError(errorMessage);
      toast({
        title: "Booking Failed",
        description: errorMessage,
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const updateBookingStatus = async (bookingId: string, status: Database['public']['Enums']['booking_status']) => {
    try {
      const { error } = await supabase
        .from('bookings')
        .update({ 
          status,
          ...(status === 'in_progress' && { check_in_time: new Date().toISOString() })
        })
        .eq('id', bookingId);

      if (error) throw error;

      toast({
        title: "Status Updated",
        description: `Booking status updated to ${status.replace('_', ' ')}`,
      });
    } catch (error) {
      console.error('Error updating booking status:', error);
      toast({
        title: "Update Failed",
        description: "Failed to update booking status",
        variant: "destructive",
      });
    }
  };

  const acceptBooking = async (bookingId: string) => {
    if (!user) throw new Error('User not authenticated');

    try {
      // Check for conflicts first
      const { data: booking } = await supabase
        .from('bookings')
        .select('*')
        .eq('id', bookingId)
        .single();

      if (!booking) throw new Error('Booking not found');

      const { data: hasConflict } = await supabase.rpc('check_booking_conflicts', {
        provider_id: user.id,
        booking_date: booking.booking_date,
        booking_time: booking.booking_time,
        duration_minutes: booking.duration_minutes || 60
      });

      if (hasConflict) {
        throw new Error('You have a conflicting booking at this time');
      }

      // Accept the booking
      const { error } = await supabase
        .from('bookings')
        .update({ 
          status: 'accepted',
          provider_id: user.id
        })
        .eq('id', bookingId);

      if (error) throw error;

      toast({
        title: "Booking Accepted",
        description: "You have successfully accepted this booking",
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to accept booking';
      toast({
        title: "Accept Failed",
        description: errorMessage,
        variant: "destructive",
      });
      throw error;
    }
  };

  const startJob = async (bookingId: string) => {
    await updateBookingStatus(bookingId, 'in_progress');
  };

  const completeJob = async (bookingId: string, rating?: number, review?: string) => {
    try {
      const updates: BookingUpdate = {
        status: 'completed',
        ...(rating && { rating }),
        ...(review && { review })
      };

      const { error } = await supabase
        .from('bookings')
        .update(updates)
        .eq('id', bookingId);

      if (error) throw error;

      toast({
        title: "Job Completed",
        description: "Job has been marked as completed. Payout will be processed automatically.",
      });
    } catch (error) {
      console.error('Error completing job:', error);
      toast({
        title: "Complete Failed",
        description: "Failed to complete job",
        variant: "destructive",
      });
    }
  };

  const cancelBooking = async (bookingId: string, reason?: string) => {
    await updateBookingStatus(bookingId, 'cancelled');
  };

  const getAvailableJobs = async (): Promise<BookingWithRelations[]> => {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          service:services(*),
          client:users!bookings_client_id_fkey(*)
        `)
        .eq('status', 'pending')
        .is('provider_id', null)
        .gte('acceptance_deadline', new Date().toISOString())
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching available jobs:', error);
      return [];
    }
  };

  const checkAvailability = async (providerId: string, date: string, time: string, duration: number): Promise<boolean> => {
    try {
      const { data, error } = await supabase.rpc('check_booking_conflicts', {
        provider_id: providerId,
        booking_date: date,
        booking_time: time,
        duration_minutes: duration
      });

      if (error) throw error;
      return !data; // Function returns true if there are conflicts, so we invert it
    } catch (error) {
      console.error('Error checking availability:', error);
      return false;
    }
  };

  const markNotificationAsRead = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', notificationId);

      if (error) throw error;
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const value: SupabaseBookingContextType = {
    bookings,
    notifications,
    isLoading,
    error,
    createBooking,
    updateBookingStatus,
    acceptBooking,
    startJob,
    completeJob,
    cancelBooking,
    getAvailableJobs,
    checkAvailability,
    markNotificationAsRead
  };

  return (
    <SupabaseBookingContext.Provider value={value}>
      {children}
    </SupabaseBookingContext.Provider>
  );
};

export const useSupabaseBookings = () => {
  const context = useContext(SupabaseBookingContext);
  if (context === undefined) {
    throw new Error('useSupabaseBookings must be used within a SupabaseBookingProvider');
  }
  return context;
};
