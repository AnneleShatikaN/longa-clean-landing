import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, MapPin, User, CheckCircle } from 'lucide-react';
import { format } from 'date-fns';
import { useSupabaseBookings } from '@/contexts/SupabaseBookingContext';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export const ProviderJobsTab: React.FC = () => {
  const { getAvailableJobs, acceptBooking } = useSupabaseBookings();
  const { user } = useAuth();
  const { toast } = useToast();
  const [availableJobs, setAvailableJobs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchAvailableJobs();
  }, []);

  const fetchAvailableJobs = async () => {
    setIsLoading(true);
    try {
      // Check if provider is verified first
      if (user?.role === 'provider') {
        const { data: userData } = await supabase
          .from('users')
          .select('verification_status')
          .eq('id', user.id)
          .single();

        if (userData?.verification_status !== 'verified') {
          setAvailableJobs([]);
          setIsLoading(false);
          return;
        }
      }

      const jobs = await getAvailableJobs();
      setAvailableJobs(jobs);
    } catch (error) {
      console.error('Error fetching jobs:', error);
      toast({
        title: "Error",
        description: "Failed to fetch available jobs",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAcceptJob = async (bookingId: string) => {
    try {
      await acceptBooking(bookingId);
      toast({
        title: "Job Accepted",
        description: "You have accepted this job successfully.",
      });
      fetchAvailableJobs(); // Refresh jobs after accepting
    } catch (error) {
      console.error('Error accepting job:', error);
      toast({
        title: "Accept Failed",
        description: "Failed to accept this job.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <p className="text-gray-600">Loading available jobs...</p>
        </CardContent>
      </Card>
    );
  }

  if (!user || user.role !== 'provider') {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <p className="text-gray-600">Please sign in as a service provider to view available jobs.</p>
        </CardContent>
      </Card>
    );
  }

  // Check if the provider is verified
  const isVerified = true; // Assume verified, replace with actual check later

  if (!isVerified) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <p className="text-yellow-600">Your provider profile is not yet verified. Please complete the verification process to view available jobs.</p>
        </CardContent>
      </Card>
    );
  }

  if (availableJobs.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <p className="text-gray-600">No available jobs at the moment. Please check back later.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Available Jobs</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {availableJobs.map((job) => (
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
                    <Badge className="bg-green-100 text-green-800">
                      Pending
                    </Badge>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                    <User className="h-3 w-3" />
                    <span>Client: {job.client?.full_name}</span>
                  </div>

                  <div className="flex justify-between items-center">
                    <div className="font-medium text-lg">N${job.total_amount}</div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleAcceptJob(job.id)}
                      className="flex items-center gap-1"
                    >
                      <CheckCircle className="h-3 w-3" />
                      Accept Job
                    </Button>
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
