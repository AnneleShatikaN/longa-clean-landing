
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Clock, User, MapPin, AlertCircle } from 'lucide-react';
import { format, addDays, isBefore, isAfter } from 'date-fns';

interface Provider {
  id: number;
  name: string;
  rating: number;
  location: string;
  availability: {
    [date: string]: string[];
  };
}

interface BookingCalendarProps {
  serviceId: number;
  serviceName: string;
  serviceDuration: number;
  onBookingConfirm: (booking: {
    date: string;
    time: string;
    providerId: number;
    providerName: string;
  }) => void;
}

const mockProviders: Provider[] = [
  {
    id: 1,
    name: "Sarah Mwangi",
    rating: 4.9,
    location: "Windhoek Central",
    availability: {
      [format(new Date(), 'yyyy-MM-dd')]: ['09:00', '10:00', '14:00', '15:00'],
      [format(addDays(new Date(), 1), 'yyyy-MM-dd')]: ['08:00', '09:00', '11:00', '16:00'],
      [format(addDays(new Date(), 2), 'yyyy-MM-dd')]: ['10:00', '13:00', '14:00', '17:00'],
    }
  },
  {
    id: 2,
    name: "John Kasimba",
    rating: 4.7,
    location: "Katutura",
    availability: {
      [format(new Date(), 'yyyy-MM-dd')]: ['08:00', '11:00', '13:00'],
      [format(addDays(new Date(), 1), 'yyyy-MM-dd')]: ['09:00', '12:00', '15:00', '17:00'],
      [format(addDays(new Date(), 3), 'yyyy-MM-dd')]: ['08:00', '09:00', '10:00', '14:00'],
    }
  }
];

export const BookingCalendar: React.FC<BookingCalendarProps> = ({
  serviceId,
  serviceName,
  serviceDuration,
  onBookingConfirm
}) => {
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [selectedProvider, setSelectedProvider] = useState<Provider | null>(null);
  const [availableProviders, setAvailableProviders] = useState<Provider[]>([]);
  const [availableTimeSlots, setAvailableTimeSlots] = useState<string[]>([]);
  const [isChecking, setIsChecking] = useState(false);

  useEffect(() => {
    if (selectedDate) {
      checkProviderAvailability(selectedDate);
    }
  }, [selectedDate]);

  useEffect(() => {
    if (selectedDate && selectedProvider) {
      updateAvailableTimeSlots();
    }
  }, [selectedDate, selectedProvider]);

  const checkProviderAvailability = async (date: Date) => {
    setIsChecking(true);
    const dateStr = format(date, 'yyyy-MM-dd');
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const available = mockProviders.filter(provider => 
      provider.availability[dateStr] && provider.availability[dateStr].length > 0
    );
    
    setAvailableProviders(available);
    setSelectedProvider(null);
    setSelectedTime('');
    setIsChecking(false);
  };

  const updateAvailableTimeSlots = () => {
    if (!selectedDate || !selectedProvider) return;
    
    const dateStr = format(selectedDate, 'yyyy-MM-dd');
    const slots = selectedProvider.availability[dateStr] || [];
    setAvailableTimeSlots(slots);
    setSelectedTime('');
  };

  const handleProviderSelect = (providerId: string) => {
    const provider = availableProviders.find(p => p.id.toString() === providerId);
    setSelectedProvider(provider || null);
  };

  const handleBookingConfirm = () => {
    if (selectedDate && selectedTime && selectedProvider) {
      onBookingConfirm({
        date: format(selectedDate, 'yyyy-MM-dd'),
        time: selectedTime,
        providerId: selectedProvider.id,
        providerName: selectedProvider.name
      });
    }
  };

  const isFormComplete = selectedDate && selectedTime && selectedProvider;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Date Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Select Date & Time
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={setSelectedDate}
            disabled={(date) => isBefore(date, new Date()) || isAfter(date, addDays(new Date(), 30))}
            className="rounded-md border pointer-events-auto"
          />
          
          {selectedDate && (
            <div className="mt-4 space-y-4">
              {isChecking ? (
                <div className="text-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="text-sm text-gray-600 mt-2">Checking availability...</p>
                </div>
              ) : availableProviders.length > 0 ? (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Select Provider
                    </label>
                    <Select value={selectedProvider?.id.toString() || ''} onValueChange={handleProviderSelect}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose a provider" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableProviders.map((provider) => (
                          <SelectItem key={provider.id} value={provider.id.toString()}>
                            <div className="flex items-center justify-between w-full">
                              <span>{provider.name}</span>
                              <div className="flex items-center gap-2 ml-4">
                                <span className="text-yellow-500">⭐ {provider.rating}</span>
                                <span className="text-gray-500 text-xs">{provider.location}</span>
                              </div>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {selectedProvider && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Available Time Slots
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        {availableTimeSlots.map((time) => (
                          <Button
                            key={time}
                            variant={selectedTime === time ? "default" : "outline"}
                            onClick={() => setSelectedTime(time)}
                            className="text-sm"
                          >
                            {time}
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-6">
                  <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-600">No providers available on this date</p>
                  <p className="text-sm text-gray-500">Please select another date</p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Booking Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Booking Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-medium text-gray-900">{serviceName}</h4>
            <p className="text-sm text-gray-600">Duration: {serviceDuration} minutes</p>
          </div>

          {selectedDate && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-gray-500" />
                <span className="text-sm">
                  {format(selectedDate, 'EEEE, MMMM do, yyyy')}
                  {selectedTime && ` at ${selectedTime}`}
                </span>
              </div>

              {selectedProvider && (
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-gray-500" />
                  <div className="flex-1">
                    <span className="text-sm font-medium">{selectedProvider.name}</span>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-yellow-600">⭐ {selectedProvider.rating}</span>
                      <span className="text-xs text-gray-500 flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {selectedProvider.location}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="border-t pt-4">
            <Button 
              className="w-full"
              onClick={handleBookingConfirm}
              disabled={!isFormComplete}
            >
              {isFormComplete ? 'Confirm Booking' : 'Complete Selection'}
            </Button>
          </div>

          {isFormComplete && (
            <div className="bg-blue-50 p-3 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Note:</strong> Your provider has 24 hours to accept this booking. 
                You'll receive a notification once confirmed.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
