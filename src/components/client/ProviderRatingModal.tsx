
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Star } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface ProviderRatingModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookingId: string;
  providerName: string;
  onRatingSubmitted: () => void;
}

export const ProviderRatingModal: React.FC<ProviderRatingModalProps> = ({
  isOpen,
  onClose,
  bookingId,
  providerName,
  onRatingSubmitted
}) => {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [review, setReview] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async () => {
    if (rating === 0) {
      toast({
        title: "Rating Required",
        description: "Please select a rating before submitting",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('bookings')
        .update({
          rating,
          review: review.trim() || null
        })
        .eq('id', bookingId);

      if (error) throw error;

      toast({
        title: "Rating Submitted",
        description: "Thank you for your feedback!"
      });

      onRatingSubmitted();
      onClose();
      
      // Reset form
      setRating(0);
      setReview('');
    } catch (error) {
      console.error('Error submitting rating:', error);
      toast({
        title: "Error",
        description: "Failed to submit rating. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStars = () => {
    return Array.from({ length: 5 }, (_, index) => {
      const starValue = index + 1;
      const isActive = starValue <= (hoveredRating || rating);
      
      return (
        <button
          key={index}
          type="button"
          onClick={() => setRating(starValue)}
          onMouseEnter={() => setHoveredRating(starValue)}
          onMouseLeave={() => setHoveredRating(0)}
          className="p-1 transition-colors"
        >
          <Star
            className={`h-8 w-8 transition-colors ${
              isActive ? 'text-yellow-400 fill-current' : 'text-gray-300'
            }`}
          />
        </button>
      );
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Rate {providerName}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-4">
              How would you rate your experience with this provider?
            </p>
            <div className="flex justify-center gap-1">
              {renderStars()}
            </div>
            {rating > 0 && (
              <p className="text-sm text-gray-500 mt-2">
                {rating} out of 5 stars
              </p>
            )}
          </div>

          <div>
            <label htmlFor="review" className="block text-sm font-medium mb-2">
              Review (Optional)
            </label>
            <Textarea
              id="review"
              placeholder="Share your experience with this provider..."
              value={review}
              onChange={(e) => setReview(e.target.value)}
              rows={4}
              maxLength={500}
            />
            <p className="text-xs text-gray-500 mt-1">
              {review.length}/500 characters
            </p>
          </div>

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1"
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              className="flex-1"
              disabled={isSubmitting || rating === 0}
            >
              {isSubmitting ? 'Submitting...' : 'Submit Rating'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
