
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
  views: number;
  priority: number;
  visibility_rules: {
    show_all: boolean;
    user_roles: string[];
    pages: string[];
  };
  is_active: boolean;
  created_at: string;
  updated_at: string;
  created_by?: string;
  last_updated_by?: string;
}

export const useFAQSystem = () => {
  const { user } = useAuth();
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [categories, setCategories] = useState<string[]>([]);

  const fetchFAQs = async (pageContext = 'all', category?: string) => {
    try {
      const { data, error } = await supabase.rpc('get_faqs_for_context', {
        p_user_role: user?.role || null,
        p_page_context: pageContext,
        p_category: category || null
      });

      if (error) throw error;
      setFaqs(data || []);

      // Extract unique categories
      const uniqueCategories = [...new Set(data?.map(faq => faq.category) || [])];
      setCategories(uniqueCategories);
    } catch (error) {
      console.error('Error fetching FAQs:', error);
      toast.error('Failed to load FAQs');
    } finally {
      setIsLoading(false);
    }
  };

  const createFAQ = async (faqData: Partial<FAQ>) => {
    try {
      const { data, error } = await supabase
        .from('support_faqs')
        .insert([{
          ...faqData,
          created_by: user?.id,
          last_updated_by: user?.id
        }])
        .select()
        .single();

      if (error) throw error;
      
      setFaqs(prev => [data, ...prev]);
      toast.success('FAQ created successfully');
      return data;
    } catch (error: any) {
      toast.error(error.message);
      throw error;
    }
  };

  const updateFAQ = async (id: string, updates: Partial<FAQ>) => {
    try {
      const { data, error } = await supabase
        .from('support_faqs')
        .update({
          ...updates,
          last_updated_by: user?.id,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      setFaqs(prev => prev.map(faq => faq.id === id ? data : faq));
      toast.success('FAQ updated successfully');
      return data;
    } catch (error: any) {
      toast.error(error.message);
      throw error;
    }
  };

  const deleteFAQ = async (id: string) => {
    try {
      const { error } = await supabase
        .from('support_faqs')
        .update({ is_active: false })
        .eq('id', id);

      if (error) throw error;

      setFaqs(prev => prev.filter(faq => faq.id !== id));
      toast.success('FAQ deleted successfully');
    } catch (error: any) {
      toast.error(error.message);
      throw error;
    }
  };

  const trackFAQView = async (faqId: string, pageContext: string) => {
    try {
      // Increment view count
      await supabase.rpc('increment_faq_views', { faq_id: faqId });
      
      // Track analytics
      await supabase
        .from('faq_analytics')
        .insert([{
          faq_id: faqId,
          user_id: user?.id,
          user_role: user?.role,
          page_context: pageContext
        }]);

      // Update local state
      setFaqs(prev => prev.map(faq => 
        faq.id === faqId ? { ...faq, views: faq.views + 1 } : faq
      ));
    } catch (error) {
      console.error('Error tracking FAQ view:', error);
    }
  };

  useEffect(() => {
    fetchFAQs();
  }, [user]);

  return {
    faqs,
    categories,
    isLoading,
    fetchFAQs,
    createFAQ,
    updateFAQ,
    deleteFAQ,
    trackFAQView
  };
};
