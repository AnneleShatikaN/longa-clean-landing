
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Calendar, Clock, MapPin, Star, User, DollarSign, MessageSquare, RotateCcw } from 'lucide-react';
import { format } from 'date-fns';

interface BookingDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: any;
  onRebook?: (providerId: string, serviceId: string) => void;
  onRate?: (bookingId: string) => void;
}

export const BookingDetailsModal: React.FC<BookingDetailsModalProps> = ({
  isOpen,
  onClose,
  booking,
  onRebook,
  onRate
}) => {
  if (!booking) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'accepted': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const canRate = booking.status === 'completed' && !booking.rating;
  const canRebook = booking.status === 'completed' && booking.provider_id;

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Star
        key={index}
        className={`h-4 w-4 ${
          index < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
        }`}
      />
    ));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Booking Details
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Header Info */}
          <Card>
            <CardContent className="p-4">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="text-lg font-semibold">{booking.service?.name}</h3>
                  <p className="text-gray-600">{booking.service?.description}</p>
                </div>
                <Badge className={getStatusColor(booking.status)}>
                  {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                </Badge>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <span>{format(new Date(booking.booking_date), 'EEEE, MMMM d, yyyy')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-gray-500" />
                  <span>{booking.booking_time} ({booking.duration_minutes} min)</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-gray-500" />
                  <span className="capitalize">{booking.location_town || 'Windhoek'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-gray-500" />
                  <span>N${booking.total_amount}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Provider Info */}
          {booking.provider && (
            <Card>
              <CardContent className="p-4">
                <h4 className="font-medium mb-3 flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Service Provider
                </h4>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{booking.provider.full_name}</p>
                    <div className="flex items-center gap-1 text-sm text-gray-600">
                      <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                      <span>{booking.provider.rating || 0} rating</span>
                      <span>• {booking.provider.total_jobs || 0} jobs</span>
                    </div>
                  </div>
                  {canRebook && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onRebook?.(booking.provider_id, booking.service_id)}
                      className="flex items-center gap-1"
                    >
                      <RotateCcw className="h-3 w-3" />
                      Rebook
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Special Instructions */}
          {booking.special_instructions && (
            <Card>
              <CardContent className="p-4">
                <h4 className="font-medium mb-2">Special Instructions</h4>
                <p className="text-gray-700 text-sm">{booking.special_instructions}</p>
              </CardContent>
            </Card>
          )}

          {/* Provider Visit Notes */}
          {booking.visit_notes && (
            <Card>
              <CardContent className="p-4">
                <h4 className="font-medium mb-2">Provider Visit Notes</h4>
                <p className="text-gray-700 text-sm">{booking.visit_notes}</p>
              </CardContent>
            </Card>
          )}

          {/* Service Photos */}
          {(booking.before_photos?.length > 0 || booking.after_photos?.length > 0) && (
            <Card>
              <CardContent className="p-4">
                <h4 className="font-medium mb-3">Service Documentation</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {booking.before_photos?.length > 0 && (
                    <div>
                      <p className="text-sm font-medium mb-2">Before Photos</p>
                      <div className="grid grid-cols-2 gap-2">
                        {booking.before_photos.slice(0, 4).map((photo: string, index: number) => (
                          <img
                            key={index}
                            src={photo}
                            alt={`Before ${index + 1}`}
                            className="w-full h-20 object-cover rounded border"
                          />
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {booking.after_photos?.length > 0 && (
                    <div>
                      <p className="text-sm font-medium mb-2">After Photos</p>
                      <div className="grid grid-cols-2 gap-2">
                        {booking.after_photos.slice(0, 4).map((photo: string, index: number) => (
                          <img
                            key={index}
                            src={photo}
                            alt={`After ${index + 1}`}
                            className="w-full h-20 object-cover rounded border"
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Issues Found */}
          {booking.issues_found?.length > 0 && (
            <Card>
              <CardContent className="p-4">
                <h4 className="font-medium mb-2">Issues Reported</h4>
                <div className="space-y-1">
                  {booking.issues_found.map((issue: string, index: number) => (
                    <div key={index} className="text-sm text-amber-700 bg-amber-50 p-2 rounded">
                      • {issue}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Rating & Review */}
          {booking.status === 'completed' && (
            <Card>
              <CardContent className="p-4">
                <h4 className="font-medium mb-3 flex items-center gap-2">
                  <Star className="h-4 w-4" />
                  Your Rating & Review
                </h4>
                
                {booking.rating ? (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="flex">
                        {renderStars(booking.rating)}
                      </div>
                      <span className="font-medium">{booking.rating} out of 5 stars</span>
                    </div>
                    {booking.review && (
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <div className="flex items-start gap-2">
                          <MessageSquare className="h-4 w-4 text-gray-500 mt-0.5" />
                          <p className="text-sm text-gray-700">"{booking.review}"</p>
                        </div>
                      </div>
                    )}
                  </div>
                ) : canRate ? (
                  <div className="text-center py-4">
                    <p className="text-gray-600 mb-3">How was your experience?</p>
                    <Button onClick={() => onRate?.(booking.id)}>
                      <Star className="h-4 w-4 mr-2" />
                      Rate This Service
                    </Button>
                  </div>
                ) : null}
              </CardContent>
            </Card>
          )}

          {/* Quality Score */}
          {booking.quality_score && (
            <Card>
              <CardContent className="p-4">
                <h4 className="font-medium mb-2">Service Quality</h4>
                <div className="flex items-center gap-2">
                  <div className="flex">
                    {renderStars(booking.quality_score)}
                  </div>
                  <span className="text-sm text-gray-600">
                    Provider self-rated quality: {booking.quality_score}/5
                  </span>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Emergency Badge */}
          {booking.emergency_booking && (
            <div className="flex justify-center">
              <Badge variant="destructive" className="px-3 py-1">
                Emergency Booking
              </Badge>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
