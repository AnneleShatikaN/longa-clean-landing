
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ChevronRight, Package, Heart, Star, CheckCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { usePackageRecommendations } from '@/hooks/usePackageRecommendations';
import { useServices } from '@/contexts/ServiceContext';
import { PaymentFlow } from '@/components/payment/PaymentFlow';

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
}

const steps: OnboardingStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to Longa',
    description: 'Let us help you find the perfect service package'
  },
  {
    id: 'preferences',
    title: 'Service Preferences',
    description: 'What services are you most interested in?'
  },
  {
    id: 'packages',
    title: 'Recommended Packages',
    description: 'Based on your preferences, here are our recommendations'
  },
  {
    id: 'complete',
    title: 'All Set!',
    description: 'You can start booking services right away'
  }
];

interface OnboardingWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

export const OnboardingWizard: React.FC<OnboardingWizardProps> = ({
  isOpen,
  onClose,
  onComplete
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [selectedPackage, setSelectedPackage] = useState<string | null>(null);
  const [showPaymentFlow, setShowPaymentFlow] = useState(false);
  
  const { user } = useAuth();
  const { recommendations, isLoading: recommendationsLoading } = usePackageRecommendations();
  const { services } = useServices();

  const progress = ((currentStep + 1) / steps.length) * 100;

  const handleServiceToggle = (serviceId: string) => {
    setSelectedServices(prev => 
      prev.includes(serviceId) 
        ? prev.filter(id => id !== serviceId)
        : [...prev, serviceId]
    );
  };

  const handlePackageSelect = (packageId: string) => {
    setSelectedPackage(packageId);
    setShowPaymentFlow(true);
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    onComplete();
    onClose();
  };

  if (!isOpen) return null;

  const getTransactionData = () => ({
    transaction_type: 'subscription' as const,
    package_id: selectedPackage || '',
    amount: 299 // This should come from package data
  });

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md max-h-[90vh] overflow-y-auto">
          <CardHeader className="text-center">
            <div className="mb-4">
              <Progress value={progress} className="w-full" />
              <p className="text-sm text-muted-foreground mt-2">
                Step {currentStep + 1} of {steps.length}
              </p>
            </div>
            <CardTitle className="flex items-center gap-2 justify-center">
              <Package className="h-5 w-5 text-blue-600" />
              {steps[currentStep].title}
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              {steps[currentStep].description}
            </p>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Welcome Step */}
            {currentStep === 0 && (
              <div className="text-center space-y-4">
                <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                  <Heart className="h-10 w-10 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold">
                  Hi {user?.full_name?.split(' ')[0] || 'there'}! 👋
                </h3>
                <p className="text-gray-600">
                  We're excited to help you discover the best home services in Windhoek. 
                  Let's get you set up with the perfect package.
                </p>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="bg-green-50 p-3 rounded-lg">
                    <div className="font-medium text-green-800">Quality Providers</div>
                    <div className="text-green-600">Vetted professionals</div>
                  </div>
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <div className="font-medium text-blue-800">Easy Booking</div>
                    <div className="text-blue-600">Book in seconds</div>
                  </div>
                </div>
              </div>
            )}

            {/* Service Preferences Step */}
            {currentStep === 1 && (
              <div className="space-y-4">
                <p className="text-center text-gray-600">
                  Select the services you're most interested in (optional):
                </p>
                <div className="grid grid-cols-1 gap-3">
                  {services.slice(0, 6).map((service) => (
                    <button
                      key={service.id}
                      onClick={() => handleServiceToggle(service.id)}
                      className={`p-4 text-left border rounded-lg transition-all ${
                        selectedServices.includes(service.id)
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium">{service.name}</div>
                          <div className="text-sm text-gray-500">
                            N${service.clientPrice}
                          </div>
                        </div>
                        {selectedServices.includes(service.id) && (
                          <CheckCircle className="h-5 w-5 text-blue-600" />
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Package Recommendations Step */}
            {currentStep === 2 && (
              <div className="space-y-4">
                {recommendationsLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="text-sm text-gray-500 mt-2">Finding perfect packages...</p>
                  </div>
                ) : (
                  <>
                    <p className="text-center text-gray-600">
                      Based on your preferences, here are our top recommendations:
                    </p>
                    <div className="space-y-3">
                      {recommendations.map((rec, index) => (
                        <div key={rec.package_id} className="border rounded-lg p-4">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <div className="flex items-center gap-2">
                                <h4 className="font-medium">Package {index + 1}</h4>
                                {index === 0 && (
                                  <Badge className="bg-yellow-100 text-yellow-800">
                                    <Star className="h-3 w-3 mr-1" />
                                    Recommended
                                  </Badge>
                                )}
                              </div>
                              <p className="text-sm text-gray-600">{rec.reason}</p>
                            </div>
                            <div className="text-right">
                              <div className="font-semibold">N$299</div>
                              <div className="text-xs text-gray-500">/month</div>
                            </div>
                          </div>
                          <Button
                            onClick={() => handlePackageSelect(rec.package_id)}
                            className="w-full"
                            variant={index === 0 ? "default" : "outline"}
                          >
                            Choose This Package
                          </Button>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Complete Step */}
            {currentStep === 3 && (
              <div className="text-center space-y-4">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle className="h-10 w-10 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold">Welcome to Longa!</h3>
                <p className="text-gray-600">
                  You're all set up and ready to start booking quality home services. 
                  Your package gives you access to vetted providers across Windhoek.
                </p>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-medium text-blue-800 mb-2">What's Next?</h4>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>• Browse available services</li>
                    <li>• Select your preferred provider</li>
                    <li>• Book instantly with your package</li>
                  </ul>
                </div>
              </div>
            )}

            {/* Navigation */}
            <div className="flex justify-between pt-4">
              <Button
                variant="outline"
                onClick={currentStep === 0 ? onClose : handlePrevious}
                className="flex items-center gap-2"
              >
                <ChevronLeft className="h-4 w-4" />
                {currentStep === 0 ? 'Skip' : 'Previous'}
              </Button>

              <Button
                onClick={currentStep === steps.length - 1 ? handleComplete : handleNext}
                className="flex items-center gap-2"
              >
                {currentStep === steps.length - 1 ? 'Get Started' : 'Next'}
                {currentStep !== steps.length - 1 && <ChevronRight className="h-4 w-4" />}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Payment Flow */}
      <PaymentFlow
        isOpen={showPaymentFlow}
        onClose={() => setShowPaymentFlow(false)}
        transactionData={getTransactionData()}
        title="Subscribe to Package"
        description="Complete your payment to activate your service package and start booking."
      />
    </>
  );
};
