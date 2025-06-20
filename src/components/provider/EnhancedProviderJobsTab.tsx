
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, MapPin, User, Package, CheckCircle, Play } from 'lucide-react';
import { format } from 'date-fns';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface ProviderJob {
  id: string;
  client_name: string;
  service_name: string;
  provider_payout: number;
  status: string;
  booking_date: string;
  booking_time: string;
  location_town: string;
  package_id?: string;
  package_name?: string;
  special_instructions?: string;
}

export const EnhancedProviderJobsTab: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [jobs, setJobs] = useState<ProviderJob[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [providerCategories, setProviderCategories] = useState<string[]>([]);

  useEffect(() => {
    if (user?.id) {
      fetchProviderCategories();
      fetchCategoryFilteredJobs();
    }
  }, [user?.id]);

  const fetchProviderCategories = async () => {
    if (!user?.id) return;

    try {
      const { data, error } = await supabase
        .from('provider_categories')
        .select('category_id')
        .eq('provider_id', user.id);

      if (error) throw error;
      setProviderCategories(data?.map(pc => pc.category_id) || []);
    } catch (error) {
      console.error('Error fetching provider categories:', error);
    }
  };

  const fetchCategoryFilteredJobs = async () => {
    if (!user?.id) return;

    try {
      setIsLoading(true);
      
      // Fetch jobs assigned to this provider OR unassigned jobs in their categories
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          id,
          booking_date,
          booking_time,
          location_town,
          status,
          provider_payout,
          special_instructions,
          package_id,
          service:services(
            id,
            name,
            category_id
          ),
          client:users!bookings_client_id_fkey(full_name),
          package:subscription_packages(name)
        `)
        .or(`provider_id.eq.${user.id},and(provider_id.is.null,status.eq.unassigned)`)
        .in('status', ['assigned', 'unassigned', 'accepted', 'in_progress'])
        .order('booking_date', { ascending: true })
        .order('booking_time', { ascending: true });

      if (error) throw error;

      // Filter jobs to only show those in provider's categories
      const filteredJobs = (data || []).filter(job => {
        // Always show jobs already assigned to this provider
        if (job.provider_id === user.id) return true;
        
        // For unassigned jobs, check if service category matches provider categories
        return job.service?.category_id && providerCategories.includes(job.service.category_id);
      });

      const processedJobs: ProviderJob[] = filteredJobs.map(job => ({
        id: job.id,
        client_name: job.client?.full_name || 'Unknown Client',
        service_name: job.service?.name || 'Unknown Service',
        provider_payout: job.provider_payout || 0,
        status: job.status,
        booking_date: job.booking_date,
        booking_time: job.booking_time,
        location_town: job.location_town || 'Windhoek',
        package_id: job.package_id,
        package_name: job.package?.name,
        special_instructions: job.special_instructions
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
        title: "Job Accepted",
        description: "You have successfully accepted this job",
      });

      fetchCategoryFilteredJobs();
    } catch (error) {
      console.error('Error accepting job:', error);
      toast({
        title: "Error",
        description: "Failed to accept job",
        variant: "destructive"
      });
    }
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

      toast({
        title: "Job Started",
        description: "You have started working on this job",
      });

      fetchCategoryFilteredJobs();
    } catch (error) {
      console.error('Error starting job:', error);
      toast({
        title: "Error",
        description: "Failed to start job",
        variant: "destructive"
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
        description: "Job marked as completed successfully",
      });

      fetchCategoryFilteredJobs();
    } catch (error) {
      console.error('Error completing job:', error);
      toast({
        title: "Error",
        description: "Failed to complete job",
        variant: "destructive"
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'unassigned': return 'bg-orange-100 text-orange-800';
      case 'assigned': return 'bg-blue-100 text-blue-800';
      case 'accepted': return 'bg-green-100 text-green-800';
      case 'in_progress': return 'bg-purple-100 text-purple-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getActionButton = (job: ProviderJob) => {
    switch (job.status) {
      case 'unassigned':
        return (
          <Button
            size="sm"
            onClick={() => handleAcceptJob(job.id)}
            className="bg-green-600 hover:bg-green-700"
          >
            Accept Job
          </Button>
        );
      case 'accepted':
        return (
          <Button
            size="sm"
            onClick={() => handleStartJob(job.id)}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Play className="h-3 w-3 mr-1" />
            Start Job
          </Button>
        );
      case 'in_progress':
        return (
          <Button
            size="sm"
            onClick={() => handleCompleteJob(job.id)}
            className="bg-purple-600 hover:bg-purple-700"
          >
            <CheckCircle className="h-3 w-3 mr-1" />
            Complete
          </Button>
        );
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <p className="text-gray-600">Loading your jobs...</p>
        </CardContent>
      </Card>
    );
  }

  if (!user || user.role !== 'provider') {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <p className="text-gray-600">Please sign in as a service provider to view your jobs.</p>
        </CardContent>
      </Card>
    );
  }

  if (providerCategories.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <p className="text-gray-600">Please select your service categories to see available jobs.</p>
        </CardContent>
      </Card>
    );
  }

  if (jobs.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <p className="text-gray-600">No jobs available in your selected categories.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Available Jobs in Your Categories</CardTitle>
          <p className="text-sm text-gray-600">
            Jobs matching your selected service categories
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {jobs.map((job) => (
              <Card key={job.id} className="border">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-medium">{job.service_name}</h4>
                        {job.package_name && (
                          <Badge variant="outline" className="flex items-center gap-1">
                            <Package className="h-3 w-3" />
                            {job.package_name}
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {job.client_name}
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {format(new Date(job.booking_date), 'MMM dd, yyyy')}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {job.booking_time}
                        </div>
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {job.location_town}
                        </div>
                      </div>
                    </div>
                    <Badge className={getStatusColor(job.status)}>
                      {job.status.replace('_', ' ').toUpperCase()}
                    </Badge>
                  </div>

                  {job.special_instructions && (
                    <div className="mb-3 p-2 bg-gray-50 rounded text-sm">
                      <strong>Instructions:</strong> {job.special_instructions}
                    </div>
                  )}

                  <div className="flex justify-between items-center">
                    <div className="font-medium text-lg text-green-600">
                      N${job.provider_payout}
                    </div>
                    {getActionButton(job)}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
