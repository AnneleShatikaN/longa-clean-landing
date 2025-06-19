
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Clock, Calendar, Save } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AvailabilitySlot {
  id?: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  is_available: boolean;
}

export const ProviderAvailabilityPage: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [availabilitySlots, setAvailabilitySlots] = useState<AvailabilitySlot[]>([]);
  const [defaultStartTime, setDefaultStartTime] = useState('08:00');
  const [defaultEndTime, setDefaultEndTime] = useState('16:00');

  const daysOfWeek = [
    { key: 0, label: 'Sunday' },
    { key: 1, label: 'Monday' },
    { key: 2, label: 'Tuesday' },
    { key: 3, label: 'Wednesday' },
    { key: 4, label: 'Thursday' },
    { key: 5, label: 'Friday' },
    { key: 6, label: 'Saturday' }
  ];

  const timeOptions = [
    '06:00', '07:00', '08:00', '09:00', '10:00', '11:00', '12:00',
    '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00'
  ];

  const fetchAvailability = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('provider_availability')
        .select('*')
        .eq('provider_id', user.id)
        .order('day_of_week');

      if (error) throw error;

      if (data && data.length > 0) {
        setAvailabilitySlots(data);
      } else {
        // Initialize with default weekday availability if no data exists
        const defaultSlots: AvailabilitySlot[] = [];
        for (let day = 1; day <= 5; day++) { // Monday to Friday
          defaultSlots.push({
            day_of_week: day,
            start_time: defaultStartTime,
            end_time: defaultEndTime,
            is_available: true
          });
        }
        setAvailabilitySlots(defaultSlots);
      }
    } catch (error) {
      console.error('Error fetching availability:', error);
      toast({
        title: "Error",
        description: "Failed to load availability data.",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    fetchAvailability();
  }, [user]);

  const getDayAvailability = (dayOfWeek: number): AvailabilitySlot | null => {
    return availabilitySlots.find(slot => slot.day_of_week === dayOfWeek) || null;
  };

  const handleDayToggle = (dayOfWeek: number, enabled: boolean) => {
    setAvailabilitySlots(prev => {
      const existing = prev.find(slot => slot.day_of_week === dayOfWeek);
      if (existing) {
        return prev.map(slot => 
          slot.day_of_week === dayOfWeek 
            ? { ...slot, is_available: enabled }
            : slot
        );
      } else {
        return [...prev, {
          day_of_week: dayOfWeek,
          start_time: defaultStartTime,
          end_time: defaultEndTime,
          is_available: enabled
        }];
      }
    });
  };

  const handleTimeChange = (dayOfWeek: number, timeType: 'start_time' | 'end_time', value: string) => {
    setAvailabilitySlots(prev => {
      const existing = prev.find(slot => slot.day_of_week === dayOfWeek);
      if (existing) {
        return prev.map(slot => 
          slot.day_of_week === dayOfWeek 
            ? { ...slot, [timeType]: value }
            : slot
        );
      } else {
        return [...prev, {
          day_of_week: dayOfWeek,
          start_time: timeType === 'start_time' ? value : defaultStartTime,
          end_time: timeType === 'end_time' ? value : defaultEndTime,
          is_available: true
        }];
      }
    });
  };

  const handleDefaultTimeChange = (timeType: 'start' | 'end', value: string) => {
    if (timeType === 'start') {
      setDefaultStartTime(value);
    } else {
      setDefaultEndTime(value);
    }
  };

  const handleSaveAvailability = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      // Delete existing availability for this provider
      await supabase
        .from('provider_availability')
        .delete()
        .eq('provider_id', user.id);

      // Insert new availability slots
      const slotsToInsert = availabilitySlots
        .filter(slot => slot.is_available)
        .map(slot => ({
          provider_id: user.id,
          day_of_week: slot.day_of_week,
          start_time: slot.start_time,
          end_time: slot.end_time,
          is_available: slot.is_available
        }));

      if (slotsToInsert.length > 0) {
        const { error } = await supabase
          .from('provider_availability')
          .insert(slotsToInsert);

        if (error) throw error;
      }

      toast({
        title: "Availability Updated",
        description: "Your availability has been saved successfully.",
      });
    } catch (error) {
      console.error('Error saving availability:', error);
      toast({
        title: "Error",
        description: "Failed to save availability. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4 space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Availability Settings</h1>
        <p className="text-gray-600">Set your working days and hours</p>
      </div>

      {/* Default Time Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Clock className="h-5 w-5" />
            <span>Default Working Hours</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="default-start-time">Default Start Time</Label>
              <Select value={defaultStartTime} onValueChange={(value) => handleDefaultTimeChange('start', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select start time" />
                </SelectTrigger>
                <SelectContent>
                  {timeOptions.map(time => (
                    <SelectItem key={time} value={time}>{time}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="default-end-time">Default End Time</Label>
              <Select value={defaultEndTime} onValueChange={(value) => handleDefaultTimeChange('end', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select end time" />
                </SelectTrigger>
                <SelectContent>
                  {timeOptions.map(time => (
                    <SelectItem key={time} value={time}>{time}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Working Days */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Calendar className="h-5 w-5" />
            <span>Working Days</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {daysOfWeek.map(day => {
            const dayAvailability = getDayAvailability(day.key);
            const isAvailable = dayAvailability?.is_available || false;
            
            return (
              <div key={day.key} className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label htmlFor={`day-${day.key}`} className="text-base font-medium">
                    {day.label}
                  </Label>
                  <Switch
                    id={`day-${day.key}`}
                    checked={isAvailable}
                    onCheckedChange={(checked) => handleDayToggle(day.key, checked)}
                  />
                </div>
                
                {isAvailable && (
                  <div className="grid grid-cols-2 gap-4 ml-4">
                    <div className="space-y-2">
                      <Label className="text-sm">Start Time</Label>
                      <Select 
                        value={dayAvailability?.start_time || defaultStartTime} 
                        onValueChange={(value) => handleTimeChange(day.key, 'start_time', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {timeOptions.map(time => (
                            <SelectItem key={time} value={time}>{time}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label className="text-sm">End Time</Label>
                      <Select 
                        value={dayAvailability?.end_time || defaultEndTime} 
                        onValueChange={(value) => handleTimeChange(day.key, 'end_time', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {timeOptions.map(time => (
                            <SelectItem key={time} value={time}>{time}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </CardContent>
      </Card>

      <Card className="bg-purple-50 border-purple-200">
        <CardContent className="p-4">
          <div className="flex items-start space-x-3">
            <div className="bg-purple-600 rounded-full p-1">
              <Calendar className="h-4 w-4 text-white" />
            </div>
            <div>
              <h3 className="font-medium text-purple-900">Area Visibility</h3>
              <p className="text-sm text-purple-700 mt-1">
                Your availability affects which jobs you'll be assigned in your work area. 
                Update regularly to ensure you receive the right amount of work.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Button 
        onClick={handleSaveAvailability}
        disabled={isLoading}
        className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3"
      >
        <Save className="h-5 w-5 mr-2" />
        {isLoading ? 'Saving...' : 'Save Availability'}
      </Button>
    </div>
  );
};
