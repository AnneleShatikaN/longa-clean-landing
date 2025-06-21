
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useLearningModules } from '@/hooks/useLearningModules';

interface QuestionFormProps {
  isOpen: boolean;
  onClose: () => void;
  moduleId: string | null;
  onSuccess: () => void;
}

export const QuestionForm: React.FC<QuestionFormProps> = ({
  isOpen,
  onClose,
  moduleId,
  onSuccess
}) => {
  const { createQuestion } = useLearningModules();
  
  const [formData, setFormData] = useState({
    question_text: '',
    option_a: '',
    option_b: '',
    option_c: '',
    option_d: '',
    correct_answer: 'A' as 'A' | 'B' | 'C' | 'D',
    explanation: '',
    question_order: 0
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!moduleId) return;
    
    setIsSubmitting(true);

    try {
      await createQuestion({
        ...formData,
        module_id: moduleId
      });
      
      // Reset form
      setFormData({
        question_text: '',
        option_a: '',
        option_b: '',
        option_c: '',
        option_d: '',
        correct_answer: 'A',
        explanation: '',
        question_order: 0
      });
      
      onSuccess();
    } catch (error) {
      console.error('Failed to create question:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormValid = formData.question_text.trim() && 
                     formData.option_a.trim() && 
                     formData.option_b.trim() && 
                     formData.option_c.trim() && 
                     formData.option_d.trim();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Quiz Question</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="question_order">Question Order</Label>
            <Input
              id="question_order"
              type="number"
              value={formData.question_order}
              onChange={(e) => setFormData({ ...formData, question_order: parseInt(e.target.value) || 0 })}
              min="0"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="question_text">Question *</Label>
            <Textarea
              id="question_text"
              value={formData.question_text}
              onChange={(e) => setFormData({ ...formData, question_text: e.target.value })}
              placeholder="Enter your quiz question..."
              rows={3}
              required
            />
          </div>

          <div className="space-y-4">
            <Label>Answer Options *</Label>
            
            <div className="grid grid-cols-1 gap-4">
              {(['A', 'B', 'C', 'D'] as const).map((option) => (
                <div key={option} className="space-y-2">
                  <Label htmlFor={`option_${option.toLowerCase()}`}>
                    Option {option}
                  </Label>
                  <Input
                    id={`option_${option.toLowerCase()}`}
                    value={formData[`option_${option.toLowerCase()}` as keyof typeof formData] as string}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      [`option_${option.toLowerCase()}`]: e.target.value 
                    })}
                    placeholder={`Enter option ${option}...`}
                    required
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <Label>Correct Answer *</Label>
            <RadioGroup
              value={formData.correct_answer}
              onValueChange={(value) => setFormData({ ...formData, correct_answer: value as 'A' | 'B' | 'C' | 'D' })}
            >
              {(['A', 'B', 'C', 'D'] as const).map((option) => (
                <div key={option} className="flex items-center space-x-2">
                  <RadioGroupItem value={option} id={`correct_${option}`} />
                  <Label htmlFor={`correct_${option}`} className="flex-1">
                    Option {option}: {formData[`option_${option.toLowerCase()}` as keyof typeof formData] as string || `Option ${option}`}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label htmlFor="explanation">Explanation (Optional)</Label>
            <Textarea
              id="explanation"
              value={formData.explanation}
              onChange={(e) => setFormData({ ...formData, explanation: e.target.value })}
              placeholder="Explain why this is the correct answer..."
              rows={3}
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || !isFormValid}>
              {isSubmitting ? 'Creating...' : 'Create Question'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
