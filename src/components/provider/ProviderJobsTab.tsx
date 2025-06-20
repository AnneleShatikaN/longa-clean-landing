import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, MapPin, User, CheckCircle, Play, XCircle, Package } from 'lucide-react';
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
  const [availableJobs, setAvailableJobs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [providerCategories, setProviderCategories] = useState<string[]>([]);
  const [completionForm, setCompletionForm] = useState<{ isOpen: boolean; booking: any }>({
    isOpen: false,
    booking: null
  });

  useEffect(() => {
    if (user?.id) {
      fetchProviderCategories();
      fetchJobs();
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

  const fetchJobs = async () => {
    if (!user?.id) return;
    
    setIsLoading(true);
    try {
      // Fetch assigned jobs
      const { data: assignedData, error: assignedError } = await supabase
        .from('bookings')
        .select(`
          *,
          service:services(*),
          client:users!bookings_client_id_fkey(*),
          package:subscription_packages(name)
        `)
        .eq('provider_id', user.id)
        .in('status', ['accepted', 'in_progress', 'completed'])
        .order('booking_date', { ascending: true });

      if (assignedError) throw assignedError;
      setAssignedJobs(assignedData || []);

      // Fetch available jobs in provider's categories
      const { data: availableData, error: availableError } = await supabase
        .from('bookings')
        .select(`
          *,
          service:services(*, category_id),
          client:users!bookings_client_id_fkey(*),
          package:subscription_packages(name)
        `)
        .is('provider_id', null)
        .eq('status', 'unassigned')
        .order('booking_date', { ascending: true });

      if (availableError) throw availableError;

      // Filter available jobs by provider categories
      const filteredAvailable = (availableData || []).filter(job => 
        job.service?.category_id && providerCategories.includes(job.service.category_id)
      );
      
      setAvailableJobs(filteredAvailable);
    } catch (error) {
      console.error('Error fetching jobs:', error);
      toast({
        title: "Error",
        description: "Failed to fetch jobs",
        variant: "destructive",
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
      
      fetchJobs();
    } catch (error) {
      console.error('Error accepting job:', error);
      toast({
        title: "Error",
        description: "Failed to accept job",
        variant: "destructive"
      });
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
      fetchJobs();
    } catch (error) {
      console.error('Error completing job:', error);
      throw error;
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
          <p className="text-gray-600">Please select your service categories in your profile to see available jobs.</p>
        </CardContent>
      </Card>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'unassigned': return 'bg-orange-100 text-orange-800';
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
      {/* Available Jobs */}
      {availableJobs.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Available Jobs in Your Categories</CardTitle>
            <p className="text-sm text-gray-600">
              Jobs matching your selected service categories
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {availableJobs.map((job) => (
                <Card key={job.id} className="border border-orange-200">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-medium">{job.service?.name}</h4>
                          {job.package?.name && (
                            <Badge variant="outline" className="flex items-center gap-1">
                              <Package className="h-3 w-3" />
                              {job.package.name}
                            </Badge>
                          )}
                        </div>
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
                      <Badge className="bg-orange-100 text-orange-800">
                        AVAILABLE
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
                      <div className="font-medium text-lg text-green-600">N${job.provider_payout || 0}</div>
                      <Button
                        size="sm"
                        onClick={() => handleAcceptJob(job.id)}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        Accept Job
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Assigned Jobs */}
      <Card>
        <CardHeader>
          <CardTitle>Your Assigned Jobs</CardTitle>
          <p className="text-sm text-gray-600">
            Jobs you have accepted or are working on
          </p>
        </CardHeader>
        <CardContent>
          {assignedJobs.length === 0 ? (
            <p className="text-gray-600 text-center py-8">No assigned jobs at the moment.</p>
          ) : (
            <div className="space-y-4">
              {assignedJobs.map((job) => (
                <Card key={job.id} className="border">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-medium">{job.service?.name}</h4>
                          {job.package?.name && (
                            <Badge variant="outline" className="flex items-center gap-1">
                              <Package className="h-3 w-3" />
                              {job.package.name}
                            </Badge>
                          )}
                        </div>
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
                      <div className="font-medium text-lg">N${job.provider_payout || 0}</div>
                      {getStatusAction(job)}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
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
