
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, MapPin, Star, Eye, User } from 'lucide-react';
import { useSupabaseBookings } from '@/contexts/SupabaseBookingContext';
import { format } from 'date-fns';
import { BookingDetailsModal } from './BookingDetailsModal';
import { RebookingModal } from './RebookingModal';
import { ProviderRatingModal } from './ProviderRatingModal';

export const BookingsTab: React.FC = () => {
  const { bookings, refetchBookings } = useSupabaseBookings();
  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showRebookModal, setShowRebookModal] = useState(false);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [rebookData, setRebookData] = useState<{ providerId: string; serviceId: string; providerName?: string; serviceName?: string }>({
    providerId: '',
    serviceId: ''
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'accepted': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleViewDetails = (booking: any) => {
    setSelectedBooking(booking);
    setShowDetailsModal(true);
  };

  const handleRebook = (providerId: string, serviceId: string) => {
    setRebookData({
      providerId,
      serviceId,
      providerName: selectedBooking?.provider?.full_name,
      serviceName: selectedBooking?.service?.name
    });
    setShowDetailsModal(false);
    setShowRebookModal(true);
  };

  const handleRate = (bookingId: string) => {
    setShowDetailsModal(false);
    setShowRatingModal(true);
  };

  const handleRatingSubmitted = () => {
    refetchBookings();
    setShowRatingModal(false);
  };

  const sortedBookings = [...bookings].sort((a, b) => 
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  if (bookings.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Bookings Yet</h3>
            <p className="text-gray-600 mb-4">You haven't made any bookings yet.</p>
            <Button onClick={() => window.location.href = '/services'}>
              Browse Services
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Your Bookings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {sortedBookings.map((booking) => (
              <Card key={booking.id} className="border">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <h4 className="font-medium">{booking.service?.name}</h4>
                      <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {format(new Date(booking.booking_date), 'MMM dd, yyyy')}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {booking.booking_time}
                        </div>
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          <span className="capitalize">{booking.location_town || 'Windhoek'}</span>
                        </div>
                      </div>
                    </div>
                    <Badge className={getStatusColor(booking.status)}>
                      {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                    </Badge>
                  </div>

                  {booking.provider && (
                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                      <User className="h-3 w-3" />
                      <span>Provider: {booking.provider.full_name}</span>
                      {booking.provider.rating > 0 && (
                        <>
                          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                          <span>{booking.provider.rating}</span>
                        </>
                      )}
                    </div>
                  )}

                  {booking.status === 'completed' && booking.rating && (
                    <div className="flex items-center gap-2 text-sm mb-3">
                      <span className="text-gray-600">Your rating:</span>
                      <div className="flex">
                        {Array.from({ length: 5 }, (_, i) => (
                          <Star
                            key={i}
                            className={`h-3 w-3 ${
                              i < booking.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="font-medium">{booking.rating}/5</span>
                    </div>
                  )}

                  <div className="flex justify-between items-center">
                    <div className="font-medium text-lg">N${booking.total_amount}</div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewDetails(booking)}
                      className="flex items-center gap-1"
                    >
                      <Eye className="h-3 w-3" />
                      View Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Modals */}
      <BookingDetailsModal
        isOpen={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
        booking={selectedBooking}
        onRebook={handleRebook}
        onRate={handleRate}
      />

      <RebookingModal
        isOpen={showRebookModal}
        onClose={() => setShowRebookModal(false)}
        providerId={rebookData.providerId}
        serviceId={rebookData.serviceId}
        providerName={rebookData.providerName}
        serviceName={rebookData.serviceName}
      />

      {selectedBooking && (
        <ProviderRatingModal
          isOpen={showRatingModal}
          onClose={() => setShowRatingModal(false)}
          bookingId={selectedBooking.id}
          providerName={selectedBooking.provider?.full_name || 'Provider'}
          onRatingSubmitted={handleRatingSubmitted}
        />
      )}
    </div>
  );
};
