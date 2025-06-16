
import React from 'react';
import { useSupabaseBookings } from '@/contexts/SupabaseBookingContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Star, Calendar, Clock, MapPin, User, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const MyServicesTab = () => {
  const { bookings, isLoading } = useSupabaseBookings();
  const navigate = useNavigate();

  // Group bookings by service and show latest booking for each
  const serviceBookings = bookings.reduce((acc, booking) => {
    const serviceId = booking.service_id;
    if (!acc[serviceId] || new Date(booking.created_at) > new Date(acc[serviceId].created_at)) {
      acc[serviceId] = booking;
    }
    return acc;
  }, {} as Record<string, any>);

  const uniqueServices = Object.values(serviceBookings);

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

  if (uniqueServices.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Star className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">No Services Booked</h3>
          <p className="text-gray-600 mb-6">
            You haven't booked any individual services yet. Start by browsing our marketplace.
          </p>
          <Button onClick={() => navigate('/search')}>
            Browse Services
          </Button>
        </CardContent>
      </Card>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'accepted': return 'bg-blue-100 text-blue-800';
      case 'in_progress': return 'bg-purple-100 text-purple-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">My Services</h3>
        <p className="text-sm text-gray-600">
          {uniqueServices.length} service{uniqueServices.length !== 1 ? 's' : ''} booked
        </p>
      </div>

      <div className="space-y-4">
        {uniqueServices.map((booking) => {
          const serviceBookings = bookings.filter(b => b.service_id === booking.service_id);
          const completedCount = serviceBookings.filter(b => b.status === 'completed').length;
          const totalBookings = serviceBookings.length;
          
          return (
            <Card key={booking.service_id}>
              <CardContent className="p-4">
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium mb-2">{booking.service?.name}</h4>
                      <div className="space-y-1 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          <span>Last booked: {booking.booking_date}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          <span>{booking.booking_time}</span>
                        </div>
                        {booking.provider && (
                          <div className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            <span>Provider: {booking.provider.full_name}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-1">
                          <Star className="h-3 w-3" />
                          <span>{completedCount}/{totalBookings} completed</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge className={getStatusColor(booking.status)}>
                        {booking.status.replace('_', ' ')}
                      </Badge>
                      <div className="text-lg font-medium mt-1">N${booking.total_amount}</div>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => navigate(`/service/${booking.service_id}`)}
                    >
                      <Eye className="h-3 w-3 mr-1" />
                      View Service
                    </Button>
                    <Button 
                      size="sm" 
                      onClick={() => navigate(`/book/${booking.service_id}`)}
                    >
                      <Calendar className="h-3 w-3 mr-1" />
                      Book Again
                    </Button>
                    {booking.status === 'completed' && (
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => navigate(`/rate/${booking.service_id}`)}
                      >
                        <Star className="h-3 w-3 mr-1" />
                        Rate Service
                      </Button>
                    )}
                  </div>

                  {totalBookings > 1 && (
                    <div className="text-xs text-gray-500 pt-2 border-t">
                      You have booked this service {totalBookings} time{totalBookings !== 1 ? 's' : ''}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
