
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
      
      // Map the data to match our FAQ interface
      const mappedFaqs = data?.map((item: any) => ({
        id: item.id,
        question: item.question,
        answer: item.answer,
        category: item.category,
        views: item.views,
        priority: item.priority,
        visibility_rules: typeof item.visibility_rules === 'string' 
          ? JSON.parse(item.visibility_rules) 
          : item.visibility_rules,
        is_active: true,
        created_at: item.created_at,
        updated_at: item.created_at,
        created_by: item.created_by,
        last_updated_by: item.last_updated_by
      })) || [];

      setFaqs(mappedFaqs);

      // Extract unique categories
      const uniqueCategories = [...new Set(mappedFaqs.map(faq => faq.category))];
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
          question: faqData.question!,
          answer: faqData.answer!,
          category: faqData.category || 'General',
          priority: faqData.priority || 0,
          visibility_rules: faqData.visibility_rules || {
            show_all: true,
            user_roles: ['client', 'provider', 'admin'],
            pages: ['all']
          },
          created_by: user?.id,
          last_updated_by: user?.id
        }])
        .select()
        .single();

      if (error) throw error;
      
      const mappedFaq: FAQ = {
        id: data.id,
        question: data.question,
        answer: data.answer,
        category: data.category,
        views: data.views || 0,
        priority: data.priority || 0,
        visibility_rules: typeof data.visibility_rules === 'string' 
          ? JSON.parse(data.visibility_rules) 
          : data.visibility_rules,
        is_active: data.is_active,
        created_at: data.created_at,
        updated_at: data.updated_at || data.created_at,
        created_by: data.created_by,
        last_updated_by: data.last_updated_by
      };

      setFaqs(prev => [mappedFaq, ...prev]);
      toast.success('FAQ created successfully');
      return mappedFaq;
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
          question: updates.question,
          answer: updates.answer,
          category: updates.category,
          priority: updates.priority,
          visibility_rules: updates.visibility_rules,
          last_updated_by: user?.id,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      const mappedFaq: FAQ = {
        id: data.id,
        question: data.question,
        answer: data.answer,
        category: data.category,
        views: data.views || 0,
        priority: data.priority || 0,
        visibility_rules: typeof data.visibility_rules === 'string' 
          ? JSON.parse(data.visibility_rules) 
          : data.visibility_rules,
        is_active: data.is_active,
        created_at: data.created_at,
        updated_at: data.updated_at || data.created_at,
        created_by: data.created_by,
        last_updated_by: data.last_updated_by
      };

      setFaqs(prev => prev.map(faq => faq.id === id ? mappedFaq : faq));
      toast.success('FAQ updated successfully');
      return mappedFaq;
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
