
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
  email: string;
  phone?: string;
  current_work_location?: string;
  bio?: string;
  avatar_url?: string;
  rating: number;
  total_jobs: number;
  distance_km?: number;
  available: boolean;
  is_active: boolean;
}

export const useProviderSearch = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [providers, setProviders] = useState<ProviderSearchResult[]>([]);
  const { toast } = useToast();

  const searchProviders = useCallback(async (filters: ProviderSearchFilters) => {
    setIsLoading(true);
    try {
      // For now, we'll use a direct query to users table
      // In a real implementation, you might want to use the RPC function
      let query = supabase
        .from('users')
        .select('*')
        .eq('role', 'provider')
        .eq('is_active', true);

      if (filters.minRating) {
        query = query.gte('rating', filters.minRating);
      }

      const { data, error } = await query
        .order('rating', { ascending: false })
        .order('total_jobs', { ascending: false })
        .limit(20);

      if (error) throw error;

      const enhancedProviders = (data || []).map(provider => ({
        ...provider,
        bio: `Experienced provider offering quality services in ${provider.current_work_location || 'Windhoek'}.`,
        available: true, // You can implement real availability checking
        distance_km: 0 // Placeholder for distance calculation
      })) as ProviderSearchResult[];

      setProviders(enhancedProviders);

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
