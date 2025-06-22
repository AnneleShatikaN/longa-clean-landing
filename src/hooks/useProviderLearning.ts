import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { 
  ModuleWithProgress, 
  ProviderLearningProgress, 
  ProviderCertificate,
  QuizQuestion,
  QuizSubmission,
  ServiceType 
} from '@/types/learning';

export const useProviderLearning = () => {
  const { user } = useAuth();
  const [modules, setModules] = useState<ModuleWithProgress[]>([]);
  const [progress, setProgress] = useState<ProviderLearningProgress[]>([]);
  const [certificate, setCertificate] = useState<ProviderCertificate | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get provider's service type from their profile with better validation
  const providerServiceType = user?.provider_category as ServiceType;

  const fetchModulesWithProgress = async () => {
    if (!user || !providerServiceType) {
      console.log('Cannot fetch modules - missing user or service type:', { 
        user: !!user, 
        serviceType: providerServiceType 
      });
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      console.log('Fetching modules for service type:', providerServiceType);

      // Fetch published modules for provider's service type
      const { data: modulesData, error: modulesError } = await supabase
        .from('learning_modules')
        .select('*')
        .eq('service_type', providerServiceType)
        .eq('is_published', true)
        .order('display_order', { ascending: true });

      if (modulesError) {
        console.error('Error fetching modules:', modulesError);
        throw modulesError;
      }

      console.log('Found modules:', modulesData?.length || 0);

      // Fetch provider's progress for these modules
      const { data: progressData, error: progressError } = await supabase
        .from('provider_learning_progress')
        .select('*')
        .eq('provider_id', user.id)
        .eq('service_type', providerServiceType);

      if (progressError) {
        console.error('Error fetching progress:', progressError);
        throw progressError;
      }

      console.log('Found progress records:', progressData?.length || 0);

      // Combine modules with progress
      const modulesWithProgress: ModuleWithProgress[] = (modulesData || []).map(module => ({
        ...module,
        progress: progressData?.find(p => p.module_id === module.id)
      }));

      setModules(modulesWithProgress);
      setProgress(progressData || []);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch learning data';
      console.error('Error in fetchModulesWithProgress:', err);
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCertificate = async () => {
    if (!user || !providerServiceType) {
      console.log('Cannot fetch certificate - missing user or service type:', { 
        user: !!user, 
        serviceType: providerServiceType 
      });
      return;
    }

    try {
      console.log('Fetching certificate:', { 
        providerId: user.id, 
        serviceType: providerServiceType 
      });

      const { data, error } = await supabase
        .from('provider_certificates')
        .select('*')
        .eq('provider_id', user.id)
        .eq('service_type', providerServiceType)
        .eq('is_active', true)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No certificate found - this is expected for new providers
          console.log('No certificate found for provider');
          setCertificate(null);
        } else {
          console.error('Error fetching certificate:', error);
          throw error;
        }
      } else {
        console.log('Certificate found:', data);
        setCertificate(data);
      }
    } catch (err) {
      console.error('Error fetching certificate:', err);
      setCertificate(null);
    }
  };

  const fetchModuleQuestions = async (moduleId: string): Promise<QuizQuestion[]> => {
    try {
      const { data, error } = await supabase
        .from('quiz_questions')
        .select('*')
        .eq('module_id', moduleId)
        .order('question_order', { ascending: true });

      if (error) throw error;

      return (data || []).map(item => ({
        ...item,
        correct_answer: item.correct_answer as 'A' | 'B' | 'C' | 'D'
      }));
    } catch (err) {
      console.error('Error fetching questions:', err);
      return [];
    }
  };

  const submitQuiz = async (moduleId: string, submissions: QuizSubmission[]): Promise<boolean> => {
    if (!user) return false;

    try {
      // First get the questions to check answers
      const questions = await fetchModuleQuestions(moduleId);
      
      // Calculate score
      let correctAnswers = 0;
      const quizAttempts = [];

      for (const submission of submissions) {
        const question = questions.find(q => q.id === submission.question_id);
        if (question) {
          const isCorrect = question.correct_answer === submission.selected_answer;
          if (isCorrect) correctAnswers++;

          quizAttempts.push({
            provider_id: user.id,
            module_id: moduleId,
            question_id: submission.question_id,
            selected_answer: submission.selected_answer,
            is_correct: isCorrect,
            attempt_number: 1
          });
        }
      }

      const score = Math.round((correctAnswers / questions.length) * 100);
      // Updated pass requirement: 80% minimum score
      const isPassed = score >= 80;

      // Save quiz attempts
      const { error: attemptsError } = await supabase
        .from('quiz_attempts')
        .insert(quizAttempts);

      if (attemptsError) throw attemptsError;

      // Update or create progress record
      const { error: progressError } = await supabase
        .from('provider_learning_progress')
        .upsert({
          provider_id: user.id,
          module_id: moduleId,
          service_type: providerServiceType,
          quiz_score: score,
          quiz_attempts: 1,
          is_completed: isPassed,
          completed_at: isPassed ? new Date().toISOString() : null
        }, {
          onConflict: 'provider_id,module_id'
        });

      if (progressError) throw progressError;

      if (isPassed) {
        toast.success(`Quiz passed with ${score}%! Module completed.`);
        // Check if all modules are complete and generate certificate
        await checkAndGenerateCertificate();
      } else {
        toast.error(`Quiz failed with ${score}%. You need at least 80% to pass. Please try again.`);
      }

      // Refresh data
      await fetchModulesWithProgress();
      return isPassed;

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to submit quiz';
      toast.error(errorMessage);
      return false;
    }
  };

  const checkAndGenerateCertificate = async () => {
    if (!user || !providerServiceType) return;

    try {
      // Check if provider has completed all modules with 80%+ score
      const { data: completionCheck, error } = await supabase
        .from('provider_learning_progress')
        .select('quiz_score, is_completed')
        .eq('provider_id', user.id)
        .eq('service_type', providerServiceType);

      if (error) throw error;

      // Get total published modules for this service type
      const { data: totalModules, error: modulesError } = await supabase
        .from('learning_modules')
        .select('id')
        .eq('service_type', providerServiceType)
        .eq('is_published', true);

      if (modulesError) throw modulesError;

      const allModulesCompleted = completionCheck?.length === totalModules?.length &&
        completionCheck?.every(progress => progress.is_completed && progress.quiz_score >= 80);

      if (allModulesCompleted && !certificate) {
        // Generate certificate
        const { data: certId, error: certIdError } = await supabase
          .rpc('generate_certificate_id', {
            p_service_type: providerServiceType
          });

        if (certIdError) throw certIdError;

        const { data: newCert, error: certError } = await supabase
          .from('provider_certificates')
          .insert({
            provider_id: user.id,
            service_type: providerServiceType,
            certificate_id: certId
          })
          .select()
          .single();

        if (certError) throw certError;

        setCertificate(newCert);
        toast.success('🎉 Congratulations! Your certificate has been generated.');
      }
    } catch (err) {
      console.error('Error checking completion:', err);
    }
  };

  const generateCertificatePDF = async (): Promise<string | null> => {
    if (!certificate || !user) return null;

    try {
      // Here you would integrate with a PDF generation service
      // For now, we'll create a simple certificate URL
      const certificateData = {
        providerName: user.full_name,
        serviceType: providerServiceType,
        certificateId: certificate.certificate_id,
        issuedDate: certificate.issued_at
      };

      // In a real implementation, you'd call a PDF generation service
      // For now, return a placeholder URL
      const pdfUrl = `/certificates/${certificate.certificate_id}.pdf`;
      
      // Update certificate with PDF URL
      await supabase
        .from('provider_certificates')
        .update({ pdf_url: pdfUrl })
        .eq('id', certificate.id);

      return pdfUrl;
    } catch (err) {
      console.error('Error generating certificate PDF:', err);
      return null;
    }
  };

  const getProgressStats = () => {
    const totalModules = modules.length;
    const completedModules = progress.filter(p => p.is_completed).length;
    const progressPercentage = totalModules > 0 ? (completedModules / totalModules) * 100 : 0;
    
    return {
      totalModules,
      completedModules,
      progressPercentage: Math.round(progressPercentage),
      isCompleted: totalModules > 0 && completedModules === totalModules
    };
  };

  useEffect(() => {
    if (user && providerServiceType) {
      console.log('useProviderLearning effect triggered:', { 
        userId: user.id, 
        serviceType: providerServiceType 
      });
      fetchModulesWithProgress();
      fetchCertificate();
    } else {
      console.log('useProviderLearning effect skipped - missing data:', { 
        user: !!user, 
        serviceType: providerServiceType 
      });
    }
  }, [user, providerServiceType]);

  return {
    modules,
    progress,
    certificate,
    isLoading,
    error,
    providerServiceType,
    fetchModuleQuestions,
    submitQuiz,
    generateCertificatePDF,
    getProgressStats,
    refreshData: fetchModulesWithProgress
  };
};
