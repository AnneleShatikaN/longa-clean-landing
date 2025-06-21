
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { assignJobToNearbyProvider } from '@/utils/jobAssignment';

interface BookingData {
  clientId: string;
  serviceId: string;
  bookingDate: string;
  bookingTime: string;
  totalAmount: number;
  clientTown: string;
  clientSuburb: string;
  serviceAddress: string;
  specialInstructions?: string;
  emergencyBooking?: boolean;
  durationMinutes?: number;
}

export const useProximityBooking = () => {
  const [isCreating, setIsCreating] = useState(false);
  const { toast } = useToast();

  const createBookingWithAssignment = async (bookingData: BookingData) => {
    setIsCreating(true);
    try {
      // Create the booking first
      const { data: booking, error: bookingError } = await supabase
        .from('bookings')
        .insert({
          client_id: bookingData.clientId,
          service_id: bookingData.serviceId,
          booking_date: bookingData.bookingDate,
          booking_time: bookingData.bookingTime,
          total_amount: bookingData.totalAmount,
          client_town: bookingData.clientTown,
          client_suburb: bookingData.clientSuburb,
          service_address: bookingData.serviceAddress,
          special_instructions: bookingData.specialInstructions,
          emergency_booking: bookingData.emergencyBooking || false,
          duration_minutes: bookingData.durationMinutes || 60,
          status: 'pending',
          assignment_status: 'pending_assignment'
        })
        .select()
        .single();

      if (bookingError) throw bookingError;

      console.log('Booking created:', booking.id);

      // Try to assign to a nearby provider
      const assignedProviderId = await assignJobToNearbyProvider({
        clientTown: bookingData.clientTown,
        clientSuburb: bookingData.clientSuburb,
        serviceId: bookingData.serviceId,
        bookingId: booking.id
      });

      if (assignedProviderId) {
        toast({
          title: "Booking Created & Assigned",
          description: "Your booking has been created and automatically assigned to a nearby provider.",
        });
        
        return { 
          success: true, 
          bookingId: booking.id, 
          providerId: assignedProviderId,
          autoAssigned: true 
        };
      } else {
        // Mark for manual assignment
        await supabase
          .from('bookings')
          .update({ 
            assignment_status: 'manual_assignment_required',
            status: 'pending' 
          })
          .eq('id', booking.id);

        toast({
          title: "Booking Created",
          description: "Your booking has been created. We're finding the best provider for you and will notify you once assigned.",
          variant: "default"
        });

        return { 
          success: true, 
          bookingId: booking.id, 
          providerId: null,
          autoAssigned: false 
        };
      }

    } catch (error) {
      console.error('Error creating booking:', error);
      toast({
        title: "Booking Failed",
        description: "Failed to create your booking. Please try again.",
        variant: "destructive",
      });
      
      return { success: false, error };
    } finally {
      setIsCreating(false);
    }
  };

  return {
    createBookingWithAssignment,
    isCreating
  };
};
