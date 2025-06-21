
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ServiceGrid } from '@/components/services/ServiceGrid';
import { PackagePurchaseFlow } from '@/components/packages/PackagePurchaseFlow';
import { EmailVerificationBanner } from '@/components/auth/EmailVerificationBanner';
import { ProfileTab } from '@/components/client/ProfileTab';
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
  LogOut,
  ShoppingBag
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
      navigate(`/services/${serviceId}`);
    }
  };

  const handlePackagePurchase = (packageId?: string) => {
    if (packageId) setSelectedPackageId(packageId);
    setShowPackagePurchase(true);
  };

  const handlePurchaseSuccess = () => {
    setShowPackagePurchase(false);
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

  // Quick action handlers
  const quickActions = {
    bookService: () => navigate('/services'),
    viewBookings: () => navigate('/my-bookings'),
    viewPackages: () => navigate('/subscription-packages'),
    viewProfile: () => {}, // Handled by tab switching
    bookCleaner: () => {
      const cleaningService = services.find(s => s.name.toLowerCase().includes('clean'));
      if (cleaningService) {
        navigate(`/services/${cleaningService.id}`);
      } else {
        navigate('/services');
      }
    }
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
      <div className="container mx-auto px-4 py-4 sm:py-8">
        {/* Navigation Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 space-y-4 sm:space-y-0">
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
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                Welcome back, {user?.full_name || user?.email}!
              </h1>
              <p className="text-gray-600 text-sm sm:text-base">Manage your bookings and services</p>
            </div>
          </div>
          <Button
            variant="outline"
            onClick={handleLogout}
            className="flex items-center gap-2 text-red-600 hover:text-red-700 hover:bg-red-50 self-start sm:self-auto"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Logout</span>
          </Button>
        </div>

        {/* Email Verification Banner */}
        <EmailVerificationBanner />

        {/* Active Package Alert */}
        {userActivePackage && (
          <Card className="mb-8 bg-gradient-to-r from-green-50 to-green-100 border-green-200">
            <CardContent className="p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-4 sm:space-y-0">
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
                  className="border-green-300 text-green-700 hover:bg-green-50 w-full sm:w-auto"
                >
                  View Usage
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <Tabs defaultValue="services" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4">
            <TabsTrigger value="services" className="text-xs sm:text-sm">Browse Services</TabsTrigger>
            <TabsTrigger value="packages" className="text-xs sm:text-sm">Packages</TabsTrigger>
            <TabsTrigger value="bookings" className="text-xs sm:text-sm">My Bookings</TabsTrigger>
            <TabsTrigger value="profile" className="text-xs sm:text-sm">Profile</TabsTrigger>
          </TabsList>

          <TabsContent value="services" className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-4 sm:space-y-0">
              <h2 className="text-xl sm:text-2xl font-bold">Available Services</h2>
              <Button onClick={quickActions.bookService} className="w-full sm:w-auto">
                View All Services
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
            
            <ServiceGrid
              maxItems={6}
              onBookService={handleServiceBook}
              showBookingButton={true}
            />

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  <Button onClick={quickActions.bookCleaner} className="justify-start h-auto p-4">
                    <ShoppingBag className="h-5 w-5 mr-2" />
                    <div className="text-left">
                      <div className="font-medium">Book a Cleaner</div>
                      <div className="text-xs opacity-75">Quick cleaning service</div>
                    </div>
                  </Button>
                  <Button variant="outline" onClick={quickActions.viewPackages} className="justify-start h-auto p-4">
                    <Package className="h-5 w-5 mr-2" />
                    <div className="text-left">
                      <div className="font-medium">View Packages</div>
                      <div className="text-xs opacity-75">Save with packages</div>
                    </div>
                  </Button>
                  <Button variant="outline" onClick={quickActions.viewBookings} className="justify-start h-auto p-4">
                    <Calendar className="h-5 w-5 mr-2" />
                    <div className="text-left">
                      <div className="font-medium">My Bookings</div>
                      <div className="text-xs opacity-75">View booking history</div>
                    </div>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="packages" className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-4 sm:space-y-0">
              <h2 className="text-xl sm:text-2xl font-bold">Packages</h2>
              <Button onClick={quickActions.viewPackages} className="w-full sm:w-auto">
                View All Packages
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>

            {!userActivePackage ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {packages.slice(0, 3).map((pkg) => (
                  <Card key={pkg.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <span className="text-sm sm:text-base">{pkg.name}</span>
                        <Badge className="bg-purple-100 text-purple-800">
                          N${pkg.price}
                        </Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-600 mb-4 text-sm">{pkg.description}</p>
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
                        size="sm"
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
            <h2 className="text-xl sm:text-2xl font-bold">My Bookings</h2>
            <Card>
              <CardContent className="p-6 text-center">
                <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No bookings yet</h3>
                <p className="text-gray-600 mb-4">
                  Start by booking a service or purchasing a package
                </p>
                <Button onClick={quickActions.bookService}>
                  Browse Services
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="profile" className="space-y-6">
            <h2 className="text-xl sm:text-2xl font-bold">Profile Settings</h2>
            <ProfileTab />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ClientDashboard;
