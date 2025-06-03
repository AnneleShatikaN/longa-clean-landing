
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface AnalyticsSummary {
  total_users: number;
  total_providers: number;
  total_bookings: number;
  completed_bookings: number;
  total_revenue: number;
  avg_rating: number;
}

export interface UserStats {
  role: string;
  total_users: number;
  active_users: number;
  new_users_30d: number;
}

export interface RevenueData {
  month: string;
  service_type: string;
  total_bookings: number;
  gross_revenue: number;
  provider_payouts: number;
  platform_commission: number;
}

export interface BookingAnalytics {
  booking_date: string;
  status: string;
  booking_count: number;
  avg_rating: number;
  avg_amount: number;
}

export interface ProviderPerformance {
  provider_id: string;
  provider_name: string;
  total_jobs: number;
  avg_rating: number;
  total_earnings: number;
  completed_jobs: number;
  cancelled_jobs: number;
  completion_rate: number;
}

export interface ServicePopularity {
  id: string;
  name: string;
  service_type: string;
  total_bookings: number;
  avg_rating: number;
  total_revenue: number;
  bookings_30d: number;
}

export interface MRRData {
  month: string;
  mrr: number;
  growth_rate: number;
}

export interface GeographicData {
  region: string;
  total_bookings: number;
  total_revenue: number;
}

export interface DateRange {
  startDate: string;
  endDate: string;
}

export const useAnalytics = () => {
  const [analyticsSummary, setAnalyticsSummary] = useState<AnalyticsSummary | null>(null);
  const [userStats, setUserStats] = useState<UserStats[]>([]);
  const [revenueData, setRevenueData] = useState<RevenueData[]>([]);
  const [bookingAnalytics, setBookingAnalytics] = useState<BookingAnalytics[]>([]);
  const [providerPerformance, setProviderPerformance] = useState<ProviderPerformance[]>([]);
  const [servicePopularity, setServicePopularity] = useState<ServicePopularity[]>([]);
  const [mrrData, setMrrData] = useState<MRRData[]>([]);
  const [geographicData, setGeographicData] = useState<GeographicData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchAnalyticsSummary = useCallback(async () => {
    try {
      const { data, error } = await supabase.rpc('get_analytics_summary');
      if (error) throw error;
      setAnalyticsSummary(data[0] || null);
    } catch (error) {
      console.error('Error fetching analytics summary:', error);
      setError('Failed to fetch analytics summary');
    }
  }, []);

  const fetchUserStats = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('analytics_user_stats')
        .select('*');
      if (error) throw error;
      setUserStats(data || []);
    } catch (error) {
      console.error('Error fetching user stats:', error);
      setError('Failed to fetch user statistics');
    }
  }, []);

  const fetchRevenueData = useCallback(async (dateRange?: DateRange) => {
    try {
      let query = supabase.from('analytics_revenue').select('*');
      
      if (dateRange) {
        query = query.gte('month', dateRange.startDate).lte('month', dateRange.endDate);
      }
      
      const { data, error } = await query.order('month', { ascending: true });
      if (error) throw error;
      setRevenueData(data || []);
    } catch (error) {
      console.error('Error fetching revenue data:', error);
      setError('Failed to fetch revenue data');
    }
  }, []);

  const fetchBookingAnalytics = useCallback(async (dateRange?: DateRange) => {
    try {
      let query = supabase.from('analytics_bookings').select('*');
      
      if (dateRange) {
        query = query.gte('booking_date', dateRange.startDate).lte('booking_date', dateRange.endDate);
      }
      
      const { data, error } = await query.order('booking_date', { ascending: true });
      if (error) throw error;
      setBookingAnalytics(data || []);
    } catch (error) {
      console.error('Error fetching booking analytics:', error);
      setError('Failed to fetch booking analytics');
    }
  }, []);

  const fetchProviderPerformance = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('analytics_provider_performance')
        .select('*')
        .order('total_earnings', { ascending: false });
      if (error) throw error;
      setProviderPerformance(data || []);
    } catch (error) {
      console.error('Error fetching provider performance:', error);
      setError('Failed to fetch provider performance');
    }
  }, []);

  const fetchServicePopularity = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('analytics_service_popularity')
        .select('*')
        .order('total_bookings', { ascending: false });
      if (error) throw error;
      setServicePopularity(data || []);
    } catch (error) {
      console.error('Error fetching service popularity:', error);
      setError('Failed to fetch service popularity');
    }
  }, []);

  const fetchMRRData = useCallback(async () => {
    try {
      const { data, error } = await supabase.rpc('get_mrr');
      if (error) throw error;
      setMrrData(data || []);
    } catch (error) {
      console.error('Error fetching MRR data:', error);
      setError('Failed to fetch MRR data');
    }
  }, []);

  const fetchGeographicData = useCallback(async () => {
    try {
      const { data, error } = await supabase.rpc('get_geographic_distribution');
      if (error) throw error;
      setGeographicData(data || []);
    } catch (error) {
      console.error('Error fetching geographic data:', error);
      setError('Failed to fetch geographic data');
    }
  }, []);

  const fetchAllAnalytics = useCallback(async (dateRange?: DateRange) => {
    setIsLoading(true);
    setError(null);
    
    try {
      await Promise.all([
        fetchAnalyticsSummary(),
        fetchUserStats(),
        fetchRevenueData(dateRange),
        fetchBookingAnalytics(dateRange),
        fetchProviderPerformance(),
        fetchServicePopularity(),
        fetchMRRData(),
        fetchGeographicData()
      ]);
    } catch (error) {
      console.error('Error fetching analytics:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch analytics data',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  }, [
    fetchAnalyticsSummary,
    fetchUserStats,
    fetchRevenueData,
    fetchBookingAnalytics,
    fetchProviderPerformance,
    fetchServicePopularity,
    fetchMRRData,
    fetchGeographicData,
    toast
  ]);

  const exportToCSV = useCallback((data: any[], filename: string) => {
    const headers = Object.keys(data[0] || {});
    const csvContent = [
      headers.join(','),
      ...data.map(row => headers.map(header => row[header]).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, []);

  useEffect(() => {
    fetchAllAnalytics();
  }, [fetchAllAnalytics]);

  return {
    analyticsSummary,
    userStats,
    revenueData,
    bookingAnalytics,
    providerPerformance,
    servicePopularity,
    mrrData,
    geographicData,
    isLoading,
    error,
    fetchAllAnalytics,
    exportToCSV
  };
};
