
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

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
        .order('priority', { ascending: false })
        .order('views', { ascending: false });

      if (error) throw error;
      
      // Map the data to match our FAQ interface
      const mappedFaqs = data?.map((item: any) => ({
        id: item.id,
        question: item.question,
        answer: item.answer,
        category: item.category,
        views: item.views || 0,
        priority: item.priority || 0,
        visibility_rules: typeof item.visibility_rules === 'string' 
          ? JSON.parse(item.visibility_rules) 
          : item.visibility_rules || {
              show_all: true,
              user_roles: ['client', 'provider', 'admin'],
              pages: ['all']
            },
        is_active: item.is_active,
        created_at: item.created_at,
        updated_at: item.updated_at || item.created_at
      })) || [];

      setFaqs(mappedFaqs);
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

  const addFAQ = async (question: string, answer: string, category: string, visibilityRules?: any) => {
    try {
      const { data, error } = await supabase
        .from('support_faqs')
        .insert([{ 
          question, 
          answer, 
          category,
          visibility_rules: visibilityRules || {
            show_all: true,
            user_roles: ['client', 'provider', 'admin'],
            pages: ['all']
          }
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
        updated_at: data.updated_at || data.created_at
      };

      setFaqs(prev => [mappedFaq, ...prev]);
      toast({
        title: "Success",
        description: "FAQ added successfully",
      });
      return mappedFaq;
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
        .update({
          question: updates.question,
          answer: updates.answer,
          category: updates.category,
          priority: updates.priority,
          visibility_rules: updates.visibility_rules
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
        updated_at: data.updated_at || data.created_at
      };

      setFaqs(prev => prev.map(faq => faq.id === id ? mappedFaq : faq));
      toast({
        title: "Success",
        description: "FAQ updated successfully",
      });
      return mappedFaq;
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

  const addDocLink = async (docData: Omit<DocLink, 'id' | 'is_active' | 'sort_order'>) => {
    try {
      const { data, error } = await supabase
        .from('docs_links')
        .insert([{ ...docData, is_active: true, sort_order: 0 }])
        .select()
        .single();

      if (error) throw error;

      setDocLinks(prev => [data, ...prev]);
      toast({
        title: "Success",
        description: "Document added successfully",
      });
      return data;
    } catch (error) {
      console.error('Error adding document:', error);
      toast({
        title: "Error",
        description: "Failed to add document",
        variant: "destructive",
      });
      throw error;
    }
  };

  const updateDocLink = async (id: string, updates: Partial<DocLink>) => {
    try {
      const { data, error } = await supabase
        .from('docs_links')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      setDocLinks(prev => prev.map(doc => doc.id === id ? data : doc));
      toast({
        title: "Success",
        description: "Document updated successfully",
      });
      return data;
    } catch (error) {
      console.error('Error updating document:', error);
      toast({
        title: "Error",
        description: "Failed to update document",
        variant: "destructive",
      });
      throw error;
    }
  };

  const deleteDocLink = async (id: string) => {
    try {
      const { error } = await supabase
        .from('docs_links')
        .update({ is_active: false })
        .eq('id', id);

      if (error) throw error;

      setDocLinks(prev => prev.filter(doc => doc.id !== id));
      toast({
        title: "Success",
        description: "Document deleted successfully",
      });
    } catch (error) {
      console.error('Error deleting document:', error);
      toast({
        title: "Error",
        description: "Failed to delete document",
        variant: "destructive",
      });
      throw error;
    }
  };

  const incrementFAQViews = async (id: string) => {
    try {
      await supabase.rpc('increment_faq_views', { faq_id: id });
      setFaqs(prev => prev.map(faq => 
        faq.id === id ? { ...faq, views: faq.views + 1 } : faq
      ));
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
    deleteFAQ: async (id: string) => {
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
    },
    addDocLink: async (docData: Omit<DocLink, 'id' | 'is_active' | 'sort_order'>) => {
      try {
        const { data, error } = await supabase
          .from('docs_links')
          .insert([{ ...docData, is_active: true, sort_order: 0 }])
          .select()
          .single();

        if (error) throw error;

        setDocLinks(prev => [data, ...prev]);
        toast({
          title: "Success",
          description: "Document added successfully",
        });
        return data;
      } catch (error) {
        console.error('Error adding document:', error);
        toast({
          title: "Error",
          description: "Failed to add document",
          variant: "destructive",
        });
        throw error;
      }
    },
    updateDocLink: async (id: string, updates: Partial<DocLink>) => {
      try {
        const { data, error } = await supabase
          .from('docs_links')
          .update(updates)
          .eq('id', id)
          .select()
          .single();

        if (error) throw error;

        setDocLinks(prev => prev.map(doc => doc.id === id ? data : doc));
        toast({
          title: "Success",
          description: "Document updated successfully",
        });
        return data;
      } catch (error) {
        console.error('Error updating document:', error);
        toast({
          title: "Error",
          description: "Failed to update document",
          variant: "destructive",
        });
        throw error;
      }
    },
    deleteDocLink: async (id: string) => {
      try {
        const { error } = await supabase
          .from('docs_links')
          .update({ is_active: false })
          .eq('id', id);

        if (error) throw error;

        setDocLinks(prev => prev.filter(doc => doc.id !== id));
        toast({
          title: "Success",
          description: "Document deleted successfully",
        });
      } catch (error) {
        console.error('Error deleting document:', error);
        toast({
          title: "Error",
          description: "Failed to delete document",
          variant: "destructive",
        });
        throw error;
      }
    },
    incrementFAQViews: async (id: string) => {
      try {
        await supabase.rpc('increment_faq_views', { faq_id: id });
        setFaqs(prev => prev.map(faq => 
          faq.id === id ? { ...faq, views: faq.views + 1 } : faq
        ));
      } catch (error) {
        console.error('Error incrementing FAQ views:', error);
      }
    },
    refetch: () => Promise.all([fetchFAQs(), fetchDocLinks()])
  };
};
