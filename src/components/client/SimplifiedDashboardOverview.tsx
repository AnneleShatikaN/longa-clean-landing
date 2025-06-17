
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useServiceEntitlements } from '@/hooks/useServiceEntitlements';
import { useSupabaseBookings } from '@/contexts/SupabaseBookingContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { Package, Calendar, Clock, Star, ArrowRight, ShoppingBag, CheckCircle } from 'lucide-react';

export const SimplifiedDashboardOverview = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { serviceUsage, isLoading } = useServiceEntitlements();
  const { bookings } = useSupabaseBookings();
  
  const hasActivePackage = serviceUsage.length > 0;
  const recentBookings = bookings.slice(0, 3);
  const pendingBookings = bookings.filter(b => b.status === 'pending').length;
  const completedBookings = bookings.filter(b => b.status === 'completed').length;

  // Mock available services data
  const availableServices = [
    {
      id: 1,
      name: 'Deep House Cleaning',
      price: 'N$600',
      duration: '3h',
      description: 'Complete deep cleaning service'
    },
    {
      id: 2,
      name: 'Garden Maintenance',
      price: 'N$400',
      duration: '2h',
      description: 'Professional garden care'
    },
    {
      id: 3,
      name: 'Home Repairs',
      price: 'N$500',
      duration: '2.5h',
      description: 'General home maintenance'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Stats Row - Bookings and Completed side by side */}
      <div className="flex flex-col md:flex-row gap-5">
        <Card className="flex-1 bg-white rounded-lg shadow-sm border-0" style={{ boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600 mb-1">{pendingBookings}</div>
              <div className="text-sm text-gray-600">Bookings</div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="flex-1 bg-white rounded-lg shadow-sm border-0" style={{ boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600 mb-1">{completedBookings}</div>
              <div className="text-sm text-gray-600">Completed</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Available Services Section */}
      <Card className="bg-white rounded-lg shadow-sm border-0" style={{ boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
        <CardHeader className="p-4">
          <CardTitle className="text-lg font-semibold text-gray-900">Available Services</CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {availableServices.map((service) => (
              <div key={service.id} className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
                <h3 className="font-medium text-gray-900 mb-2">{service.name}</h3>
                <p className="text-sm text-gray-600 mb-3">{service.description}</p>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-lg font-semibold text-blue-600">{service.price}</span>
                  <span className="text-sm text-gray-500">{service.duration}</span>
                </div>
                <Button 
                  size="sm" 
                  className="w-full"
                  onClick={() => navigate('/search')}
                >
                  Book Now
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Package Status or Individual Booking Promotion */}
      {hasActivePackage ? (
        <Card className="bg-white rounded-lg shadow-sm border-0" style={{ boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          <CardHeader className="p-4">
            <CardTitle className="flex items-center gap-2 text-green-600">
              <Package className="h-5 w-5" />
              Active Package
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="space-y-4">
              <p className="text-gray-600">
                You have access to {serviceUsage.length} services in your package.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {serviceUsage.slice(0, 4).map((usage) => (
                  <div key={usage.service_id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <div className="font-medium">{usage.service_name}</div>
                      <div className="text-sm text-gray-600">
                        {usage.used_count}/{usage.allowed_count} used
                      </div>
                    </div>
                    <div className="w-12 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-blue-500 rounded-full"
                        style={{ width: `${(usage.used_count / usage.allowed_count) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
              {serviceUsage.length > 4 && (
                <p className="text-sm text-gray-500">
                  +{serviceUsage.length - 4} more services available
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="bg-white rounded-lg shadow-sm border-0" style={{ boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          <CardContent className="p-4">
            <div className="mb-4">
              <ShoppingBag className="h-12 w-12 text-blue-500 mx-auto mb-3" />
              <h3 className="text-lg font-semibold mb-2 text-center">Ready to Book a Service?</h3>
              <p className="text-gray-600 mb-4 text-center">
                Browse our available services and book what you need, when you need it.
              </p>
            </div>
            <div className="space-y-3">
              <Button onClick={() => navigate('/search')} className="w-full">
                Browse All Services
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">Or</span>
                </div>
              </div>
              <Button 
                variant="outline" 
                onClick={() => navigate('/subscription-packages')}
                className="w-full"
              >
                <Package className="h-4 w-4 mr-2" />
                View Packages & Save
              </Button>
              <p className="text-xs text-gray-500 text-center">
                Packages offer better value and priority booking
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Bookings */}
      {recentBookings.length > 0 && (
        <Card className="bg-white rounded-lg shadow-sm border-0" style={{ boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          <CardHeader className="p-4">
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Recent Bookings
              </span>
              {bookings.length > 3 && (
                <Button variant="ghost" size="sm" onClick={() => navigate('/bookings')}>
                  View All
                </Button>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="space-y-3">
              {recentBookings.map((booking) => (
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
                    <div className="text-sm text-gray-600 flex items-center gap-4">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {booking.booking_date}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {booking.booking_time}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">N${booking.total_amount}</div>
                    {booking.provider && (
                      <div className="text-sm text-gray-600">{booking.provider.full_name}</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Footer Links */}
      <div className="flex items-center gap-4 pt-4">
        <Button 
          variant="link" 
          onClick={() => navigate('/subscription-packages')}
          className="p-0 h-auto text-blue-600 hover:text-blue-800"
        >
          View Packages
        </Button>
        <Button 
          variant="link" 
          onClick={() => navigate('/bookings')}
          className="p-0 h-auto text-blue-600 hover:text-blue-800"
        >
          All Bookings
        </Button>
      </div>
    </div>
  );
};
