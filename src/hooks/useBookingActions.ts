
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useBookingActions = () => {
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const updateBookingStatus = async (bookingId: string, newStatus: string, additionalData?: any) => {
    setIsLoading(bookingId);
    setError(null);

    try {
      const updateData = {
        status: newStatus,
        updated_at: new Date().toISOString(),
        ...additionalData
      };

      const { error: updateError } = await supabase
        .from('bookings')
        .update(updateData)
        .eq('id', bookingId);

      if (updateError) throw updateError;

      toast({
        title: "Booking Updated",
        description: `Booking status changed to ${newStatus}`,
      });

      return { success: true };

    } catch (err: any) {
      const errorMessage = err.message || 'Failed to update booking';
      setError(errorMessage);
      
      toast({
        title: "Update Failed",
        description: errorMessage,
        variant: "destructive",
      });

      return { success: false, error: errorMessage };

    } finally {
      setIsLoading(null);
    }
  };

  const assignProvider = async (bookingId: string, providerId: string, assignedBy: string) => {
    return updateBookingStatus(bookingId, 'accepted', {
      provider_id: providerId,
      assigned_by: assignedBy,
      assigned_at: new Date().toISOString(),
      assignment_status: 'assigned'
    });
  };

  const startJob = async (bookingId: string) => {
    return updateBookingStatus(bookingId, 'in_progress', {
      check_in_time: new Date().toISOString()
    });
  };

  const completeJob = async (bookingId: string) => {
    return updateBookingStatus(bookingId, 'completed');
  };

  const cancelBooking = async (bookingId: string, reason?: string) => {
    return updateBookingStatus(bookingId, 'cancelled', {
      cancellation_reason: reason
    });
  };

  const clearError = () => {
    setError(null);
  };

  return {
    updateBookingStatus,
    assignProvider,
    startJob,
    completeJob,
    cancelBooking,
    isLoading,
    error,
    clearError
  };
};
