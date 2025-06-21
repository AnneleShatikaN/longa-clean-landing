
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { TownSuburbSelector } from '@/components/location/TownSuburbSelector';
import { useProximityBooking } from '@/hooks/useProximityBooking';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { MapPin, Calendar, Clock, DollarSign } from 'lucide-react';

interface BookingFormWithLocationProps {
  serviceId: string;
  serviceName: string;
  servicePrice: number;
  onSuccess?: () => void;
}

export const BookingFormWithLocation: React.FC<BookingFormWithLocationProps> = ({
  serviceId,
  serviceName,
  servicePrice,
  onSuccess
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { createBookingWithAssignment, isCreating } = useProximityBooking();

  const [formData, setFormData] = useState({
    bookingDate: '',
    bookingTime: '',
    clientTown: user?.town || '',
    clientSuburb: user?.suburb || '',
    serviceAddress: '',
    specialInstructions: '',
    emergencyBooking: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to book a service",
        variant: "destructive"
      });
      return;
    }

    if (!formData.clientTown || !formData.clientSuburb || !formData.serviceAddress) {
      toast({
        title: "Location Required",
        description: "Please provide your complete address details",
        variant: "destructive"
      });
      return;
    }

    try {
      const result = await createBookingWithAssignment({
        clientId: user.id,
        serviceId,
        bookingDate: formData.bookingDate,
        bookingTime: formData.bookingTime,
        totalAmount: servicePrice,
        clientTown: formData.clientTown,
        clientSuburb: formData.clientSuburb,
        serviceAddress: formData.serviceAddress,
        specialInstructions: formData.specialInstructions,
        emergencyBooking: formData.emergencyBooking,
        durationMinutes: 60
      });

      if (result.success) {
        onSuccess?.();
      }
    } catch (error) {
      console.error('Booking error:', error);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Book {serviceName}
        </CardTitle>
        <div className="flex items-center gap-2 text-lg font-semibold text-green-600">
          <DollarSign className="h-5 w-5" />
          N${servicePrice}
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Date and Time */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="bookingDate">Booking Date</Label>
              <Input
                id="bookingDate"
                type="date"
                value={formData.bookingDate}
                onChange={(e) => setFormData(prev => ({ ...prev, bookingDate: e.target.value }))}
                min={new Date().toISOString().split('T')[0]}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bookingTime">Preferred Time</Label>
              <Input
                id="bookingTime"
                type="time"
                value={formData.bookingTime}
                onChange={(e) => setFormData(prev => ({ ...prev, bookingTime: e.target.value }))}
                required
              />
            </div>
          </div>

          {/* Location Selection */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              <Label className="text-base font-medium">Service Location</Label>
            </div>
            
            <TownSuburbSelector
              town={formData.clientTown}
              suburb={formData.clientSuburb}
              onTownChange={(town) => setFormData(prev => ({ ...prev, clientTown: town, clientSuburb: '' }))}
              onSuburbChange={(suburb) => setFormData(prev => ({ ...prev, clientSuburb: suburb }))}
            />

            <div className="space-y-2">
              <Label htmlFor="serviceAddress">Complete Address</Label>
              <Textarea
                id="serviceAddress"
                value={formData.serviceAddress}
                onChange={(e) => setFormData(prev => ({ ...prev, serviceAddress: e.target.value }))}
                placeholder="Enter your complete address (street, house number, landmarks)"
                required
                rows={3}
              />
            </div>
          </div>

          {/* Special Instructions */}
          <div className="space-y-2">
            <Label htmlFor="specialInstructions">Special Instructions (Optional)</Label>
            <Textarea
              id="specialInstructions"
              value={formData.specialInstructions}
              onChange={(e) => setFormData(prev => ({ ...prev, specialInstructions: e.target.value }))}
              placeholder="Any specific requirements or instructions for the service provider"
              rows={3}
            />
          </div>

          <Button 
            type="submit" 
            className="w-full" 
            disabled={isCreating}
            size="lg"
          >
            <Clock className="h-4 w-4 mr-2" />
            {isCreating ? 'Creating Booking...' : 'Book Now'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
