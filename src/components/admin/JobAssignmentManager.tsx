
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Calendar, Clock, MapPin, User, Star, Briefcase } from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export const JobAssignmentManager: React.FC = () => {
  const { toast } = useToast();
  const [unassignedBookings, setUnassignedBookings] = useState([]);
  const [availableProviders, setAvailableProviders] = useState([]);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [selectedProvider, setSelectedProvider] = useState('');
  const [assignmentReason, setAssignmentReason] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isAssigning, setIsAssigning] = useState(false);

  useEffect(() => {
    fetchUnassignedBookings();
  }, []);

  const fetchUnassignedBookings = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          service:services(*),
          client:users!bookings_client_id_fkey(*)
        `)
        .eq('status', 'pending')
        .is('provider_id', null)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUnassignedBookings(data || []);
    } catch (error) {
      console.error('Error fetching unassigned bookings:', error);
      toast({
        title: "Error",
        description: "Failed to fetch unassigned bookings",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAvailableProviders = async (booking: any) => {
    try {
      const { data, error } = await supabase.rpc('find_available_providers_for_booking', {
        p_service_id: booking.service_id,
        p_booking_date: booking.booking_date,
        p_booking_time: booking.booking_time,
        p_duration_minutes: booking.duration_minutes || 60,
        p_location_town: booking.location_town || 'windhoek'
      });

      if (error) throw error;
      setAvailableProviders(data || []);
    } catch (error) {
      console.error('Error fetching available providers:', error);
      toast({
        title: "Error",
        description: "Failed to fetch available providers",
        variant: "destructive",
      });
    }
  };

  const handleAssignJob = async () => {
    if (!selectedBooking || !selectedProvider) return;

    setIsAssigning(true);
    try {
      const { data, error } = await supabase.rpc('assign_booking_to_provider', {
        p_booking_id: selectedBooking.id,
        p_provider_id: selectedProvider,
        p_assigned_by: (await supabase.auth.getUser()).data.user?.id,
        p_assignment_reason: assignmentReason,
        p_auto_assigned: false
      });

      if (error) throw error;

      const result = data as any;
      if (result.success) {
        toast({
          title: "Job Assigned",
          description: `Job successfully assigned to ${result.provider_name}`,
        });
        setSelectedBooking(null);
        setSelectedProvider('');
        setAssignmentReason('');
        fetchUnassignedBookings();
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('Error assigning job:', error);
      toast({
        title: "Assignment Failed",
        description: error.message || "Failed to assign job",
        variant: "destructive",
      });
    } finally {
      setIsAssigning(false);
    }
  };

  const openAssignmentDialog = (booking: any) => {
    setSelectedBooking(booking);
    fetchAvailableProviders(booking);
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <p className="text-gray-600">Loading unassigned bookings...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Job Assignment Manager</CardTitle>
          <p className="text-sm text-gray-600">
            Assign pending bookings to available providers based on location, expertise, and availability
          </p>
        </CardHeader>
        <CardContent>
          {unassignedBookings.length === 0 ? (
            <p className="text-center text-gray-600 py-8">
              No unassigned bookings found. All current bookings have been assigned.
            </p>
          ) : (
            <div className="space-y-4">
              {unassignedBookings.map((booking) => (
                <Card key={booking.id} className="border">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <h4 className="font-medium">{booking.service?.name}</h4>
                        <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {format(new Date(booking.booking_date), 'MMM dd, yyyy')}
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {booking.booking_time}
                          </div>
                          <div className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            <span className="capitalize">{booking.location_town || 'Windhoek'}</span>
                          </div>
                        </div>
                      </div>
                      <Badge className="bg-orange-100 text-orange-800">
                        Pending Assignment
                      </Badge>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                      <User className="h-3 w-3" />
                      <span>Client: {booking.client?.full_name}</span>
                    </div>

                    {booking.special_instructions && (
                      <div className="mb-3 p-2 bg-gray-50 rounded text-sm">
                        <strong>Instructions:</strong> {booking.special_instructions}
                      </div>
                    )}

                    <div className="flex justify-between items-center">
                      <div className="font-medium text-lg">N${booking.total_amount}</div>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openAssignmentDialog(booking)}
                          >
                            Assign Provider
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>Assign Provider to Job</DialogTitle>
                          </DialogHeader>
                          
                          <div className="space-y-4">
                            <div className="p-4 bg-gray-50 rounded">
                              <h3 className="font-medium mb-2">{selectedBooking?.service?.name}</h3>
                              <div className="text-sm text-gray-600 space-y-1">
                                <div>Date: {selectedBooking && format(new Date(selectedBooking.booking_date), 'MMM dd, yyyy')}</div>
                                <div>Time: {selectedBooking?.booking_time}</div>
                                <div>Location: {selectedBooking?.location_town || 'Windhoek'}</div>
                                <div>Client: {selectedBooking?.client?.full_name}</div>
                              </div>
                            </div>

                            <div>
                              <label className="block text-sm font-medium mb-2">Available Providers</label>
                              <Select value={selectedProvider} onValueChange={setSelectedProvider}>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select a provider" />
                                </SelectTrigger>
                                <SelectContent>
                                  {availableProviders.map((provider) => (
                                    <SelectItem key={provider.provider_id} value={provider.provider_id}>
                                      <div className="flex items-center gap-2">
                                        <span>{provider.provider_name}</span>
                                        <div className="flex items-center gap-1">
                                          <Star className="h-3 w-3 text-yellow-500" />
                                          <span className="text-xs">{provider.rating}</span>
                                        </div>
                                        <Badge variant="outline" className="text-xs">
                                          {provider.expertise_level}
                                        </Badge>
                                        <span className="text-xs text-gray-500">
                                          {provider.years_experience}y exp
                                        </span>
                                      </div>
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              {availableProviders.length === 0 && (
                                <p className="text-sm text-orange-600 mt-1">
                                  No providers available for this time slot. Consider adjusting the booking time.
                                </p>
                              )}
                            </div>

                            <div>
                              <label className="block text-sm font-medium mb-2">Assignment Reason (Optional)</label>
                              <Textarea
                                value={assignmentReason}
                                onChange={(e) => setAssignmentReason(e.target.value)}
                                placeholder="Reason for assigning this specific provider..."
                                rows={3}
                              />
                            </div>

                            <div className="flex justify-end gap-2">
                              <Button variant="outline" onClick={() => setSelectedBooking(null)}>
                                Cancel
                              </Button>
                              <Button
                                onClick={handleAssignJob}
                                disabled={!selectedProvider || isAssigning}
                              >
                                {isAssigning ? 'Assigning...' : 'Assign Job'}
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
