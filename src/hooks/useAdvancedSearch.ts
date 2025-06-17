
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
      // Use a more robust search approach that handles missing RPC functions
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

      // Apply filters safely
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

      const { data, error, count } = await query;

      if (error) throw error;

      // Transform data to match expected format
      const transformedResults: SearchResult[] = (data || []).map(item => ({
        id: item.id,
        name: item.name,
        description: item.description || '',
        service_type: item.service_type,
        client_price: item.client_price,
        duration_minutes: item.duration_minutes,
        tags: item.tags || [],
        avg_rating: 0, // Default since we don't have analytics yet
        total_bookings: 0, // Default since we don't have analytics yet
        search_rank: 1 // Default ranking
      }));

      setResults(transformedResults);
      setTotalCount(count || transformedResults.length);

      // Track search analytics if query exists
      if (filters.query) {
        await trackSearchAnalytics(filters, transformedResults.length);
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
      // Simple suggestion system using service names
      const { data, error } = await supabase
        .from('services')
        .select('name, tags')
        .eq('is_active', true)
        .or(`name.ilike.%${partialQuery}%`)
        .limit(10);

      if (error) throw error;

      const suggestions: SearchSuggestion[] = [];
      
      // Add service name suggestions
      data?.forEach(service => {
        if (service.name.toLowerCase().includes(partialQuery.toLowerCase())) {
          suggestions.push({
            suggestion: service.name,
            category: 'service',
            popularity: 1
          });
        }
      });

      setSuggestions(suggestions.slice(0, 10));
    } catch (error) {
      console.error('Suggestions error:', error);
      setSuggestions([]);
    }
  }, []);

  const trackSearchAnalytics = async (filters: SearchFilters, resultCount: number) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      // Only track if the table exists
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

      // Don't throw error if table doesn't exist
      if (error && !error.message.includes('relation "search_analytics" does not exist')) {
        console.error('Analytics tracking error:', error);
      }
    } catch (error) {
      console.error('Analytics tracking error:', error);
    }
  };

  const trackResultClick = async (resultId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      // Only track if the table exists
      const { error } = await supabase.from('user_behavior_events').insert({
        user_id: user?.id,
        event_type: 'search_result_click',
        event_data: { result_id: resultId },
        page_url: window.location.href,
        user_agent: navigator.userAgent,
        session_id: crypto.randomUUID()
      });

      // Don't throw error if table doesn't exist
      if (error && !error.message.includes('relation "user_behavior_events" does not exist')) {
        console.error('Click tracking error:', error);
      }
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
