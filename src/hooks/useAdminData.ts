
import { useState, useEffect, useCallback } from 'react';
import { useDataMode } from '@/contexts/DataModeContext';
import { supabase } from '@/integrations/supabase/client';

export const useAdminData = () => {
  const { dataMode, mockData } = useDataMode();
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchLiveData = async () => {
    // Fetch dashboard stats
    const { data: users } = await supabase.from('users').select('*');
    const { data: services } = await supabase.from('services').select('*');
    const { data: bookings } = await supabase.from('bookings').select('*');
    const { data: payouts } = await supabase.from('payouts').select('*');

    // Calculate dashboard stats
    const dashboardStats = {
      totalUsers: users?.length || 0,
      activeProviders: users?.filter(u => u.role === 'provider' && u.is_active)?.length || 0,
      totalBookings: bookings?.length || 0,
      revenue: bookings?.filter(b => b.status === 'completed').reduce((sum, b) => sum + (b.total_amount || 0), 0) || 0,
      pendingPayouts: payouts?.filter(p => p.status === 'pending').reduce((sum, p) => sum + (p.amount || 0), 0) || 0,
      systemHealth: 99.2
    };

    setData({
      dashboardStats,
      users: users || [],
      services: services || [],
      bookings: bookings || [],
      payouts: payouts || [],
      analytics: {
        monthlyRevenue: [],
        servicePopularity: [],
        providerPerformance: []
      },
      supportTickets: []
    });
  };

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      switch (dataMode) {
        case 'live':
          await fetchLiveData();
          break;
        case 'mock':
          setData(mockData);
          break;
        case 'none':
          setData(null);
          break;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch data');
      setData(null);
    } finally {
      setIsLoading(false);
    }
  }, [dataMode, mockData]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, isLoading, error, refetch: fetchData };
};
