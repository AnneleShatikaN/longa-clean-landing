
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

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

      if (data.success) {
        toast({
          title: "Package Booking Created",
          description: `${data.successful_assignments} of ${data.total_jobs} jobs successfully assigned to providers.`,
          variant: data.unassigned_jobs > 0 ? "destructive" : "default"
        });

        if (data.unassigned_jobs > 0) {
          toast({
            title: "Assignment Warning",
            description: `${data.unassigned_jobs} jobs could not be assigned due to no available providers in the required categories.`,
            variant: "destructive"
          });
        }
      } else {
        throw new Error(data.error);
      }

      return data;
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
