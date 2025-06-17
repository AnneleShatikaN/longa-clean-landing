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
type UserRow = Database['public']['Tables']['users']['Row'];

export interface BookingWithRelations extends BookingRow {
  service?: ServiceRow | null;
  client?: UserRow | null;
  provider?: UserRow | null;
}

export interface BookingData {
  serviceId: string;
  bookingDate: string;
  bookingTime: string;
  specialInstructions?: string;
  emergencyBooking?: boolean;
  durationMinutes: number;
  locationTown?: string; // Add location for bookings
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
  refetchBookings: () => Promise<void>;
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

      // Check if user has an active package and if service is covered
      const { data: activePackage } = await supabase
        .from('user_active_packages')
        .select(`
          *,
          package:subscription_packages(
            package_entitlements:package_entitlements(
              allowed_service_id,
              quantity_per_cycle
            )
          )
        `)
        .eq('user_id', user.id)
        .eq('status', 'active')
        .gte('expiry_date', new Date().toISOString().split('T')[0])
        .maybeSingle();

      let usePackageCredit = false;
      let packageUsageResult = null;

      // Check if service is covered by package
      if (activePackage?.package?.package_entitlements) {
        const isServiceCovered = activePackage.package.package_entitlements.some(
          (ent: any) => ent.allowed_service_id === bookingData.serviceId
        );

        if (isServiceCovered) {
          // Check if user can use package credit
          const { data: usageCheck } = await supabase.rpc('use_package_service', {
            p_user_id: user.id,
            p_service_id: bookingData.serviceId
          });

          // Type cast the response properly
          const usageResult = usageCheck as any;
          if (usageResult?.success) {
            usePackageCredit = true;
            packageUsageResult = usageResult;
          }
        }
      }

      // Calculate acceptance deadline (24 hours from now)
      const acceptanceDeadline = new Date();
      acceptanceDeadline.setHours(acceptanceDeadline.getHours() + 24);

      const bookingInsert: BookingInsert = {
        client_id: user.id,
        service_id: bookingData.serviceId,
        booking_date: bookingData.bookingDate,
        booking_time: bookingData.bookingTime,
        total_amount: usePackageCredit ? 0 : service.client_price, // Free if using package credit
        duration_minutes: bookingData.durationMinutes,
        special_instructions: bookingData.specialInstructions,
        emergency_booking: bookingData.emergencyBooking || false,
        acceptance_deadline: acceptanceDeadline.toISOString(),
        location_town: bookingData.locationTown || 'windhoek',
        status: 'pending'
      };

      const { data, error } = await supabase
        .from('bookings')
        .insert(bookingInsert)
        .select()
        .single();

      if (error) throw error;

      // Log package usage if applicable
      if (usePackageCredit && activePackage) {
        await supabase
          .from('service_usage_logs')
          .insert({
            user_id: user.id,
            package_id: activePackage.package_id,
            allowed_service_id: bookingData.serviceId,
            booking_id: data.id
          });
      }

      // Send notifications to available providers in the same location
      const { data: availableProviders, error: providersError } = await supabase
        .from('users')
        .select('id')
        .eq('role', 'provider')
        .eq('is_active', true)
        .eq('current_work_location', bookingData.locationTown || 'windhoek');

      if (!providersError && availableProviders) {
        // Send notification to each available provider
        for (const provider of availableProviders) {
          await supabase.rpc('send_notification', {
            user_id: provider.id,
            notification_type: 'new_booking',
            title: 'New Booking Available',
            message: `New ${service.name} booking for ${bookingData.bookingDate} at ${bookingData.bookingTime} in ${bookingData.locationTown || 'Windhoek'}${usePackageCredit ? ' (Package Credit)' : ''}`,
            booking_id: data.id
          });
        }
      }

      toast({
        title: "Booking Created",
        description: usePackageCredit 
          ? `Your booking has been created using package credit. ${packageUsageResult?.remaining || 0} credits remaining.`
          : "Your booking has been created and sent to available providers in your area.",
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
    // This function is now disabled for the new assignment system
    throw new Error('Job acceptance is now handled through admin assignment. Please wait for jobs to be assigned to you.');
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
    try {
      const { error } = await supabase
        .from('bookings')
        .update({ 
          status: 'cancelled'
        })
        .eq('id', bookingId);

      if (error) throw error;

      toast({
        title: "Booking Cancelled",
        description: "Your booking has been cancelled successfully.",
      });
    } catch (error) {
      console.error('Error cancelling booking:', error);
      toast({
        title: "Cancel Failed",
        description: "Failed to cancel booking",
        variant: "destructive",
      });
      throw error;
    }
  };

  const getAvailableJobs = async (): Promise<BookingWithRelations[]> => {
    // Providers should no longer see "available" jobs - only assigned ones
    // This function now returns empty array for providers
    if (user?.role === 'provider') {
      return []; // Providers can't self-select jobs anymore
    }

    // For admin/client views, still show unassigned jobs
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
    markNotificationAsRead,
    refetchBookings: fetchBookings
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
