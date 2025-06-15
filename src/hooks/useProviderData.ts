
import { useState, useEffect, useCallback } from 'react';
import { useDataMode } from '@/contexts/DataModeContext';
import { supabase } from '@/integrations/supabase/client';

interface Job {
  id: number;
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
  jobId: number;
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
    // Fetch real data from Supabase
    const { data: bookings, error: bookingsError } = await supabase
      .from('bookings')
      .select('*')
      .order('created_at', { ascending: false });

    if (bookingsError) throw bookingsError;

    // Transform bookings to jobs format
    const jobs: Job[] = (bookings || []).map(booking => ({
      id: booking.id,
      service: booking.service_name || 'Service',
      clientName: booking.client_name || 'Client',
      clientPhone: '+264 81 123 4567',
      clientEmail: 'client@email.com',
      location: 'Windhoek',
      amount: booking.total_amount || 0,
      date: new Date(booking.created_at).toISOString().split('T')[0],
      status: booking.status as 'requested' | 'accepted' | 'completed',
      duration: '2h 0m',
      completedDate: booking.completed_at ? new Date(booking.completed_at).toISOString().split('T')[0] : undefined,
      jobType: 'one-off',
      expectedPayout: booking.total_amount * 0.85 || 0,
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
          const liveData = await fetchLiveData();
          setData(liveData);
          break;
        case 'mock':
          if (mockData?.jobs) {
            // Use provider-specific mock data from the general mock data
            setData({
              jobs: mockData.jobs || [],
              notifications: mockData.notifications || [],
              ratings: mockData.ratings || [],
              monthlyEarnings: mockData.monthlyEarnings || []
            });
          } else {
            // Fallback to provider-specific mock file
            const providerMockData = await fetchMockData();
            setData(providerMockData);
          }
          break;
        case 'none':
          setData({
            jobs: [],
            notifications: [],
            ratings: [],
            monthlyEarnings: []
          });
          break;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch data');
      setData(null);
    } finally {
      setIsLoading(false);
    }
  }, [dataMode, mockData, dataModeLoading]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const updateJobStatus = async (jobId: number, status: 'accepted' | 'completed') => {
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
