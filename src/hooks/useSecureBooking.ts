
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { checkServiceAccess, logServiceUsage } from '@/utils/serviceEntitlements';

export interface SecureBookingData {
  serviceId: string;
  bookingDate: string;
  bookingTime: string;
  totalAmount: number;
  specialInstructions?: string;
  emergencyBooking?: boolean;
  durationMinutes?: number;
}

interface AccessValidationResult {
  allowed: boolean;
  reason?: string;
}

export const useSecureBooking = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const validateAccess = async (serviceId: string): Promise<AccessValidationResult> => {
    if (!user) throw new Error('User not authenticated');

    try {
      const result = await checkServiceAccess(user.id, serviceId);
      return {
        allowed: result.allowed,
        reason: result.reason
      };
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
          description: accessResult.reason || 'Access denied',
          variant: "destructive",
        });
        return { success: false, reason: accessResult.reason || 'Access denied' };
      }

      // Get service details for duration
      const { data: service, error: serviceError } = await supabase
        .from('services')
        .select('duration_minutes, name')
        .eq('id', bookingData.serviceId)
        .single();

      if (serviceError) throw serviceError;

      // Create booking directly
      const { data: booking, error: bookingError } = await supabase
        .from('bookings')
        .insert({
          client_id: user.id,
          service_id: bookingData.serviceId,
          booking_date: bookingData.bookingDate,
          booking_time: bookingData.bookingTime,
          total_amount: bookingData.totalAmount,
          special_instructions: bookingData.specialInstructions,
          emergency_booking: bookingData.emergencyBooking || false,
          duration_minutes: bookingData.durationMinutes || service.duration_minutes,
          status: 'pending'
        })
        .select()
        .single();

      if (bookingError) throw bookingError;

      // Get user's active package for logging usage
      const { data: activePackage } = await supabase
        .from('user_active_packages')
        .select('package_id')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .gte('expiry_date', new Date().toISOString().split('T')[0])
        .single();

      // Log service usage if package exists
      if (activePackage) {
        await logServiceUsage(
          user.id,
          activePackage.package_id,
          bookingData.serviceId,
          booking.id
        );
      }

      toast({
        title: "Booking Created",
        description: `Your booking for ${service.name} has been created successfully.`,
      });
      
      return { success: true, bookingId: booking.id };

    } catch (error) {
      console.error('Secure booking error:', error);
      
      // Check if it's a package access issue
      if (error instanceof Error && error.message.includes('package')) {
        return { success: false, reason: 'No active package found' };
      }
      
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
