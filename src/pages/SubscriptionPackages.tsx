
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useServices } from '@/contexts/ServiceContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, ArrowLeft, Sparkles, Home, Car } from 'lucide-react';

const getServiceIcon = (serviceName: string) => {
  const name = serviceName.toLowerCase();
  if (name.includes('premium') || name.includes('pro')) return Sparkles;
  if (name.includes('car') || name.includes('vehicle')) return Car;
  return Home; // Default icon
};

const SubscriptionPackages = () => {
  const navigate = useNavigate();
  const { services, isLoading } = useServices();

  // Filter for active subscription services only
  const subscriptionServices = services.filter(service => 
    service.type === 'subscription' && service.status === 'active'
  );

  const handleGetStarted = (serviceId: string) => {
    console.log(`Getting started with service ${serviceId}`);
    // TODO: Navigate to subscription signup/payment flow
  };

  if (isLoading) {
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
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Loading...</h1>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader className="text-center pb-4">
                  <div className="h-6 bg-gray-200 rounded w-3/4 mx-auto mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto mb-4"></div>
                  <div className="h-8 bg-gray-200 rounded w-2/3 mx-auto"></div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-3 mb-8">
                    {[1, 2, 3, 4].map((j) => (
                      <div key={j} className="h-4 bg-gray-200 rounded"></div>
                    ))}
                  </div>
                  <div className="h-10 bg-gray-200 rounded"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

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
        {subscriptionServices.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Sparkles className="h-16 w-16 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Subscription Packages Available</h3>
            <p className="text-gray-600 mb-6">There are currently no subscription packages available.</p>
            <Button 
              variant="outline"
              onClick={() => navigate('/booking/one-off')}
              size="lg"
            >
              Browse One-Time Services
            </Button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
              {subscriptionServices.map((service, index) => {
                const IconComponent = getServiceIcon(service.name);
                const isPopular = index === 1; // Mark middle service as popular for now
                
                return (
                  <Card 
                    key={service.id}
                    className={`relative ${
                      isPopular 
                        ? 'border-purple-500 border-2 shadow-xl scale-105' 
                        : 'border-gray-200 hover:shadow-lg'
                    } transition-all duration-300`}
                  >
                    {isPopular && (
                      <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                        <Badge className="bg-purple-500 text-white px-4 py-1 text-sm font-semibold">
                          Most Popular
                        </Badge>
                      </div>
                    )}
                    
                    <CardHeader className="text-center pb-4">
                      <div className="bg-purple-100 p-3 rounded-lg w-fit mx-auto mb-4">
                        <IconComponent className="h-8 w-8 text-purple-600" />
                      </div>
                      <CardTitle className="text-2xl font-bold text-gray-900">
                        {service.name}
                      </CardTitle>
                      <p className="text-gray-600 mb-4">{service.description}</p>
                      <div className="flex items-center justify-center">
                        <span className="text-4xl font-bold text-gray-900">N${service.clientPrice}</span>
                        <span className="text-gray-600 ml-2">/month</span>
                      </div>
                    </CardHeader>

                    <CardContent className="pt-0">
                      {/* Service Tags as Features */}
                      {service.tags && service.tags.length > 0 && (
                        <ul className="space-y-3 mb-6">
                          {service.tags.map((tag, tagIndex) => (
                            <li key={tagIndex} className="flex items-start">
                              <Check className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                              <span className="text-gray-700">{tag}</span>
                            </li>
                          ))}
                        </ul>
                      )}

                      {/* Duration info */}
                      <div className="mb-6 p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Service Duration:</span>
                          <span className="text-sm font-medium text-gray-900">
                            {service.duration.hours}h {service.duration.minutes > 0 ? `${service.duration.minutes}m` : ''}
                          </span>
                        </div>
                      </div>

                      <Button 
                        onClick={() => handleGetStarted(service.id)}
                        className={`w-full ${
                          isPopular 
                            ? 'bg-purple-600 hover:bg-purple-700 text-white' 
                            : 'bg-gray-900 hover:bg-gray-800 text-white'
                        }`}
                        size="lg"
                      >
                        Get Started
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
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
          </>
        )}
      </div>
    </div>
  );
};

export default SubscriptionPackages;
