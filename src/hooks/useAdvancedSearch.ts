
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
      const { data, error } = await supabase.rpc('search_services', {
        search_query: filters.query || null,
        service_type_filter: filters.serviceType || null,
        min_price: filters.minPrice || null,
        max_price: filters.maxPrice || null,
        min_duration: filters.minDuration || null,
        max_duration: filters.maxDuration || null,
        min_rating: filters.minRating || null,
        tags_filter: filters.tags || null,
        limit_results: pageSize,
        offset_results: page * pageSize
      });

      if (error) throw error;

      setResults(data || []);
      setTotalCount(data?.length || 0);

      // Track search analytics
      if (filters.query) {
        await trackSearchAnalytics(filters, data?.length || 0);
      }

    } catch (error) {
      console.error('Search error:', error);
      toast({
        title: "Search Error",
        description: "Failed to search services. Please try again.",
        variant: "destructive",
      });
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
      const { data, error } = await supabase.rpc('get_search_suggestions', {
        partial_query: partialQuery,
        limit_results: 10
      });

      if (error) throw error;
      setSuggestions(data || []);
    } catch (error) {
      console.error('Suggestions error:', error);
    }
  }, []);

  const trackSearchAnalytics = async (filters: SearchFilters, resultCount: number) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      await supabase.from('search_analytics').insert({
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
    } catch (error) {
      console.error('Analytics tracking error:', error);
    }
  };

  const trackResultClick = async (resultId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      await supabase.from('user_behavior_events').insert({
        user_id: user?.id,
        event_type: 'search_result_click',
        event_data: { result_id: resultId },
        page_url: window.location.href,
        user_agent: navigator.userAgent,
        session_id: crypto.randomUUID()
      });
    } catch (error) {
      console.error('Click tracking error:', error);
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
