
import React, { useState, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, X, Clock, MapPin, DollarSign, User } from 'lucide-react';
import { format } from 'date-fns';
import { useMobileUtils } from '@/hooks/useMobileUtils';

interface SwipeableJobCardProps {
  job: any;
  onAccept: (jobId: string) => void;
  onDecline: (jobId: string) => void;
}

export const SwipeableJobCard: React.FC<SwipeableJobCardProps> = ({
  job,
  onAccept,
  onDecline
}) => {
  const [swipeOffset, setSwipeOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const startX = useRef(0);
  const { handleTouchFeedback, vibrate } = useMobileUtils();

  const handleTouchStart = (e: React.TouchEvent) => {
    startX.current = e.touches[0].clientX;
    setIsDragging(true);
    handleTouchFeedback();
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    
    const currentX = e.touches[0].clientX;
    const diff = currentX - startX.current;
    setSwipeOffset(Math.max(-150, Math.min(150, diff)));
  };

  const handleTouchEnd = () => {
    if (Math.abs(swipeOffset) > 80) {
      vibrate([50, 50, 100]);
      if (swipeOffset > 0) {
        onAccept(job.id);
      } else {
        onDecline(job.id);
      }
    }
    setSwipeOffset(0);
    setIsDragging(false);
  };

  const getBackgroundColor = () => {
    if (swipeOffset > 50) return 'bg-green-100';
    if (swipeOffset < -50) return 'bg-red-100';
    return 'bg-white';
  };

  const getSwipeIndicator = () => {
    if (swipeOffset > 50) {
      return (
        <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-green-600">
          <CheckCircle className="h-8 w-8" />
        </div>
      );
    }
    if (swipeOffset < -50) {
      return (
        <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-red-600">
          <X className="h-8 w-8" />
        </div>
      );
    }
    return null;
  };

  return (
    <div className="relative overflow-hidden">
      {/* Swipe indicators */}
      <div className="absolute inset-0 flex items-center justify-between px-4 pointer-events-none">
        <div className="text-green-600 opacity-50">
          <CheckCircle className="h-12 w-12" />
          <div className="text-sm font-semibold mt-1">Accept</div>
        </div>
        <div className="text-red-600 opacity-50">
          <X className="h-12 w-12" />
          <div className="text-sm font-semibold mt-1">Decline</div>
        </div>
      </div>

      <Card 
        className={`border-2 transition-all duration-200 ${getBackgroundColor()} ${
          isDragging ? 'scale-105 shadow-lg' : ''
        }`}
        style={{ transform: `translateX(${swipeOffset}px)` }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {getSwipeIndicator()}
        
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-800">{job.service?.name}</h2>
              <div className="text-3xl font-bold text-green-600 mt-2">N${job.total_amount}</div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-3 text-lg">
                <User className="h-6 w-6 text-gray-600" />
                <span>{job.client?.full_name}</span>
              </div>
              <div className="flex items-center gap-3 text-lg">
                <Clock className="h-6 w-6 text-gray-600" />
                <span>{format(new Date(job.booking_date), 'MMM dd')} at {job.booking_time}</span>
              </div>
              <div className="flex items-center gap-3 text-lg">
                <MapPin className="h-6 w-6 text-gray-600" />
                <span>{job.location_town}</span>
              </div>
            </div>

            <div className="text-center text-gray-500 text-sm mt-4">
              Swipe right to accept • Swipe left to decline
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
