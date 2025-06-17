
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface SearchFilters {
  query: string;
  serviceType?: string;
  minPrice?: number;
  maxPrice?: number;
  minDuration?: number;
  maxDuration?: number;
  minRating?: number;
  tags?: string[];
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

export interface SearchResult {
  id: string;
  name: string;
  description: string;
  service_type: string;
  client_price: number;
  duration_minutes: number;
  tags: string[];
  avg_rating: number;
  total_bookings: number;
  search_rank: number;
}

export interface SearchSuggestion {
  suggestion: string;
  category: string;
  popularity: number;
}

export const useAdvancedSearch = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const { toast } = useToast();

  const searchServices = useCallback(async (
    filters: SearchFilters,
    page: number = 0,
    pageSize: number = 20
  ) => {
    setIsLoading(true);
    try {
      // Get services with real analytics
      let query = supabase
        .from('services')
        .select(`
          id,
          name,
          description,
          service_type,
          client_price,
          duration_minutes,
          tags,
          created_at
        `)
        .eq('is_active', true);

      // Apply filters
      if (filters.query && filters.query.trim()) {
        query = query.or(`name.ilike.%${filters.query}%,description.ilike.%${filters.query}%`);
      }

      if (filters.serviceType) {
        query = query.eq('service_type', filters.serviceType);
      }

      if (filters.minPrice !== undefined) {
        query = query.gte('client_price', filters.minPrice);
      }

      if (filters.maxPrice !== undefined) {
        query = query.lte('client_price', filters.maxPrice);
      }

      if (filters.minDuration !== undefined) {
        query = query.gte('duration_minutes', filters.minDuration);
      }

      if (filters.maxDuration !== undefined) {
        query = query.lte('duration_minutes', filters.maxDuration);
      }

      // Order results
      const sortBy = filters.sortBy || 'created_at';
      const sortOrder = filters.sortOrder || 'DESC';
      query = query.order(sortBy, { ascending: sortOrder === 'ASC' });

      // Apply pagination
      query = query.range(page * pageSize, (page + 1) * pageSize - 1);

      const { data: serviceData, error, count } = await query;

      if (error) throw error;

      // Get real analytics for these services
      const serviceIds = serviceData?.map(s => s.id) || [];
      let analyticsData: any[] = [];

      if (serviceIds.length > 0) {
        // Get booking statistics
        const { data: bookingStats } = await supabase
          .from('bookings')
          .select('service_id, rating, status')
          .in('service_id', serviceIds);

        // Calculate analytics for each service
        analyticsData = serviceIds.map(serviceId => {
          const serviceBookings = bookingStats?.filter(b => b.service_id === serviceId) || [];
          const completedBookings = serviceBookings.filter(b => b.status === 'completed');
          const ratingsData = completedBookings.filter(b => b.rating && b.rating > 0);
          
          const avgRating = ratingsData.length > 0 
            ? ratingsData.reduce((sum, b) => sum + (b.rating || 0), 0) / ratingsData.length 
            : 0;

          return {
            service_id: serviceId,
            avg_rating: Math.round(avgRating * 10) / 10,
            total_bookings: serviceBookings.length
          };
        });
      }

      // Transform data to match expected format with real analytics
      const transformedResults: SearchResult[] = (serviceData || []).map(item => {
        const analytics = analyticsData.find(a => a.service_id === item.id);
        
        return {
          id: item.id,
          name: item.name,
          description: item.description || '',
          service_type: item.service_type,
          client_price: item.client_price,
          duration_minutes: item.duration_minutes,
          tags: item.tags || [],
          avg_rating: analytics?.avg_rating || 0,
          total_bookings: analytics?.total_bookings || 0,
          search_rank: 1 // Default ranking
        };
      });

      // Filter by minimum rating if specified
      let filteredResults = transformedResults;
      if (filters.minRating !== undefined) {
        filteredResults = transformedResults.filter(r => r.avg_rating >= filters.minRating!);
      }

      setResults(filteredResults);
      setTotalCount(count || filteredResults.length);

      // Track search analytics - ensure it doesn't fail silently
      if (filters.query) {
        await trackSearchAnalytics(filters, filteredResults.length);
      }

    } catch (error) {
      console.error('Search error:', error);
      toast({
        title: "Search Error",
        description: "Failed to search services. Please try again.",
        variant: "destructive",
      });
      setResults([]);
      setTotalCount(0);
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const getSuggestions = useCallback(async (partialQuery: string) => {
    if (!partialQuery || partialQuery.length < 2) {
      setSuggestions([]);
      return;
    }

    try {
      // Get service name suggestions with real popularity data
      const { data: serviceData, error } = await supabase
        .from('services')
        .select('id, name, tags')
        .eq('is_active', true)
        .or(`name.ilike.%${partialQuery}%`)
        .limit(10);

      if (error) throw error;

      const suggestions: SearchSuggestion[] = [];
      
      if (serviceData) {
        // Get booking counts for popularity
        const serviceIds = serviceData.map(s => s.id);
        const { data: bookingCounts } = await supabase
          .from('bookings')
          .select('service_id')
          .in('service_id', serviceIds);

        // Add service name suggestions with real popularity
        serviceData.forEach(service => {
          if (service.name.toLowerCase().includes(partialQuery.toLowerCase())) {
            const bookingCount = bookingCounts?.filter(b => b.service_id === service.id).length || 0;
            suggestions.push({
              suggestion: service.name,
              category: 'service',
              popularity: bookingCount
            });
          }
        });
      }

      // Sort by popularity (booking count)
      suggestions.sort((a, b) => b.popularity - a.popularity);
      setSuggestions(suggestions.slice(0, 10));
    } catch (error) {
      console.error('Suggestions error:', error);
      setSuggestions([]);
    }
  }, []);

  const trackSearchAnalytics = async (filters: SearchFilters, resultCount: number) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      // Ensure search analytics are properly tracked
      const { error } = await supabase.from('search_analytics').insert({
        user_id: user?.id,
        search_query: filters.query,
        search_filters: {
          serviceType: filters.serviceType,
          minPrice: filters.minPrice,
          maxPrice: filters.maxPrice,
          minRating: filters.minRating,
          tags: filters.tags
        },
        results_count: resultCount,
        session_id: crypto.randomUUID()
      });

      if (error) {
        console.error('Search analytics tracking failed:', error);
        // Don't throw error, just log it so search doesn't fail
      }
    } catch (error) {
      console.error('Search analytics tracking error:', error);
      // Don't throw error, just log it so search doesn't fail
    }
  };

  const trackResultClick = async (resultId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      // Track click with proper error handling
      const { error } = await supabase.from('user_behavior_events').insert({
        user_id: user?.id,
        event_type: 'search_result_click',
        event_data: { result_id: resultId },
        page_url: window.location.href,
        user_agent: navigator.userAgent,
        session_id: crypto.randomUUID()
      });

      if (error) {
        console.error('Click tracking failed:', error);
        // Don't throw error, just log it
      }
    } catch (error) {
      console.error('Click tracking error:', error);
      // Don't throw error, just log it
    }
  };

  return {
    searchServices,
    getSuggestions,
    trackResultClick,
    results,
    suggestions,
    isLoading,
    totalCount
  };
};
