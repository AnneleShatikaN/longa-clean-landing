
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { LearningModule, QuizQuestion, CreateModuleRequest, CreateQuestionRequest, ServiceType } from '@/types/learning';

export const useLearningModules = () => {
  const [modules, setModules] = useState<LearningModule[]>([]);
  const [questions, setQuestions] = useState<{ [moduleId: string]: QuizQuestion[] }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchModules = async (serviceType?: ServiceType) => {
    setIsLoading(true);
    setError(null);
    
    try {
      let query = supabase
        .from('learning_modules')
        .select('*')
        .order('display_order', { ascending: true });
      
      if (serviceType) {
        query = query.eq('service_type', serviceType);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      setModules(data || []);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch modules';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchQuestions = async (moduleId: string) => {
    try {
      const { data, error } = await supabase
        .from('quiz_questions')
        .select('*')
        .eq('module_id', moduleId)
        .order('question_order', { ascending: true });
      
      if (error) throw error;
      
      setQuestions(prev => ({
        ...prev,
        [moduleId]: data || []
      }));
      
      return data || [];
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch questions';
      toast.error(errorMessage);
      return [];
    }
  };

  const createModule = async (moduleData: CreateModuleRequest): Promise<LearningModule | null> => {
    try {
      const { data, error } = await supabase
        .from('learning_modules')
        .insert([moduleData])
        .select()
        .single();
      
      if (error) throw error;
      
      toast.success('Module created successfully');
      await fetchModules();
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create module';
      toast.error(errorMessage);
      return null;
    }
  };

  const updateModule = async (id: string, updates: Partial<CreateModuleRequest>): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('learning_modules')
        .update(updates)
        .eq('id', id);
      
      if (error) throw error;
      
      toast.success('Module updated successfully');
      await fetchModules();
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update module';
      toast.error(errorMessage);
      return false;
    }
  };

  const deleteModule = async (id: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('learning_modules')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      toast.success('Module deleted successfully');
      await fetchModules();
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete module';
      toast.error(errorMessage);
      return false;
    }
  };

  const createQuestion = async (questionData: CreateQuestionRequest): Promise<QuizQuestion | null> => {
    try {
      const { data, error } = await supabase
        .from('quiz_questions')
        .insert([questionData])
        .select()
        .single();
      
      if (error) throw error;
      
      toast.success('Question created successfully');
      await fetchQuestions(questionData.module_id);
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create question';
      toast.error(errorMessage);
      return null;
    }
  };

  const updateQuestion = async (id: string, updates: Partial<CreateQuestionRequest>): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('quiz_questions')
        .update(updates)
        .eq('id', id);
      
      if (error) throw error;
      
      toast.success('Question updated successfully');
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update question';
      toast.error(errorMessage);
      return false;
    }
  };

  const deleteQuestion = async (id: string, moduleId: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('quiz_questions')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      toast.success('Question deleted successfully');
      await fetchQuestions(moduleId);
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete question';
      toast.error(errorMessage);
      return false;
    }
  };

  useEffect(() => {
    fetchModules();
  }, []);

  return {
    modules,
    questions,
    isLoading,
    error,
    fetchModules,
    fetchQuestions,
    createModule,
    updateModule,
    deleteModule,
    createQuestion,
    updateQuestion,
    deleteQuestion
  };
};
