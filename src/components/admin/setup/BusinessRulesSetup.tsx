
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';

interface BusinessRulesSetupProps {
  onComplete: () => void;
}

export const BusinessRulesSetup: React.FC<BusinessRulesSetupProps> = ({ onComplete }) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    bookingWindow: '24',
    cancellationWindow: '2',
    rescheduleWindow: '4',
    maxBookingsPerDay: '10',
    workingHours: {
      start: '08:00',
      end: '18:00',
    },
    cancellationPolicy: '',
    refundPolicy: '',
    serviceArea: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    localStorage.setItem('business_rules_setup', JSON.stringify(formData));
    
    toast({
      title: "Success",
      description: "Business rules configured successfully",
    });
    
    onComplete();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Booking Rules</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="bookingWindow">Advance Booking (hours)</Label>
              <Input
                id="bookingWindow"
                type="number"
                value={formData.bookingWindow}
                onChange={(e) => setFormData(prev => ({ ...prev, bookingWindow: e.target.value }))}
                placeholder="24"
              />
            </div>
            
            <div>
              <Label htmlFor="maxBookings">Max Bookings/Day</Label>
              <Input
                id="maxBookings"
                type="number"
                value={formData.maxBookingsPerDay}
                onChange={(e) => setFormData(prev => ({ ...prev, maxBookingsPerDay: e.target.value }))}
                placeholder="10"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="startTime">Working Hours Start</Label>
              <Input
                id="startTime"
                type="time"
                value={formData.workingHours.start}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  workingHours: { ...prev.workingHours, start: e.target.value }
                }))}
              />
            </div>
            
            <div>
              <Label htmlFor="endTime">Working Hours End</Label>
              <Input
                id="endTime"
                type="time"
                value={formData.workingHours.end}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  workingHours: { ...prev.workingHours, end: e.target.value }
                }))}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Cancellation & Rescheduling</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="cancellationWindow">Cancellation Window (hours)</Label>
              <Input
                id="cancellationWindow"
                type="number"
                value={formData.cancellationWindow}
                onChange={(e) => setFormData(prev => ({ ...prev, cancellationWindow: e.target.value }))}
                placeholder="2"
              />
            </div>
            
            <div>
              <Label htmlFor="rescheduleWindow">Reschedule Window (hours)</Label>
              <Input
                id="rescheduleWindow"
                type="number"
                value={formData.rescheduleWindow}
                onChange={(e) => setFormData(prev => ({ ...prev, rescheduleWindow: e.target.value }))}
                placeholder="4"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="cancellationPolicy">Cancellation Policy</Label>
            <Textarea
              id="cancellationPolicy"
              value={formData.cancellationPolicy}
              onChange={(e) => setFormData(prev => ({ ...prev, cancellationPolicy: e.target.value }))}
              placeholder="Describe your cancellation policy..."
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor="refundPolicy">Refund Policy</Label>
            <Textarea
              id="refundPolicy"
              value={formData.refundPolicy}
              onChange={(e) => setFormData(prev => ({ ...prev, refundPolicy: e.target.value }))}
              placeholder="Describe your refund policy..."
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Service Area</CardTitle>
        </CardHeader>
        <CardContent>
          <div>
            <Label htmlFor="serviceArea">Coverage Area</Label>
            <Textarea
              id="serviceArea"
              value={formData.serviceArea}
              onChange={(e) => setFormData(prev => ({ ...prev, serviceArea: e.target.value }))}
              placeholder="Describe your service coverage area (cities, regions, etc.)"
              rows={2}
            />
          </div>
        </CardContent>
      </Card>

      <Button type="submit" className="w-full">
        Save Business Rules
      </Button>
    </form>
  );
};
