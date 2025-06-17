
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ChevronLeft, ChevronRight, Package, Heart, Star, CheckCircle, MapPin, Mail, AlertCircle, BookOpen, Clock } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { usePackageRecommendations } from '@/hooks/usePackageRecommendations';
import { useServices } from '@/contexts/ServiceContext';
import { PaymentFlow } from '@/components/payment/PaymentFlow';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  canSkip?: boolean;
}

const NAMIBIAN_TOWNS = [
  { value: 'windhoek', label: 'Windhoek' },
  { value: 'walvis-bay', label: 'Walvis Bay' },
  { value: 'swakopmund', label: 'Swakopmund' },
  { value: 'oshakati', label: 'Oshakati' },
  { value: 'rundu', label: 'Rundu' },
  { value: 'otjiwarongo', label: 'Otjiwarongo' },
  { value: 'gobabis', label: 'Gobabis' },
  { value: 'katima-mulilo', label: 'Katima Mulilo' },
  { value: 'tsumeb', label: 'Tsumeb' },
  { value: 'keetmanshoop', label: 'Keetmanshoop' },
  { value: 'rehoboth', label: 'Rehoboth' },
  { value: 'mariental', label: 'Mariental' }
];

const steps: OnboardingStep[] = [
  {
    id: 'email-verification',
    title: 'Verify Your Email',
    description: 'Please verify your email address to continue'
  },
  {
    id: 'welcome',
    title: 'Welcome to Longa',
    description: 'Let us show you how our platform works'
  },
  {
    id: 'how-it-works',
    title: 'How Longa Works',
    description: 'Learn about our services and booking options',
    canSkip: true
  },
  {
    id: 'location',
    title: 'Your Location',
    description: 'Tell us where you need services'
  },
  {
    id: 'preferences',
    title: 'Service Preferences',
    description: 'What services interest you most?',
    canSkip: true
  },
  {
    id: 'packages',
    title: 'Recommended Packages',
    description: 'Based on your preferences, here are our recommendations',
    canSkip: true
  },
  {
    id: 'complete',
    title: 'You\'re All Set!',
    description: 'Welcome to the Longa family'
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
  const [userLocation, setUserLocation] = useState('');
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [checkingEmailStatus, setCheckingEmailStatus] = useState(true);
  
  const { user } = useAuth();
  const { recommendations, isLoading: recommendationsLoading } = usePackageRecommendations();
  const { services } = useServices();
  const { toast } = useToast();

  const progress = ((currentStep + 1) / steps.length) * 100;

  // Check email verification status
  useEffect(() => {
    const checkEmailVerification = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await supabase.auth.getUser();
        if (error) throw error;
        
        const emailConfirmed = data.user?.email_confirmed_at !== null;
        setIsEmailVerified(emailConfirmed);
        
        // If email is verified, skip email verification step
        if (emailConfirmed && currentStep === 0) {
          setCurrentStep(1);
        }
      } catch (error) {
        console.error('Error checking email verification:', error);
      } finally {
        setCheckingEmailStatus(false);
      }
    };

    if (user) {
      checkEmailVerification();
    }
  }, [user]);

  const handleResendVerification = async () => {
    if (!user?.email) return;
    
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: user.email,
        options: {
          emailRedirectTo: `${window.location.origin}/`
        }
      });
      
      if (error) throw error;
      
      toast({
        title: "Verification email sent!",
        description: "Please check your email and click the verification link.",
      });
    } catch (error) {
      console.error('Error resending verification:', error);
      toast({
        title: "Error",
        description: "Failed to resend verification email. Please try again.",
        variant: "destructive",
      });
    }
  };

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
    if (currentStep === 0 && !isEmailVerified) {
      // Can't proceed without email verification
      return;
    }
    
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    if (steps[currentStep].canSkip) {
      handleNext();
    }
  };

  const handleComplete = async () => {
    try {
      // Save onboarding completion status
      if (user) {
        const { error } = await supabase
          .from('profiles')
          .update({ 
            onboarding_completed: true,
            preferred_location: userLocation || null,
            updated_at: new Date().toISOString()
          })
          .eq('id', user.id);
        
        if (error) throw error;
      }
      
      onComplete();
      onClose();
    } catch (error) {
      console.error('Error completing onboarding:', error);
      // Still complete onboarding even if saving fails
      onComplete();
      onClose();
    }
  };

  if (!isOpen) return null;

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
            {/* Email Verification Step */}
            {currentStep === 0 && (
              <div className="text-center space-y-4">
                {checkingEmailStatus ? (
                  <div className="py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="text-sm text-gray-500 mt-2">Checking email status...</p>
                  </div>
                ) : isEmailVerified ? (
                  <div className="space-y-4">
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                      <CheckCircle className="h-10 w-10 text-green-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-green-800">Email Verified!</h3>
                    <p className="text-gray-600">Your email has been verified. Let's continue with your setup.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto">
                      <Mail className="h-10 w-10 text-yellow-600" />
                    </div>
                    <h3 className="text-lg font-semibold">Verify Your Email</h3>
                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        Please check your email and click the verification link to continue.
                      </AlertDescription>
                    </Alert>
                    <div className="text-sm text-gray-600 space-y-2">
                      <p>We sent a verification email to:</p>
                      <p className="font-medium text-gray-900 bg-gray-50 p-2 rounded">{user?.email}</p>
                    </div>
                    <Button onClick={handleResendVerification} variant="outline" className="w-full">
                      Resend Verification Email
                    </Button>
                    <p className="text-xs text-gray-500">
                      Check your spam folder if you don't see the email.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Welcome Step */}
            {currentStep === 1 && (
              <div className="text-center space-y-4">
                <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                  <Heart className="h-10 w-10 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold">
                  Hi {user?.full_name?.split(' ')[0] || 'there'}! 👋
                </h3>
                <p className="text-gray-600">
                  Welcome to Longa! We're excited to help you discover the best home services in Namibia. 
                  Let's get you set up in just a few quick steps.
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

            {/* How It Works Step */}
            {currentStep === 2 && (
              <div className="space-y-4">
                <div className="text-center mb-4">
                  <BookOpen className="h-12 w-12 text-blue-600 mx-auto mb-2" />
                  <h3 className="text-lg font-semibold">How Longa Works</h3>
                </div>
                <div className="space-y-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-2">Two Ways to Book:</h4>
                    <div className="space-y-3 text-sm">
                      <div className="flex items-start gap-3">
                        <Package className="h-4 w-4 text-blue-600 mt-0.5" />
                        <div>
                          <strong>Packages:</strong> Buy credits upfront for better rates and convenience
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <Clock className="h-4 w-4 text-green-600 mt-0.5" />
                        <div>
                          <strong>One-off:</strong> Book individual services as needed
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-medium text-blue-800 mb-2">Simple Process:</h4>
                    <ol className="text-sm text-blue-700 space-y-1">
                      <li>1. Choose your service</li>
                      <li>2. Select a verified provider</li>
                      <li>3. Pick your time and pay</li>
                      <li>4. Relax while we handle the rest!</li>
                    </ol>
                  </div>
                </div>
              </div>
            )}

            {/* Location Step */}
            {currentStep === 3 && (
              <div className="space-y-4">
                <div className="text-center mb-4">
                  <MapPin className="h-12 w-12 text-blue-600 mx-auto mb-2" />
                  <h3 className="text-lg font-semibold">Where do you need services?</h3>
                  <p className="text-sm text-gray-600">This helps us show you available providers in your area.</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">Primary Location</Label>
                  <Select value={userLocation} onValueChange={setUserLocation}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select your city/town" />
                    </SelectTrigger>
                    <SelectContent>
                      {NAMIBIAN_TOWNS.map((town) => (
                        <SelectItem key={town.value} value={town.value}>
                          {town.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-gray-500">
                    You can change this later or add additional locations in your profile.
                  </p>
                </div>
              </div>
            )}

            {/* Service Preferences Step */}
            {currentStep === 4 && (
              <div className="space-y-4">
                <p className="text-center text-gray-600">
                  Select services you're interested in (this helps us personalize your experience):
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
                            From N${service.clientPrice}
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
            {currentStep === 5 && (
              <div className="space-y-4">
                {recommendationsLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="text-sm text-gray-500 mt-2">Finding perfect packages...</p>
                  </div>
                ) : (
                  <>
                    <p className="text-center text-gray-600">
                      Based on your preferences, here are our recommendations:
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
                    <div className="text-center">
                      <p className="text-sm text-gray-500 mb-2">Not ready for a package?</p>
                      <Button variant="ghost" onClick={handleNext} className="text-blue-600">
                        I'll browse services individually
                      </Button>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Complete Step */}
            {currentStep === 6 && (
              <div className="text-center space-y-4">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle className="h-10 w-10 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold">Welcome to Longa!</h3>
                <p className="text-gray-600">
                  You're all set up and ready to start booking quality home services. 
                  {userLocation && ` We'll show you providers available in ${NAMIBIAN_TOWNS.find(t => t.value === userLocation)?.label}.`}
                </p>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-medium text-blue-800 mb-2">What's Next?</h4>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>• Browse available services in your area</li>
                    <li>• Select your preferred provider</li>
                    <li>• Book instantly or schedule for later</li>
                    {selectedServices.length > 0 && <li>• Check out your preferred services first</li>}
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
                disabled={currentStep === 0 && !isEmailVerified}
              >
                <ChevronLeft className="h-4 w-4" />
                {currentStep === 0 ? 'Close' : 'Previous'}
              </Button>

              <div className="flex items-center gap-2">
                {steps[currentStep].canSkip && (
                  <Button variant="ghost" onClick={handleSkip}>
                    Skip
                  </Button>
                )}
                
                <Button
                  onClick={currentStep === steps.length - 1 ? handleComplete : handleNext}
                  disabled={(currentStep === 0 && !isEmailVerified) || (currentStep === 3 && !userLocation)}
                  className="flex items-center gap-2"
                >
                  {currentStep === steps.length - 1 ? 'Get Started' : 'Next'}
                  {currentStep !== steps.length - 1 && <ChevronRight className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Payment Flow */}
      {showPaymentFlow && (
        <PaymentFlow
          amount={299}
          packageId={selectedPackage || ''}
          transactionType="subscription"
          onPaymentSubmitted={() => setShowPaymentFlow(false)}
        />
      )}
    </>
  );
};
