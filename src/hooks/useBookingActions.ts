
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

  // New enhanced booking actions using direct SQL
  const updateBookingDetails = async (bookingId: string, updates: any) => {
    setIsLoading(bookingId);
    setError(null);

    try {
      const { error } = await supabase
        .from('bookings')
        .update({
          booking_date: updates.p_booking_date,
          booking_time: updates.p_booking_time,
          service_id: updates.p_service_id,
          total_amount: updates.p_total_amount,
          special_instructions: updates.p_special_instructions,
          location_town: updates.p_location_town,
          duration_minutes: updates.p_duration_minutes,
          emergency_booking: updates.p_emergency_booking,
          updated_at: new Date().toISOString()
        })
        .eq('id', bookingId);

      if (error) throw error;

      toast({
        title: "Booking Updated",
        description: "Booking details have been successfully updated",
      });

      return { success: true };

    } catch (err: any) {
      const errorMessage = err.message || 'Failed to update booking details';
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

  const reassignProvider = async (bookingId: string, newProviderId: string, reason: string, oldProviderId?: string) => {
    setIsLoading(bookingId);
    setError(null);

    try {
      // Update the booking with new provider
      const { error: updateError } = await supabase
        .from('bookings')
        .update({
          provider_id: newProviderId,
          assigned_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', bookingId);

      if (updateError) throw updateError;

      // Log the reassignment
      const { error: assignmentError } = await supabase
        .from('booking_assignments')
        .insert({
          booking_id: bookingId,
          provider_id: newProviderId,
          assignment_reason: reason,
          auto_assigned: false
        });

      if (assignmentError) console.warn('Assignment logging failed:', assignmentError);

      toast({
        title: "Provider Reassigned",
        description: "Provider has been successfully reassigned",
      });

      return { success: true };

    } catch (err: any) {
      const errorMessage = err.message || 'Failed to reassign provider';
      setError(errorMessage);
      
      toast({
        title: "Reassignment Failed",
        description: errorMessage,
        variant: "destructive",
      });

      return { success: false, error: errorMessage };

    } finally {
      setIsLoading(null);
    }
  };

  const rollbackBookingStatus = async (bookingId: string, newStatus: string, reason: string) => {
    setIsLoading(bookingId);
    setError(null);

    try {
      const { error } = await supabase
        .from('bookings')
        .update({
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', bookingId);

      if (error) throw error;

      toast({
        title: "Status Rolled Back",
        description: "Booking status has been rolled back successfully",
      });

      return { success: true };

    } catch (err: any) {
      const errorMessage = err.message || 'Failed to rollback booking status';
      setError(errorMessage);
      
      toast({
        title: "Rollback Failed",
        description: errorMessage,
        variant: "destructive",
      });

      return { success: false, error: errorMessage };

    } finally {
      setIsLoading(null);
    }
  };

  const markNoShow = async (bookingId: string, type: 'client' | 'provider', reason: string) => {
    setIsLoading(bookingId);
    setError(null);

    try {
      const updateData: any = {
        status: 'cancelled',
        updated_at: new Date().toISOString()
      };

      if (type === 'provider') {
        updateData.provider_id = null;
        updateData.assigned_at = null;
      }

      const { error } = await supabase
        .from('bookings')
        .update(updateData)
        .eq('id', bookingId);

      if (error) throw error;

      toast({
        title: "No-Show Recorded",
        description: `${type === 'client' ? 'Client' : 'Provider'} no-show has been recorded`,
      });

      return { success: true };

    } catch (err: any) {
      const errorMessage = err.message || 'Failed to record no-show';
      setError(errorMessage);
      
      toast({
        title: "No-Show Failed",
        description: errorMessage,
        variant: "destructive",
      });

      return { success: false, error: errorMessage };

    } finally {
      setIsLoading(null);
    }
  };

  const cancelWithRefund = async (bookingId: string, reason: string) => {
    setIsLoading(bookingId);
    setError(null);

    try {
      const { error } = await supabase
        .from('bookings')
        .update({
          status: 'cancelled',
          updated_at: new Date().toISOString()
        })
        .eq('id', bookingId);

      if (error) throw error;

      toast({
        title: "Booking Cancelled",
        description: "Booking has been cancelled and refund initiated",
      });

      return { success: true };

    } catch (err: any) {
      const errorMessage = err.message || 'Failed to cancel booking with refund';
      setError(errorMessage);
      
      toast({
        title: "Cancellation Failed",
        description: errorMessage,
        variant: "destructive",
      });

      return { success: false, error: errorMessage };

    } finally {
      setIsLoading(null);
    }
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
    updateBookingDetails,
    reassignProvider,
    rollbackBookingStatus,
    markNoShow,
    cancelWithRefund,
    isLoading,
    error,
    clearError
  };
};
