
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface LocationService {
  id: string;
  name: string;
  description: string;
  service_type: string;
  client_price: number;
  duration_minutes: number;
  tags: string[];
  coverage_areas: string[];
  provider_count: number;
}

interface LocationProvider {
  id: string;
  full_name: string;
  rating: number;
  total_jobs: number;
  current_work_location: string;
  service_coverage_areas: string[];
}

export const useLocationServices = () => {
  const [services, setServices] = useState<LocationService[]>([]);
  const [providers, setProviders] = useState<LocationProvider[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const getServicesByLocation = useCallback(async (location?: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.rpc('get_services_by_location', {
        location_filter: location || null
      });

      if (error) throw error;
      setServices(data || []);
    } catch (error) {
      console.error('Error fetching services by location:', error);
      toast({
        title: "Error",
        description: "Failed to load services for your location",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const getProvidersByLocation = useCallback(async (location?: string, serviceId?: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.rpc('get_providers_by_location', {
        location_filter: location || null,
        service_id_filter: serviceId || null
      });

      if (error) throw error;
      setProviders(data || []);
    } catch (error) {
      console.error('Error fetching providers by location:', error);
      toast({
        title: "Error",
        description: "Failed to load providers for your location",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  return {
    services,
    providers,
    isLoading,
    getServicesByLocation,
    getProvidersByLocation
  };
};
