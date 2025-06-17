
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useServices } from '@/contexts/ServiceContext';
import { useSupabaseBookings } from '@/contexts/SupabaseBookingContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { Calendar, Clock, User, DollarSign, ArrowRight, Package, Star } from 'lucide-react';

export const SimplifiedDashboardOverview = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { getActiveServices, isLoading: servicesLoading } = useServices();
  const { bookings, isLoading: bookingsLoading } = useSupabaseBookings();
  
  const activeServices = getActiveServices();
  const upcomingBookings = bookings
    .filter(b => b.status === 'pending' || b.status === 'accepted')
    .slice(0, 3);

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    if (hours > 0) {
      return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
    }
    return `${minutes}m`;
  };

  const handleBookService = (serviceId: string) => {
    navigate(`/one-off-booking?service=${serviceId}`);
  };

  if (servicesLoading || bookingsLoading) {
    return (
      <div className="space-y-6 p-4">
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 bg-gray-200 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 max-w-4xl mx-auto">
      {/* Welcome Section */}
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, {user?.full_name?.split(' ')[0] || 'Client'}!
        </h1>
        <p className="text-gray-600">Book services quickly and easily</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="text-center">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-600">{bookings.length}</div>
            <div className="text-sm text-gray-600">Total Bookings</div>
          </CardContent>
        </Card>
        <Card className="text-center">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">
              {bookings.filter(b => b.status === 'completed').length}
            </div>
            <div className="text-sm text-gray-600">Completed</div>
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Bookings */}
      {upcomingBookings.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Upcoming Bookings
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/client-dashboard')}
                className="text-blue-600 hover:text-blue-800"
              >
                View All
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {upcomingBookings.map((booking) => (
              <div key={booking.id} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <div className="flex-1">
                  <div className="font-medium text-sm">{booking.service?.name}</div>
                  <div className="text-xs text-gray-600 flex items-center gap-2">
                    <span>{booking.booking_date}</span>
                    <span>{booking.booking_time}</span>
                  </div>
                </div>
                <Badge variant={booking.status === 'accepted' ? 'default' : 'secondary'}>
                  {booking.status}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Available Services */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5" />
            Available Services
          </CardTitle>
          <p className="text-sm text-gray-600">Tap to book instantly</p>
        </CardHeader>
        <CardContent>
          {activeServices.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600 mb-4">No services available at the moment</p>
              <Button onClick={() => navigate('/subscription-packages')}>
                View Packages
              </Button>
            </div>
          ) : (
            <div className="grid gap-3">
              {activeServices.slice(0, 6).map((service) => (
                <div
                  key={service.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:shadow-md transition-shadow"
                >
                  <div className="flex-1">
                    <h3 className="font-medium">{service.name}</h3>
                    <p className="text-sm text-gray-600 line-clamp-1">{service.description}</p>
                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <DollarSign className="h-3 w-3" />
                        N${service.clientPrice}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatDuration(service.duration.minutes + (service.duration.hours * 60))}
                      </span>
                    </div>
                  </div>
                  <Button 
                    onClick={() => handleBookService(service.id)}
                    className="ml-4 bg-blue-600 hover:bg-blue-700"
                  >
                    Book Now
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Button
          onClick={() => navigate('/subscription-packages')}
          variant="outline"
          className="h-auto p-4 flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <Package className="h-5 w-5" />
            <span>View Packages</span>
          </div>
          <ArrowRight className="h-4 w-4" />
        </Button>
        
        <Button
          onClick={() => navigate('/client-dashboard')}
          variant="outline"
          className="h-auto p-4 flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <Calendar className="h-5 w-5" />
            <span>All Bookings</span>
          </div>
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};
