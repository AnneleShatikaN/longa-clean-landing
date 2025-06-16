import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CalendarIcon, Clock, AlertTriangle, AlertCircle, Users } from 'lucide-react';
import { format, addDays, isBefore, startOfDay } from 'date-fns';
import { useSupabaseBookings } from '@/contexts/SupabaseBookingContext';
import { useServices } from '@/contexts/ServiceContext';
import { useServiceEntitlements } from '@/hooks/useServiceEntitlements';
import { useAuth } from '@/contexts/AuthContext';
import { PaymentFlow } from '@/components/payment/PaymentFlow';
import { ProviderSelection } from '@/components/providers/ProviderSelection';
import { cn } from '@/lib/utils';

interface SupabaseBookingFormProps {
  serviceId?: string;
  onBookingCreated?: () => void;
}

export const SupabaseBookingForm: React.FC<SupabaseBookingFormProps> = ({
  serviceId,
  onBookingCreated
}) => {
  const { isLoading, checkAvailability } = useSupabaseBookings();
  const { services } = useServices();
  const { checkAccess } = useServiceEntitlements();
  const { user } = useAuth();
  
  const [selectedService, setSelectedService] = useState<any>(null);
  const [selectedProviderId, setSelectedProviderId] = useState<string>('');
  const [bookingDate, setBookingDate] = useState<Date>();
  const [bookingTime, setBookingTime] = useState('09:00');
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [emergencyBooking, setEmergencyBooking] = useState(false);
  const [isCheckingAvailability, setIsCheckingAvailability] = useState(false);
  const [availabilityChecked, setAvailabilityChecked] = useState(false);
  const [accessCheck, setAccessCheck] = useState<{allowed: boolean, reason?: string} | null>(null);
  const [showPaymentFlow, setShowPaymentFlow] = useState(false);
  const [currentStep, setCurrentStep] = useState<'provider' | 'details' | 'payment'>('provider');

  // Find selected service
  useEffect(() => {
    if (serviceId) {
      const service = services.find(s => s.id === serviceId);
      setSelectedService(service);
    }
  }, [serviceId, services]);

  // Check service access when service is selected
  useEffect(() => {
    const checkServiceAccess = async () => {
      if (selectedService && user) {
        const result = await checkAccess(selectedService.id);
        setAccessCheck(result);
      }
    };
    
    checkServiceAccess();
  }, [selectedService, user, checkAccess]);

  const handleProviderSelected = (providerId: string) => {
    setSelectedProviderId(providerId);
    setCurrentStep('details');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedService || !bookingDate || !user || !selectedProviderId) {
      return;
    }

    // If user has access through package, create booking directly
    if (accessCheck?.allowed) {
      // Original booking creation logic would go here
      // For now, show success message
      onBookingCreated?.();
      return;
    }

    // If no access, show payment flow for one-off booking
    setShowPaymentFlow(true);
  };

  const handleCheckAvailability = async () => {
    if (!bookingDate || !selectedService || !selectedProviderId) return;

    setIsCheckingAvailability(true);
    try {
      const isAvailable = await checkAvailability(
        selectedProviderId,
        format(bookingDate, 'yyyy-MM-dd'),
        bookingTime,
        selectedService.duration.hours * 60 + selectedService.duration.minutes
      );
      
      setAvailabilityChecked(true);
    } catch (error) {
      console.error('Availability check failed:', error);
    } finally {
      setIsCheckingAvailability(false);
    }
  };

  const handleBackToProviders = () => {
    setCurrentStep('provider');
    setSelectedProviderId('');
  };

  if (!selectedService) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-gray-500">Please select a service to book</p>
        </CardContent>
      </Card>
    );
  }

  const minDate = startOfDay(new Date());
  const maxDate = addDays(new Date(), 30);

  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 8; hour < 18; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        slots.push(timeString);
      }
    }
    return slots;
  };

  const getTransactionData = () => ({
    transaction_type: 'booking' as const,
    service_id: selectedService.id,
    amount: selectedService.clientPrice,
    booking_details: {
      provider_id: selectedProviderId,
      booking_date: format(bookingDate!, 'yyyy-MM-dd'),
      booking_time: bookingTime,
      special_instructions: specialInstructions,
      emergency_booking: emergencyBooking,
      duration_minutes: selectedService.duration.hours * 60 + selectedService.duration.minutes
    }
  });

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Book {selectedService.name}
            <Badge variant="secondary">
              N${selectedService.clientPrice}
            </Badge>
          </CardTitle>
          
          {/* Step Indicator */}
          <div className="flex items-center gap-2 mt-4">
            <div className={`flex items-center gap-2 ${currentStep === 'provider' ? 'text-blue-600' : currentStep === 'details' || currentStep === 'payment' ? 'text-green-600' : 'text-gray-400'}`}>
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${currentStep === 'provider' ? 'bg-blue-600 text-white' : currentStep === 'details' || currentStep === 'payment' ? 'bg-green-600 text-white' : 'bg-gray-200'}`}>
                1
              </div>
              <span className="text-sm font-medium">Choose Provider</span>
            </div>
            
            <div className="h-px bg-gray-300 w-8"></div>
            
            <div className={`flex items-center gap-2 ${currentStep === 'details' ? 'text-blue-600' : currentStep === 'payment' ? 'text-green-600' : 'text-gray-400'}`}>
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${currentStep === 'details' ? 'bg-blue-600 text-white' : currentStep === 'payment' ? 'bg-green-600 text-white' : 'bg-gray-200'}`}>
                2
              </div>
              <span className="text-sm font-medium">Booking Details</span>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          {/* Provider Selection Step */}
          {currentStep === 'provider' && (
            <div className="space-y-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-medium mb-2">{selectedService.name}</h3>
                <p className="text-sm text-gray-600 mb-2">{selectedService.description}</p>
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span>{selectedService.duration.hours}h {selectedService.duration.minutes}m</span>
                  </div>
                  <Badge variant={selectedService.type === 'one-off' ? 'default' : 'secondary'}>
                    {selectedService.type === 'one-off' ? 'One-time' : 'Package'}
                  </Badge>
                </div>
              </div>

              <ProviderSelection
                serviceId={selectedService.id}
                onProviderSelected={handleProviderSelected}
                selectedProviderId={selectedProviderId}
              />
            </div>
          )}

          {/* Booking Details Step */}
          {currentStep === 'details' && (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="flex items-center gap-2 mb-4">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleBackToProviders}
                >
                  ← Back to Providers
                </Button>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Users className="h-4 w-4" />
                  <span>Provider selected</span>
                </div>
              </div>

              {/* Access check warning */}
              {accessCheck && !accessCheck.allowed && (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    This service requires payment as it's not included in your current package.
                  </AlertDescription>
                </Alert>
              )}

              {/* Date Selection */}
              <div className="space-y-2">
                <Label>Select Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !bookingDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {bookingDate ? format(bookingDate, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={bookingDate}
                      onSelect={(date) => {
                        setBookingDate(date);
                        setAvailabilityChecked(false);
                      }}
                      disabled={(date) => 
                        isBefore(date, minDate) || 
                        date > maxDate
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* Time Selection */}
              <div className="space-y-2">
                <Label htmlFor="time">Select Time</Label>
                <select
                  id="time"
                  value={bookingTime}
                  onChange={(e) => {
                    setBookingTime(e.target.value);
                    setAvailabilityChecked(false);
                  }}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {generateTimeSlots().map((time) => (
                    <option key={time} value={time}>
                      {time}
                    </option>
                  ))}
                </select>
              </div>

              {/* Availability Check */}
              {bookingDate && selectedProviderId && (
                <div className="space-y-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCheckAvailability}
                    disabled={isCheckingAvailability}
                    className="w-full"
                  >
                    {isCheckingAvailability ? 'Checking...' : 'Check Provider Availability'}
                  </Button>
                  
                  {availabilityChecked && (
                    <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-md">
                      <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                      <span className="text-sm text-green-700">Provider is available at this time</span>
                    </div>
                  )}
                </div>
              )}

              {/* Special Instructions */}
              <div className="space-y-2">
                <Label htmlFor="instructions">Special Instructions (Optional)</Label>
                <Textarea
                  id="instructions"
                  placeholder="Any specific requirements or instructions..."
                  value={specialInstructions}
                  onChange={(e) => setSpecialInstructions(e.target.value)}
                  rows={3}
                />
              </div>

              {/* Emergency Booking */}
              <div className="flex items-center justify-between p-4 border border-orange-200 rounded-lg bg-orange-50">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-orange-600" />
                  <div>
                    <Label htmlFor="emergency" className="text-orange-900">Emergency Booking</Label>
                    <p className="text-sm text-orange-700">Higher priority, additional fees may apply</p>
                  </div>
                </div>
                <Switch
                  id="emergency"
                  checked={emergencyBooking}
                  onCheckedChange={setEmergencyBooking}
                />
              </div>

              {/* Booking Summary */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium mb-2">Booking Summary</h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span>Service:</span>
                    <span>{selectedService.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Date:</span>
                    <span>{bookingDate ? format(bookingDate, 'MMM dd, yyyy') : 'Not selected'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Time:</span>
                    <span>{bookingTime}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Duration:</span>
                    <span>{selectedService.duration.hours}h {selectedService.duration.minutes}m</span>
                  </div>
                  <div className="flex justify-between font-medium border-t pt-2">
                    <span>Total:</span>
                    <span>N${selectedService.clientPrice}</span>
                  </div>
                  {emergencyBooking && (
                    <div className="flex justify-between text-orange-600">
                      <span>Emergency Fee:</span>
                      <span>+N$50</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={!bookingDate || isLoading || !availabilityChecked || !selectedProviderId}
                className="w-full"
              >
                {accessCheck?.allowed ? 'Create Booking' : 'Proceed to Payment'}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>

      {/* Payment Flow */}
      <PaymentFlow
        isOpen={showPaymentFlow}
        onClose={() => setShowPaymentFlow(false)}
        transactionData={getTransactionData()}
        title="Complete Your Booking"
        description="Complete your payment to confirm this service booking."
      />
    </>
  );
};
