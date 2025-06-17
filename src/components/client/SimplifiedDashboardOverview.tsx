
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useServiceEntitlements } from '@/hooks/useServiceEntitlements';
import { useSupabaseBookings } from '@/contexts/SupabaseBookingContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { Package, Calendar, Clock, CheckCircle } from 'lucide-react';

export const SimplifiedDashboardOverview = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { serviceUsage, isLoading } = useServiceEntitlements();
  const { bookings } = useSupabaseBookings();
  
  const hasActivePackage = serviceUsage.length > 0;
  const recentBookings = bookings.slice(0, 3);

  // Service cards data - elegant 1x3 grid
  const serviceCards = [
    {
      id: '1',
      name: 'Deep House Cleaning',
      description: 'Complete deep cleaning service for your home',
      price: 'N$600',
      duration: '3h'
    },
    {
      id: '2',
      name: 'Garden Maintenance',
      description: 'Professional garden care and landscaping',
      price: 'N$400',
      duration: '2h'
    },
    {
      id: '3',
      name: 'Home Repairs',
      description: 'General home maintenance and repair services',
      price: 'N$500',
      duration: '2.5h'
    }
  ];

  const handleBookService = (serviceId: string) => {
    navigate(`/one-off-booking?service_id=${serviceId}`);
  };

  return (
    <div className="space-y-6" style={{ background: 'linear-gradient(to right, #e6f0fa, #fff)', padding: '20px', borderRadius: '8px' }}>
      
      {/* Service Cards Grid - 1x3 elegant layout */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {serviceCards.map((service) => (
          <Card 
            key={service.id} 
            className="bg-white border-0"
            style={{ 
              borderRadius: '8px', 
              padding: '15px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)' 
            }}
          >
            <CardContent className="p-0">
              <h3 className="text-lg font-semibold text-gray-900 mb-2" style={{ fontSize: '18px' }}>
                {service.name}
              </h3>
              <p className="text-gray-600 mb-4" style={{ fontSize: '14px' }}>
                {service.description}
              </p>
              <div className="flex items-center justify-between mb-4">
                <span className="text-xl font-bold text-blue-600">{service.price}</span>
                <span className="text-sm text-gray-500">{service.duration}</span>
              </div>
              <Button 
                className="w-full bg-blue-900 hover:bg-blue-800 text-white cursor-pointer"
                style={{ 
                  padding: '10px',
                  fontSize: '16px'
                }}
                onClick={() => handleBookService(service.id)}
              >
                Book Now
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Browse All Services Button */}
      <div className="flex justify-center">
        <Button 
          onClick={() => navigate('/search')}
          className="bg-blue-100 text-blue-900 hover:bg-blue-200"
          style={{ fontSize: '16px', padding: '12px 24px' }}
        >
          Browse All Services
        </Button>
      </div>

      {/* Package Status */}
      {hasActivePackage && (
        <Card className="bg-white border-0" style={{ borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          <CardHeader style={{ padding: '15px' }}>
            <CardTitle className="flex items-center gap-2 text-green-600" style={{ fontSize: '18px' }}>
              <Package className="h-5 w-5" />
              Active Package
            </CardTitle>
          </CardHeader>
          <CardContent style={{ padding: '15px', paddingTop: '0' }}>
            <div className="space-y-4">
              <p className="text-gray-600" style={{ fontSize: '14px' }}>
                You have access to {serviceUsage.length} services in your package.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {serviceUsage.slice(0, 4).map((usage) => (
                  <div key={usage.service_id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <div className="font-medium" style={{ fontSize: '14px' }}>{usage.service_name}</div>
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
      )}

      {/* Recent Bookings */}
      {recentBookings.length > 0 && (
        <Card className="bg-white border-0" style={{ borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          <CardHeader style={{ padding: '15px' }}>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2" style={{ fontSize: '18px' }}>
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
          <CardContent style={{ padding: '15px', paddingTop: '0' }}>
            <div className="space-y-3">
              {recentBookings.map((booking) => (
                <div key={booking.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium" style={{ fontSize: '14px' }}>{booking.service?.name}</h4>
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

      {/* Enhanced Footer Navigation */}
      <div className="flex justify-center" style={{ padding: '20px' }}>
        <Card className="bg-white border-0" style={{ borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          <CardContent className="text-center" style={{ padding: '20px' }}>
            <Button 
              onClick={() => navigate('/subscription-packages')}
              className="bg-blue-600 hover:bg-blue-700 text-white mb-3"
              style={{ fontSize: '16px', padding: '12px 24px' }}
            >
              Explore Packages & Bookings
            </Button>
            <p className="text-gray-500" style={{ fontSize: '12px' }}>
              Packages offer better value and priority booking
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
