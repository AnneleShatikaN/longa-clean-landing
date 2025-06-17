
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useRecurringBookings } from '@/hooks/useRecurringBookings';
import { useServices } from '@/contexts/ServiceContext';
import { Repeat, Calendar, Clock, MapPin, X, Loader2 } from 'lucide-react';
import { format } from 'date-fns';

export const RecurringBookingsTab = () => {
  const { recurringSchedules, isLoading, cancelRecurringSchedule } = useRecurringBookings();
  const { services } = useServices();

  const getServiceName = (serviceId: string) => {
    const service = services.find(s => s.id === serviceId);
    return service?.name || 'Unknown Service';
  };

  const getFrequencyLabel = (frequency: string) => {
    switch (frequency) {
      case 'weekly':
        return 'Weekly';
      case 'bi-weekly':
        return 'Bi-weekly';
      case 'monthly':
        return 'Monthly';
      default:
        return frequency;
    }
  };

  const getDayName = (dayOfWeek: number) => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[dayOfWeek] || 'Unknown';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        <span className="ml-2">Loading recurring bookings...</span>
      </div>
    );
  }

  if (recurringSchedules.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <Repeat className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Recurring Bookings</h3>
          <p className="text-gray-600 mb-6">
            You don't have any recurring bookings set up yet.
          </p>
          <Button onClick={() => window.location.href = '/search'}>
            <Calendar className="h-4 w-4 mr-2" />
            Book a Service
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Recurring Bookings</h2>
        <Badge variant="secondary">
          {recurringSchedules.length} active schedule{recurringSchedules.length !== 1 ? 's' : ''}
        </Badge>
      </div>

      <div className="grid gap-4">
        {recurringSchedules.map((schedule) => (
          <Card key={schedule.id} className="border-l-4 border-l-blue-500">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Repeat className="h-5 w-5 text-blue-600" />
                    {getServiceName(schedule.service_id)}
                  </CardTitle>
                  <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {getFrequencyLabel(schedule.frequency)} on {getDayName(schedule.day_of_week)}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {schedule.booking_time}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      {schedule.location_town}
                    </span>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => cancelRecurringSchedule(schedule.id)}
                  className="text-red-600 hover:text-red-700"
                >
                  <X className="h-4 w-4 mr-1" />
                  Cancel
                </Button>
              </div>
            </CardHeader>
            
            <CardContent>
              <div className="space-y-3">
                <div className="bg-gray-50 p-3 rounded-lg">
                  <h4 className="font-medium text-sm mb-2">Schedule Details</h4>
                  <div className="text-sm space-y-1">
                    <div className="flex justify-between">
                      <span>Started:</span>
                      <span>{format(new Date(schedule.start_date), 'MMM dd, yyyy')}</span>
                    </div>
                    {schedule.end_date && (
                      <div className="flex justify-between">
                        <span>Ends:</span>
                        <span>{format(new Date(schedule.end_date), 'MMM dd, yyyy')}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span>Duration:</span>
                      <span>{Math.floor(schedule.duration_minutes / 60)}h {schedule.duration_minutes % 60}m</span>
                    </div>
                  </div>
                </div>

                {schedule.special_instructions && (
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <h4 className="font-medium text-sm mb-1">Special Instructions</h4>
                    <p className="text-sm text-gray-700">{schedule.special_instructions}</p>
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    Auto-scheduled
                  </Badge>
                  {schedule.emergency_booking && (
                    <Badge variant="destructive" className="text-xs">
                      Emergency priority
                    </Badge>
                  )}
                  <Badge variant="default" className="text-xs">
                    Active
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
