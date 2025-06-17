
import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Calendar, Clock, MapPin, User, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/contexts/AuthContext';
import { useServices } from '@/contexts/ServiceContext';
import { useSupabaseBookings } from '@/contexts/SupabaseBookingContext';
import { useToast } from '@/hooks/use-toast';
import { format, addDays, isBefore, startOfDay } from 'date-fns';

const OneOffBooking = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { services } = useServices();
  const { createBooking } = useSupabaseBookings();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  
  const [selectedService, setSelectedService] = useState<any>(null);
  const [bookingDate, setBookingDate] = useState('');
  const [bookingTime, setBookingTime] = useState('09:00');
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [clientLocation, setClientLocation] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Get service ID from URL params
  const serviceId = searchParams.get('service_id');

  useEffect(() => {
    if (serviceId && services.length > 0) {
      const service = services.find(s => s.id === serviceId);
      if (service) {
        setSelectedService(service);
      }
    }
  }, [serviceId, services]);

  useEffect(() => {
    // Pre-fill client location from user profile
    if (user) {
      setClientLocation(user.current_work_location || 'Windhoek');
    }
  }, [user]);

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

  const generateDateOptions = () => {
    const options = [];
    const today = new Date();
    
    options.push({
      value: format(today, 'yyyy-MM-dd'),
      label: 'Today'
    });
    
    const tomorrow = addDays(today, 1);
    options.push({
      value: format(tomorrow, 'yyyy-MM-dd'),
      label: 'Tomorrow'
    });
    
    for (let i = 2; i < 7; i++) {
      const date = addDays(today, i);
      options.push({
        value: format(date, 'yyyy-MM-dd'),
        label: format(date, 'EEEE, MMM d')
      });
    }
    
    return options;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedService || !bookingDate || !user) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    const selectedDate = new Date(bookingDate);
    const today = startOfDay(new Date());
    
    if (isBefore(selectedDate, today)) {
      toast({
        title: "Invalid Date",
        description: "Please select a future date for your booking.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const booking = await createBooking({
        serviceId: selectedService.id,
        bookingDate: bookingDate,
        bookingTime: bookingTime,
        specialInstructions: specialInstructions,
        durationMinutes: selectedService.duration_minutes || 180,
        locationTown: clientLocation.toLowerCase(),
      });

      toast({
        title: "Booking Created!",
        description: "Your service booking has been submitted successfully.",
      });

      // Navigate to confirmation page
      navigate(`/booking-confirmation?booking_id=${booking.id}`);

    } catch (error: any) {
      console.error('Error creating booking:', error);
      toast({
        title: "Booking Failed",
        description: error.message || "There was an error creating your booking. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Please Sign In</h1>
          <p className="text-gray-600 mb-6">You need to be logged in to book services</p>
          <Button onClick={() => navigate('/auth')}>
            Sign In
          </Button>
        </div>
      </div>
    );
  }

  // If no service is preselected, redirect to search/services page
  if (!serviceId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Select a Service</h1>
          <p className="text-gray-600 mb-6">Please choose a service to book first.</p>
          <Button onClick={() => navigate('/search')}>
            Browse Services
          </Button>
        </div>
      </div>
    );
  }

  if (!selectedService) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Service Not Found</h1>
          <p className="text-gray-600 mb-6">The selected service could not be found.</p>
          <Button onClick={() => navigate('/client-dashboard')}>
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/client-dashboard')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Button>
        </div>

        {/* Main Form Card */}
        <Card style={{ 
          borderRadius: '8px', 
          padding: '20px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)' 
        }}>
          <CardHeader className="text-center">
            <CardTitle className="text-xl font-bold">Book a Service</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Service Display */}
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <h3 className="text-lg font-semibold text-blue-900 mb-2">{selectedService.name}</h3>
                <p className="text-blue-800 text-sm mb-3">{selectedService.description}</p>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2 text-sm text-blue-700">
                    <Clock className="h-4 w-4" />
                    <span>{Math.floor((selectedService.duration_minutes || 180) / 60)}h {(selectedService.duration_minutes || 180) % 60}m</span>
                  </div>
                  <div className="text-xl font-bold text-blue-900">
                    N${selectedService.client_price}
                  </div>
                </div>
              </div>

              {/* Client Location */}
              <div className="space-y-3">
                <Label htmlFor="location" className="flex items-center gap-2 text-base">
                  <MapPin className="h-4 w-4" />
                  Service Location
                </Label>
                <Input
                  id="location"
                  value={clientLocation}
                  onChange={(e) => setClientLocation(e.target.value)}
                  placeholder="Enter your location"
                  required
                  style={{ padding: '10px', fontSize: '14px' }}
                />
                <p className="text-xs text-gray-600 italic">
                  Providers near you will be matched
                </p>
              </div>

              {/* Date Picker */}
              <div className="space-y-3">
                <Label htmlFor="date" className="flex items-center gap-2 text-base">
                  <Calendar className="h-4 w-4" />
                  Preferred Day
                </Label>
                <select
                  id="date"
                  value={bookingDate}
                  onChange={(e) => setBookingDate(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  required
                >
                  <option value="">Select a day</option>
                  {generateDateOptions().map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Time Picker */}
              <div className="space-y-3">
                <Label htmlFor="time" className="flex items-center gap-2 text-base">
                  <Clock className="h-4 w-4" />
                  Preferred Time
                </Label>
                <select
                  id="time"
                  value={bookingTime}
                  onChange={(e) => setBookingTime(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  required
                >
                  {generateTimeSlots().map((time) => (
                    <option key={time} value={time}>
                      {time}
                    </option>
                  ))}
                </select>
              </div>

              {/* Provider Assignment Info */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-start gap-2">
                  <Info className="h-4 w-4 text-gray-600 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-700 italic">
                      Provider will be assigned automatically based on your location and time
                    </p>
                    <Button 
                      type="button"
                      className="mt-2 bg-gray-300 text-gray-500 cursor-not-allowed text-xs"
                      disabled
                      title="Coming Soon"
                    >
                      Choose Provider (Coming Soon)
                    </Button>
                  </div>
                </div>
              </div>

              {/* Special Instructions */}
              <div className="space-y-3">
                <Label htmlFor="instructions" className="text-base">Special Instructions</Label>
                <Textarea
                  id="instructions"
                  placeholder="e.g., Gate code, cleaning instructions, pet info"
                  value={specialInstructions}
                  onChange={(e) => setSpecialInstructions(e.target.value)}
                  rows={4}
                  style={{ width: '100%', fontSize: '12px' }}
                />
              </div>

              {/* Booking Summary */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium mb-3">Booking Summary</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Service:</span>
                    <span>{selectedService.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Date:</span>
                    <span>{bookingDate || 'Not selected'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Time:</span>
                    <span>{bookingTime}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Location:</span>
                    <span>{clientLocation}</span>
                  </div>
                  <div className="flex justify-between font-medium border-t pt-2">
                    <span>Total:</span>
                    <span>N${selectedService.client_price}</span>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={!bookingDate || isSubmitting}
                className="w-full bg-blue-900 hover:bg-blue-800 text-white"
                style={{ 
                  fontSize: '16px', 
                  padding: '10px',
                  borderRadius: '8px'
                }}
              >
                {isSubmitting ? 'Creating Booking...' : 'Confirm Booking'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default OneOffBooking;
