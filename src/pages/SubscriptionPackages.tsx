
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { PackageCard } from '@/components/subscription/PackageCard';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useSubscriptionPackages } from '@/hooks/useSubscriptionPackages';
import { Card, CardContent } from '@/components/ui/card';

const SubscriptionPackages = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { packages, userActivePackage, isLoading, error } = useSubscriptionPackages();

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Please Sign In</h1>
          <p className="text-gray-600 mb-6">You need to be logged in to view subscription packages</p>
          <Button onClick={() => navigate('/auth')}>
            Sign In
          </Button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading packages...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Card>
          <CardContent className="p-8 text-center">
            <h1 className="text-2xl font-bold text-red-600 mb-4">Error Loading Packages</h1>
            <p className="text-gray-600 mb-6">{error}</p>
            <Button onClick={() => window.location.reload()}>
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(-1)}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Subscription Packages</h1>
            <p className="text-gray-600 mt-2">Choose the perfect plan for your service needs</p>
          </div>
        </div>

        {/* Active Package Alert */}
        {userActivePackage && (
          <Card className="mb-8 bg-green-50 border-green-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-green-800">Active Package</h3>
                  <p className="text-sm text-green-700">
                    You currently have an active {userActivePackage.package.name} valid until{' '}
                    {new Date(userActivePackage.expiry_date).toLocaleDateString()}
                  </p>
                </div>
                <Button
                  variant="outline"
                  onClick={() => navigate('/client-dashboard')}
                  className="border-green-300 text-green-700 hover:bg-green-100"
                >
                  View Usage
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Packages Grid */}
        {packages.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <h3 className="text-xl font-semibold mb-2">No Packages Available</h3>
              <p className="text-gray-600">
                No subscription packages are currently available. Please check back later.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {packages.map((pkg) => {
              const features = pkg.entitlements?.map(ent => 
                `${ent.quantity_per_cycle}x ${ent.service?.name || 'Service'} per month`
              ) || [];

              return (
                <PackageCard
                  key={pkg.id}
                  id={pkg.id}
                  name={pkg.name}
                  price={pkg.price}
                  description={pkg.description || ''}
                  features={features}
                  popular={pkg.name.toLowerCase().includes('premium')}
                  hasActivePackage={!!userActivePackage}
                />
              );
            })}
          </div>
        )}

        {/* FAQ Section */}
        <div className="max-w-4xl mx-auto mt-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">Frequently Asked Questions</h2>
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="font-semibold mb-2">How does the payment process work?</h3>
              <p className="text-gray-600">
                After selecting a package, you'll receive bank deposit instructions. Simply make the deposit 
                and send proof of payment via WhatsApp. We'll verify and activate your package within 24 hours.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="font-semibold mb-2">Can I upgrade or downgrade my package?</h3>
              <p className="text-gray-600">
                Yes, you can change your package at any time. Contact our support team for assistance 
                with package changes.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="font-semibold mb-2">What happens if I don't use all my bookings?</h3>
              <p className="text-gray-600">
                Unused bookings don't roll over to the next month. We recommend choosing a package 
                that matches your expected usage.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionPackages;
