
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ArrowLeft, Calendar as CalendarIcon, Clock, Home, Car, Sparkles, Shirt, Eye } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
  duration: string;
  icon: React.ComponentType<{ className?: string }>;
}

const services: Service[] = [
  {
    id: 'basic-cleaning',
    name: 'Basic Home Cleaning',
    description: 'Regular cleaning of living areas, kitchen, and bathrooms',
    price: 150,
    duration: '2-3 hours',
    icon: Home,
  },
  {
    id: 'deep-cleaning',
    name: 'Deep Home Cleaning',
    description: 'Comprehensive cleaning including baseboards, inside appliances, and detailed scrubbing',
    price: 300,
    duration: '4-6 hours',
    icon: Sparkles,
  },
  {
    id: 'laundry',
    name: 'Laundry Service',
    description: 'Wash, dry, and fold your clothes with premium detergents',
    price: 80,
    duration: '3-4 hours',
    icon: Shirt,
  },
  {
    id: 'car-wash',
    name: 'Car Wash',
    description: 'Complete exterior and interior car cleaning',
    price: 120,
    duration: '1-2 hours',
    icon: Car,
  },
  {
    id: 'window-cleaning',
    name: 'Window Cleaning',
    description: 'Professional cleaning of interior and exterior windows',
    price: 100,
    duration: '1-2 hours',
    icon: Eye,
  },
];

const timeSlots = [
  '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'
];

const OneOffBooking = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const handleServiceSelect = (service: Service) => {
    setSelectedService(service);
  };

  const handleConfirmBooking = async () => {
    if (!selectedService || !selectedDate || !selectedTime) {
      return;
    }

    setIsLoading(true);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Navigate back to dashboard with success message
    navigate('/dashboard/client');
    setIsLoading(false);
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {services.map((service) => {
                  const IconComponent = service.icon;
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
                            <div className="flex items-center justify-between">
                              <span className="text-lg font-bold text-purple-600">N${service.price}</span>
                              <Badge variant="secondary" className="text-xs">
                                <Clock className="h-3 w-3 mr-1" />
                                {service.duration}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
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
                          <p className="text-sm text-gray-600">{selectedService.duration}</p>
                        </div>
                        <span className="font-semibold text-gray-900">N${selectedService.price}</span>
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
                        <span className="text-lg font-bold text-purple-600">N${selectedService.price}</span>
                      </div>
                    </div>

                    <Button 
                      className="w-full bg-purple-600 hover:bg-purple-700" 
                      onClick={handleConfirmBooking}
                      disabled={!isFormValid || isLoading}
                    >
                      {isLoading ? 'Processing...' : 'Confirm & Pay'}
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
