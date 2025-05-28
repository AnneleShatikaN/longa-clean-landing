
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, ArrowLeft } from 'lucide-react';

const SubscriptionPackages = () => {
  const navigate = useNavigate();

  const packages = [
    {
      id: 'basic',
      name: 'Basic',
      price: 900,
      description: 'Perfect for individuals',
      popular: false,
      features: [
        '2 laundry services per month',
        '1 car wash per month',
        'Basic home cleaning',
        'Email support',
        'Standard booking'
      ]
    },
    {
      id: 'standard',
      name: 'Standard',
      price: 1500,
      description: 'Most popular choice',
      popular: true,
      features: [
        '4 laundry services per month',
        '2 car washes per month',
        'Standard home cleaning',
        'Phone support',
        'Same-day booking',
        'Priority scheduling'
      ]
    },
    {
      id: 'premium',
      name: 'Premium',
      price: 2500,
      description: 'For busy households',
      popular: false,
      features: [
        'Unlimited laundry services',
        '4 car washes per month',
        'Deep home cleaning',
        'Priority support 24/7',
        'Custom scheduling',
        'Dedicated service manager'
      ]
    }
  ];

  const handleGetStarted = (packageId: string) => {
    console.log(`Getting started with ${packageId} package`);
    // TODO: Navigate to signup/payment flow
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            <Button 
              variant="ghost" 
              onClick={() => navigate('/dashboard/client')}
              className="mr-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
            <h1 className="text-2xl font-bold text-purple-600">Longa</h1>
            <span className="text-gray-300 mx-2">|</span>
            <h2 className="text-lg text-gray-700">Subscription Packages</h2>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Choose Your Perfect Plan
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Save time and money with our convenient subscription packages. 
            Get regular services delivered right to your doorstep.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {packages.map((pkg) => (
            <Card 
              key={pkg.id}
              className={`relative ${
                pkg.popular 
                  ? 'border-purple-500 border-2 shadow-xl scale-105' 
                  : 'border-gray-200 hover:shadow-lg'
              } transition-all duration-300`}
            >
              {pkg.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-purple-500 text-white px-4 py-1 text-sm font-semibold">
                    Most Popular
                  </Badge>
                </div>
              )}
              
              <CardHeader className="text-center pb-4">
                <CardTitle className="text-2xl font-bold text-gray-900">
                  {pkg.name}
                </CardTitle>
                <p className="text-gray-600 mb-4">{pkg.description}</p>
                <div className="flex items-center justify-center">
                  <span className="text-4xl font-bold text-gray-900">N${pkg.price}</span>
                  <span className="text-gray-600 ml-2">/month</span>
                </div>
              </CardHeader>

              <CardContent className="pt-0">
                <ul className="space-y-3 mb-8">
                  {pkg.features.map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button 
                  onClick={() => handleGetStarted(pkg.id)}
                  className={`w-full ${
                    pkg.popular 
                      ? 'bg-purple-600 hover:bg-purple-700 text-white' 
                      : 'bg-gray-900 hover:bg-gray-800 text-white'
                  }`}
                  size="lg"
                >
                  Get Started
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* One-time Services Link */}
        <div className="text-center">
          <div className="bg-white rounded-lg shadow-sm border p-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Need a one-time service?
            </h3>
            <p className="text-gray-600 mb-6">
              Not ready for a subscription? Book individual services as needed.
            </p>
            <Button 
              variant="outline"
              onClick={() => navigate('/booking/one-off')}
              size="lg"
            >
              Browse One-Time Services
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionPackages;
