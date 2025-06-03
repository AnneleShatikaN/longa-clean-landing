
import React, { useState } from 'react';
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from '@/hooks/use-toast';
import { Clock, Plus, X } from 'lucide-react';

interface TimeSlot {
  id: string;
  start_time: string;
  end_time: string;
  is_available: boolean;
}

interface ProviderAvailabilityCalendarProps {
  providerId: string;
}

export const ProviderAvailabilityCalendar: React.FC<ProviderAvailabilityCalendarProps> = ({
  providerId
}) => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // Mock function for now - would be replaced with actual Supabase call when table exists
  const fetchAvailability = async (date: Date) => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setTimeSlots([
        { id: '1', start_time: '09:00', end_time: '10:00', is_available: true },
        { id: '2', start_time: '14:00', end_time: '15:00', is_available: true }
      ]);
      setLoading(false);
    }, 500);
  };

  const addTimeSlot = async () => {
    if (!selectedDate) return;

    const newSlot: TimeSlot = {
      id: Date.now().toString(),
      start_time: "09:00",
      end_time: "10:00",
      is_available: true
    };

    setTimeSlots(prev => [...prev, newSlot]);
    
    toast({
      title: "Time slot added",
      description: "New availability slot has been created",
    });
  };

  const removeTimeSlot = async (slotId: string) => {
    setTimeSlots(prev => prev.filter(slot => slot.id !== slotId));
    
    toast({
      title: "Time slot removed",
      description: "Availability slot has been deleted",
    });
  };

  React.useEffect(() => {
    if (selectedDate) {
      fetchAvailability(selectedDate);
    }
  }, [selectedDate, providerId]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Clock className="w-5 h-5" />
          <span>Availability Calendar</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              disabled={(date) => date < new Date()}
              className="rounded-md border"
            />
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">
                {selectedDate?.toLocaleDateString()} Availability
              </h3>
              <Button onClick={addTimeSlot} size="sm">
                <Plus className="w-4 h-4 mr-1" />
                Add Slot
              </Button>
            </div>
            
            {loading ? (
              <p>Loading...</p>
            ) : (
              <div className="space-y-2">
                {timeSlots.length === 0 ? (
                  <p className="text-gray-500">No availability set for this date</p>
                ) : (
                  timeSlots.map((slot) => (
                    <div key={slot.id} className="flex items-center justify-between p-2 border rounded">
                      <div className="flex items-center space-x-2">
                        <span>{slot.start_time} - {slot.end_time}</span>
                        <Badge variant={slot.is_available ? "default" : "secondary"}>
                          {slot.is_available ? "Available" : "Unavailable"}
                        </Badge>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeTimeSlot(slot.id)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
