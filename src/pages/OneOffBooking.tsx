
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ArrowLeft, Calendar as CalendarIcon, Clock, Home, Car, Sparkles, Shirt, Eye } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Service } from '@/contexts/DataContext';

const getServiceIcon = (serviceName: string) => {
  const name = serviceName.toLowerCase();
  if (name.includes('clean')) return Home;
  if (name.includes('car') || name.includes('vehicle')) return Car;
  if (name.includes('laundry') || name.includes('wash')) return Shirt;
  if (name.includes('window')) return Eye;
  if (name.includes('deep') || name.includes('premium')) return Sparkles;
  return Home; // Default icon
};

const timeSlots = [
  '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'
];

const OneOffBooking = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { services, isLoading } = useData();
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filter for active one-off services only
  const oneOffServices = services.filter(service => 
    service.type === 'one-off' && service.status === 'active'
  );

  const handleServiceSelect = (service: Service) => {
    setSelectedService(service);
  };

  const handleConfirmBooking = async () => {
    if (!selectedService || !selectedDate || !selectedTime) {
      return;
    }

    setIsSubmitting(true);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Navigate back to dashboard with success message
    navigate('/dashboard/client');
    setIsSubmitting(false);
  };

  const isFormValid = selectedService && selectedDate && selectedTime;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Button 
                variant="ghost" 
                onClick={() => navigate('/dashboard/client')}
                className="text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
              <span className="text-gray-300">|</span>
              <h1 className="text-2xl font-bold text-purple-600">Book a Service</h1>
            </div>
            <div className="text-sm text-gray-600">
              Welcome, {user?.name}
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Service Selection */}
          <div className="lg:col-span-2 space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Select a Service</h2>
              {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[1, 2, 3, 4].map((i) => (
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
                <div className="text-center py-12">
                  <div className="text-gray-400 mb-4">
                    <Home className="h-16 w-16 mx-auto" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Services Available</h3>
                  <p className="text-gray-600">There are currently no one-off services available for booking.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {oneOffServices.map((service) => {
                    const IconComponent = getServiceIcon(service.name);
                    return (
                      <Card 
                        key={service.id}
                        className={cn(
                          "cursor-pointer transition-all hover:shadow-md",
                          selectedService?.id === service.id 
                            ? "border-purple-200 bg-purple-50" 
                            : "border-gray-200 hover:border-purple-100"
                        )}
                        onClick={() => handleServiceSelect(service)}
                      >
                        <CardContent className="p-6">
                          <div className="flex items-start space-x-4">
                            <div className="bg-purple-100 p-3 rounded-lg">
                              <IconComponent className="h-6 w-6 text-purple-600" />
                            </div>
                            <div className="flex-1">
                              <h3 className="font-semibold text-gray-900 mb-1">{service.name}</h3>
                              <p className="text-sm text-gray-600 mb-3">{service.description}</p>
                              
                              {/* Service Tags */}
                              {service.tags && service.tags.length > 0 && (
                                <div className="flex flex-wrap gap-1 mb-3">
                                  {service.tags.map((tag, index) => (
                                    <Badge key={index} variant="secondary" className="text-xs">
                                      {tag}
                                    </Badge>
                                  ))}
                                </div>
                              )}
                              
                              <div className="flex items-center justify-between">
                                <span className="text-lg font-bold text-purple-600">N${service.clientPrice}</span>
                                <Badge variant="secondary" className="text-xs">
                                  <Clock className="h-3 w-3 mr-1" />
                                  {service.duration.hours}h {service.duration.minutes > 0 ? `${service.duration.minutes}m` : ''}
                                </Badge>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Date & Time Selection */}
            {selectedService && (
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Select Date & Time</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Date Selection */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Choose Date</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !selectedDate && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {selectedDate ? format(selectedDate, "PPP") : "Pick a date"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={selectedDate}
                            onSelect={setSelectedDate}
                            disabled={(date) => date < new Date()}
                            initialFocus
                            className="pointer-events-auto"
                          />
                        </PopoverContent>
                      </Popover>
                    </CardContent>
                  </Card>

                  {/* Time Selection */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Choose Time</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Select value={selectedTime} onValueChange={setSelectedTime}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select time slot" />
                        </SelectTrigger>
                        <SelectContent>
                          {timeSlots.map((time) => (
                            <SelectItem key={time} value={time}>
                              {time}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}
          </div>

          {/* Booking Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-8">
              <CardHeader>
                <CardTitle className="text-lg">Booking Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {selectedService ? (
                  <>
                    <div className="space-y-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium text-gray-900">{selectedService.name}</p>
                          <p className="text-sm text-gray-600">
                            {selectedService.duration.hours}h {selectedService.duration.minutes > 0 ? `${selectedService.duration.minutes}m` : ''}
                          </p>
                        </div>
                        <span className="font-semibold text-gray-900">N${selectedService.clientPrice}</span>
                      </div>
                      
                      {selectedDate && (
                        <div className="text-sm text-gray-600">
                          <p><strong>Date:</strong> {format(selectedDate, "PPP")}</p>
                        </div>
                      )}
                      
                      {selectedTime && (
                        <div className="text-sm text-gray-600">
                          <p><strong>Time:</strong> {selectedTime}</p>
                        </div>
                      )}
                    </div>

                    <div className="border-t pt-4">
                      <div className="flex justify-between items-center">
                        <span className="text-lg font-semibold text-gray-900">Total</span>
                        <span className="text-lg font-bold text-purple-600">N${selectedService.clientPrice}</span>
                      </div>
                    </div>

                    <Button 
                      className="w-full bg-purple-600 hover:bg-purple-700" 
                      onClick={handleConfirmBooking}
                      disabled={!isFormValid || isSubmitting}
                    >
                      {isSubmitting ? 'Processing...' : 'Confirm & Pay'}
                    </Button>
                  </>
                ) : (
                  <p className="text-gray-500 text-center py-8">
                    Select a service to see booking details
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OneOffBooking;
