
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { PackageCard } from '@/components/subscription/PackageCard';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const SubscriptionPackages = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

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

  const packages = [
    {
      id: 'basic',
      name: 'Basic Package',
      price: 299,
      description: 'Perfect for occasional service needs',
      features: [
        '3 service bookings per month',
        'Email support',
        'Basic scheduling',
        'Standard providers'
      ]
    },
    {
      id: 'premium',
      name: 'Premium Package',
      price: 599,
      description: 'Most popular choice for regular users',
      features: [
        '8 service bookings per month',
        'Priority support',
        'Advanced scheduling',
        'Premium providers',
        'Emergency bookings',
        'Booking modifications'
      ],
      popular: true
    },
    {
      id: 'enterprise',
      name: 'Enterprise Package',
      price: 1199,
      description: 'Unlimited access for businesses',
      features: [
        'Unlimited service bookings',
        '24/7 phone support',
        'Dedicated account manager',
        'All premium providers',
        'Priority emergency bookings',
        'Custom scheduling',
        'Bulk booking discounts'
      ]
    }
  ];

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

        {/* Packages Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {packages.map((pkg) => (
            <PackageCard
              key={pkg.id}
              id={pkg.id}
              name={pkg.name}
              price={pkg.price}
              description={pkg.description}
              features={pkg.features}
              popular={pkg.popular}
            />
          ))}
        </div>

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
