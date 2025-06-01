
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { 
  MapPin, 
  Clock, 
  CheckCircle, 
  Camera, 
  MessageSquare, 
  Star,
  Navigation,
  User,
  Phone
} from 'lucide-react';
import { Booking } from '@/contexts/BookingContext';

interface JobTrackerProps {
  booking: Booking;
  onStatusUpdate: (status: Booking['status']) => void;
  onRatingSubmit: (rating: number, comment: string) => void;
}

export const JobTracker: React.FC<JobTrackerProps> = ({
  booking,
  onStatusUpdate,
  onRatingSubmit
}) => {
  const [jobProgress, setJobProgress] = useState(0);
  const [rating, setRating] = useState(0);
  const [reviewComment, setReviewComment] = useState('');
  const [checkInTime, setCheckInTime] = useState<string | null>(null);

  useEffect(() => {
    // Simulate job progress based on status
    switch (booking.status) {
      case 'pending':
        setJobProgress(10);
        break;
      case 'accepted':
        setJobProgress(25);
        break;
      case 'in-progress':
        setJobProgress(60);
        if (!checkInTime) {
          setCheckInTime(new Date().toLocaleTimeString());
        }
        break;
      case 'completed':
        setJobProgress(100);
        break;
      default:
        setJobProgress(0);
    }
  }, [booking.status, checkInTime]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'accepted': return 'bg-blue-100 text-blue-800';
      case 'in-progress': return 'bg-purple-100 text-purple-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getJobSteps = () => {
    const steps = [
      { label: 'Booking Confirmed', completed: ['accepted', 'in-progress', 'completed'].includes(booking.status) },
      { label: 'Provider En Route', completed: ['in-progress', 'completed'].includes(booking.status) },
      { label: 'Service Started', completed: ['in-progress', 'completed'].includes(booking.status) },
      { label: 'Service Completed', completed: booking.status === 'completed' }
    ];
    return steps;
  };

  const handleRatingSubmit = () => {
    if (rating > 0) {
      onRatingSubmit(rating, reviewComment);
    }
  };

  const simulateStatusUpdate = (newStatus: Booking['status']) => {
    onStatusUpdate(newStatus);
  };

  return (
    <div className="space-y-6">
      {/* Job Status Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Job Tracking
            </CardTitle>
            <Badge className={getStatusColor(booking.status)}>
              {booking.status.replace('-', ' ').toUpperCase()}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h3 className="font-medium text-gray-900">{booking.serviceName}</h3>
              <p className="text-sm text-gray-600">
                {booking.date} at {booking.time} • N${booking.amount}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="bg-blue-100 p-2 rounded-full">
                <User className="h-4 w-4 text-blue-600" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-sm">{booking.providerName}</p>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <Phone className="h-3 w-3" />
                  <span>+264 81 234 5678</span>
                  <MessageSquare className="h-3 w-3 ml-2" />
                  <span>Message</span>
                </div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Progress</span>
                <span>{jobProgress}%</span>
              </div>
              <Progress value={jobProgress} className="h-2" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Job Steps */}
      <Card>
        <CardHeader>
          <CardTitle>Job Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {getJobSteps().map((step, index) => (
              <div key={index} className="flex items-center gap-3">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                  step.completed ? 'bg-green-500' : 'bg-gray-200'
                }`}>
                  {step.completed ? (
                    <CheckCircle className="h-4 w-4 text-white" />
                  ) : (
                    <span className="text-xs text-gray-500">{index + 1}</span>
                  )}
                </div>
                <span className={`text-sm ${step.completed ? 'text-green-600 font-medium' : 'text-gray-500'}`}>
                  {step.label}
                </span>
                {step.label === 'Service Started' && checkInTime && (
                  <span className="text-xs text-gray-400 ml-auto">
                    Started at {checkInTime}
                  </span>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Real-time Updates */}
      {booking.status === 'accepted' && (
        <Card>
          <CardContent className="pt-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Navigation className="h-4 w-4 text-blue-600" />
                <span className="font-medium text-blue-900">Provider is on the way</span>
              </div>
              <p className="text-sm text-blue-700">
                Estimated arrival: 15-20 minutes
              </p>
              <Button 
                size="sm" 
                className="mt-3"
                onClick={() => simulateStatusUpdate('in-progress')}
              >
                Simulate Provider Arrival
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Photo Updates */}
      {booking.status === 'in-progress' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Camera className="h-5 w-5" />
              Progress Photos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-100 aspect-square rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <Camera className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-xs text-gray-500">Before photo</p>
                </div>
              </div>
              <div className="bg-gray-100 aspect-square rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <Camera className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-xs text-gray-500">In progress</p>
                </div>
              </div>
            </div>
            <Button 
              className="w-full mt-4"
              onClick={() => simulateStatusUpdate('completed')}
            >
              Simulate Job Completion
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Rating & Review */}
      {booking.status === 'completed' && !booking.rating && (
        <Card>
          <CardHeader>
            <CardTitle>Rate Your Experience</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rate the service
              </label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setRating(star)}
                    className={`p-1 ${rating >= star ? 'text-yellow-500' : 'text-gray-300'}`}
                  >
                    <Star className="h-6 w-6 fill-current" />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Leave a review (optional)
              </label>
              <Textarea
                placeholder="Tell us about your experience..."
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                rows={3}
              />
            </div>

            <Button 
              onClick={handleRatingSubmit}
              disabled={rating === 0}
              className="w-full"
            >
              Submit Rating
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Completed Job Summary */}
      {booking.status === 'completed' && booking.rating && (
        <Card>
          <CardContent className="pt-6">
            <div className="bg-green-50 p-4 rounded-lg text-center">
              <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <h3 className="font-medium text-green-900">Job Completed!</h3>
              <p className="text-sm text-green-700 mt-1">
                Thank you for choosing our service. Your rating: {booking.rating} ⭐
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
