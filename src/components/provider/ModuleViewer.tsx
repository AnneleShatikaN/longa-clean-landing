
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Youtube, FileText, HelpCircle, CheckCircle, AlertCircle } from 'lucide-react';
import { ModuleWithProgress, QuizQuestion, QuizSubmission } from '@/types/learning';
import { useProviderLearning } from '@/hooks/useProviderLearning';
import { EnhancedLoading } from '@/components/ui/enhanced-loading';

interface ModuleViewerProps {
  module: ModuleWithProgress;
  onBack: () => void;
}

export const ModuleViewer: React.FC<ModuleViewerProps> = ({ module, onBack }) => {
  const { fetchModuleQuestions, submitQuiz } = useProviderLearning();
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [answers, setAnswers] = useState<{ [questionId: string]: 'A' | 'B' | 'C' | 'D' }>({});
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showQuiz, setShowQuiz] = useState(false);

  const isCompleted = module.progress?.is_completed || false;

  useEffect(() => {
    const loadQuestions = async () => {
      setIsLoadingQuestions(true);
      const moduleQuestions = await fetchModuleQuestions(module.id);
      setQuestions(moduleQuestions);
      setIsLoadingQuestions(false);
    };

    loadQuestions();
  }, [module.id]);

  const getYouTubeEmbedUrl = (url: string): string => {
    const videoIdMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/);
    if (videoIdMatch) {
      return `https://www.youtube.com/embed/${videoIdMatch[1]}`;
    }
    return url;
  };

  const handleAnswerChange = (questionId: string, answer: 'A' | 'B' | 'C' | 'D') => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  const handleSubmitQuiz = async () => {
    const submissions: QuizSubmission[] = questions.map(q => ({
      question_id: q.id,
      selected_answer: answers[q.id]
    }));

    // Check if all questions are answered
    if (submissions.some(s => !s.selected_answer)) {
      alert('Please answer all questions before submitting.');
      return;
    }

    setIsSubmitting(true);
    const success = await submitQuiz(module.id, submissions);
    setIsSubmitting(false);

    if (success) {
      // Quiz passed, go back to module list
      setTimeout(() => onBack(), 2000);
    }
  };

  const allQuestionsAnswered = questions.length > 0 && questions.every(q => answers[q.id]);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Academy
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">{module.title}</h1>
          {isCompleted && (
            <div className="flex items-center gap-2 mt-1">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="text-sm text-green-600">Module Completed</span>
            </div>
          )}
        </div>
      </div>

      {/* Module Content */}
      <div className="space-y-6">
        {/* Description */}
        {module.description && (
          <Card>
            <CardContent className="p-6">
              <p className="text-gray-700">{module.description}</p>
            </CardContent>
          </Card>
        )}

        {/* Video Content */}
        {module.youtube_url && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Youtube className="h-5 w-5 text-red-600" />
                Training Video
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="aspect-video">
                <iframe
                  src={getYouTubeEmbedUrl(module.youtube_url)}
                  title={module.title}
                  className="w-full h-full rounded-lg"
                  allowFullScreen
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Additional Notes */}
        {module.notes && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Additional Notes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-50 p-4 rounded-lg">
                <pre className="whitespace-pre-wrap text-sm text-gray-700">
                  {module.notes}
                </pre>
              </div>
            </CardContent>
          </Card>
        )}

        {/* PDF Resource */}
        {module.notes_pdf_url && (
          <Card>
            <CardHeader>
              <CardTitle>PDF Resource</CardTitle>
            </CardHeader>
            <CardContent>
              <Button variant="outline" asChild>
                <a
                  href={module.notes_pdf_url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Download PDF Resource
                </a>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Quiz Section */}
      {questions.length > 0 && !isCompleted && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HelpCircle className="h-5 w-5" />
              Module Quiz
            </CardTitle>
            <p className="text-sm text-gray-600">
              You must answer all questions correctly to complete this module.
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            {isLoadingQuestions ? (
              <EnhancedLoading message="Loading quiz questions..." />
            ) : (
              <>
                {questions.map((question, index) => (
                  <div key={question.id} className="space-y-4">
                    <h3 className="font-medium text-gray-900">
                      Question {index + 1}: {question.question_text}
                    </h3>
                    
                    <RadioGroup
                      value={answers[question.id] || ''}
                      onValueChange={(value) => handleAnswerChange(question.id, value as 'A' | 'B' | 'C' | 'D')}
                    >
                      {(['A', 'B', 'C', 'D'] as const).map((option) => (
                        <div key={option} className="flex items-center space-x-2">
                          <RadioGroupItem value={option} id={`${question.id}-${option}`} />
                          <Label htmlFor={`${question.id}-${option}`} className="flex-1 cursor-pointer">
                            <span className="font-medium">{option}:</span>{' '}
                            {question[`option_${option.toLowerCase()}` as keyof QuizQuestion] as string}
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                  </div>
                ))}

                <div className="pt-6 border-t">
                  <Button
                    onClick={handleSubmitQuiz}
                    disabled={!allQuestionsAnswered || isSubmitting}
                    className="w-full"
                  >
                    {isSubmitting ? 'Submitting Quiz...' : 'Submit Quiz'}
                  </Button>
                  
                  {!allQuestionsAnswered && (
                    <p className="text-sm text-amber-600 mt-2 flex items-center gap-1">
                      <AlertCircle className="h-4 w-4" />
                      Please answer all questions to submit the quiz.
                    </p>
                  )}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      )}

      {/* Completion Status */}
      {isCompleted && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-6 w-6 text-green-600" />
              <div>
                <h3 className="font-semibold text-green-800">Module Completed!</h3>
                <p className="text-green-700 mt-1">
                  Score: {module.progress?.quiz_score}% - You have successfully completed this module.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
