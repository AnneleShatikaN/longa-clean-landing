
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ServiceGrid } from '@/components/services/ServiceGrid';
import { PackagePurchaseFlow } from '@/components/packages/PackagePurchaseFlow';
import { EmailVerificationBanner } from '@/components/auth/EmailVerificationBanner';
import { useAuth } from '@/contexts/AuthContext';
import { useSubscriptionPackages } from '@/hooks/useSubscriptionPackages';
import { useServicesEnhanced } from '@/hooks/useServicesEnhanced';
import { useEnhancedNotifications } from '@/hooks/useEnhancedNotifications';
import { 
  Package, 
  Calendar, 
  CreditCard, 
  User, 
  Settings,
  Star,
  Clock,
  MapPin,
  ArrowRight,
  ArrowLeft,
  LogOut
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ClientDashboard = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { userActivePackage, packages, isLoading: packagesLoading } = useSubscriptionPackages();
  const { services, isLoading: servicesLoading } = useServicesEnhanced();
  const { notifyBookingSuccess } = useEnhancedNotifications();
  
  const [showPackagePurchase, setShowPackagePurchase] = useState(false);
  const [selectedPackageId, setSelectedPackageId] = useState<string>('');

  const handleServiceBook = (serviceId: string) => {
    const service = services.find(s => s.id === serviceId);
    if (service) {
      notifyBookingSuccess(service.name);
      navigate(`/service/${serviceId}`);
    }
  };

  const handlePackagePurchase = (packageId?: string) => {
    if (packageId) setSelectedPackageId(packageId);
    setShowPackagePurchase(true);
  };

  const handlePurchaseSuccess = () => {
    setShowPackagePurchase(false);
    // Refresh package data
    window.location.reload();
  };

  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/auth');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleBack = () => {
    navigate(-1);
  };

  if (packagesLoading || servicesLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (showPackagePurchase) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-white">
        <PackagePurchaseFlow
          packageId={selectedPackageId}
          onClose={() => setShowPackagePurchase(false)}
          onSuccess={handlePurchaseSuccess}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-white">
      <div className="container mx-auto px-4 py-8">
        {/* Navigation Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={handleBack}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Welcome back, {user?.full_name || user?.email}!
              </h1>
              <p className="text-gray-600">Manage your bookings and services</p>
            </div>
          </div>
          <Button
            variant="outline"
            onClick={handleLogout}
            className="flex items-center gap-2 text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </Button>
        </div>

        {/* Email Verification Banner */}
        <EmailVerificationBanner />

        {/* Active Package Alert */}
        {userActivePackage && (
          <Card className="mb-8 bg-gradient-to-r from-green-50 to-green-100 border-green-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-green-800 text-lg flex items-center gap-2">
                    <Package className="h-5 w-5" />
                    Active Package: {userActivePackage.package.name}
                  </h3>
                  <p className="text-green-700 mt-1">
                    Valid until <strong>{new Date(userActivePackage.expiry_date).toLocaleDateString()}</strong>
                  </p>
                </div>
                <Button
                  variant="outline"
                  className="border-green-300 text-green-700 hover:bg-green-50"
                >
                  View Usage
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <Tabs defaultValue="services" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="services">Browse Services</TabsTrigger>
            <TabsTrigger value="packages">Packages</TabsTrigger>
            <TabsTrigger value="bookings">My Bookings</TabsTrigger>
            <TabsTrigger value="profile">Profile</TabsTrigger>
          </TabsList>

          <TabsContent value="services" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Available Services</h2>
              <Button onClick={() => navigate('/search')}>
                View All Services
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
            
            <ServiceGrid
              maxItems={6}
              onBookService={handleServiceBook}
              showBookingButton={true}
            />
          </TabsContent>

          <TabsContent value="packages" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Subscription Packages</h2>
              <Button onClick={() => navigate('/subscription-packages')}>
                View All Packages
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>

            {!userActivePackage ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {packages.slice(0, 3).map((pkg) => (
                  <Card key={pkg.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <span>{pkg.name}</span>
                        <Badge className="bg-purple-100 text-purple-800">
                          N${pkg.price}
                        </Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-600 mb-4">{pkg.description}</p>
                      <ul className="space-y-2 mb-4">
                        {pkg.entitlements?.slice(0, 3).map((ent, index) => (
                          <li key={index} className="flex items-center text-sm">
                            <div className="w-2 h-2 bg-purple-600 rounded-full mr-2"></div>
                            {ent.quantity_per_cycle}× {ent.service?.name || 'Service'}
                          </li>
                        ))}
                      </ul>
                      <Button 
                        onClick={() => handlePackagePurchase(pkg.id)}
                        className="w-full"
                      >
                        Purchase Package
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="p-6 text-center">
                  <Package className="h-12 w-12 text-green-600 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">You have an active package!</h3>
                  <p className="text-gray-600">
                    Your {userActivePackage.package.name} is active until{' '}
                    {new Date(userActivePackage.expiry_date).toLocaleDateString()}
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="bookings" className="space-y-6">
            <h2 className="text-2xl font-bold">My Bookings</h2>
            <Card>
              <CardContent className="p-6 text-center">
                <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No bookings yet</h3>
                <p className="text-gray-600 mb-4">
                  Start by booking a service or purchasing a package
                </p>
                <Button onClick={() => navigate('/search')}>
                  Browse Services
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="profile" className="space-y-6">
            <h2 className="text-2xl font-bold">Profile Settings</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Account Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Name</label>
                    <p className="text-gray-900">{user?.full_name || 'Not set'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Email</label>
                    <p className="text-gray-900">{user?.email}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Phone</label>
                    <p className="text-gray-900">{user?.phone || 'Not set'}</p>
                  </div>
                  <Button variant="outline" className="w-full">
                    <Settings className="h-4 w-4 mr-2" />
                    Edit Profile
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button variant="outline" className="w-full justify-start">
                    <Star className="h-4 w-4 mr-2" />
                    Rate Recent Services
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <MapPin className="h-4 w-4 mr-2" />
                    Update Service Areas
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Clock className="h-4 w-4 mr-2" />
                    Booking History
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ClientDashboard;
