
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { MessageSquare, Star, ThumbsUp, ThumbsDown, Send, CheckCircle } from 'lucide-react';
import { useEnhancedToast } from '@/hooks/useEnhancedToast';
import { usePerformanceMonitoring } from '@/hooks/usePerformanceMonitoring';

interface FeedbackData {
  type: 'bug' | 'feature' | 'general' | 'performance';
  rating: number;
  message: string;
  email?: string;
  page: string;
  userAgent: string;
  timestamp: number;
}

export const FeedbackSystem: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [feedback, setFeedback] = useState<Partial<FeedbackData>>({
    type: 'general',
    rating: 0,
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { toast } = useEnhancedToast();
  const { trackUserAction } = usePerformanceMonitoring();

  const handleRatingClick = (rating: number) => {
    setFeedback(prev => ({ ...prev, rating }));
    trackUserAction('feedback_rating_selected', { rating });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!feedback.message?.trim()) {
      toast.warning('Please provide feedback', 'Your message is required');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const feedbackData: FeedbackData = {
        type: feedback.type as FeedbackData['type'],
        rating: feedback.rating || 0,
        message: feedback.message,
        email: feedback.email,
        page: window.location.pathname,
        userAgent: navigator.userAgent,
        timestamp: Date.now(),
      };

      // In production, this would send to your feedback API
      await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(feedbackData),
      });

      trackUserAction('feedback_submitted', { 
        type: feedbackData.type, 
        rating: feedbackData.rating 
      });

      setIsSubmitted(true);
      toast.success('Thank you!', 'Your feedback has been submitted successfully');
      
      setTimeout(() => {
        setIsOpen(false);
        setIsSubmitted(false);
        setFeedback({ type: 'general', rating: 0, message: '' });
      }, 2000);
      
    } catch (error) {
      console.error('Failed to submit feedback:', error);
      toast.error('Submission failed', 'Please try again later');
    } finally {
      setIsSubmitting(false);
    }
  };

  const feedbackTypes = [
    { value: 'bug', label: 'Bug Report', color: 'bg-red-100 text-red-800' },
    { value: 'feature', label: 'Feature Request', color: 'bg-blue-100 text-blue-800' },
    { value: 'general', label: 'General Feedback', color: 'bg-green-100 text-green-800' },
    { value: 'performance', label: 'Performance Issue', color: 'bg-yellow-100 text-yellow-800' },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          className="fixed bottom-4 right-4 rounded-full w-12 h-12 shadow-lg z-50"
          onClick={() => trackUserAction('feedback_dialog_opened')}
        >
          <MessageSquare className="h-5 w-5" />
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <MessageSquare className="h-5 w-5" />
            <span>Send Feedback</span>
          </DialogTitle>
        </DialogHeader>

        {isSubmitted ? (
          <div className="py-8 text-center space-y-4">
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto" />
            <div>
              <h3 className="text-lg font-medium">Thank you!</h3>
              <p className="text-sm text-gray-500">Your feedback has been submitted successfully.</p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label>Feedback Type</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {feedbackTypes.map((type) => (
                  <Badge
                    key={type.value}
                    variant={feedback.type === type.value ? "default" : "outline"}
                    className={`cursor-pointer ${feedback.type === type.value ? type.color : ''}`}
                    onClick={() => setFeedback(prev => ({ ...prev, type: type.value as FeedbackData['type'] }))}
                  >
                    {type.label}
                  </Badge>
                ))}
              </div>
            </div>

            <div>
              <Label>How would you rate your experience?</Label>
              <div className="flex space-x-1 mt-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`h-6 w-6 cursor-pointer transition-colors ${
                      star <= (feedback.rating || 0) 
                        ? 'text-yellow-400 fill-current' 
                        : 'text-gray-300'
                    }`}
                    onClick={() => handleRatingClick(star)}
                  />
                ))}
              </div>
            </div>

            <div>
              <Label htmlFor="message">Your Feedback *</Label>
              <Textarea
                id="message"
                placeholder="Please share your thoughts, suggestions, or report any issues..."
                value={feedback.message}
                onChange={(e) => setFeedback(prev => ({ ...prev, message: e.target.value }))}
                className="mt-2"
                rows={4}
              />
            </div>

            <div>
              <Label htmlFor="email">Email (optional)</Label>
              <input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={feedback.email || ''}
                onChange={(e) => setFeedback(prev => ({ ...prev, email: e.target.value }))}
                className="w-full mt-2 px-3 py-2 border border-gray-300 rounded-md text-sm"
              />
              <p className="text-xs text-gray-500 mt-1">
                Only if you'd like us to follow up with you
              </p>
            </div>

            <Alert>
              <AlertDescription className="text-xs">
                This feedback will help us improve our service. Your information is kept private and secure.
              </AlertDescription>
            </Alert>

            <div className="flex space-x-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setIsOpen(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={isSubmitting || !feedback.message?.trim()}
                className="flex-1"
              >
                {isSubmitting ? (
                  'Sending...'
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Send Feedback
                  </>
                )}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};

// Quick feedback buttons for specific actions
export const QuickFeedback: React.FC<{ action: string; className?: string }> = ({ 
  action, 
  className = '' 
}) => {
  const { toast } = useEnhancedToast();
  const { trackUserAction } = usePerformanceMonitoring();

  const handleQuickFeedback = (type: 'positive' | 'negative') => {
    trackUserAction('quick_feedback', { action, type });
    
    if (type === 'positive') {
      toast.success('Thanks!', 'Glad you found this helpful');
    } else {
      toast.info('Feedback noted', 'We\'ll work on improving this');
    }
  };

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <span className="text-sm text-gray-500">Was this helpful?</span>
      <Button
        size="sm"
        variant="ghost"
        onClick={() => handleQuickFeedback('positive')}
        className="h-8 w-8 p-0"
      >
        <ThumbsUp className="h-4 w-4" />
      </Button>
      <Button
        size="sm"
        variant="ghost"
        onClick={() => handleQuickFeedback('negative')}
        className="h-8 w-8 p-0"
      >
        <ThumbsDown className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default FeedbackSystem;
