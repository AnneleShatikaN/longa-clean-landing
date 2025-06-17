
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, X, MapPin, Clock, DollarSign, User, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useSupabaseBookings } from '@/contexts/SupabaseBookingContext';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

export const SimplifiedProviderDashboard = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [currentJob, setCurrentJob] = useState<any>(null);
  const [availableJobs, setAvailableJobs] = useState<any[]>([]);
  const [myJobs, setMyJobs] = useState<any[]>([]);
  const [view, setView] = useState<'main' | 'available' | 'current'>('main');

  useEffect(() => {
    // Fetch jobs - simplified version
    // In real implementation, this would fetch from Supabase
    setAvailableJobs([
      {
        id: '1',
        service: { name: 'House Cleaning' },
        client: { full_name: 'Sarah Johnson' },
        booking_date: '2025-06-17',
        booking_time: '10:00',
        total_amount: 600,
        location_town: 'Windhoek',
        status: 'pending'
      }
    ]);

    setMyJobs([
      {
        id: '2',
        service: { name: 'Car Wash' },
        client: { full_name: 'John Smith' },
        booking_date: '2025-06-17',
        booking_time: '14:00',
        total_amount: 100,
        location_town: 'Windhoek',
        status: 'accepted'
      }
    ]);
  }, []);

  const handleAcceptJob = async (jobId: string) => {
    try {
      toast({
        title: "Job Accepted!",
        description: "You have accepted this job.",
      });
      // Move job from available to my jobs
      const job = availableJobs.find(j => j.id === jobId);
      if (job) {
        setMyJobs([...myJobs, { ...job, status: 'accepted' }]);
        setAvailableJobs(availableJobs.filter(j => j.id !== jobId));
      }
      setView('main');
    } catch (error) {
      toast({
        title: "Error",
        description: "Could not accept job. Try again.",
        variant: "destructive",
      });
    }
  };

  const handleDeclineJob = async (jobId: string) => {
    setAvailableJobs(availableJobs.filter(j => j.id !== jobId));
    setView('main');
    toast({
      title: "Job Declined",
      description: "Job has been declined.",
    });
  };

  const handleStartJob = async (jobId: string) => {
    const job = myJobs.find(j => j.id === jobId);
    if (job) {
      setMyJobs(myJobs.map(j => 
        j.id === jobId ? { ...j, status: 'in_progress' } : j
      ));
      toast({
        title: "Job Started",
        description: "Good luck with your job!",
      });
    }
  };

  const handleCompleteJob = async (jobId: string) => {
    const job = myJobs.find(j => j.id === jobId);
    if (job) {
      setMyJobs(myJobs.map(j => 
        j.id === jobId ? { ...j, status: 'completed' } : j
      ));
      toast({
        title: "Job Completed!",
        description: "Great work! Payment processing.",
      });
    }
  };

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
              disabled={availableJobs.length === 0}
            >
              <div className="text-center">
                <div>View New Jobs</div>
                {availableJobs.length > 0 && (
                  <Badge className="bg-red-500 text-white mt-1">
                    {availableJobs.length} waiting
                  </Badge>
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
                        onClick={() => handleAcceptJob(job.id)}
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
