
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
  views: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface DocLink {
  id: string;
  title: string;
  description?: string;
  url: string;
  category: string;
  file_type: string;
  is_active: boolean;
  sort_order: number;
}

export const useSupportData = () => {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [docLinks, setDocLinks] = useState<DocLink[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchFAQs = async () => {
    try {
      const { data, error } = await supabase
        .from('support_faqs')
        .select('*')
        .eq('is_active', true)
        .order('views', { ascending: false });

      if (error) throw error;
      setFaqs(data || []);
    } catch (error) {
      console.error('Error fetching FAQs:', error);
      toast({
        title: "Error",
        description: "Failed to fetch FAQs",
        variant: "destructive",
      });
    }
  };

  const fetchDocLinks = async () => {
    try {
      const { data, error } = await supabase
        .from('docs_links')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true });

      if (error) throw error;
      setDocLinks(data || []);
    } catch (error) {
      console.error('Error fetching doc links:', error);
      toast({
        title: "Error",
        description: "Failed to fetch documentation links",
        variant: "destructive",
      });
    }
  };

  const addFAQ = async (question: string, answer: string, category: string) => {
    try {
      const { data, error } = await supabase
        .from('support_faqs')
        .insert([{ question, answer, category }])
        .select()
        .single();

      if (error) throw error;

      setFaqs(prev => [data, ...prev]);
      toast({
        title: "Success",
        description: "FAQ added successfully",
      });
      return data;
    } catch (error) {
      console.error('Error adding FAQ:', error);
      toast({
        title: "Error",
        description: "Failed to add FAQ",
        variant: "destructive",
      });
      throw error;
    }
  };

  const updateFAQ = async (id: string, updates: Partial<FAQ>) => {
    try {
      const { data, error } = await supabase
        .from('support_faqs')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      setFaqs(prev => prev.map(faq => faq.id === id ? data : faq));
      toast({
        title: "Success",
        description: "FAQ updated successfully",
      });
      return data;
    } catch (error) {
      console.error('Error updating FAQ:', error);
      toast({
        title: "Error",
        description: "Failed to update FAQ",
        variant: "destructive",
      });
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
      toast({
        title: "Success",
        description: "FAQ deleted successfully",
      });
    } catch (error) {
      console.error('Error deleting FAQ:', error);
      toast({
        title: "Error",
        description: "Failed to delete FAQ",
        variant: "destructive",
      });
      throw error;
    }
  };

  const incrementFAQViews = async (id: string) => {
    try {
      await supabase.rpc('increment_faq_views', { faq_id: id });
    } catch (error) {
      console.error('Error incrementing FAQ views:', error);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      await Promise.all([fetchFAQs(), fetchDocLinks()]);
      setIsLoading(false);
    };

    loadData();
  }, []);

  return {
    faqs,
    docLinks,
    isLoading,
    addFAQ,
    updateFAQ,
    deleteFAQ,
    incrementFAQViews,
    refetch: () => Promise.all([fetchFAQs(), fetchDocLinks()])
  };
};
