
import { useState, useEffect } from 'react';
import { useDataMode } from '@/contexts/DataModeContext';

export interface ProviderProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  rating: number;
  totalJobs: number;
  specialties: string[];
  available: boolean;
  earnings: number;
  joinDate: string;
  lastActive: string;
}

export const useProviderProfiles = () => {
  const { dataMode, mockData } = useDataMode();
  const [providers, setProviders] = useState<ProviderProfile[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const loadProviders = async () => {
      setIsLoading(true);
      
      if (dataMode === 'mock') {
        // Load from admin mock data (users with role 'provider')
        const mockProviders = mockData?.admin?.users
          ?.filter((user: any) => user.role === 'provider')
          ?.map((user: any) => ({
            id: user.id,
            name: user.name,
            email: user.email,
            phone: user.bankMobileNumber,
            rating: user.rating,
            totalJobs: user.total_jobs,
            specialties: user.specialties || [],
            available: user.available ?? true,
            earnings: mockData?.admin?.analytics?.providerPerformance?.find((p: any) => p.name === user.name)?.earnings || 0,
            joinDate: user.joinDate,
            lastActive: user.lastActive
          })) || [];
        
        setProviders(mockProviders);
      } else if (dataMode === 'live') {
        // TODO: Implement live data fetching from Supabase
        setProviders([]);
      } else {
        setProviders([]);
      }
      
      setIsLoading(false);
    };

    loadProviders();
  }, [dataMode, mockData]);

  return { providers, isLoading };
};
