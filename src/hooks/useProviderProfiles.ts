
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface ProviderProfile {
  id: string;
  full_name: string;
  email: string;
  phone?: string;
  current_work_location?: string;
  bio?: string;
  avatar_url?: string;
  rating: number;
  total_jobs: number;
  is_active: boolean;
  created_at: string;
}

export const useProviderProfiles = () => {
  const [providers, setProviders] = useState<ProviderProfile[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const fetchProviders = async (filters?: {
    location?: string;
    serviceId?: string;
    minRating?: number;
    isActive?: boolean;
  }) => {
    setIsLoading(true);
    try {
      let query = supabase
        .from('users')
        .select('*')
        .eq('role', 'provider');

      if (filters?.isActive !== undefined) {
        query = query.eq('is_active', filters.isActive);
      }

      if (filters?.location) {
        query = query.eq('current_work_location', filters.location.toLowerCase());
      }

      if (filters?.minRating) {
        query = query.gte('rating', filters.minRating);
      }

      const { data, error } = await query
        .order('rating', { ascending: false })
        .order('total_jobs', { ascending: false });

      if (error) throw error;

      const typedProviders = (data || []).map(provider => ({
        ...provider,
        bio: provider.bio || `Experienced ${provider.role} providing quality services in ${provider.current_work_location || 'Windhoek'}.`
      })) as ProviderProfile[];

      setProviders(typedProviders);
    } catch (error) {
      console.error('Error fetching providers:', error);
      toast({
        title: "Error",
        description: "Failed to load providers. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getProviderById = async (providerId: string): Promise<ProviderProfile | null> => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', providerId)
        .eq('role', 'provider')
        .single();

      if (error) throw error;

      return {
        ...data,
        bio: data.bio || `Experienced provider offering quality services in ${data.current_work_location || 'Windhoek'}.`
      } as ProviderProfile;
    } catch (error) {
      console.error('Error fetching provider:', error);
      return null;
    }
  };

  useEffect(() => {
    fetchProviders({ isActive: true });
  }, []);

  return {
    providers,
    isLoading,
    fetchProviders,
    getProviderById
  };
};
