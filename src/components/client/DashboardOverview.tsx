
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useServiceEntitlements } from '@/hooks/useServiceEntitlements';
import { useSupabaseBookings } from '@/contexts/SupabaseBookingContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { Package, Calendar, Clock, Star, ArrowRight, ShoppingBag, CheckCircle } from 'lucide-react';

export const DashboardOverview = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { serviceUsage, isLoading } = useServiceEntitlements();
  const { bookings } = useSupabaseBookings();
  
  const hasActivePackage = serviceUsage.length > 0;
  const recentBookings = bookings.slice(0, 3);
  const pendingBookings = bookings.filter(b => b.status === 'pending').length;
  const completedBookings = bookings.filter(b => b.status === 'completed').length;

  return (
    <div className="space-y-6">
      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{bookings.length}</div>
            <div className="text-sm text-gray-600">Total Bookings</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{completedBookings}</div>
            <div className="text-sm text-gray-600">Completed</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-orange-600">{pendingBookings}</div>
            <div className="text-sm text-gray-600">Pending</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">{serviceUsage.length}</div>
            <div className="text-sm text-gray-600">Package Services</div>
          </CardContent>
        </Card>
      </div>

      {/* Package Status or Call to Action */}
      {hasActivePackage ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-600">
              <Package className="h-5 w-5" />
              Active Package
            </CardTitle>
          </CardHeader>
          <CardContent>
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
        <Card>
          <CardContent className="p-6 text-center">
            <div className="mb-4">
              <Package className="h-12 w-12 text-gray-400 mx-auto mb-3" />
              <h3 className="text-lg font-semibold mb-2">Get More Value with a Package</h3>
              <p className="text-gray-600 mb-4">
                Save money and get priority access to services with one of our packages.
              </p>
            </div>
            <div className="space-y-3">
              <Button onClick={() => navigate('/subscription-packages')} className="w-full sm:w-auto">
                View Packages
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
              <div className="text-sm text-gray-500">
                or <button 
                  onClick={() => navigate('/search')} 
                  className="text-blue-600 underline"
                >
                  book individual services
                </button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Bookings */}
      {recentBookings.length > 0 && (
        <Card>
          <CardHeader>
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
          <CardContent>
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

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Button onClick={() => navigate('/search')} className="justify-start">
              <ShoppingBag className="h-4 w-4 mr-2" />
              Book a Service
            </Button>
            {!hasActivePackage && (
              <Button variant="outline" onClick={() => navigate('/subscription-packages')} className="justify-start">
                <Package className="h-4 w-4 mr-2" />
                View Packages
              </Button>
            )}
            <Button variant="outline" onClick={() => navigate('/bookings')} className="justify-start">
              <Calendar className="h-4 w-4 mr-2" />
              My Bookings
            </Button>
            <Button variant="outline" onClick={() => navigate('/profile')} className="justify-start">
              <Star className="h-4 w-4 mr-2" />
              Rate Services
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
