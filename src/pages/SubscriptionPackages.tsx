
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { PackageCard } from '@/components/subscription/PackageCard';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2, Package } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useSubscriptionPackages } from '@/hooks/useSubscriptionPackages';
import { Card, CardContent } from '@/components/ui/card';

const SubscriptionPackages = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { packages, userActivePackage, isLoading, error } = useSubscriptionPackages();

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-white flex items-center justify-center p-4">
        <div className="text-center max-w-md mx-auto">
          <Package className="h-16 w-16 text-purple-600 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Please Sign In</h1>
          <p className="text-gray-600 mb-6">You need to be logged in to view subscription packages</p>
          <Button 
            onClick={() => navigate('/auth')}
            className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white rounded-full px-8"
          >
            Sign In
          </Button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-purple-600" />
          <p className="text-gray-600">Loading packages...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-white flex items-center justify-center p-4">
        <Card className="max-w-md mx-auto">
          <CardContent className="p-8 text-center">
            <h1 className="text-2xl font-bold text-red-600 mb-4">Error Loading Packages</h1>
            <p className="text-gray-600 mb-6">{error}</p>
            <Button 
              onClick={() => window.location.reload()}
              className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white rounded-full"
            >
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-white">
      <div className="container mx-auto px-4 py-6 sm:py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6 sm:mb-8">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 border-purple-200 text-purple-700 hover:bg-purple-50 w-fit"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <div className="flex-1">
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 font-['Inter']">Subscription Packages</h1>
            <p className="text-lg sm:text-xl text-gray-600 mt-1 sm:mt-2">Choose the perfect plan for your service needs</p>
          </div>
        </div>

        {/* Active Package Alert */}
        {userActivePackage && (
          <Card className="mb-6 sm:mb-8 bg-gradient-to-r from-green-50 to-green-100 border-green-200">
            <CardContent className="p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h3 className="font-semibold text-green-800 text-lg">🎉 Active Package</h3>
                  <p className="text-green-700 mt-1 text-sm sm:text-base">
                    You currently have an active <strong>{userActivePackage.package.name}</strong> valid until{' '}
                    <strong>{new Date(userActivePackage.expiry_date).toLocaleDateString()}</strong>
                  </p>
                </div>
                <Button
                  variant="outline"
                  onClick={() => navigate('/client-dashboard')}
                  className="border-green-300 text-green-700 hover:bg-green-50 rounded-full w-fit"
                >
                  View Usage
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Packages Grid - Now First */}
        {packages.length === 0 ? (
          <Card className="mb-8 sm:mb-12">
            <CardContent className="p-8 sm:p-12 text-center">
              <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No packages available</h3>
              <p className="text-gray-600 mb-6">
                No subscription packages are currently available. Please check back later.
              </p>
              <Button 
                onClick={() => navigate('/services')}
                className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white rounded-full"
              >
                Browse Individual Services
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 max-w-7xl mx-auto mb-12 sm:mb-16">
            {packages.map((pkg) => {
              const features = pkg.entitlements?.map(ent => 
                `${ent.quantity_per_cycle}× ${ent.service?.name || 'Service'} per month`
              ) || [`${pkg.name} package benefits`, 'Priority booking', 'Flexible scheduling'];

              return (
                <PackageCard
                  key={pkg.id}
                  id={pkg.id}
                  name={pkg.name}
                  price={pkg.price}
                  description={pkg.description || `Get ${pkg.name.toLowerCase()} with great savings`}
                  features={features}
                  popular={pkg.name.toLowerCase().includes('premium') || pkg.name.toLowerCase().includes('popular')}
                  hasActivePackage={!!userActivePackage}
                />
              );
            })}
          </div>
        )}

        {/* Benefits Section - Now Second */}
        {packages.length > 0 && (
          <div className="mb-12 sm:mb-16 bg-white p-6 sm:p-8 rounded-2xl shadow-sm">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6 text-center font-['Inter']">
              Why Choose a Package?
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="bg-gradient-to-r from-purple-100 to-purple-200 p-4 rounded-full w-fit mx-auto mb-4">
                  <Package className="h-6 w-6 text-purple-600" />
                </div>
                <h3 className="font-semibold mb-2">Better Value</h3>
                <p className="text-gray-600 text-sm">Save up to 30% compared to individual bookings</p>
              </div>
              <div className="text-center">
                <div className="bg-gradient-to-r from-purple-100 to-purple-200 p-4 rounded-full w-fit mx-auto mb-4">
                  <ArrowLeft className="h-6 w-6 text-purple-600" />
                </div>
                <h3 className="font-semibold mb-2">Priority Booking</h3>
                <p className="text-gray-600 text-sm">Get first access to popular time slots</p>
              </div>
              <div className="text-center">
                <div className="bg-gradient-to-r from-purple-100 to-purple-200 p-4 rounded-full w-fit mx-auto mb-4">
                  <Loader2 className="h-6 w-6 text-purple-600" />
                </div>
                <h3 className="font-semibold mb-2">Flexible Usage</h3>
                <p className="text-gray-600 text-sm">Use your credits whenever you need them</p>
              </div>
            </div>
          </div>
        )}

        {/* FAQ Section - Now Last */}
        <div className="max-w-4xl mx-auto mb-12 sm:mb-16">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6 sm:mb-8 text-center font-['Inter']">
            Frequently Asked Questions
          </h2>
          <div className="space-y-4 sm:space-y-6">
            <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm">
              <h3 className="font-semibold mb-2 text-base sm:text-lg">How does the payment process work?</h3>
              <p className="text-gray-600 text-sm sm:text-base">
                After selecting a package, you'll receive bank deposit instructions. Simply make the deposit 
                and send proof of payment via WhatsApp. We'll verify and activate your package within 24 hours.
              </p>
            </div>
            <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm">
              <h3 className="font-semibold mb-2 text-base sm:text-lg">Can I upgrade or downgrade my package?</h3>
              <p className="text-gray-600 text-sm sm:text-base">
                Yes, you can change your package at any time. Contact our support team for assistance 
                with package changes. We'll prorate the difference and adjust your billing accordingly.
              </p>
            </div>
            <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm">
              <h3 className="font-semibold mb-2 text-base sm:text-lg">What happens if I don't use all my bookings?</h3>
              <p className="text-gray-600 text-sm sm:text-base">
                Unused bookings don't roll over to the next month. We recommend choosing a package 
                that matches your expected usage. You can always upgrade if you need more services.
              </p>
            </div>
            <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm">
              <h3 className="font-semibold mb-2 text-base sm:text-lg">Can I cancel my package anytime?</h3>
              <p className="text-gray-600 text-sm sm:text-base">
                Yes, you can cancel your package at any time. Your current package will remain active until 
                the end of your billing period, and you won't be charged for the next cycle.
              </p>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center bg-white p-6 sm:p-8 rounded-2xl shadow-sm">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 font-['Inter']">
            Still have questions?
          </h2>
          <p className="text-gray-600 mb-6 text-sm sm:text-base">
            Our support team is here to help you choose the right package
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              onClick={() => navigate('/contact')}
              className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white rounded-full px-8"
            >
              Contact Support
            </Button>
            <Button 
              variant="outline" 
              onClick={() => navigate('/services')}
              className="border-purple-200 text-purple-700 hover:bg-purple-50 rounded-full px-8"
            >
              Browse Individual Services
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionPackages;
