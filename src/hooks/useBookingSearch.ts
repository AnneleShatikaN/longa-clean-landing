
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface BookingSearchFilters {
  status?: string;
  serviceType?: string;
  dateFrom?: string;
  dateTo?: string;
  minAmount?: number;
  maxAmount?: number;
  searchText?: string;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

export interface BookingSearchResult {
  id: string;
  booking_date: string;
  booking_time: string;
  status: string;
  total_amount: number;
  service_name: string;
  client_name: string;
  provider_name?: string;
  created_at: string;
  search_rank: number;
}

export const useBookingSearch = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [bookings, setBookings] = useState<BookingSearchResult[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const { user } = useAuth();
  const { toast } = useToast();

  const searchBookings = useCallback(async (
    filters: BookingSearchFilters,
    page: number = 0,
    pageSize: number = 50
  ) => {
    if (!user) return;

    setIsLoading(true);
    try {
      const { data, error } = await supabase.rpc('search_bookings', {
        user_id_filter: user.id,
        user_role: user.role,
        status_filter: filters.status || null,
        service_type_filter: filters.serviceType || null,
        date_from: filters.dateFrom || null,
        date_to: filters.dateTo || null,
        min_amount: filters.minAmount || null,
        max_amount: filters.maxAmount || null,
        search_text: filters.searchText || null,
        sort_by: filters.sortBy || 'created_at',
        sort_order: filters.sortOrder || 'DESC',
        limit_results: pageSize,
        offset_results: page * pageSize
      });

      if (error) throw error;
      setBookings(data || []);
      setTotalCount(data?.length || 0);

    } catch (error) {
      console.error('Booking search error:', error);
      toast({
        title: "Search Error",
        description: "Failed to search bookings. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [user, toast]);

  const exportBookings = useCallback(async (filters: BookingSearchFilters) => {
    if (!user) return;

    try {
      const { data, error } = await supabase.rpc('search_bookings', {
        user_id_filter: user.id,
        user_role: user.role,
        status_filter: filters.status || null,
        service_type_filter: filters.serviceType || null,
        date_from: filters.dateFrom || null,
        date_to: filters.dateTo || null,
        min_amount: filters.minAmount || null,
        max_amount: filters.maxAmount || null,
        search_text: filters.searchText || null,
        sort_by: 'created_at',
        sort_order: 'DESC',
        limit_results: 10000,
        offset_results: 0
      });

      if (error) throw error;

      // Convert to CSV
      const headers = ['Date', 'Time', 'Status', 'Service', 'Client', 'Provider', 'Amount'];
      const csvContent = [
        headers.join(','),
        ...data.map(booking => [
          booking.booking_date,
          booking.booking_time,
          booking.status,
          booking.service_name,
          booking.client_name,
          booking.provider_name || 'N/A',
          booking.total_amount
        ].join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `bookings-export-${new Date().toISOString().split('T')[0]}.csv`;
      link.click();
      window.URL.revokeObjectURL(url);

      toast({
        title: "Export Successful",
        description: "Bookings data has been exported to CSV.",
      });

    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: "Export Error",
        description: "Failed to export bookings data.",
        variant: "destructive",
      });
    }
  }, [user, toast]);

  return {
    searchBookings,
    exportBookings,
    bookings,
    isLoading,
    totalCount
  };
};
