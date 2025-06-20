
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface PackageBookingResult {
  success: boolean;
  error?: string;
  package_booking_id?: string;
  total_jobs?: number;
  successful_assignments?: number;
  unassigned_jobs?: number;
}

export const usePackageBooking = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const processPackageBooking = async (
    clientId: string,
    packageId: string,
    scheduledDate: string = new Date().toISOString().split('T')[0]
  ) => {
    try {
      setIsProcessing(true);
      
      const { data, error } = await supabase.rpc('process_package_booking', {
        p_client_id: clientId,
        p_package_id: packageId,
        p_scheduled_date: scheduledDate
      });

      if (error) throw error;

      // Safely cast the data to our expected type
      const result = data as unknown as PackageBookingResult;

      if (result?.success) {
        toast({
          title: "Package Booking Created",
          description: `${result.successful_assignments} of ${result.total_jobs} jobs successfully assigned to providers.`,
          variant: result.unassigned_jobs && result.unassigned_jobs > 0 ? "destructive" : "default"
        });

        if (result.unassigned_jobs && result.unassigned_jobs > 0) {
          toast({
            title: "Assignment Warning",
            description: `${result.unassigned_jobs} jobs could not be assigned due to no available providers in the required categories.`,
            variant: "destructive"
          });
        }
      } else {
        throw new Error(result?.error || 'Unknown error occurred');
      }

      return result;
    } catch (error) {
      console.error('Error processing package booking:', error);
      toast({
        title: "Error",
        description: "Failed to process package booking",
        variant: "destructive"
      });
      throw error;
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    processPackageBooking,
    isProcessing
  };
};
