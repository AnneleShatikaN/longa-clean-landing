
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

  // New enhanced booking actions
  const updateBookingDetails = async (bookingId: string, updates: any) => {
    setIsLoading(bookingId);
    setError(null);

    try {
      const { error } = await supabase.rpc('update_booking_details', {
        p_booking_id: bookingId,
        ...updates
      });

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
      const { error } = await supabase.rpc('reassign_booking_provider', {
        p_booking_id: bookingId,
        p_new_provider_id: newProviderId,
        p_reassignment_reason: reason,
        p_old_provider_id: oldProviderId
      });

      if (error) throw error;

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
      const { error } = await supabase.rpc('rollback_booking_status', {
        p_booking_id: bookingId,
        p_new_status: newStatus,
        p_reason: reason
      });

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
      const rpcFunction = type === 'client' ? 'mark_client_no_show' : 'mark_provider_no_show';
      const { error } = await supabase.rpc(rpcFunction, {
        p_booking_id: bookingId,
        p_reason: reason
      });

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
      const { error } = await supabase.rpc('cancel_booking_with_refund', {
        p_booking_id: bookingId,
        p_reason: reason
      });

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
