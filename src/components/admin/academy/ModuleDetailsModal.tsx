
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Youtube, FileText, HelpCircle, Trash2 } from 'lucide-react';
import { LearningModule, QuizQuestion } from '@/types/learning';
import { useLearningModules } from '@/hooks/useLearningModules';

interface ModuleDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  moduleId: string | null;
  module?: LearningModule;
  questions: QuizQuestion[];
  onAddQuestion: () => void;
}

export const ModuleDetailsModal: React.FC<ModuleDetailsModalProps> = ({
  isOpen,
  onClose,
  moduleId,
  module,
  questions,
  onAddQuestion
}) => {
  const { deleteQuestion, fetchQuestions } = useLearningModules();

  const handleDeleteQuestion = async (questionId: string) => {
    if (!moduleId) return;
    
    if (window.confirm('Are you sure you want to delete this question?')) {
      const success = await deleteQuestion(questionId, moduleId);
      if (success) {
        fetchQuestions(moduleId);
      }
    }
  };

  const getYouTubeEmbedUrl = (url: string): string => {
    const videoIdMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/);
    if (videoIdMatch) {
      return `https://www.youtube.com/embed/${videoIdMatch[1]}`;
    }
    return url;
  };

  if (!module) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span>{module.title}</span>
            <Badge variant={module.is_published ? 'default' : 'secondary'}>
              {module.is_published ? 'Published' : 'Draft'}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Module Content */}
          <div className="space-y-4">
            {module.description && (
              <div>
                <h3 className="font-semibold mb-2">Description</h3>
                <p className="text-gray-600">{module.description}</p>
              </div>
            )}

            {module.youtube_url && (
              <div>
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  <Youtube className="h-4 w-4" />
                  Video Content
                </h3>
                <div className="aspect-video">
                  <iframe
                    src={getYouTubeEmbedUrl(module.youtube_url)}
                    title={module.title}
                    className="w-full h-full rounded-lg"
                    allowFullScreen
                  />
                </div>
              </div>
            )}

            {module.notes && (
              <div>
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Additional Notes
                </h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <pre className="whitespace-pre-wrap text-sm">{module.notes}</pre>
                </div>
              </div>
            )}

            {module.notes_pdf_url && (
              <div>
                <h3 className="font-semibold mb-2">PDF Resource</h3>
                <a
                  href={module.notes_pdf_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  Download PDF Resource
                </a>
              </div>
            )}
          </div>

          {/* Quiz Questions */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold flex items-center gap-2">
                <HelpCircle className="h-4 w-4" />
                Quiz Questions ({questions.length})
              </h3>
              <Button onClick={onAddQuestion} size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Question
              </Button>
            </div>

            {questions.length === 0 ? (
              <Card>
                <CardContent className="text-center py-8">
                  <HelpCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-4">No quiz questions yet</p>
                  <Button onClick={onAddQuestion}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add First Question
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {questions.map((question, index) => (
                  <Card key={question.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <CardTitle className="text-base">
                          Question {index + 1}
                        </CardTitle>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteQuestion(question.id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="font-medium">{question.question_text}</p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {(['A', 'B', 'C', 'D'] as const).map((option) => (
                          <div
                            key={option}
                            className={`p-2 rounded border ${
                              question.correct_answer === option
                                ? 'bg-green-50 border-green-200 text-green-800'
                                : 'bg-gray-50 border-gray-200'
                            }`}
                          >
                            <span className="font-medium">{option}:</span> {question[`option_${option.toLowerCase()}` as keyof QuizQuestion]}
                          </div>
                        ))}
                      </div>

                      {question.explanation && (
                        <div className="bg-blue-50 p-3 rounded border border-blue-200">
                          <p className="text-sm">
                            <span className="font-medium text-blue-800">Explanation:</span>{' '}
                            <span className="text-blue-700">{question.explanation}</span>
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <Button onClick={onClose}>Close</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
