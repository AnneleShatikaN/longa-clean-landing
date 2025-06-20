
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { CheckCircle, X, MapPin, Clock, DollarSign, User, ArrowLeft, UserCheck, UserX } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useSupabaseBookings } from '@/contexts/SupabaseBookingContext';
import { useNotifications } from '@/contexts/NotificationContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';

interface Job {
  id: string;
  service: { name: string };
  client: { full_name: string };
  booking_date: string;
  booking_time: string;
  total_amount: number;
  location_town: string;
  status: string;
  service_address: string;
}

export const SimplifiedProviderDashboard = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isAvailable, setIsAvailable] = useState(true);
  const [currentJob, setCurrentJob] = useState<Job | null>(null);
  const [availableJobs, setAvailableJobs] = useState<Job[]>([]);
  const [myJobs, setMyJobs] = useState<Job[]>([]);
  const [view, setView] = useState<'main' | 'available' | 'current'>('main');
  const [isLoading, setIsLoading] = useState(true);

  const fetchJobs = async () => {
    if (!user) return;

    try {
      setIsLoading(true);

      // Fetch available jobs (unassigned)
      const { data: availableData, error: availableError } = await supabase
        .from('bookings')
        .select(`
          *,
          service:services(name),
          client:users!bookings_client_id_fkey(full_name)
        `)
        .is('provider_id', null)
        .eq('status', 'pending')
        .eq('location_town', user.current_work_location || 'windhoek')
        .order('created_at', { ascending: false });

      if (availableError) throw availableError;

      // Fetch my jobs (assigned to me)
      const { data: myJobsData, error: myJobsError } = await supabase
        .from('bookings')
        .select(`
          *,
          service:services(name),
          client:users!bookings_client_id_fkey(full_name)
        `)
        .eq('provider_id', user.id)
        .in('status', ['accepted', 'in_progress'])
        .order('booking_date', { ascending: true });

      if (myJobsError) throw myJobsError;

      // Transform data
      const availableJobsTransformed = (availableData || []).map(job => ({
        id: job.id,
        service: { name: job.service?.name || 'Service' },
        client: { full_name: job.client?.full_name || 'Client' },
        booking_date: job.booking_date,
        booking_time: job.booking_time,
        total_amount: job.total_amount,
        location_town: job.location_town,
        status: job.status,
        service_address: job.service_address || 'Address not provided'
      }));

      const myJobsTransformed = (myJobsData || []).map(job => ({
        id: job.id,
        service: { name: job.service?.name || 'Service' },
        client: { full_name: job.client?.full_name || 'Client' },
        booking_date: job.booking_date,
        booking_time: job.booking_time,
        total_amount: job.total_amount,
        location_town: job.location_town,
        status: job.status,
        service_address: job.service_address || 'Address not provided'
      }));

      setAvailableJobs(availableJobsTransformed);
      setMyJobs(myJobsTransformed);

    } catch (error) {
      console.error('Error fetching jobs:', error);
      toast({
        title: "Error",
        description: "Failed to load jobs. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, [user]);

  const handleAcceptJob = async (jobId: string) => {
    try {
      const { error } = await supabase
        .from('bookings')
        .update({
          provider_id: user?.id,
          status: 'accepted',
          assigned_at: new Date().toISOString()
        })
        .eq('id', jobId);

      if (error) throw error;

      toast({
        title: "Job Accepted!",
        description: "You have accepted this job.",
      });
      
      await fetchJobs(); // Refresh data
      setView('main');
    } catch (error) {
      console.error('Error accepting job:', error);
      toast({
        title: "Error",
        description: "Could not accept job. Try again.",
        variant: "destructive",
      });
    }
  };

  const handleDeclineJob = async (jobId: string) => {
    // For now, just remove from available jobs locally
    setAvailableJobs(availableJobs.filter(j => j.id !== jobId));
    setView('main');
    toast({
      title: "Job Declined",
      description: "Job has been declined.",
    });
  };

  const handleStartJob = async (jobId: string) => {
    try {
      const { error } = await supabase
        .from('bookings')
        .update({
          status: 'in_progress',
          check_in_time: new Date().toISOString()
        })
        .eq('id', jobId);

      if (error) throw error;

      setMyJobs(myJobs.map(j => 
        j.id === jobId ? { ...j, status: 'in_progress' } : j
      ));
      
      toast({
        title: "Job Started",
        description: "Good luck with your job!",
      });
    } catch (error) {
      console.error('Error starting job:', error);
      toast({
        title: "Error",
        description: "Could not start job. Try again.",
        variant: "destructive",
      });
    }
  };

  const handleCompleteJob = async (jobId: string) => {
    try {
      const { error } = await supabase
        .from('bookings')
        .update({
          status: 'completed'
        })
        .eq('id', jobId);

      if (error) throw error;

      setMyJobs(myJobs.map(j => 
        j.id === jobId ? { ...j, status: 'completed' } : j
      ));
      
      toast({
        title: "Job Completed!",
        description: "Great work! Payment processing.",
      });
    } catch (error) {
      console.error('Error completing job:', error);
      toast({
        title: "Error",
        description: "Could not complete job. Try again.",
        variant: "destructive",
      });
    }
  };

  const setAvailability = async (available: boolean) => {
    try {
      const { error } = await supabase
        .from('users')
        .update({ is_available: available })
        .eq('id', user?.id);

      if (error) throw error;

      setIsAvailable(available);
      toast({
        title: available ? "You're now available" : "You're now unavailable",
        description: available ? "You'll receive job notifications" : "You won't receive new jobs",
      });
    } catch (error) {
      console.error('Error updating availability:', error);
      toast({
        title: "Error",
        description: "Could not update availability",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-green-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  // Main dashboard view
  if (view === 'main') {
    return (
      <div className="min-h-screen bg-green-50 p-4">
        <div className="max-w-md mx-auto space-y-6">
          {/* Header */}
          <div className="text-center py-6">
            <h1 className="text-3xl font-bold text-green-800">Provider Dashboard</h1>
            <p className="text-lg text-green-600 mt-2">Welcome back!</p>
          </div>

          {/* Availability Status Card */}
          <Card className={`border-2 ${isAvailable ? 'border-green-200 bg-green-100' : 'border-red-200 bg-red-100'}`}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {isAvailable ? (
                    <UserCheck className="h-8 w-8 text-green-600" />
                  ) : (
                    <UserX className="h-8 w-8 text-red-600" />
                  )}
                  <div>
                    <div className="text-xl font-bold">
                      {isAvailable ? 'Available' : 'Unavailable'}
                    </div>
                    <div className="text-sm text-gray-600">
                      {isAvailable ? 'Receiving job assignments' : 'Not receiving jobs'}
                    </div>
                  </div>
                </div>
                <Switch
                  checked={isAvailable}
                  onCheckedChange={setAvailability}
                  className="data-[state=checked]:bg-green-600 scale-150"
                />
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 gap-4">
            <Card className="bg-blue-100 border-blue-200">
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold text-blue-800">{availableJobs.length}</div>
                <div className="text-lg text-blue-600">New Jobs</div>
              </CardContent>
            </Card>
            <Card className="bg-green-100 border-green-200">
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold text-green-800">{myJobs.length}</div>
                <div className="text-lg text-green-600">My Jobs</div>
              </CardContent>
            </Card>
          </div>

          {/* Main Actions */}
          <div className="space-y-4">
            <Button 
              onClick={() => setView('available')}
              className="w-full h-20 text-xl bg-blue-600 hover:bg-blue-700"
              disabled={availableJobs.length === 0 || !isAvailable}
            >
              <div className="text-center">
                <div>View New Jobs</div>
                {availableJobs.length > 0 && isAvailable && (
                  <Badge className="bg-red-500 text-white mt-1">
                    {availableJobs.length} waiting
                  </Badge>
                )}
                {!isAvailable && (
                  <div className="text-sm mt-1 opacity-75">Turn on availability to receive jobs</div>
                )}
              </div>
            </Button>

            <Button 
              onClick={() => setView('current')}
              className="w-full h-20 text-xl bg-green-600 hover:bg-green-700"
              disabled={myJobs.length === 0}
            >
              <div className="text-center">
                <div>My Current Jobs</div>
                {myJobs.length > 0 && (
                  <div className="text-sm mt-1">{myJobs.length} active</div>
                )}
              </div>
            </Button>
          </div>

          {/* Next Job Preview */}
          {myJobs.length > 0 && (
            <Card className="bg-yellow-50 border-yellow-200">
              <CardContent className="p-4">
                <h3 className="text-lg font-semibold text-yellow-800 mb-2">Next Job</h3>
                <div className="space-y-2">
                  <div className="text-xl font-bold">{myJobs[0].service.name}</div>
                  <div className="flex items-center gap-2 text-lg">
                    <Clock className="h-5 w-5" />
                    {format(new Date(myJobs[0].booking_date), 'MMM dd')} at {myJobs[0].booking_time}
                  </div>
                  <div className="flex items-center gap-2 text-lg">
                    <DollarSign className="h-5 w-5" />
                    N${myJobs[0].total_amount}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Availability Notice */}
          {!isAvailable && (
            <Card className="border-orange-200 bg-orange-50">
              <CardContent className="p-4 text-center">
                <div className="text-orange-800 font-medium mb-2">You're currently unavailable</div>
                <div className="text-sm text-orange-600">
                  Turn on availability above to start receiving job assignments
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    );
  }

  // Available jobs view
  if (view === 'available') {
    return (
      <div className="min-h-screen bg-blue-50 p-4">
        <div className="max-w-md mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center gap-4 py-4">
            <Button 
              variant="outline" 
              size="lg"
              onClick={() => setView('main')}
              className="p-3"
            >
              <ArrowLeft className="h-6 w-6" />
            </Button>
            <h1 className="text-2xl font-bold text-blue-800">New Jobs</h1>
          </div>

          {availableJobs.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <div className="text-xl text-gray-600">No new jobs available</div>
                <div className="text-lg text-gray-500 mt-2">Check back later</div>
              </CardContent>
            </Card>
          ) : (
            availableJobs.map((job) => (
              <Card key={job.id} className="border-2 border-blue-200">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="text-center">
                      <h2 className="text-2xl font-bold text-blue-800">{job.service.name}</h2>
                      <div className="text-3xl font-bold text-green-600 mt-2">N${job.total_amount}</div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center gap-3 text-lg">
                        <User className="h-6 w-6 text-gray-600" />
                        <span>{job.client.full_name}</span>
                      </div>
                      <div className="flex items-center gap-3 text-lg">
                        <Clock className="h-6 w-6 text-gray-600" />
                        <span>{format(new Date(job.booking_date), 'MMM dd')} at {job.booking_time}</span>
                      </div>
                      <div className="flex items-center gap-3 text-lg">
                        <MapPin className="h-6 w-6 text-gray-600" />
                        <span>{job.location_town}</span>
                      </div>
                      <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                        <strong>Address:</strong> {job.service_address}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-4">
                      <Button 
                        onClick={() => handleDeclineJob(job.id)}
                        variant="outline"
                        className="h-16 text-lg border-2 border-red-300 text-red-600 hover:bg-red-50"
                      >
                        <X className="h-6 w-6 mr-2" />
                        Decline
                      </Button>
                      <Button 
                        onClick={() =>

 handleAcceptJob(job.id)}
                        className="h-16 text-lg bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle className="h-6 w-6 mr-2" />
                        Accept
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    );
  }

  // Current jobs view
  if (view === 'current') {
    return (
      <div className="min-h-screen bg-green-50 p-4">
        <div className="max-w-md mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center gap-4 py-4">
            <Button 
              variant="outline" 
              size="lg"
              onClick={() => setView('main')}
              className="p-3"
            >
              <ArrowLeft className="h-6 w-6" />
            </Button>
            <h1 className="text-2xl font-bold text-green-800">My Jobs</h1>
          </div>

          {myJobs.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <div className="text-xl text-gray-600">No active jobs</div>
                <div className="text-lg text-gray-500 mt-2">Accept some jobs to get started</div>
              </CardContent>
            </Card>
          ) : (
            myJobs.map((job) => (
              <Card key={job.id} className="border-2 border-green-200">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="text-center">
                      <h2 className="text-2xl font-bold text-green-800">{job.service.name}</h2>
                      <div className="text-3xl font-bold text-green-600 mt-2">N${job.total_amount}</div>
                      <Badge 
                        className={`mt-2 text-lg px-4 py-2 ${
                          job.status === 'accepted' ? 'bg-blue-100 text-blue-800' :
                          job.status === 'in_progress' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }`}
                      >
                        {job.status === 'accepted' ? 'Ready to Start' :
                         job.status === 'in_progress' ? 'In Progress' :
                         'Completed'}
                      </Badge>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center gap-3 text-lg">
                        <User className="h-6 w-6 text-gray-600" />
                        <span>{job.client.full_name}</span>
                      </div>
                      <div className="flex items-center gap-3 text-lg">
                        <Clock className="h-6 w-6 text-gray-600" />
                        <span>{format(new Date(job.booking_date), 'MMM dd')} at {job.booking_time}</span>
                      </div>
                      <div className="flex items-center gap-3 text-lg">
                        <MapPin className="h-6 w-6 text-gray-600" />
                        <span>{job.location_town}</span>
                      </div>
                      <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                        <strong>Address:</strong> {job.service_address}
                      </div>
                    </div>

                    <div className="pt-4">
                      {job.status === 'accepted' && (
                        <Button 
                          onClick={() => handleStartJob(job.id)}
                          className="w-full h-16 text-xl bg-blue-600 hover:bg-blue-700"
                        >
                          Start Job
                        </Button>
                      )}
                      {job.status === 'in_progress' && (
                        <Button 
                          onClick={() => handleCompleteJob(job.id)}
                          className="w-full h-16 text-xl bg-green-600 hover:bg-green-700"
                        >
                          <CheckCircle className="h-6 w-6 mr-2" />
                          Mark Complete
                        </Button>
                      )}
                      {job.status === 'completed' && (
                        <div className="text-center text-xl text-green-600 font-semibold py-4">
                          ✓ Job Completed
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    );
  }

  return null;
};
