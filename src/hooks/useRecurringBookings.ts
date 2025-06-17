
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

// Extended booking type with recurring fields
interface ExtendedBooking {
  id: string;
  client_id: string;
  service_id: string;
  booking_date: string;
  booking_time: string;
  total_amount: number;
  special_instructions?: string;
  emergency_booking: boolean;
  duration_minutes: number;
  location_town: string;
  created_at: string;
  is_recurring?: boolean;
  recurring_frequency?: string;
  recurring_day_of_week?: number;
  recurring_end_date?: string;
  is_auto_scheduled?: boolean;
  recurring_parent_id?: string;
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
      // Query bookings with recurring flags using raw query to avoid type issues
      const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .eq('client_id', user.id)
        .eq('is_recurring', true)
        .eq('is_auto_scheduled', false)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Transform and type assert the data
      const schedules = (data as ExtendedBooking[]).map(booking => ({
        id: booking.id,
        parent_booking_id: booking.id,
        service_id: booking.service_id,
        frequency: (booking.recurring_frequency || 'weekly') as 'weekly' | 'bi-weekly' | 'monthly',
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
      // Update the parent booking to mark it as recurring using raw update
      const { error: updateError } = await supabase.rpc('sql', {
        query: `
          UPDATE bookings 
          SET 
            is_recurring = true,
            recurring_frequency = $1,
            recurring_day_of_week = $2,
            recurring_end_date = $3
          WHERE id = $4
        `,
        params: [
          scheduleData.frequency,
          scheduleData.day_of_week,
          scheduleData.end_date,
          scheduleData.parent_booking_id
        ]
      });

      if (updateError) throw updateError;

      // Generate next recurring dates manually
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
          // Use raw insert to avoid type issues
          const { error } = await supabase.rpc('sql', {
            query: `
              INSERT INTO bookings (
                client_id, service_id, booking_date, booking_time,
                special_instructions, emergency_booking, duration_minutes,
                location_town, is_recurring, recurring_parent_id,
                recurring_frequency, recurring_day_of_week, is_auto_scheduled,
                status, total_amount
              ) 
              SELECT 
                $1, $2, $3, $4, $5, $6, $7, $8, true, $9, $10, $11, true, 'pending',
                COALESCE(s.client_price, 0)
              FROM services s WHERE s.id = $2
            `,
            params: [
              user.id,
              scheduleData.service_id,
              nextDate.toISOString().split('T')[0],
              scheduleData.booking_time,
              scheduleData.special_instructions,
              scheduleData.emergency_booking,
              scheduleData.duration_minutes,
              scheduleData.location_town,
              scheduleData.parent_booking_id,
              scheduleData.frequency,
              scheduleData.day_of_week
            ]
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
      // Cancel using raw SQL to avoid type issues
      const { error } = await supabase.rpc('sql', {
        query: `
          UPDATE bookings 
          SET 
            is_recurring = false,
            recurring_frequency = null,
            recurring_day_of_week = null,
            recurring_end_date = null
          WHERE id = $1
        `,
        params: [scheduleId]
      });

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
