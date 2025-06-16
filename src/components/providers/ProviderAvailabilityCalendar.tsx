
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { CalendarIcon, Clock, X } from 'lucide-react';
import { format, isSameDay } from 'date-fns';

interface ProviderAvailabilityCalendarProps {
  providerId: string;
  providerName: string;
  onTimeSlotSelected?: (date: Date, time: string) => void;
}

interface TimeSlot {
  time: string;
  available: boolean;
}

export const ProviderAvailabilityCalendar: React.FC<ProviderAvailabilityCalendarProps> = ({
  providerId,
  providerName,
  onTimeSlotSelected
}) => {
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [isOpen, setIsOpen] = useState(false);

  // Mock availability data - in real implementation, this would come from API
  const getAvailabilityForDate = (date: Date): TimeSlot[] => {
    const baseSlots = [
      '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
      '11:00', '11:30', '13:00', '13:30', '14:00', '14:30',
      '15:00', '15:30', '16:00', '16:30', '17:00'
    ];

    return baseSlots.map(time => ({
      time,
      available: Math.random() > 0.3 // Random availability for demo
    }));
  };

  const handleTimeSlotClick = (time: string) => {
    if (selectedDate && onTimeSlotSelected) {
      onTimeSlotSelected(selectedDate, time);
      setIsOpen(false);
    }
  };

  const timeSlots = selectedDate ? getAvailabilityForDate(selectedDate) : [];

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2">
          <CalendarIcon className="h-4 w-4" />
          Check Availability
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5" />
            {providerName}'s Availability
          </DialogTitle>
        </DialogHeader>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Calendar */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Select Date</CardTitle>
            </CardHeader>
            <CardContent>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                disabled={(date) => date < new Date()}
                className="w-full"
              />
            </CardContent>
          </Card>
          
          {/* Time Slots */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Available Times
                {selectedDate && (
                  <Badge variant="outline">
                    {format(selectedDate, 'MMM dd')}
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {selectedDate ? (
                <div className="space-y-2">
                  <div className="grid grid-cols-3 gap-2">
                    {timeSlots.map((slot) => (
                      <Button
                        key={slot.time}
                        variant={slot.available ? "outline" : "secondary"}
                        size="sm"
                        disabled={!slot.available}
                        onClick={() => handleTimeSlotClick(slot.time)}
                        className={`text-xs ${slot.available ? 'hover:bg-blue-50' : 'opacity-50'}`}
                      >
                        {slot.time}
                      </Button>
                    ))}
                  </div>
                  
                  {timeSlots.filter(slot => slot.available).length === 0 && (
                    <div className="text-center py-4 text-gray-500">
                      <X className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                      <p className="text-sm">No available slots on this date</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <CalendarIcon className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                  <p className="text-sm">Select a date to view available times</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        
        <div className="flex justify-between items-center text-sm text-gray-600 mt-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 border border-gray-300 rounded"></div>
              <span>Available</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-gray-200 rounded"></div>
              <span>Unavailable</span>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
