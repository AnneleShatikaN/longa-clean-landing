
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
      
      // Use a simple query to avoid type inference issues
      const { data: bookings, error } = await supabase
        .from('bookings')
        .select(`
          id,
          service_id,
          booking_time,
          booking_date,
          special_instructions,
          emergency_booking,
          duration_minutes,
          location_town,
          created_at,
          is_recurring,
          recurring_frequency,
          recurring_day_of_week,
          recurring_end_date,
          is_auto_scheduled
        `)
        .eq('client_id', user.id)
        .eq('is_recurring', true)
        .eq('is_auto_scheduled', false);

      if (error) throw error;
      
      // Transform the booking data manually
      const schedules: RecurringSchedule[] = (bookings || []).map((booking: any) => ({
        id: booking.id,
        parent_booking_id: booking.id,
        service_id: booking.service_id,
        frequency: booking.recurring_frequency || 'weekly',
        day_of_week: booking.recurring_day_of_week || 1,
        booking_time: booking.booking_time,
        start_date: booking.booking_date,
        end_date: booking.recurring_end_date,
        is_active: true,
        special_instructions: booking.special_instructions,
        emergency_booking: booking.emergency_booking,
        duration_minutes: booking.duration_minutes || 60,
        location_town: booking.location_town || 'windhoek',
        created_at: booking.created_at
      }));
      
      setRecurringSchedules(schedules);
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
      // Update the parent booking to mark it as recurring
      const { error: updateError } = await supabase
        .from('bookings')
        .update({
          is_recurring: true,
          recurring_frequency: scheduleData.frequency,
          recurring_day_of_week: scheduleData.day_of_week,
          recurring_end_date: scheduleData.end_date
        })
        .eq('id', scheduleData.parent_booking_id);

      if (updateError) throw updateError;

      // Generate future bookings manually (simplified approach)
      const nextDates = getNextRecurringDates(
        new Date(scheduleData.start_date),
        scheduleData.frequency,
        scheduleData.day_of_week,
        3
      );

      let bookingsCreated = 0;
      
      // Create future bookings one by one
      for (const nextDate of nextDates) {
        if (nextDate > new Date() && bookingsCreated < 12) {
          // Get service details first
          const { data: serviceData } = await supabase
            .from('services')
            .select('client_price')
            .eq('id', scheduleData.service_id)
            .single();

          const { error } = await supabase
            .from('bookings')
            .insert({
              client_id: user.id,
              service_id: scheduleData.service_id,
              booking_date: nextDate.toISOString().split('T')[0],
              booking_time: scheduleData.booking_time,
              special_instructions: scheduleData.special_instructions,
              emergency_booking: scheduleData.emergency_booking,
              duration_minutes: scheduleData.duration_minutes,
              location_town: scheduleData.location_town,
              is_recurring: true,
              recurring_parent_id: scheduleData.parent_booking_id,
              recurring_frequency: scheduleData.frequency,
              recurring_day_of_week: scheduleData.day_of_week,
              is_auto_scheduled: true,
              status: 'pending',
              total_amount: serviceData?.client_price || 0
            });

          if (!error) {
            bookingsCreated++;
          }
        }
      }

      toast({
        title: "Recurring Booking Created",
        description: `${bookingsCreated} future bookings have been scheduled`,
      });

      await fetchRecurringSchedules();
      return { id: scheduleData.parent_booking_id };
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
      // Cancel by updating the booking flags
      const { error } = await supabase
        .from('bookings')
        .update({
          is_recurring: false,
          recurring_frequency: null,
          recurring_day_of_week: null,
          recurring_end_date: null
        })
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

// Helper function to calculate next recurring dates
function getNextRecurringDates(
  startDate: Date,
  frequency: 'weekly' | 'bi-weekly' | 'monthly',
  dayOfWeek: number,
  monthsAhead: number = 3
): Date[] {
  const dates: Date[] = [];
  let currentDate = new Date(startDate);
  const endDate = new Date(startDate);
  endDate.setMonth(endDate.getMonth() + monthsAhead);

  while (currentDate <= endDate) {
    dates.push(new Date(currentDate));
    
    // Calculate next date based on frequency
    if (frequency === 'weekly') {
      currentDate.setDate(currentDate.getDate() + 7);
    } else if (frequency === 'bi-weekly') {
      currentDate.setDate(currentDate.getDate() + 14);
    } else if (frequency === 'monthly') {
      currentDate.setMonth(currentDate.getMonth() + 1);
    }
  }

  return dates;
}
