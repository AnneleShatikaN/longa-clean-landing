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
import { CalendarIcon, Clock, AlertTriangle, AlertCircle, Users, CheckCircle } from 'lucide-react';
import { format, addDays, isBefore, startOfDay } from 'date-fns';
import { useServices } from '@/contexts/ServiceContext';
import { useServiceEntitlements } from '@/hooks/useServiceEntitlements';
import { useAuth } from '@/contexts/AuthContext';
import { useSecureBooking } from '@/hooks/useSecureBooking';
import { useRealTimeNotifications } from '@/hooks/useRealTimeNotifications';
import { useRecurringBookings } from '@/hooks/useRecurringBookings';
import { PaymentFlow } from '@/components/payment/PaymentFlow';
import { ProviderSelection } from '@/components/providers/ProviderSelection';
import { RecurringBookingForm } from '@/components/booking/RecurringBookingForm';
import { cn } from '@/lib/utils';
import TownSuburbSelector from '@/components/location/TownSuburbSelector';

interface SupabaseBookingFormProps {
  serviceId?: string;
  onBookingCreated?: () => void;
}

export const SupabaseBookingForm: React.FC<SupabaseBookingFormProps> = ({
  serviceId,
  onBookingCreated
}) => {
  const { services } = useServices();
  const { checkAccess } = useServiceEntitlements();
  const { user } = useAuth();
  const { createSecureBooking, validateAccess, isLoading } = useSecureBooking();
  const { createRecurringSchedule } = useRecurringBookings();
  
  useRealTimeNotifications();
  
  const [selectedService, setSelectedService] = useState<any>(null);
  const [selectedProviderId, setSelectedProviderId] = useState<string>('');
  const [bookingDate, setBookingDate] = useState<Date>();
  const [bookingTime, setBookingTime] = useState('09:00');
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [emergencyBooking, setEmergencyBooking] = useState(false);
  const [accessCheck, setAccessCheck] = useState<{allowed: boolean, reason?: string} | null>(null);
  const [showPaymentFlow, setShowPaymentFlow] = useState(false);
  const [currentStep, setCurrentStep] = useState<'provider' | 'details' | 'payment'>('provider');
  
  // Recurring booking states
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurringFrequency, setRecurringFrequency] = useState<'weekly' | 'bi-weekly' | 'monthly'>('weekly');
  const [preferredDay, setPreferredDay] = useState(1); // Monday by default
  const [recurringEndDate, setRecurringEndDate] = useState<string>();

  // Location state
  const [clientTown, setClientTown] = useState('');
  const [clientSuburb, setClientSuburb] = useState('');

  useEffect(() => {
    if (serviceId) {
      const service = services.find(s => s.id === serviceId);
      setSelectedService(service);
    }
  }, [serviceId, services]);

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
    
    if (!selectedService || !bookingDate || !user || !selectedProviderId || !clientTown || !clientSuburb) {
      return;
    }

    try {
      // Create the initial booking with location data
      const result = await createSecureBooking({
        serviceId: selectedService.id,
        bookingDate: format(bookingDate, 'yyyy-MM-dd'),
        bookingTime: bookingTime,
        totalAmount: selectedService.clientPrice,
        specialInstructions: specialInstructions || undefined,
        emergencyBooking,
        durationMinutes: selectedService.duration.hours * 60 + selectedService.duration.minutes,
        clientTown,
        clientSuburb
      });

      if (result.success && result.bookingId) {
        // If recurring is enabled, create the recurring schedule
        if (isRecurring && result.bookingId) {
          await createRecurringSchedule({
            parent_booking_id: result.bookingId,
            service_id: selectedService.id,
            frequency: recurringFrequency,
            day_of_week: preferredDay,
            booking_time: bookingTime,
            start_date: format(bookingDate, 'yyyy-MM-dd'),
            end_date: recurringEndDate,
            special_instructions: specialInstructions,
            emergency_booking: emergencyBooking,
            duration_minutes: selectedService.duration.hours * 60 + selectedService.duration.minutes,
            location_town: 'windhoek' // Default location
          });
        }

        onBookingCreated?.();
        setSelectedProviderId('');
        setBookingDate(undefined);
        setSpecialInstructions('');
        setEmergencyBooking(false);
        setIsRecurring(false);
        setCurrentStep('provider');
      } else if (result.reason === 'No active package found' || result.reason === 'Service not included in package') {
        setShowPaymentFlow(true);
      }
    } catch (error) {
      console.error('Error creating booking:', error);
    }
  };

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

  const handleBackToProviders = () => {
    setCurrentStep('provider');
    setSelectedProviderId('');
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Book {selectedService?.name || 'Service'}
            {selectedService && (
              <Badge variant="secondary">
                N${selectedService.clientPrice}
              </Badge>
            )}
            {accessCheck?.allowed && (
              <Badge className="bg-green-100 text-green-800">
                <CheckCircle className="h-3 w-3 mr-1" />
                Package Access
              </Badge>
            )}
          </CardTitle>
          
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
          
          {currentStep === 'provider' && (
            <div className="space-y-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-medium mb-2">{selectedService?.name}</h3>
                <p className="text-sm text-gray-600 mb-2">{selectedService?.description}</p>
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span>{selectedService?.duration.hours}h {selectedService?.duration.minutes}m</span>
                  </div>
                  <Badge variant={selectedService?.type === 'one-off' ? 'default' : 'secondary'}>
                    {selectedService?.type === 'one-off' ? 'One-time' : 'Package'}
                  </Badge>
                </div>
              </div>

              <ProviderSelection
                serviceId={selectedService?.id}
                onProviderSelected={handleProviderSelected}
                selectedProviderId={selectedProviderId}
              />
            </div>
          )}

          
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

              {accessCheck && !accessCheck.allowed && (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    This service requires payment as it's not included in your current package.
                  </AlertDescription>
                </Alert>
              )}

              {/* Service Location */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Service Location</h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <TownSuburbSelector
                    town={clientTown}
                    suburb={clientSuburb}
                    onTownChange={setClientTown}
                    onSuburbChange={setClientSuburb}
                  />
                </div>
              </div>

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
                      onSelect={setBookingDate}
                      disabled={(date) => 
                        isBefore(date, minDate) || 
                        date > maxDate
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label htmlFor="time">Select Time</Label>
                <select
                  id="time"
                  value={bookingTime}
                  onChange={(e) => setBookingTime(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {generateTimeSlots().map((time) => (
                    <option key={time} value={time}>
                      {time}
                    </option>
                  ))}
                </select>
              </div>

              {/* Recurring Booking Form */}
              <RecurringBookingForm
                isRecurring={isRecurring}
                onRecurringChange={setIsRecurring}
                frequency={recurringFrequency}
                onFrequencyChange={setRecurringFrequency}
                preferredDay={preferredDay}
                onPreferredDayChange={setPreferredDay}
                endDate={recurringEndDate}
                onEndDateChange={setRecurringEndDate}
              />

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

              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium mb-2">Booking Summary</h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span>Service:</span>
                    <span>{selectedService?.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Location:</span>
                    <span>{clientSuburb && clientTown ? `${clientSuburb}, ${clientTown}` : 'Not selected'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Date:</span>
                    <span>{bookingDate ? format(bookingDate, 'MMM dd, yyyy') : 'Not selected'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Time:</span>
                    <span>{bookingTime}</span>
                  </div>
                  {isRecurring && (
                    <div className="flex justify-between">
                      <span>Recurring:</span>
                      <span>{recurringFrequency}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>Duration:</span>
                    <span>{selectedService?.duration.hours}h {selectedService?.duration.minutes}m</span>
                  </div>
                  <div className="flex justify-between font-medium border-t pt-2">
                    <span>Total:</span>
                    <span>N${selectedService?.clientPrice}</span>
                  </div>
                  {emergencyBooking && (
                    <div className="flex justify-between text-orange-600">
                      <span>Emergency Fee:</span>
                      <span>+N$50</span>
                    </div>
                  )}
                </div>
              </div>

              
              <Button
                type="submit"
                disabled={!bookingDate || isLoading || !selectedProviderId || !clientTown || !clientSuburb}
                className="w-full"
              >
                {isLoading ? 'Creating Booking...' : (
                  isRecurring ? 'Create Recurring Booking' : 
                  accessCheck?.allowed ? 'Create Booking' : 'Proceed to Payment'
                )}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>

      
      {showPaymentFlow && (
        <PaymentFlow
          amount={selectedService?.clientPrice || 0}
          serviceId={selectedService?.id || ''}
          transactionType="booking"
          bookingDetails={{
            provider_id: selectedProviderId,
            booking_date: bookingDate ? format(bookingDate, 'yyyy-MM-dd') : '',
            booking_time: bookingTime,
            special_instructions: specialInstructions,
            emergency_booking: emergencyBooking,
            duration_minutes: selectedService ? selectedService.duration.hours * 60 + selectedService.duration.minutes : 60,
            client_town: clientTown,
            client_suburb: clientSuburb
          }}
          onPaymentSubmitted={() => setShowPaymentFlow(false)}
        />
      )}
    </>
  );
};
