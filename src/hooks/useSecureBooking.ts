
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

export interface SecureBookingData {
  serviceId: string;
  bookingDate: string;
  bookingTime: string;
  totalAmount: number;
  specialInstructions?: string;
  emergencyBooking?: boolean;
  durationMinutes?: number;
}

export const useSecureBooking = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const validateAccess = async (serviceId: string) => {
    if (!user) throw new Error('User not authenticated');

    try {
      const { data, error } = await supabase.rpc('validate_booking_access', {
        p_user_id: user.id,
        p_service_id: serviceId
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Access validation error:', error);
      throw error;
    }
  };

  const createSecureBooking = async (bookingData: SecureBookingData) => {
    if (!user) throw new Error('User not authenticated');

    setIsLoading(true);
    try {
      // First validate access
      const accessResult = await validateAccess(bookingData.serviceId);
      
      if (!accessResult.allowed) {
        toast({
          title: "Booking Not Allowed",
          description: accessResult.reason,
          variant: "destructive",
        });
        return { success: false, reason: accessResult.reason };
      }

      // Create booking using secure function
      const { data, error } = await supabase.rpc('create_validated_booking', {
        p_service_id: bookingData.serviceId,
        p_booking_date: bookingData.bookingDate,
        p_booking_time: bookingData.bookingTime,
        p_total_amount: bookingData.totalAmount,
        p_special_instructions: bookingData.specialInstructions,
        p_emergency_booking: bookingData.emergencyBooking || false,
        p_duration_minutes: bookingData.durationMinutes
      });

      if (error) throw error;

      if (data.success) {
        toast({
          title: "Booking Created",
          description: data.message,
        });
        return { success: true, bookingId: data.booking_id };
      } else {
        toast({
          title: "Booking Failed",
          description: data.error,
          variant: "destructive",
        });
        return { success: false, reason: data.error };
      }
    } catch (error) {
      console.error('Secure booking error:', error);
      toast({
        title: "Booking Error",
        description: "Failed to create booking. Please try again.",
        variant: "destructive",
      });
      return { success: false, reason: 'Network or server error' };
    } finally {
      setIsLoading(false);
    }
  };

  return {
    createSecureBooking,
    validateAccess,
    isLoading
  };
};
