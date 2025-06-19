
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useServices } from '@/contexts/ServiceContext';
import { useSubscriptionPackages } from '@/hooks/useSubscriptionPackages';
import { useSupabaseBookings } from '@/contexts/SupabaseBookingContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { 
  Package, 
  Calendar, 
  Clock, 
  MapPin, 
  ArrowRight, 
  ShoppingBag, 
  CheckCircle,
  Sparkles,
  Home,
  Zap
} from 'lucide-react';

export const SimplifiedDashboardOverview = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { services, isLoading: servicesLoading } = useServices();
  const { userActivePackage, isLoading: packageLoading } = useSubscriptionPackages();
  const { bookings, isLoading: bookingsLoading } = useSupabaseBookings();
  
  const nextBooking = bookings.find(b => 
    new Date(b.booking_date) >= new Date() && b.status !== 'cancelled'
  );
  
  const completedBookings = bookings.filter(b => b.status === 'completed').length;
  const upcomingBookings = bookings.filter(b => 
    new Date(b.booking_date) >= new Date() && b.status !== 'cancelled'
  ).length;

  const popularServices = [
    { 
      id: 'home-cleaning',
      name: 'Home Cleaning', 
      description: 'Regular house cleaning',
      icon: Home,
      color: 'bg-blue-100 text-blue-600'
    },
    { 
      id: 'deep-clean',
      name: 'Deep Clean', 
      description: 'Intensive cleaning',
      icon: Sparkles,
      color: 'bg-purple-100 text-purple-600'
    },
    { 
      id: 'move-in',
      name: 'Move-In Help', 
      description: 'New home cleaning',
      icon: Zap,
      color: 'bg-green-100 text-green-600'
    }
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-purple-50 to-white p-6 rounded-2xl border">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Hi {user?.full_name?.split(' ')[0] || 'there'} 👋
        </h2>
        <p className="text-gray-600 mb-6">
          Ready to book your next cleaning service?
        </p>
        
        {/* Quick Actions */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Button 
            onClick={() => navigate('/search')}
            className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white rounded-full"
          >
            <ShoppingBag className="h-4 w-4 mr-2" />
            Book Again
          </Button>
          <Button 
            variant="outline" 
            onClick={() => navigate(userActivePackage ? '/client-dashboard' : '/subscription-packages')}
            className="border-purple-200 text-purple-700 hover:bg-purple-50 rounded-full"
          >
            <Package className="h-4 w-4 mr-2" />
            {userActivePackage ? 'Check Package' : 'Get Package'}
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Next Booking */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Calendar className="h-5 w-5 text-purple-600" />
              Next Booking
            </CardTitle>
          </CardHeader>
          <CardContent>
            {nextBooking ? (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    {nextBooking.status}
                  </Badge>
                  <span className="text-sm text-gray-600">{nextBooking.service?.name}</span>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-1 text-sm">
                    <Calendar className="h-3 w-3 text-gray-500" />
                    <span>{nextBooking.booking_date}</span>
                  </div>
                  <div className="flex items-center gap-1 text-sm">
                    <Clock className="h-3 w-3 text-gray-500" />
                    <span>{nextBooking.booking_time}</span>
                  </div>
                  <div className="flex items-center gap-1 text-sm">
                    <MapPin className="h-3 w-3 text-gray-500" />
                    <span>{nextBooking.location_town || 'Windhoek'}</span>
                  </div>
                </div>
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="w-full"
                  onClick={() => navigate('/bookings')}
                >
                  View Details
                </Button>
              </div>
            ) : (
              <div className="text-center py-4">
                <Calendar className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600 mb-3">No upcoming bookings</p>
                <Button 
                  size="sm" 
                  onClick={() => navigate('/search')}
                  className="bg-purple-600 hover:bg-purple-700 text-white"
                >
                  Book Now
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Package Status */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Package className="h-5 w-5 text-purple-600" />
              Package Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            {packageLoading ? (
              <div className="animate-pulse space-y-3">
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </div>
            ) : userActivePackage ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Badge className="bg-green-100 text-green-800">Active</Badge>
                  <span className="text-sm font-medium">N${userActivePackage.package.price}</span>
                </div>
                <div>
                  <p className="font-medium">{userActivePackage.package.name}</p>
                  <p className="text-sm text-gray-600">
                    Valid until {new Date(userActivePackage.expiry_date).toLocaleDateString()}
                  </p>
                </div>
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="w-full"
                  onClick={() => navigate('/client-dashboard')}
                >
                  View Package
                </Button>
              </div>
            ) : (
              <div className="text-center py-4">
                <Package className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600 mb-3">No active package</p>
                <Button 
                  size="sm" 
                  onClick={() => navigate('/subscription-packages')}
                  className="bg-purple-600 hover:bg-purple-700 text-white"
                >
                  Get Package
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Current Location */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <MapPin className="h-5 w-5 text-purple-600" />
              Service Area
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-medium">Windhoek</span>
                <Badge variant="outline" className="text-xs">Available</Badge>
              </div>
              <p className="text-sm text-gray-600">
                Services available in your area
              </p>
              <Button 
                size="sm" 
                variant="outline" 
                className="w-full"
                onClick={() => navigate('/services')}
              >
                Update Location
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border text-center">
          <div className="text-2xl font-bold text-purple-600">{bookings.length}</div>
          <div className="text-sm text-gray-600">Total Bookings</div>
        </div>
        <div className="bg-white p-4 rounded-xl border text-center">
          <div className="text-2xl font-bold text-green-600">{completedBookings}</div>
          <div className="text-sm text-gray-600">Completed</div>
        </div>
        <div className="bg-white p-4 rounded-xl border text-center">
          <div className="text-2xl font-bold text-blue-600">{upcomingBookings}</div>
          <div className="text-sm text-gray-600">Upcoming</div>
        </div>
        <div className="bg-white p-4 rounded-xl border text-center">
          <div className="text-2xl font-bold text-orange-600">
            {userActivePackage ? '1' : '0'}
          </div>
          <div className="text-sm text-gray-600">Active Package</div>
        </div>
      </div>

      {/* Popular Services */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-purple-600" />
              Popular Services
            </span>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigate('/search')}
              className="text-purple-600 hover:text-purple-700"
            >
              View All
              <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {popularServices.map((service) => {
              const IconComponent = service.icon;
              return (
                <div 
                  key={service.id}
                  className="p-4 border rounded-xl hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => navigate('/search')}
                >
                  <div className={`${service.color} p-3 rounded-full w-fit mb-3`}>
                    <IconComponent className="h-5 w-5" />
                  </div>
                  <h4 className="font-medium mb-1">{service.name}</h4>
                  <p className="text-sm text-gray-600 mb-3">{service.description}</p>
                  <Button size="sm" className="w-full bg-purple-600 hover:bg-purple-700 text-white">
                    Book Now
                  </Button>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      {bookings.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-purple-600" />
                Recent Activity
              </span>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => navigate('/bookings')}
                className="text-purple-600 hover:text-purple-700"
              >
                View All Bookings
                <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {bookings.slice(0, 3).map((booking) => (
                <div key={booking.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium">{booking.service?.name}</h4>
                      <Badge variant={
                        booking.status === 'completed' ? 'default' : 
                        booking.status === 'pending' ? 'secondary' : 
                        'outline'
                      }>
                        {booking.status === 'completed' && <CheckCircle className="h-3 w-3 mr-1" />}
                        {booking.status}
                      </Badge>
                    </div>
                    <div className="text-sm text-gray-600">
                      {booking.booking_date} at {booking.booking_time}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">N${booking.total_amount}</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
