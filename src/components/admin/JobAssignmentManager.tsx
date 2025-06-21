
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MapPin, User, Clock, AlertTriangle, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';

interface UnassignedJob {
  id: string;
  client_name: string;
  service_name: string;
  client_town: string;
  client_suburb: string;
  booking_date: string;
  booking_time: string;
  total_amount: number;
  assignment_status: string;
  created_at: string;
}

interface AvailableProvider {
  id: string;
  full_name: string;
  town: string;
  suburb: string;
  max_distance: number;
  rating: number;
  total_jobs: number;
}

const JobAssignmentManager: React.FC = () => {
  const { toast } = useToast();
  const [unassignedJobs, setUnassignedJobs] = useState<UnassignedJob[]>([]);
  const [availableProviders, setAvailableProviders] = useState<AvailableProvider[]>([]);
  const [selectedJob, setSelectedJob] = useState<string>('');
  const [selectedProvider, setSelectedProvider] = useState<string>('');
  const [isAssigning, setIsAssigning] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUnassignedJobs = async () => {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          id,
          client_town,
          client_suburb,
          booking_date,
          booking_time,
          total_amount,
          assignment_status,
          created_at,
          service:services(name),
          client:users!bookings_client_id_fkey(full_name)
        `)
        .in('assignment_status', ['manual_assignment_required', 'unassigned'])
        .is('assigned_provider_id', null)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedJobs = (data || []).map(job => ({
        id: job.id,
        client_name: job.client?.full_name || 'Unknown Client',
        service_name: job.service?.name || 'Unknown Service',
        client_town: job.client_town || 'Unknown',
        client_suburb: job.client_suburb || 'Unknown',
        booking_date: job.booking_date,
        booking_time: job.booking_time,
        total_amount: job.total_amount,
        assignment_status: job.assignment_status,
        created_at: job.created_at
      }));

      setUnassignedJobs(formattedJobs);
    } catch (error) {
      console.error('Error fetching unassigned jobs:', error);
      toast({
        title: "Error",
        description: "Failed to load unassigned jobs",
        variant: "destructive",
      });
    }
  };

  const fetchAvailableProviders = async (jobTown: string) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('id, full_name, town, suburb, max_distance, rating, total_jobs')
        .eq('role', 'provider')
        .eq('is_active', true)
        .eq('is_available', true)
        .eq('verification_status', 'verified')
        .eq('town', jobTown)
        .order('rating', { ascending: false });

      if (error) throw error;
      setAvailableProviders(data || []);
    } catch (error) {
      console.error('Error fetching providers:', error);
    }
  };

  const handleJobSelect = (jobId: string) => {
    setSelectedJob(jobId);
    setSelectedProvider('');
    
    const job = unassignedJobs.find(j => j.id === jobId);
    if (job) {
      fetchAvailableProviders(job.client_town);
    }
  };

  const assignJobToProvider = async () => {
    if (!selectedJob || !selectedProvider) return;

    setIsAssigning(true);
    
    try {
      const { error } = await supabase
        .from('bookings')
        .update({
          assigned_provider_id: selectedProvider,
          assignment_status: 'manually_assigned',
          status: 'assigned',
          assigned_at: new Date().toISOString(),
          assigned_by: (await supabase.auth.getUser()).data.user?.id
        })
        .eq('id', selectedJob);

      if (error) throw error;

      toast({
        title: "Job Assigned",
        description: "The job has been successfully assigned to the selected provider.",
      });

      // Refresh the lists
      await fetchUnassignedJobs();
      setSelectedJob('');
      setSelectedProvider('');
      setAvailableProviders([]);

    } catch (error) {
      console.error('Error assigning job:', error);
      toast({
        title: "Assignment Failed",
        description: "Failed to assign the job. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsAssigning(false);
    }
  };

  useEffect(() => {
    fetchUnassignedJobs().finally(() => setIsLoading(false));
  }, []);

  const selectedJobData = unassignedJobs.find(job => job.id === selectedJob);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Manual Job Assignment</h2>
        <Button onClick={fetchUnassignedJobs} variant="outline">
          Refresh
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Unass igned Jobs */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-500" />
              Unassigned Jobs ({unassignedJobs.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p className="text-center py-4">Loading unassigned jobs...</p>
            ) : unassignedJobs.length === 0 ? (
              <div className="text-center py-8">
                <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                <p className="text-gray-600">All jobs are assigned!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {unassignedJobs.map((job) => (
                  <div
                    key={job.id}
                    className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                      selectedJob === job.id ? 'border-blue-500 bg-blue-50' : 'hover:bg-gray-50'
                    }`}
                    onClick={() => handleJobSelect(job.id)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">{job.service_name}</h4>
                      <Badge variant="outline" className="text-orange-600">
                        {job.assignment_status.replace('_', ' ')}
                      </Badge>
                    </div>
                    <div className="text-sm text-gray-600 space-y-1">
                      <div className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        {job.client_name}
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {job.client_suburb}, {job.client_town}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {format(new Date(job.booking_date), 'MMM dd, yyyy')} at {job.booking_time}
                      </div>
                      <div className="font-medium">N${job.total_amount}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Available Providers */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-blue-500" />
              Available Providers
              {selectedJobData && (
                <span className="text-sm font-normal text-gray-600">
                  in {selectedJobData.client_town}
                </span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!selectedJob ? (
              <p className="text-center py-8 text-gray-500">
                Select a job to see available providers
              </p>
            ) : availableProviders.length === 0 ? (
              <p className="text-center py-8 text-gray-500">
                No available providers in {selectedJobData?.client_town}
              </p>
            ) : (
              <div className="space-y-4">
                <Select value={selectedProvider} onValueChange={setSelectedProvider}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a provider" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableProviders.map((provider) => (
                      <SelectItem key={provider.id} value={provider.id}>
                        {provider.full_name} - {provider.suburb} (Rating: {provider.rating.toFixed(1)})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {selectedProvider && (
                  <div className="space-y-3">
                    {availableProviders
                      .filter(p => p.id === selectedProvider)
                      .map((provider) => (
                        <div key={provider.id} className="p-3 border rounded-lg bg-blue-50">
                          <h4 className="font-medium">{provider.full_name}</h4>
                          <div className="text-sm text-gray-600 space-y-1">
                            <div>Location: {provider.suburb}, {provider.town}</div>
                            <div>Max Distance: {provider.max_distance} units</div>
                            <div>Rating: {provider.rating.toFixed(1)}/5</div>
                            <div>Total Jobs: {provider.total_jobs}</div>
                          </div>
                        </div>
                      ))}

                    <Button
                      onClick={assignJobToProvider}
                      disabled={isAssigning}
                      className="w-full"
                    >
                      {isAssigning ? 'Assigning...' : 'Assign Job to Provider'}
                    </Button>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default JobAssignmentManager;
