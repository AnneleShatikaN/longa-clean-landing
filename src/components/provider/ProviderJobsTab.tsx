import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, MapPin, User, CheckCircle, Play, XCircle } from 'lucide-react';
import { format } from 'date-fns';
import { useSupabaseBookings } from '@/contexts/SupabaseBookingContext';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { JobCompletionForm } from './JobCompletionForm';

interface ProviderJobsTabProps {
  availableJobs?: any[];
  myJobs?: any[];
  onAcceptJob?: (jobId: string) => Promise<void>;
  onDeclineJob?: (jobId: string) => Promise<void>;
  onCompleteJob?: (jobId: string) => Promise<void>;
  isAvailable?: boolean;
}

const ProviderJobsTab: React.FC<ProviderJobsTabProps> = ({
  availableJobs: propAvailableJobs,
  myJobs: propMyJobs,
  onAcceptJob: propOnAcceptJob,
  onDeclineJob: propOnDeclineJob,
  onCompleteJob: propOnCompleteJob,
  isAvailable = true
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [assignedJobs, setAssignedJobs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [completionForm, setCompletionForm] = useState<{ isOpen: boolean; booking: any }>({
    isOpen: false,
    booking: null
  });

  useEffect(() => {
    if (propMyJobs) {
      setAssignedJobs(propMyJobs);
      setIsLoading(false);
    } else {
      fetchAssignedJobs();
    }
  }, [propMyJobs, user]);

  const fetchAssignedJobs = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      // Only fetch jobs that have been assigned to this provider
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          service:services(*),
          client:users!bookings_client_id_fkey(*),
          assignment:booking_assignments(*)
        `)
        .eq('provider_id', user.id)
        .in('status', ['accepted', 'in_progress', 'completed'])
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAssignedJobs(data || []);
    } catch (error) {
      console.error('Error fetching assigned jobs:', error);
      toast({
        title: "Error",
        description: "Failed to fetch your assigned jobs",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartJob = async (bookingId: string) => {
    try {
      const { error } = await supabase
        .from('bookings')
        .update({ 
          status: 'in_progress',
          check_in_time: new Date().toISOString()
        })
        .eq('id', bookingId);

      if (error) throw error;

      toast({
        title: "Job Started",
        description: "You have started working on this job.",
      });
      fetchAssignedJobs();
    } catch (error) {
      console.error('Error starting job:', error);
      toast({
        title: "Error",
        description: "Failed to start job",
        variant: "destructive",
      });
    }
  };

  const handleCompleteJobWithForm = (booking: any) => {
    setCompletionForm({ isOpen: true, booking });
  };

  const handleJobCompletion = async (completionData: {
    visitNotes: string;
    beforePhotos: string[];
    afterPhotos: string[];
    issuesFound: string[];
    qualityScore: number;
  }) => {
    try {
      const { error } = await supabase
        .from('bookings')
        .update({ 
          status: 'completed',
          visit_notes: completionData.visitNotes,
          before_photos: completionData.beforePhotos,
          after_photos: completionData.afterPhotos,
          issues_found: completionData.issuesFound,
          quality_score: completionData.qualityScore,
          completed_at: new Date().toISOString()
        })
        .eq('id', completionForm.booking.id);

      if (error) throw error;

      setCompletionForm({ isOpen: false, booking: null });
      fetchAssignedJobs();
    } catch (error) {
      console.error('Error completing job:', error);
      throw error;
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <p className="text-gray-600">Loading your assigned jobs...</p>
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

  if (assignedJobs.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <p className="text-gray-600">No jobs have been assigned to you yet. Jobs are assigned by administrators based on your availability and expertise.</p>
        </CardContent>
      </Card>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'accepted': return 'bg-blue-100 text-blue-800';
      case 'in_progress': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusAction = (job: any) => {
    switch (job.status) {
      case 'accepted':
        return (
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleStartJob(job.id)}
            className="flex items-center gap-1"
          >
            <Play className="h-3 w-3" />
            Start Job
          </Button>
        );
      case 'in_progress':
        return (
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleCompleteJobWithForm(job)}
            className="flex items-center gap-1"
          >
            <CheckCircle className="h-3 w-3" />
            Complete Job
          </Button>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Your Assigned Jobs</CardTitle>
          <p className="text-sm text-gray-600">
            Jobs assigned to you by administrators based on your availability and expertise
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {assignedJobs.map((job) => (
              <Card key={job.id} className="border">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <h4 className="font-medium">{job.service?.name}</h4>
                      <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
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
                          <span className="capitalize">{job.location_town || 'Windhoek'}</span>
                        </div>
                      </div>
                    </div>
                    <Badge className={getStatusColor(job.status)}>
                      {job.status.replace('_', ' ').charAt(0).toUpperCase() + job.status.replace('_', ' ').slice(1)}
                    </Badge>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                    <User className="h-3 w-3" />
                    <span>Client: {job.client?.full_name}</span>
                  </div>

                  {job.special_instructions && (
                    <div className="mb-3 p-2 bg-gray-50 rounded text-sm">
                      <strong>Instructions:</strong> {job.special_instructions}
                    </div>
                  )}

                  <div className="flex justify-between items-center">
                    <div className="font-medium text-lg">N${job.total_amount}</div>
                    {getStatusAction(job)}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      <JobCompletionForm
        isOpen={completionForm.isOpen}
        onClose={() => setCompletionForm({ isOpen: false, booking: null })}
        booking={completionForm.booking}
        onComplete={handleJobCompletion}
      />
    </div>
  );
};

export default ProviderJobsTab;
