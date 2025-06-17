
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Calendar, Clock, Plus, Trash2, Edit } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const DAYS_OF_WEEK = [
  { value: 0, label: 'Sunday' },
  { value: 1, label: 'Monday' },
  { value: 2, label: 'Tuesday' },
  { value: 3, label: 'Wednesday' },
  { value: 4, label: 'Thursday' },
  { value: 5, label: 'Friday' },
  { value: 6, label: 'Saturday' }
];

export const ProviderAvailabilityManager: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [availability, setAvailability] = useState([]);
  const [timeOff, setTimeOff] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddAvailability, setShowAddAvailability] = useState(false);
  const [showAddTimeOff, setShowAddTimeOff] = useState(false);

  const [newAvailability, setNewAvailability] = useState({
    day_of_week: 1,
    start_time: '09:00',
    end_time: '17:00',
    is_available: true
  });

  const [newTimeOff, setNewTimeOff] = useState({
    start_date: '',
    end_date: '',
    reason: '',
    all_day: true,
    start_time: '09:00',
    end_time: '17:00'
  });

  useEffect(() => {
    if (user) {
      fetchAvailabilityData();
    }
  }, [user]);

  const fetchAvailabilityData = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      // Fetch availability schedules
      const { data: availabilityData, error: availabilityError } = await supabase
        .from('provider_availability')
        .select('*')
        .eq('provider_id', user.id)
        .order('day_of_week');

      if (availabilityError) throw availabilityError;

      // Fetch time off records
      const { data: timeOffData, error: timeOffError } = await supabase
        .from('provider_time_off')
        .select('*')
        .eq('provider_id', user.id)
        .gte('end_date', new Date().toISOString().split('T')[0])
        .order('start_date');

      if (timeOffError) throw timeOffError;

      setAvailability(availabilityData || []);
      setTimeOff(timeOffData || []);
    } catch (error) {
      console.error('Error fetching availability data:', error);
      toast({
        title: "Error",
        description: "Failed to fetch availability data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddAvailability = async () => {
    try {
      const { error } = await supabase
        .from('provider_availability')
        .insert({
          provider_id: user.id,
          ...newAvailability
        });

      if (error) throw error;

      toast({
        title: "Availability Added",
        description: "Your availability has been updated successfully.",
      });

      setNewAvailability({
        day_of_week: 1,
        start_time: '09:00',
        end_time: '17:00',
        is_available: true
      });
      setShowAddAvailability(false);
      fetchAvailabilityData();
    } catch (error) {
      console.error('Error adding availability:', error);
      toast({
        title: "Error",
        description: "Failed to add availability",
        variant: "destructive",
      });
    }
  };

  const handleAddTimeOff = async () => {
    try {
      const { error } = await supabase
        .from('provider_time_off')
        .insert({
          provider_id: user.id,
          ...newTimeOff
        });

      if (error) throw error;

      toast({
        title: "Time Off Added",
        description: "Your time off has been scheduled successfully.",
      });

      setNewTimeOff({
        start_date: '',
        end_date: '',
        reason: '',
        all_day: true,
        start_time: '09:00',
        end_time: '17:00'
      });
      setShowAddTimeOff(false);
      fetchAvailabilityData();
    } catch (error) {
      console.error('Error adding time off:', error);
      toast({
        title: "Error",
        description: "Failed to add time off",
        variant: "destructive",
      });
    }
  };

  const handleDeleteAvailability = async (id: string) => {
    try {
      const { error } = await supabase
        .from('provider_availability')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Availability Removed",
        description: "Availability slot has been removed.",
      });
      fetchAvailabilityData();
    } catch (error) {
      console.error('Error deleting availability:', error);
      toast({
        title: "Error",
        description: "Failed to remove availability",
        variant: "destructive",
      });
    }
  };

  const handleDeleteTimeOff = async (id: string) => {
    try {
      const { error } = await supabase
        .from('provider_time_off')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Time Off Removed",
        description: "Time off has been removed.",
      });
      fetchAvailabilityData();
    } catch (error) {
      console.error('Error deleting time off:', error);
      toast({
        title: "Error",
        description: "Failed to remove time off",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <p className="text-gray-600">Loading availability data...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Weekly Availability */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Weekly Availability</CardTitle>
            <Dialog open={showAddAvailability} onOpenChange={setShowAddAvailability}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Plus className="h-4 w-4 mr-1" />
                  Add Availability
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Availability Slot</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label>Day of Week</Label>
                    <select
                      className="w-full p-2 border rounded"
                      value={newAvailability.day_of_week}
                      onChange={(e) => setNewAvailability({
                        ...newAvailability,
                        day_of_week: parseInt(e.target.value)
                      })}
                    >
                      {DAYS_OF_WEEK.map(day => (
                        <option key={day.value} value={day.value}>{day.label}</option>
                      ))}
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Start Time</Label>
                      <Input
                        type="time"
                        value={newAvailability.start_time}
                        onChange={(e) => setNewAvailability({
                          ...newAvailability,
                          start_time: e.target.value
                        })}
                      />
                    </div>
                    <div>
                      <Label>End Time</Label>
                      <Input
                        type="time"
                        value={newAvailability.end_time}
                        onChange={(e) => setNewAvailability({
                          ...newAvailability,
                          end_time: e.target.value
                        })}
                      />
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={newAvailability.is_available}
                      onCheckedChange={(checked) => setNewAvailability({
                        ...newAvailability,
                        is_available: checked
                      })}
                    />
                    <Label>Available for bookings</Label>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setShowAddAvailability(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleAddAvailability}>
                      Add Availability
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {availability.length === 0 ? (
            <p className="text-center text-gray-600 py-4">
              No availability set. Add your working hours to receive job assignments.
            </p>
          ) : (
            <div className="space-y-2">
              {availability.map((slot) => (
                <div key={slot.id} className="flex items-center justify-between p-3 border rounded">
                  <div className="flex items-center gap-4">
                    <span className="font-medium">
                      {DAYS_OF_WEEK.find(d => d.value === slot.day_of_week)?.label}
                    </span>
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4 text-gray-500" />
                      <span>{slot.start_time} - {slot.end_time}</span>
                    </div>
                    <Badge variant={slot.is_available ? "default" : "secondary"}>
                      {slot.is_available ? "Available" : "Unavailable"}
                    </Badge>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteAvailability(slot.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Time Off */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Scheduled Time Off</CardTitle>
            <Dialog open={showAddTimeOff} onOpenChange={setShowAddTimeOff}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Plus className="h-4 w-4 mr-1" />
                  Add Time Off
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Schedule Time Off</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Start Date</Label>
                      <Input
                        type="date"
                        value={newTimeOff.start_date}
                        onChange={(e) => setNewTimeOff({
                          ...newTimeOff,
                          start_date: e.target.value
                        })}
                      />
                    </div>
                    <div>
                      <Label>End Date</Label>
                      <Input
                        type="date"
                        value={newTimeOff.end_date}
                        onChange={(e) => setNewTimeOff({
                          ...newTimeOff,
                          end_date: e.target.value
                        })}
                      />
                    </div>
                  </div>
                  <div>
                    <Label>Reason</Label>
                    <Textarea
                      value={newTimeOff.reason}
                      onChange={(e) => setNewTimeOff({
                        ...newTimeOff,
                        reason: e.target.value
                      })}
                      placeholder="Vacation, sick leave, etc."
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={newTimeOff.all_day}
                      onCheckedChange={(checked) => setNewTimeOff({
                        ...newTimeOff,
                        all_day: checked
                      })}
                    />
                    <Label>All day</Label>
                  </div>
                  {!newTimeOff.all_day && (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Start Time</Label>
                        <Input
                          type="time"
                          value={newTimeOff.start_time}
                          onChange={(e) => setNewTimeOff({
                            ...newTimeOff,
                            start_time: e.target.value
                          })}
                        />
                      </div>
                      <div>
                        <Label>End Time</Label>
                        <Input
                          type="time"
                          value={newTimeOff.end_time}
                          onChange={(e) => setNewTimeOff({
                            ...newTimeOff,
                            end_time: e.target.value
                          })}
                        />
                      </div>
                    </div>
                  )}
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setShowAddTimeOff(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleAddTimeOff}>
                      Schedule Time Off
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {timeOff.length === 0 ? (
            <p className="text-center text-gray-600 py-4">
              No scheduled time off.
            </p>
          ) : (
            <div className="space-y-2">
              {timeOff.map((leave) => (
                <div key={leave.id} className="flex items-center justify-between p-3 border rounded">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      <span>
                        {new Date(leave.start_date).toLocaleDateString()} - {new Date(leave.end_date).toLocaleDateString()}
                      </span>
                    </div>
                    {!leave.all_day && (
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4 text-gray-500" />
                        <span>{leave.start_time} - {leave.end_time}</span>
                      </div>
                    )}
                    {leave.reason && (
                      <span className="text-sm text-gray-600">{leave.reason}</span>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteTimeOff(leave.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
