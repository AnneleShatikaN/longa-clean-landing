
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { CalendarIcon, Repeat, Clock } from 'lucide-react';

interface RecurringBookingFormProps {
  isRecurring: boolean;
  onRecurringChange: (enabled: boolean) => void;
  frequency: 'weekly' | 'bi-weekly' | 'monthly';
  onFrequencyChange: (frequency: 'weekly' | 'bi-weekly' | 'monthly') => void;
  preferredDay: number;
  onPreferredDayChange: (day: number) => void;
  endDate?: string;
  onEndDateChange: (date?: string) => void;
}

export const RecurringBookingForm: React.FC<RecurringBookingFormProps> = ({
  isRecurring,
  onRecurringChange,
  frequency,
  onFrequencyChange,
  preferredDay,
  onPreferredDayChange,
  endDate,
  onEndDateChange,
}) => {
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  const getFrequencyDescription = () => {
    switch (frequency) {
      case 'weekly':
        return `Every ${dayNames[preferredDay]}`;
      case 'bi-weekly':
        return `Every other ${dayNames[preferredDay]}`;
      case 'monthly':
        return `Monthly on ${dayNames[preferredDay]}`;
      default:
        return '';
    }
  };

  return (
    <Card className="border-blue-200 bg-blue-50">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Repeat className="h-5 w-5 text-blue-600" />
          Recurring Booking
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="recurring" className="text-sm font-medium">
              Make this a recurring booking
            </Label>
            <p className="text-xs text-gray-600 mt-1">
              Automatically schedule future bookings
            </p>
          </div>
          <Switch
            id="recurring"
            checked={isRecurring}
            onCheckedChange={onRecurringChange}
          />
        </div>

        {isRecurring && (
          <div className="space-y-4 pt-4 border-t">
            <div className="space-y-2">
              <Label>Frequency</Label>
              <Select value={frequency} onValueChange={onFrequencyChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select frequency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="bi-weekly">Bi-weekly (Every 2 weeks)</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Preferred Day</Label>
              <Select value={preferredDay.toString()} onValueChange={(value) => onPreferredDayChange(parseInt(value))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select day" />
                </SelectTrigger>
                <SelectContent>
                  {dayNames.map((day, index) => (
                    <SelectItem key={index} value={index.toString()}>
                      {day}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="bg-white p-3 rounded-lg border">
              <div className="flex items-center gap-2 mb-2">
                <CalendarIcon className="h-4 w-4 text-blue-600" />
                <span className="font-medium text-sm">Schedule Summary</span>
              </div>
              <div className="text-sm text-gray-700">
                <p>{getFrequencyDescription()}</p>
                <p className="text-xs text-gray-500 mt-1">
                  Future bookings will be automatically created for the next 3 months
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                <Clock className="h-3 w-3 mr-1" />
                Auto-scheduled
              </Badge>
              <Badge variant="outline" className="text-xs">
                Individual cancellation allowed
              </Badge>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
