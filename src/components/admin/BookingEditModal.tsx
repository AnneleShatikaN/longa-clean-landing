
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Calendar, Clock, MapPin, DollarSign, User, FileText, Save, X } from 'lucide-react';
import { format } from 'date-fns';

interface BookingData {
  id: string;
  booking_date: string;
  booking_time: string;
  status: string;
  total_amount: number;
  special_instructions?: string;
  location_town: string;
  duration_minutes: number;
  emergency_booking: boolean;
  service_id: string;
  client_id: string;
  provider_id?: string;
  service: {
    id: string;
    name: string;
    client_price: number;
    duration_minutes: number;
  };
  client: {
    id: string;
    full_name: string;
    phone?: string;
  };
  provider?: {
    id: string;
    full_name: string;
  };
}

interface BookingEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: BookingData | null;
  onBookingUpdated: () => void;
}

export const BookingEditModal: React.FC<BookingEditModalProps> = ({
  isOpen,
  onClose,
  booking,
  onBookingUpdated
}) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [services, setServices] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    booking_date: '',
    booking_time: '',
    service_id: '',
    total_amount: 0,
    special_instructions: '',
    location_town: '',
    duration_minutes: 60,
    emergency_booking: false
  });

  useEffect(() => {
    if (booking) {
      setFormData({
        booking_date: booking.booking_date,
        booking_time: booking.booking_time,
        service_id: booking.service_id,
        total_amount: booking.total_amount,
        special_instructions: booking.special_instructions || '',
        location_town: booking.location_town,
        duration_minutes: booking.duration_minutes,
        emergency_booking: booking.emergency_booking
      });
    }
  }, [booking]);

  useEffect(() => {
    if (isOpen) {
      fetchServices();
    }
  }, [isOpen]);

  const fetchServices = async () => {
    try {
      const { data, error } = await supabase
        .from('services')
        .select('id, name, client_price, duration_minutes')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      setServices(data || []);
    } catch (error) {
      console.error('Error fetching services:', error);
      toast({
        title: "Error",
        description: "Failed to load services",
        variant: "destructive",
      });
    }
  };

  const handleServiceChange = (serviceId: string) => {
    const selectedService = services.find(s => s.id === serviceId);
    if (selectedService) {
      setFormData(prev => ({
        ...prev,
        service_id: serviceId,
        total_amount: selectedService.client_price,
        duration_minutes: selectedService.duration_minutes
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!booking) return;

    setIsLoading(true);
    try {
      // Call the update booking function
      const { error } = await supabase.rpc('update_booking_details', {
        p_booking_id: booking.id,
        p_booking_date: formData.booking_date,
        p_booking_time: formData.booking_time,
        p_service_id: formData.service_id,
        p_total_amount: formData.total_amount,
        p_special_instructions: formData.special_instructions,
        p_location_town: formData.location_town,
        p_duration_minutes: formData.duration_minutes,
        p_emergency_booking: formData.emergency_booking
      });

      if (error) throw error;

      toast({
        title: "Booking Updated",
        description: "Booking details have been successfully updated",
      });

      onBookingUpdated();
      onClose();
    } catch (error: any) {
      console.error('Error updating booking:', error);
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update booking",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!booking) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Edit Booking - {booking.service.name}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Client Information */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold mb-2 flex items-center gap-2">
              <User className="h-4 w-4" />
              Client Information
            </h3>
            <div className="text-sm space-y-1">
              <p><strong>Name:</strong> {booking.client.full_name}</p>
              {booking.client.phone && <p><strong>Phone:</strong> {booking.client.phone}</p>}
              <p><strong>Booking ID:</strong> {booking.id}</p>
            </div>
          </div>

          {/* Date and Time */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="booking_date" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Booking Date
              </Label>
              <Input
                id="booking_date"
                type="date"
                value={formData.booking_date}
                onChange={(e) => setFormData(prev => ({ ...prev, booking_date: e.target.value }))}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="booking_time" className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Booking Time
              </Label>
              <Input
                id="booking_time"
                type="time"
                value={formData.booking_time}
                onChange={(e) => setFormData(prev => ({ ...prev, booking_time: e.target.value }))}
                required
              />
            </div>
          </div>

          {/* Service and Pricing */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="service_id">Service</Label>
              <Select value={formData.service_id} onValueChange={handleServiceChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a service" />
                </SelectTrigger>
                <SelectContent>
                  {services.map((service) => (
                    <SelectItem key={service.id} value={service.id}>
                      {service.name} - N${service.client_price}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="total_amount" className="flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Total Amount (N$)
              </Label>
              <Input
                id="total_amount"
                type="number"
                step="0.01"
                value={formData.total_amount}
                onChange={(e) => setFormData(prev => ({ ...prev, total_amount: parseFloat(e.target.value) || 0 }))}
                required
              />
            </div>
          </div>

          {/* Location and Duration */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="location_town" className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Location
              </Label>
              <Select 
                value={formData.location_town} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, location_town: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select location" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="windhoek">Windhoek</SelectItem>
                  <SelectItem value="walvis_bay">Walvis Bay</SelectItem>
                  <SelectItem value="swakopmund">Swakopmund</SelectItem>
                  <SelectItem value="oshakati">Oshakati</SelectItem>
                  <SelectItem value="rundu">Rundu</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="duration_minutes">Duration (minutes)</Label>
              <Input
                id="duration_minutes"
                type="number"
                value={formData.duration_minutes}
                onChange={(e) => setFormData(prev => ({ ...prev, duration_minutes: parseInt(e.target.value) || 60 }))}
                required
              />
            </div>
          </div>

          {/* Special Instructions */}
          <div className="space-y-2">
            <Label htmlFor="special_instructions">Special Instructions</Label>
            <Textarea
              id="special_instructions"
              value={formData.special_instructions}
              onChange={(e) => setFormData(prev => ({ ...prev, special_instructions: e.target.value }))}
              rows={3}
              placeholder="Any special requirements or notes..."
            />
          </div>

          {/* Emergency Booking Toggle */}
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="emergency_booking"
              checked={formData.emergency_booking}
              onChange={(e) => setFormData(prev => ({ ...prev, emergency_booking: e.target.checked }))}
              className="rounded"
            />
            <Label htmlFor="emergency_booking">Emergency Booking</Label>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              <Save className="h-4 w-4 mr-2" />
              {isLoading ? 'Updating...' : 'Update Booking'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
