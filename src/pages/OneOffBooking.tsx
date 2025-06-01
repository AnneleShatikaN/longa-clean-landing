
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useServices } from '@/contexts/ServiceContext';
import { useBookings } from '@/contexts/BookingContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { BookingCalendar } from '@/components/booking/BookingCalendar';
import { ArrowLeft, Home, Car, Sparkles, Shirt, Eye, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const getServiceIcon = (serviceName: string) => {
  const name = serviceName.toLowerCase();
  if (name.includes('clean')) return Home;
  if (name.includes('car') || name.includes('vehicle')) return Car;
  if (name.includes('laundry') || name.includes('wash')) return Shirt;
  if (name.includes('window')) return Eye;
  if (name.includes('deep') || name.includes('premium')) return Sparkles;
  return Home; // Default icon
};

const OneOffBooking = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { services, isLoading: servicesLoading, error: servicesError } = useServices();
  const { createBooking, isLoading: bookingLoading } = useBookings();
  const { toast } = useToast();
  const [selectedService, setSelectedService] = useState<any>(null);
  const [step, setStep] = useState<'select-service' | 'book-service'>('select-service');

  // Filter for active one-off services only
  const oneOffServices = services.filter(service => 
    service.type === 'one-off' && service.status === 'active'
  );

  const handleServiceSelect = (service: any) => {
    setSelectedService(service);
    setStep('book-service');
  };

  const handleBookingConfirm = async (bookingData: {
    date: string;
    time: string;
    providerId: number;
    providerName: string;
  }) => {
    if (!selectedService || !user) return;

    try {
      await createBooking({
        clientId: parseInt(user.id || '1'),
        clientName: user.name || 'Client',
        providerId: bookingData.providerId,
        providerName: bookingData.providerName,
        serviceId: selectedService.id,
        serviceName: selectedService.name,
        date: bookingData.date,
        time: bookingData.time,
        amount: selectedService.clientPrice,
        duration: selectedService.duration.hours * 60 + selectedService.duration.minutes,
        jobType: 'one-off'
      });

      toast({
        title: "Booking Request Sent!",
        description: `Your booking for ${selectedService.name} has been sent to ${bookingData.providerName}. You'll receive a notification once they respond.`,
      });

      navigate('/dashboard/client');
    } catch (error) {
      toast({
        title: "Booking Failed",
        description: error instanceof Error ? error.message : "Failed to create booking. Please try again.",
        variant: "destructive"
      });
    }
  };

  if (servicesError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Alert variant="destructive" className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{servicesError}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Button 
                variant="ghost" 
                onClick={() => {
                  if (step === 'book-service') {
                    setStep('select-service');
                    setSelectedService(null);
                  } else {
                    navigate('/dashboard/client');
                  }
                }}
                className="text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                {step === 'book-service' ? 'Back to Services' : 'Back to Dashboard'}
              </Button>
              <span className="text-gray-300">|</span>
              <h1 className="text-2xl font-bold text-purple-600">
                {step === 'book-service' ? 'Book Service' : 'Select Service'}
              </h1>
            </div>
            <div className="text-sm text-gray-600">
              Welcome, {user?.name}
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {step === 'select-service' ? (
          // Service Selection Step
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              Choose a Service for One-Time Booking
            </h2>
            
            {servicesLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <Card key={i} className="animate-pulse">
                    <CardContent className="p-6">
                      <div className="flex items-start space-x-4">
                        <div className="bg-gray-200 p-3 rounded-lg w-12 h-12"></div>
                        <div className="flex-1 space-y-2">
                          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                          <div className="h-3 bg-gray-200 rounded w-full"></div>
                          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : oneOffServices.length === 0 ? (
              <Card>
                <CardContent className="pt-8 pb-8 text-center">
                  <Home className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    No Services Available
                  </h3>
                  <p className="text-gray-600 mb-4">
                    There are currently no one-off services available for booking.
                  </p>
                  <Button onClick={() => navigate('/dashboard/client')}>
                    Return to Dashboard
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {oneOffServices.map((service) => {
                  const IconComponent = getServiceIcon(service.name);
                  return (
                    <Card 
                      key={service.id}
                      className="cursor-pointer transition-all hover:shadow-lg hover:border-purple-200"
                      onClick={() => handleServiceSelect(service)}
                    >
                      <CardContent className="p-6">
                        <div className="flex items-start space-x-4">
                          <div className="bg-purple-100 p-3 rounded-lg">
                            <IconComponent className="h-6 w-6 text-purple-600" />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900 mb-2">{service.name}</h3>
                            <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                              {service.description}
                            </p>
                            
                            {service.tags && service.tags.length > 0 && (
                              <div className="flex flex-wrap gap-1 mb-3">
                                {service.tags.slice(0, 2).map((tag, index) => (
                                  <Badge key={index} variant="secondary" className="text-xs">
                                    {tag}
                                  </Badge>
                                ))}
                                {service.tags.length > 2 && (
                                  <Badge variant="outline" className="text-xs">
                                    +{service.tags.length - 2}
                                  </Badge>
                                )}
                              </div>
                            )}
                            
                            <div className="flex items-center justify-between">
                              <span className="text-lg font-bold text-purple-600">
                                N${service.clientPrice}
                              </span>
                              <Badge variant="outline" className="text-xs">
                                {service.duration.hours}h {service.duration.minutes > 0 ? `${service.duration.minutes}m` : ''}
                              </Badge>
                            </div>

                            {service.averageRating > 0 && (
                              <div className="flex items-center gap-1 mt-2 text-sm text-gray-600">
                                <span className="text-yellow-500">⭐</span>
                                <span>{service.averageRating.toFixed(1)}</span>
                                <span>({service.totalBookings} bookings)</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        ) : (
          // Booking Step
          <div>
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Book: {selectedService?.name}
              </h2>
              <p className="text-gray-600">
                Select your preferred date, time, and provider
              </p>
            </div>

            <BookingCalendar
              serviceId={selectedService?.id}
              serviceName={selectedService?.name}
              serviceDuration={selectedService?.duration.hours * 60 + selectedService?.duration.minutes}
              onBookingConfirm={handleBookingConfirm}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default OneOffBooking;
