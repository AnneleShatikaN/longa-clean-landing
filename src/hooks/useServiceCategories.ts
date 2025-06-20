
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ServiceCategory {
  id: string;
  name: string;
  description: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export const useServiceCategories = () => {
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const fetchCategories = async (activeOnly: boolean = false) => {
    try {
      setIsLoading(true);
      
      let query = supabase
        .from('service_categories')
        .select('*')
        .order('name');

      if (activeOnly) {
        query = query.eq('is_active', true);
      }

      const { data, error } = await query;

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast({
        title: "Error",
        description: "Failed to load service categories",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getCategoryById = (id: string) => {
    return categories.find(category => category.id === id);
  };

  const getActiveCategoriesCount = () => {
    return categories.filter(category => category.is_active).length;
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  return {
    categories,
    isLoading,
    fetchCategories,
    getCategoryById,
    getActiveCategoriesCount,
    refetch: fetchCategories
  };
};
