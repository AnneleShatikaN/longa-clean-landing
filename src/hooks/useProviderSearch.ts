
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface ProviderSearchFilters {
  latitude?: number;
  longitude?: number;
  maxDistance?: number;
  serviceType?: string;
  minRating?: number;
  availableDate?: string;
  availableTime?: string;
}

export interface ProviderSearchResult {
  id: string;
  full_name: string;
  rating: number;
  total_jobs: number;
  distance_km?: number;
  available: boolean;
}

export const useProviderSearch = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [providers, setProviders] = useState<ProviderSearchResult[]>([]);
  const { toast } = useToast();

  const searchProviders = useCallback(async (filters: ProviderSearchFilters) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.rpc('search_providers_by_location', {
        search_lat: filters.latitude || null,
        search_lng: filters.longitude || null,
        max_distance_km: filters.maxDistance || 50,
        service_type_filter: filters.serviceType || null,
        min_rating: filters.minRating || null,
        available_date: filters.availableDate || null,
        available_time: filters.availableTime || null,
        limit_results: 20
      });

      if (error) throw error;
      setProviders(data || []);

    } catch (error) {
      console.error('Provider search error:', error);
      toast({
        title: "Search Error",
        description: "Failed to search providers. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const checkProviderAvailability = useCallback(async (
    providerId: string, 
    date: string, 
    time: string, 
    duration: number
  ) => {
    try {
      const { data, error } = await supabase.rpc('check_booking_conflicts', {
        provider_id: providerId,
        booking_date: date,
        booking_time: time,
        duration_minutes: duration
      });

      if (error) throw error;
      return !data; // Function returns true if conflicts exist, so we invert
    } catch (error) {
      console.error('Availability check error:', error);
      return false;
    }
  }, []);

  return {
    searchProviders,
    checkProviderAvailability,
    providers,
    isLoading
  };
};
