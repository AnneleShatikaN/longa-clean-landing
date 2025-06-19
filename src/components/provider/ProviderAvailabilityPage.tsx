
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

interface Availability {
  monday: boolean;
  tuesday: boolean;
  wednesday: boolean;
  thursday: boolean;
  friday: boolean;
  saturday: boolean;
  sunday: boolean;
  start_time: string;
  end_time: string;
}

export const ProviderAvailabilityPage: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [availability, setAvailability] = useState<Availability>({
    monday: true,
    tuesday: true,
    wednesday: true,
    thursday: true,
    friday: true,
    saturday: false,
    sunday: false,
    start_time: '08:00',
    end_time: '16:00'
  });

  const daysOfWeek = [
    { key: 'monday', label: 'Monday' },
    { key: 'tuesday', label: 'Tuesday' },
    { key: 'wednesday', label: 'Wednesday' },
    { key: 'thursday', label: 'Thursday' },
    { key: 'friday', label: 'Friday' },
    { key: 'saturday', label: 'Saturday' },
    { key: 'sunday', label: 'Sunday' }
  ];

  const timeOptions = [
    '06:00', '07:00', '08:00', '09:00', '10:00', '11:00', '12:00',
    '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00'
  ];

  const fetchAvailability = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_availability')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      if (data) {
        setAvailability({
          monday: data.monday,
          tuesday: data.tuesday,
          wednesday: data.wednesday,
          thursday: data.thursday,
          friday: data.friday,
          saturday: data.saturday,
          sunday: data.sunday,
          start_time: data.start_time || '08:00',
          end_time: data.end_time || '16:00'
        });
      }
    } catch (error) {
      console.error('Error fetching availability:', error);
    }
  };

  useEffect(() => {
    fetchAvailability();
  }, [user]);

  const handleDayToggle = (day: string, enabled: boolean) => {
    setAvailability(prev => ({
      ...prev,
      [day]: enabled
    }));
  };

  const handleTimeChange = (timeType: 'start_time' | 'end_time', value: string) => {
    setAvailability(prev => ({
      ...prev,
      [timeType]: value
    }));
  };

  const handleSaveAvailability = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('user_availability')
        .upsert({
          user_id: user.id,
          ...availability,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id'
        });

      if (error) throw error;

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

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Calendar className="h-5 w-5" />
            <span>Working Days</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {daysOfWeek.map(day => (
            <div key={day.key} className="flex items-center justify-between">
              <Label htmlFor={day.key} className="text-base font-medium">
                {day.label}
              </Label>
              <Switch
                id={day.key}
                checked={availability[day.key as keyof Availability] as boolean}
                onCheckedChange={(checked) => handleDayToggle(day.key, checked)}
              />
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Clock className="h-5 w-5" />
            <span>Working Hours</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start-time">Start Time</Label>
              <Select value={availability.start_time} onValueChange={(value) => handleTimeChange('start_time', value)}>
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
              <Label htmlFor="end-time">End Time</Label>
              <Select value={availability.end_time} onValueChange={(value) => handleTimeChange('end_time', value)}>
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
