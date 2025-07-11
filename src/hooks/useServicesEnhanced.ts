
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface ServiceData {
  id: string;
  name: string;
  description: string;
  service_type: 'one-off' | 'subscription';
  client_price: number;
  provider_fee?: number;
  commission_percentage?: number;
  duration_minutes: number;
  is_active: boolean;
  tags: string[];
  coverage_areas: string[];
  created_at: string;
  updated_at: string;
}

export const useServicesEnhanced = () => {
  const [services, setServices] = useState<ServiceData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchServices = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Fetch from Supabase with proper type casting
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Transform Supabase data to match ServiceData interface
      const transformedServices: ServiceData[] = (data || []).map((service: any) => ({
        id: service.id,
        name: service.name,
        description: service.description || '',
        service_type: (service.service_type === 'subscription' ? 'subscription' : 'one-off') as 'one-off' | 'subscription',
        client_price: service.client_price,
        provider_fee: service.provider_fee,
        commission_percentage: service.commission_percentage,
        duration_minutes: service.duration_minutes,
        is_active: service.is_active,
        tags: service.tags || [],
        coverage_areas: service.coverage_areas || ['windhoek'],
        created_at: service.created_at || new Date().toISOString(),
        updated_at: service.updated_at || new Date().toISOString()
      }));
      
      setServices(transformedServices);
    } catch (err) {
      console.error('Error fetching services:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to load services';
      setError(errorMessage);
      toast.error('Failed to load services', {
        description: errorMessage
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  const refreshServices = useCallback(() => {
    fetchServices();
  }, [fetchServices]);

  const getServiceById = useCallback((id: string) => {
    return services.find(service => service.id === id);
  }, [services]);

  const getServicesByType = useCallback((type: 'one-off' | 'subscription') => {
    return services.filter(service => service.service_type === type);
  }, [services]);

  const searchServices = useCallback((query: string) => {
    if (!query.trim()) return services;
    
    const lowercaseQuery = query.toLowerCase();
    return services.filter(service => 
      service.name.toLowerCase().includes(lowercaseQuery) ||
      service.description.toLowerCase().includes(lowercaseQuery) ||
      service.tags.some(tag => tag.toLowerCase().includes(lowercaseQuery))
    );
  }, [services]);

  return {
    services,
    isLoading,
    error,
    refreshServices,
    getServiceById,
    getServicesByType,
    searchServices,
    activeServices: services.filter(s => s.is_active),
    oneOffServices: services.filter(s => s.service_type === 'one-off' && s.is_active),
    subscriptionServices: services.filter(s => s.service_type === 'subscription' && s.is_active)
  };
};
