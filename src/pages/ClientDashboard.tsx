
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { ServiceDisplayWithEntitlements } from '@/components/ServiceDisplayWithEntitlements';
import { ServiceUsageTracker } from '@/components/client/ServiceUsageTracker';
import { PackagePrompt } from '@/components/client/PackagePrompt';
import { BookingManager } from '@/components/booking/BookingManager';
import { RealTimeBookingManager } from '@/components/booking/RealTimeBookingManager';
import { PendingTransactionsDisplay } from '@/components/client/PendingTransactionsDisplay';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { useServiceEntitlements } from '@/hooks/useServiceEntitlements';
import { Calendar, Package, Settings, User, Home, Clock } from 'lucide-react';

const ClientDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { serviceUsage, isLoading } = useServiceEntitlements();
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null);
  const [showBookingForm, setShowBookingForm] = useState(false);

  const hasActivePackage = serviceUsage.length > 0;

  const handleServiceSelection = (serviceId: string) => {
    setSelectedServiceId(serviceId);
    setShowBookingForm(true);
  };

  const handleBookingCreated = () => {
    setShowBookingForm(false);
    setSelectedServiceId(null);
  };

  const handleUpgradeToPackages = () => {
    navigate('/subscription-packages');
  };

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
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Welcome back, {user.full_name || user.email}
              </h1>
              <p className="text-gray-600 mt-2">Manage your bookings and services</p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={hasActivePackage ? "default" : "secondary"}>
                {hasActivePackage ? "Active Package" : "No Package"}
              </Badge>
            </div>
          </div>
        </div>

        <Tabs defaultValue="services" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="services" className="flex items-center gap-2">
              <Home className="h-4 w-4" />
              Services
            </TabsTrigger>
            <TabsTrigger value="bookings" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              My Bookings
            </TabsTrigger>
            <TabsTrigger value="pending" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Pending
            </TabsTrigger>
            <TabsTrigger value="packages" className="flex items-center gap-2">
              <Package className="h-4 w-4" />
              Packages
            </TabsTrigger>
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Profile
            </TabsTrigger>
          </TabsList>

          <TabsContent value="services" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                {hasActivePackage ? (
                  <ServiceDisplayWithEntitlements
                    onBookService={handleServiceSelection}
                    showBookingButton={true}
                  />
                ) : (
                  <PackagePrompt onUpgrade={handleUpgradeToPackages} />
                )}
              </div>
              <div className="space-y-6">
                <ServiceUsageTracker onUpgrade={handleUpgradeToPackages} />
                {hasActivePackage && <RealTimeBookingManager />}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="bookings" className="space-y-6">
            <BookingManager userRole="client" userId={parseInt(user.id)} />
          </TabsContent>

          <TabsContent value="pending" className="space-y-6">
            <PendingTransactionsDisplay />
          </TabsContent>

          <TabsContent value="packages" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Package className="h-5 w-5" />
                      Package Management
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {hasActivePackage ? (
                      <div className="space-y-4">
                        <div className="text-center">
                          <h3 className="text-lg font-semibold text-green-600 mb-2">
                            You have an active package!
                          </h3>
                          <p className="text-gray-600 mb-4">
                            Your current package gives you access to {serviceUsage.length} services.
                          </p>
                        </div>
                        <div className="flex justify-center gap-4">
                          <Button variant="outline" onClick={handleUpgradeToPackages}>
                            View All Packages
                          </Button>
                          <Button onClick={handleUpgradeToPackages}>
                            Upgrade Package
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <PackagePrompt onUpgrade={handleUpgradeToPackages} />
                    )}
                  </CardContent>
                </Card>
              </div>
              <div>
                <ServiceUsageTracker onUpgrade={handleUpgradeToPackages} />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Profile Settings
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Full Name</label>
                    <p className="text-gray-900">{user.full_name || 'Not provided'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Email</label>
                    <p className="text-gray-900">{user.email}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Phone</label>
                    <p className="text-gray-900">{user.phone || 'Not provided'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Account Status</label>
                    <div className="flex items-center gap-2">
                      <Badge variant={user.is_active ? "default" : "destructive"}>
                        {user.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ClientDashboard;
