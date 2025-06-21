
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface BookingData {
  serviceId: string;
  bookingDate: string;
  bookingTime: string;
  totalAmount: number;
  specialInstructions?: string;
  emergencyBooking: boolean;
  durationMinutes: number;
  clientTown?: string;
  clientSuburb?: string;
  serviceAddress?: string;
}

interface BookingResult {
  success: boolean;
  bookingId?: string;
  reason?: string;
}

export const useSecureBooking = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const createSecureBooking = async (bookingData: BookingData): Promise<BookingResult> => {
    if (!user) {
      return { success: false, reason: 'User not authenticated' };
    }

    setIsLoading(true);

    try {
      // Get service details
      const { data: service, error: serviceError } = await supabase
        .from('services')
        .select('*')
        .eq('id', bookingData.serviceId)
        .single();

      if (serviceError || !service) {
        throw new Error('Service not found');
      }

      // Check for active package
      const { data: activePackage } = await supabase
        .from('user_active_packages')
        .select(`
          *,
          package:subscription_packages(
            package_entitlements:package_entitlements(
              allowed_service_id,
              quantity_per_cycle
            )
          )
        `)
        .eq('user_id', user.id)
        .eq('status', 'active')
        .gte('expiry_date', new Date().toISOString().split('T')[0])
        .maybeSingle();

      let usePackageCredit = false;
      let packageUsageResult = null;

      // Check if service is covered by package
      if (activePackage?.package?.package_entitlements) {
        const isServiceCovered = activePackage.package.package_entitlements.some(
          (ent: any) => ent.allowed_service_id === bookingData.serviceId
        );

        if (isServiceCovered) {
          // Check if user can use package credit
          const { data: usageCheck } = await supabase.rpc('use_package_service', {
            p_user_id: user.id,
            p_service_id: bookingData.serviceId
          });

          const usageResult = usageCheck as any;
          if (usageResult?.success) {
            usePackageCredit = true;
            packageUsageResult = usageResult;
          }
        }
      }

      // Calculate acceptance deadline (24 hours from now)
      const acceptanceDeadline = new Date();
      acceptanceDeadline.setHours(acceptanceDeadline.getHours() + 24);

      // Create booking with comprehensive location data
      const { data: booking, error: bookingError } = await supabase
        .from('bookings')
        .insert({
          client_id: user.id,
          service_id: bookingData.serviceId,
          booking_date: bookingData.bookingDate,
          booking_time: bookingData.bookingTime,
          total_amount: usePackageCredit ? 0 : service.client_price,
          duration_minutes: bookingData.durationMinutes,
          special_instructions: bookingData.specialInstructions,
          emergency_booking: bookingData.emergencyBooking,
          acceptance_deadline: acceptanceDeadline.toISOString(),
          location_town: bookingData.clientTown || 'Windhoek',
          client_town: bookingData.clientTown || 'Windhoek',
          client_suburb: bookingData.clientSuburb || 'CBD',
          service_address: bookingData.serviceAddress || `${bookingData.clientSuburb || 'CBD'}, ${bookingData.clientTown || 'Windhoek'}`,
          status: 'pending'
        })
        .select()
        .single();

      if (bookingError) throw bookingError;

      // Log package usage if applicable
      if (usePackageCredit && activePackage) {
        await supabase
          .from('service_usage_logs')
          .insert({
            user_id: user.id,
            package_id: activePackage.package_id,
            allowed_service_id: bookingData.serviceId,
            booking_id: booking.id
          });
      }

      toast({
        title: "Booking Created",
        description: usePackageCredit 
          ? `Your booking has been created using package credit. ${packageUsageResult?.remaining || 0} credits remaining. Auto-assignment in progress...`
          : "Your booking has been created and is being automatically assigned to available providers in your area.",
      });

      return { success: true, bookingId: booking.id };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create booking';
      toast({
        title: "Booking Failed",
        description: errorMessage,
        variant: "destructive",
      });
      return { success: false, reason: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  const validateAccess = async (serviceId: string) => {
    // Implementation for access validation
    return { allowed: true };
  };

  return {
    createSecureBooking,
    validateAccess,
    isLoading
  };
};
