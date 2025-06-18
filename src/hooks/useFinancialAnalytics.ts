
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface RevenueForcast {
  month: string;
  predicted_revenue: number;
  predicted_bookings: number;
  confidence_level: number;
  growth_trend: number;
}

export interface ServiceProfitability {
  service_id: string;
  service_name: string;
  service_type: string;
  total_bookings: number;
  completed_bookings: number;
  total_revenue: number;
  total_payouts: number;
  profit_margin: number;
  avg_rating: number;
  avg_price: number;
}

export interface ProviderRanking {
  provider_id: string;
  provider_name: string;
  overall_rating: number;
  total_jobs: number;
  bookings_30_days: number;
  completed_30_days: number;
  revenue_30_days: number;
  recent_rating: number;
  completion_rate: number;
}

export interface CustomerLTV {
  client_id: string;
  first_booking_date: string;
  last_booking_date: string;
  total_bookings: number;
  completed_bookings: number;
  total_spent: number;
  avg_booking_value: number;
  customer_lifetime_value: number;
  churn_risk_score: number;
}

export interface FinancialOverviewData {
  month: string;
  total_bookings: number;
  completed_bookings: number;
  revenue: number;
  provider_payouts: number;
  avg_booking_value: number;
  platform_commission: number;
}

export const useFinancialAnalytics = () => {
  const [financialOverview, setFinancialOverview] = useState<FinancialOverviewData[]>([]);
  const [revenueForecasts, setRevenueForecasts] = useState<RevenueForcast[]>([]);
  const [serviceProfitability, setServiceProfitability] = useState<ServiceProfitability[]>([]);
  const [providerRankings, setProviderRankings] = useState<ProviderRanking[]>([]);
  const [customerLTV, setCustomerLTV] = useState<CustomerLTV[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchFinancialOverview = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('analytics_financial_overview')
        .select('*')
        .order('month', { ascending: false })
        .limit(12);

      if (error) throw error;
      setFinancialOverview(data || []);
    } catch (err: any) {
      console.error('Error fetching financial overview:', err);
      setError(err.message);
    }
  }, []);

  const fetchRevenueForecasts = useCallback(async (months: number = 6) => {
    try {
      const { data, error } = await supabase.rpc('calculate_revenue_forecast', {
        forecast_months: months
      });

      if (error) throw error;
      setRevenueForecasts(data || []);
    } catch (err: any) {
      console.error('Error fetching revenue forecasts:', err);
      setError(err.message);
    }
  }, []);

  const fetchServiceProfitability = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('analytics_service_profitability')
        .select('*')
        .order('profit_margin', { ascending: false });

      if (error) throw error;
      setServiceProfitability(data || []);
    } catch (err: any) {
      console.error('Error fetching service profitability:', err);
      setError(err.message);
    }
  }, []);

  const fetchProviderRankings = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('analytics_provider_rankings')
        .select('*')
        .order('completion_rate', { ascending: false })
        .limit(20);

      if (error) throw error;
      setProviderRankings(data || []);
    } catch (err: any) {
      console.error('Error fetching provider rankings:', err);
      setError(err.message);
    }
  }, []);

  const fetchCustomerLTV = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('customer_analytics')
        .select('*')
        .order('customer_lifetime_value', { ascending: false })
        .limit(50);

      if (error) throw error;
      setCustomerLTV(data || []);
    } catch (err: any) {
      console.error('Error fetching customer LTV:', err);
      setError(err.message);
    }
  }, []);

  const calculateCustomerLTV = useCallback(async (clientId: string) => {
    try {
      const { data, error } = await supabase.rpc('calculate_customer_ltv', {
        client_id_param: clientId
      });

      if (error) throw error;
      return data;
    } catch (err: any) {
      console.error('Error calculating customer LTV:', err);
      toast({
        title: 'Error',
        description: 'Failed to calculate customer lifetime value',
        variant: 'destructive'
      });
      return 0;
    }
  }, [toast]);

  const fetchAllAnalytics = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      await Promise.all([
        fetchFinancialOverview(),
        fetchRevenueForecasts(),
        fetchServiceProfitability(),
        fetchProviderRankings(),
        fetchCustomerLTV()
      ]);
    } catch (err: any) {
      setError(err.message);
      toast({
        title: 'Error',
        description: 'Failed to fetch analytics data',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  }, [
    fetchFinancialOverview,
    fetchRevenueForecasts,
    fetchServiceProfitability,
    fetchProviderRankings,
    fetchCustomerLTV,
    toast
  ]);

  const exportAnalyticsData = useCallback((data: any[], filename: string) => {
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

  return {
    financialOverview,
    revenueForecasts,
    serviceProfitability,
    providerRankings,
    customerLTV,
    isLoading,
    error,
    fetchAllAnalytics,
    fetchRevenueForecasts,
    calculateCustomerLTV,
    exportAnalyticsData
  };
};
