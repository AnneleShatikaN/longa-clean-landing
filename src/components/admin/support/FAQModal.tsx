
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FAQ } from '@/hooks/useSupportData';

interface FAQModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (question: string, answer: string, category: string) => Promise<void>;
  onUpdate?: (id: string, updates: Partial<FAQ>) => Promise<void>;
  onDelete?: (id: string) => Promise<void>;
  faq?: FAQ | null;
  mode: 'add' | 'edit';
}

export const FAQModal: React.FC<FAQModalProps> = ({
  isOpen,
  onClose,
  onSave,
  onUpdate,
  onDelete,
  faq,
  mode
}) => {
  const [formData, setFormData] = useState({
    question: '',
    answer: '',
    category: 'General'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (mode === 'edit' && faq) {
      setFormData({
        question: faq.question,
        answer: faq.answer,
        category: faq.category
      });
    } else {
      setFormData({
        question: '',
        answer: '',
        category: 'General'
      });
    }
  }, [mode, faq, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.question.trim() || !formData.answer.trim()) return;

    setIsSubmitting(true);
    try {
      if (mode === 'add') {
        await onSave(formData.question, formData.answer, formData.category);
      } else if (mode === 'edit' && faq && onUpdate) {
        await onUpdate(faq.id, {
          question: formData.question,
          answer: formData.answer,
          category: formData.category
        });
      }
      onClose();
    } catch (error) {
      console.error('Error saving FAQ:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!faq || !onDelete) return;
    
    setIsSubmitting(true);
    try {
      await onDelete(faq.id);
      onClose();
    } catch (error) {
      console.error('Error deleting FAQ:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {mode === 'add' ? 'Add New FAQ' : 'Edit FAQ'}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium">Question</label>
            <Input
              value={formData.question}
              onChange={(e) => setFormData({ ...formData, question: e.target.value })}
              placeholder="Enter the question"
              required
            />
          </div>
          
          <div>
            <label className="text-sm font-medium">Category</label>
            <Select 
              value={formData.category} 
              onValueChange={(value) => setFormData({ ...formData, category: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="General">General</SelectItem>
                <SelectItem value="Bookings">Bookings</SelectItem>
                <SelectItem value="Payments">Payments</SelectItem>
                <SelectItem value="Providers">Providers</SelectItem>
                <SelectItem value="Technical">Technical</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <label className="text-sm font-medium">Answer</label>
            <Textarea
              value={formData.answer}
              onChange={(e) => setFormData({ ...formData, answer: e.target.value })}
              placeholder="Enter the detailed answer"
              rows={6}
              required
            />
          </div>
          
          <div className="flex justify-between">
            <div>
              {mode === 'edit' && onDelete && (
                <Button
                  type="button"
                  variant="destructive"
                  onClick={handleDelete}
                  disabled={isSubmitting}
                >
                  Delete FAQ
                </Button>
              )}
            </div>
            
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Saving...' : mode === 'add' ? 'Add FAQ' : 'Update FAQ'}
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
