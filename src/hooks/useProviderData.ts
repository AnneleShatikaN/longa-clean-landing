
import { useState, useEffect, useCallback } from 'react';
import { useDataMode } from '@/contexts/DataModeContext';
import { supabase } from '@/integrations/supabase/client';

interface Job {
  id: string; // Changed from number to string to match Supabase UUID
  service: string;
  clientName: string;
  clientPhone: string;
  clientEmail: string;
  location: string;
  amount: number;
  date: string;
  status: 'requested' | 'accepted' | 'completed';
  duration: string;
  completedDate?: string;
  rating?: number;
  reviewComment?: string;
  jobType: 'one-off' | 'subscription';
  expectedPayout: number;
  actualPayout?: number;
  commissionPercentage?: number;
  providerFee?: number;
  payoutStatus?: 'pending' | 'processing' | 'paid';
  payoutDate?: string;
}

interface Notification {
  id: number;
  type: 'new_job' | 'job_completed' | 'rating_received' | 'payment_received';
  title: string;
  message: string;
  time: string;
  read: boolean;
  actionable?: boolean;
}

interface Rating {
  id: number;
  jobId: string; // Changed from number to string
  clientName: string;
  rating: number;
  comment: string;
  date: string;
  service: string;
}

interface MonthlyEarning {
  month: string;
  earnings: number;
  jobsCompleted: number;
  averageRating: number;
}

interface ProviderData {
  jobs: Job[];
  notifications: Notification[];
  ratings: Rating[];
  monthlyEarnings: MonthlyEarning[];
}

export const useProviderData = () => {
  const { dataMode, mockData, isLoading: dataModeLoading } = useDataMode();
  const [data, setData] = useState<ProviderData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchLiveData = async (): Promise<ProviderData> => {
    // Fetch real data from Supabase with proper joins to get service and client names
    const { data: bookings, error: bookingsError } = await supabase
      .from('bookings')
      .select(`
        *,
        services(name),
        users!bookings_client_id_fkey(full_name)
      `)
      .order('created_at', { ascending: false });

    if (bookingsError) throw bookingsError;

    // Transform bookings to jobs format with proper property mapping
    const jobs: Job[] = (bookings || []).map(booking => ({
      id: booking.id,
      service: booking.services?.name || 'Service',
      clientName: booking.users?.full_name || 'Client',
      clientPhone: '+264 81 123 4567',
      clientEmail: 'client@email.com',
      location: 'Windhoek',
      amount: booking.total_amount || 0,
      date: new Date(booking.created_at).toISOString().split('T')[0],
      status: booking.status as 'requested' | 'accepted' | 'completed',
      duration: `${Math.floor((booking.duration_minutes || 120) / 60)}h ${(booking.duration_minutes || 120) % 60}m`,
      completedDate: booking.status === 'completed' ? new Date(booking.created_at).toISOString().split('T')[0] : undefined,
      jobType: 'one-off',
      expectedPayout: (booking.total_amount || 0) * 0.85,
      commissionPercentage: 15,
      payoutStatus: booking.status === 'completed' ? 'paid' : 'pending'
    }));

    return {
      jobs,
      notifications: [],
      ratings: [],
      monthlyEarnings: []
    };
  };

  const fetchMockData = async (): Promise<ProviderData> => {
    // Directly fetch the provider mock file in fallback case
    const response = await fetch('/data/provider_mock_data.json');
    if (!response.ok) {
      throw new Error('Failed to load mock data');
    }
    return response.json();
  };

  const fetchData = useCallback(async () => {
    if (dataModeLoading) return;

    setIsLoading(true);
    setError(null);

    try {
      switch (dataMode) {
        case 'live':
          {
            console.log('[ProviderData] Fetching live data');
            const liveData = await fetchLiveData();
            setData(liveData);
          }
          break;
        case 'mock':
          {
            // Check if mockData has a valid .provider property (after the context fix)
            console.log('[ProviderData] Provided mockData:', mockData);

            let dataSource: ProviderData | null = null;
            if (
              mockData &&
              typeof mockData === 'object' &&
              mockData.provider &&
              (Array.isArray(mockData.provider.jobs) ||
                Array.isArray(mockData.provider.notifications) ||
                Array.isArray(mockData.provider.ratings) ||
                Array.isArray(mockData.provider.monthlyEarnings))
            ) {
              dataSource = {
                jobs: mockData.provider.jobs || [],
                notifications: mockData.provider.notifications || [],
                ratings: mockData.provider.ratings || [],
                monthlyEarnings: mockData.provider.monthlyEarnings || []
              };
              console.log('[ProviderData] Loaded provider data from merged global mockData:', dataSource);
            } else {
              // fallback: fetch directly
              const fallbackProviderData = await fetchMockData();
              dataSource = {
                jobs: fallbackProviderData.jobs || [],
                notifications: fallbackProviderData.notifications || [],
                ratings: fallbackProviderData.ratings || [],
                monthlyEarnings: fallbackProviderData.monthlyEarnings || [],
              };
              console.log('[ProviderData] Loaded provider data from fallback provider_mock_data.json:', dataSource);
            }
            setData(dataSource);
          }
          break;
        case 'none':
          console.log('[ProviderData] Data mode is none. Setting empty data.');
          setData({
            jobs: [],
            notifications: [],
            ratings: [],
            monthlyEarnings: []
          });
          break;
        default:
          setData(null);
          break;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch data');
      setData(null);
      console.error('[ProviderData] Error during fetchData:', err);
    } finally {
      setIsLoading(false);
    }
  }, [dataMode, mockData, dataModeLoading]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const updateJobStatus = async (jobId: string, status: 'accepted' | 'completed') => {
    if (!data) return;

    if (dataMode === 'live') {
      const { error } = await supabase
        .from('bookings')
        .update({ status })
        .eq('id', jobId);

      if (error) {
        console.error('Error updating job status:', error);
        return;
      }
    }

    // Update local state
    setData(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        jobs: prev.jobs.map(job =>
          job.id === jobId ? { ...job, status } : job
        )
      };
    });
  };

  return {
    data,
    isLoading: isLoading || dataModeLoading,
    error,
    refetch: fetchData,
    updateJobStatus
  };
};
