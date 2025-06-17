
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface RecurringSchedule {
  id: string;
  parent_booking_id: string;
  service_id: string;
  frequency: 'weekly' | 'bi-weekly' | 'monthly';
  day_of_week: number;
  booking_time: string;
  start_date: string;
  end_date?: string;
  is_active: boolean;
  special_instructions?: string;
  emergency_booking: boolean;
  duration_minutes: number;
  location_town: string;
  created_at: string;
}

export const useRecurringBookings = () => {
  const [recurringSchedules, setRecurringSchedules] = useState<RecurringSchedule[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchRecurringSchedules = async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('recurring_booking_schedules')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRecurringSchedules(data || []);
    } catch (error) {
      console.error('Error fetching recurring schedules:', error);
      toast({
        title: "Error",
        description: "Failed to load recurring bookings",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const createRecurringSchedule = async (scheduleData: {
    parent_booking_id: string;
    service_id: string;
    frequency: 'weekly' | 'bi-weekly' | 'monthly';
    day_of_week: number;
    booking_time: string;
    start_date: string;
    end_date?: string;
    special_instructions?: string;
    emergency_booking: boolean;
    duration_minutes: number;
    location_town: string;
  }) => {
    if (!user) throw new Error('User not authenticated');

    try {
      const { data, error } = await supabase
        .from('recurring_booking_schedules')
        .insert({
          ...scheduleData,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;

      // Automatically create future bookings
      const { data: functionResult, error: functionError } = await supabase.rpc(
        'create_recurring_bookings',
        { schedule_id: data.id }
      );

      if (functionError) throw functionError;

      toast({
        title: "Recurring Booking Created",
        description: `${functionResult.bookings_created} future bookings have been scheduled`,
      });

      await fetchRecurringSchedules();
      return data;
    } catch (error) {
      console.error('Error creating recurring schedule:', error);
      toast({
        title: "Error",
        description: "Failed to create recurring booking",
        variant: "destructive",
      });
      throw error;
    }
  };

  const cancelRecurringSchedule = async (scheduleId: string) => {
    try {
      const { error } = await supabase
        .from('recurring_booking_schedules')
        .update({ is_active: false })
        .eq('id', scheduleId);

      if (error) throw error;

      toast({
        title: "Recurring Booking Cancelled",
        description: "The recurring schedule has been cancelled. Existing bookings remain unchanged.",
      });

      await fetchRecurringSchedules();
    } catch (error) {
      console.error('Error cancelling recurring schedule:', error);
      toast({
        title: "Error",
        description: "Failed to cancel recurring booking",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchRecurringSchedules();
  }, [user]);

  return {
    recurringSchedules,
    isLoading,
    createRecurringSchedule,
    cancelRecurringSchedule,
    refetch: fetchRecurringSchedules,
  };
};
