
import React, { useState } from 'react';
import { useSupabaseBookings } from '@/contexts/SupabaseBookingContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, Clock, User, MapPin, DollarSign, Filter, Star, ExternalLink, AlertTriangle } from 'lucide-react';
import { ProviderRatingModal } from './ProviderRatingModal';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

export const BookingsTab = () => {
  const { bookings, isLoading, cancelBooking } = useSupabaseBookings();
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [ratingModal, setRatingModal] = useState<{
    isOpen: boolean;
    bookingId: string;
    providerName: string;
  }>({
    isOpen: false,
    bookingId: '',
    providerName: ''
  });
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const filteredBookings = statusFilter === 'all' 
    ? bookings 
    : bookings.filter(booking => booking.status === statusFilter);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'accepted': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'in_progress': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return '✅';
      case 'pending': return '⏳';
      case 'accepted': return '👍';
      case 'in_progress': return '🔄';
      case 'cancelled': return '❌';
      default: return '📋';
    }
  };

  const handleRateProvider = (bookingId: string, providerName: string) => {
    setRatingModal({
      isOpen: true,
      bookingId,
      providerName
    });
  };

  const handleViewProviderProfile = (providerId: string) => {
    navigate(`/provider/${providerId}`);
  };

  const handleCancelBooking = async (bookingId: string) => {
    if (window.confirm('Are you sure you want to cancel this booking?')) {
      try {
        await cancelBooking(bookingId, 'Cancelled by client');
        toast({
          title: "Booking Cancelled",
          description: "Your booking has been cancelled successfully.",
        });
      } catch (error) {
        toast({
          title: "Cancel Failed",
          description: "There was an error cancelling your booking. Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  const canRateProvider = (booking: any) => {
    return booking.status === 'completed' && 
           booking.provider && 
           !booking.rating;
  };

  const canCancelBooking = (booking: any) => {
    return booking.status === 'pending' || booking.status === 'accepted';
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-4">
              <div className="space-y-3">
                <div className="h-5 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              My Bookings
            </CardTitle>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="accepted">Accepted</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600">
            Showing {filteredBookings.length} of {bookings.length} booking{bookings.length !== 1 ? 's' : ''}
          </p>
        </CardContent>
      </Card>

      {filteredBookings.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">
              {statusFilter === 'all' ? 'No Bookings Yet' : `No ${statusFilter} Bookings`}
            </h3>
            <p className="text-gray-600 mb-6">
              {statusFilter === 'all' 
                ? "You haven't made any bookings yet. Start by browsing our services."
                : `You don't have any ${statusFilter} bookings at the moment.`
              }
            </p>
            {statusFilter === 'all' && (
              <Button onClick={() => navigate('/search')}>
                Browse Services
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredBookings.map((booking) => (
            <Card key={booking.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-medium">{booking.service?.name}</h4>
                        <Badge className={getStatusColor(booking.status)}>
                          {getStatusIcon(booking.status)} {booking.status.replace('_', ' ')}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          <span>{booking.booking_date}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          <span>{booking.booking_time}</span>
                        </div>
                        {booking.provider ? (
                          <div className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            <button
                              onClick={() => handleViewProviderProfile(booking.provider!.id)}
                              className="text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1"
                            >
                              {booking.provider.full_name}
                              <ExternalLink className="h-3 w-3" />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            <span className="text-gray-500 italic">Provider pending</span>
                          </div>
                        )}
                        {booking.location_town && (
                          <div className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            <span>{booking.location_town}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="flex items-center gap-1 text-lg font-medium">
                        <DollarSign className="h-4 w-4" />
                        N${booking.total_amount}
                      </div>
                      <div className="text-xs text-gray-500">
                        {booking.duration_minutes && `${booking.duration_minutes} min`}
                      </div>
                    </div>
                  </div>

                  {booking.special_instructions && (
                    <div className="p-2 bg-gray-50 rounded text-sm">
                      <strong>Instructions:</strong> {booking.special_instructions}
                    </div>
                  )}

                  {booking.emergency_booking && (
                    <Badge variant="destructive" className="text-xs">
                      🚨 Emergency Booking
                    </Badge>
                  )}

                  {/* Action Buttons */}
                  <div className="flex items-center justify-between pt-2 border-t">
                    <div>
                      {booking.rating && (
                        <div className="flex items-center gap-1 text-sm">
                          <span>Your Rating:</span>
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-4 w-4 ${
                                i < booking.rating! ? 'text-yellow-400 fill-current' : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex gap-2">
                      {canCancelBooking(booking) && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleCancelBooking(booking.id)}
                          className="flex items-center gap-1 text-red-600 border-red-300 hover:bg-red-50"
                        >
                          <AlertTriangle className="h-3 w-3" />
                          Cancel Booking
                        </Button>
                      )}
                      
                      {canRateProvider(booking) && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleRateProvider(booking.id, booking.provider!.full_name)}
                          className="flex items-center gap-1"
                        >
                          <Star className="h-3 w-3" />
                          Rate Provider
                        </Button>
                      )}
                    </div>
                  </div>

                  <div className="text-xs text-gray-500 pt-2 border-t">
                    Booked on {new Date(booking.created_at).toLocaleDateString()}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <ProviderRatingModal
        isOpen={ratingModal.isOpen}
        onClose={() => setRatingModal({ isOpen: false, bookingId: '', providerName: '' })}
        bookingId={ratingModal.bookingId}
        providerName={ratingModal.providerName}
        onRatingSubmitted={() => {
          // Refresh bookings or update local state
          window.location.reload();
        }}
      />
    </div>
  );
};
