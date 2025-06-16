
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { useServiceEntitlements } from '@/hooks/useServiceEntitlements';
import { useSupabaseBookings } from '@/contexts/SupabaseBookingContext';
import { Package, Calendar, User, ShoppingBag, Home, Star, Clock, MapPin, ArrowRight } from 'lucide-react';
import { DashboardOverview } from '@/components/client/DashboardOverview';
import { MyPackageTab } from '@/components/client/MyPackageTab';
import { MyServicesTab } from '@/components/client/MyServicesTab';
import { BookingsTab } from '@/components/client/BookingsTab';
import { ProfileTab } from '@/components/client/ProfileTab';

const ClientDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { serviceUsage, isLoading } = useServiceEntitlements();
  const { bookings } = useSupabaseBookings();
  
  const hasActivePackage = serviceUsage.length > 0;
  const hasBookings = bookings.length > 0;

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Please Sign In</h1>
          <p className="text-gray-600 mb-6">You need to be logged in to access your dashboard</p>
          <Button onClick={() => navigate('/auth')}>
            Sign In
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-4 md:py-8">
        {/* Header */}
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                Welcome back, {user.full_name?.split(' ')[0] || user.email?.split('@')[0]}
              </h1>
              <p className="text-gray-600 mt-1">Manage your services and bookings</p>
            </div>
            <div className="flex items-center gap-2">
              {hasActivePackage && (
                <Badge variant="default" className="bg-green-600">
                  <Package className="h-3 w-3 mr-1" />
                  Active Package
                </Badge>
              )}
              {hasBookings && (
                <Badge variant="outline">
                  {bookings.length} Booking{bookings.length !== 1 ? 's' : ''}
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Mobile-First Tabs */}
        <Tabs defaultValue="dashboard" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3 md:grid-cols-6 h-auto p-1">
            <TabsTrigger value="dashboard" className="flex flex-col items-center gap-1 py-2 text-xs">
              <Home className="h-4 w-4" />
              <span className="hidden sm:inline">Dashboard</span>
            </TabsTrigger>
            <TabsTrigger value="book-service" className="flex flex-col items-center gap-1 py-2 text-xs">
              <ShoppingBag className="h-4 w-4" />
              <span className="hidden sm:inline">Book Service</span>
            </TabsTrigger>
            <TabsTrigger value="my-services" className="flex flex-col items-center gap-1 py-2 text-xs">
              <Star className="h-4 w-4" />
              <span className="hidden sm:inline">My Services</span>
            </TabsTrigger>
            {hasActivePackage && (
              <TabsTrigger value="my-package" className="flex flex-col items-center gap-1 py-2 text-xs">
                <Package className="h-4 w-4" />
                <span className="hidden sm:inline">My Package</span>
              </TabsTrigger>
            )}
            <TabsTrigger value="bookings" className="flex flex-col items-center gap-1 py-2 text-xs">
              <Calendar className="h-4 w-4" />
              <span className="hidden sm:inline">Bookings</span>
            </TabsTrigger>
            <TabsTrigger value="profile" className="flex flex-col items-center gap-1 py-2 text-xs">
              <User className="h-4 w-4" />
              <span className="hidden sm:inline">Profile</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-4">
            <DashboardOverview />
          </TabsContent>

          <TabsContent value="book-service" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShoppingBag className="h-5 w-5" />
                  Book a Service
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <div className="mb-6">
                    <ShoppingBag className="h-16 w-16 text-blue-500 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold mb-2">Ready to book a service?</h3>
                    <p className="text-gray-600 mb-6">
                      {hasActivePackage 
                        ? "Use your package credits or book additional services"
                        : "Book individual services or get a package for better value"
                      }
                    </p>
                  </div>
                  <div className="space-y-3">
                    <Button onClick={() => navigate('/search')} className="w-full sm:w-auto">
                      Browse Services
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                    {!hasActivePackage && (
                      <div>
                        <p className="text-sm text-gray-500 mb-2">or</p>
                        <Button 
                          variant="outline" 
                          onClick={() => navigate('/subscription-packages')}
                          className="w-full sm:w-auto"
                        >
                          View Packages
                          <Package className="h-4 w-4 ml-2" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="my-services" className="space-y-4">
            <MyServicesTab />
          </TabsContent>

          {hasActivePackage && (
            <TabsContent value="my-package" className="space-y-4">
              <MyPackageTab />
            </TabsContent>
          )}

          <TabsContent value="bookings" className="space-y-4">
            <BookingsTab />
          </TabsContent>

          <TabsContent value="profile" className="space-y-4">
            <ProfileTab />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ClientDashboard;
