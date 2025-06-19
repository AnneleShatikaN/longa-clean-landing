
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  User,
  Play,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

interface Job {
  id: string;
  client_name: string;
  client_avatar?: string;
  booking_date: string;
  booking_time: string;
  location_town: string;
  service_name: string;
  status: string;
  total_amount: number;
}

export const ProviderMyJobs: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchJobs = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          id,
          booking_date,
          booking_time,
          location_town,
          status,
          total_amount,
          service:services(name),
          client:users!bookings_client_id_fkey(full_name, avatar_url)
        `)
        .eq('provider_id', user.id)
        .order('booking_date', { ascending: true })
        .order('booking_time', { ascending: true });

      if (error) throw error;

      const processedJobs: Job[] = (data || []).map(job => ({
        id: job.id,
        client_name: job.client?.full_name || 'Unknown Client',
        client_avatar: job.client?.avatar_url,
        booking_date: job.booking_date,
        booking_time: job.booking_time,
        location_town: job.location_town || 'Windhoek',
        service_name: job.service?.name || 'Service',
        status: job.status,
        total_amount: job.total_amount
      }));

      setJobs(processedJobs);
    } catch (error) {
      console.error('Error fetching jobs:', error);
      toast({
        title: "Error",
        description: "Failed to fetch jobs",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, [user]);

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

      toast({
        title: "Job Started",
        description: "You have started working on this job.",
      });
      fetchJobs();
    } catch (error) {
      console.error('Error starting job:', error);
      toast({
        title: "Error",
        description: "Failed to start job",
        variant: "destructive",
      });
    }
  };

  const handleCompleteJob = async (jobId: string) => {
    try {
      const { error } = await supabase
        .from('bookings')
        .update({ 
          status: 'completed',
          completed_at: new Date().toISOString()
        })
        .eq('id', jobId);

      if (error) throw error;

      toast({
        title: "Job Completed",
        description: "Job marked as completed successfully.",
      });
      fetchJobs();
    } catch (error) {
      console.error('Error completing job:', error);
      toast({
        title: "Error",
        description: "Failed to complete job",
        variant: "destructive",
      });
    }
  };

  const handleCancelJob = async (jobId: string) => {
    try {
      const { error } = await supabase
        .from('bookings')
        .update({ status: 'cancelled' })
        .eq('id', jobId);

      if (error) throw error;

      toast({
        title: "Job Cancelled",
        description: "Job has been cancelled.",
      });
      fetchJobs();
    } catch (error) {
      console.error('Error cancelling job:', error);
      toast({
        title: "Error",
        description: "Failed to cancel job",
        variant: "destructive",
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'accepted': return 'bg-blue-100 text-blue-800';
      case 'in_progress': return 'bg-orange-100 text-orange-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getJobActions = (job: Job) => {
    switch (job.status) {
      case 'accepted':
        return (
          <div className="flex space-x-2">
            <Button
              size="sm"
              onClick={() => handleStartJob(job.id)}
              className="bg-purple-600 hover:bg-purple-700 text-white"
            >
              <Play className="h-3 w-3 mr-1" />
              Start
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleCancelJob(job.id)}
              className="text-red-600 border-red-200"
            >
              <XCircle className="h-3 w-3 mr-1" />
              Cancel
            </Button>
          </div>
        );
      case 'in_progress':
        return (
          <Button
            size="sm"
            onClick={() => handleCompleteJob(job.id)}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            <CheckCircle className="h-3 w-3 mr-1" />
            Complete
          </Button>
        );
      default:
        return null;
    }
  };

  const filterJobs = (filterType: string) => {
    const today = new Date().toISOString().split('T')[0];
    
    switch (filterType) {
      case 'today':
        return jobs.filter(job => job.booking_date === today && ['accepted', 'in_progress'].includes(job.status));
      case 'upcoming':
        return jobs.filter(job => job.booking_date >= today && ['accepted'].includes(job.status));
      case 'completed':
        return jobs.filter(job => job.status === 'completed');
      default:
        return jobs;
    }
  };

  const JobCard = ({ job }: { job: Job }) => (
    <Card className="mb-4">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={job.client_avatar} />
              <AvatarFallback>
                {job.client_name.split(' ').map(n => n[0]).join('').toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium text-gray-900">{job.client_name}</p>
              <p className="text-sm text-gray-600">{job.service_name}</p>
            </div>
          </div>
          <Badge className={getStatusColor(job.status)}>
            {job.status.replace('_', ' ').charAt(0).toUpperCase() + job.status.replace('_', ' ').slice(1)}
          </Badge>
        </div>

        <div className="flex items-center justify-between text-sm text-gray-600 mb-3">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              <Calendar className="h-4 w-4" />
              <span>{format(new Date(job.booking_date), 'MMM dd')}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Clock className="h-4 w-4" />
              <span>{job.booking_time}</span>
            </div>
            <div className="flex items-center space-x-1">
              <MapPin className="h-4 w-4" />
              <span>{job.location_town}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="font-bold text-green-600 text-lg">N${job.total_amount}</div>
          {getJobActions(job)}
        </div>
      </CardContent>
    </Card>
  );

  if (isLoading) {
    return (
      <div className="p-4">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-2xl font-bold text-gray-900">My Jobs</h1>
      
      <Tabs defaultValue="today" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="today">Today</TabsTrigger>
          <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
        </TabsList>
        
        <TabsContent value="today" className="mt-4">
          <div className="space-y-4">
            {filterJobs('today').length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No jobs scheduled for today</p>
                  <p className="text-sm text-gray-500">Enjoy your free day!</p>
                </CardContent>
              </Card>
            ) : (
              filterJobs('today').map(job => <JobCard key={job.id} job={job} />)
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="upcoming" className="mt-4">
          <div className="space-y-4">
            {filterJobs('upcoming').length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No upcoming jobs</p>
                  <p className="text-sm text-gray-500">New jobs will appear here when assigned</p>
                </CardContent>
              </Card>
            ) : (
              filterJobs('upcoming').map(job => <JobCard key={job.id} job={job} />)
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="completed" className="mt-4">
          <div className="space-y-4">
            {filterJobs('completed').length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <CheckCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No completed jobs yet</p>
                  <p className="text-sm text-gray-500">Completed jobs will appear here</p>
                </CardContent>
              </Card>
            ) : (
              filterJobs('completed').map(job => <JobCard key={job.id} job={job} />)
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
