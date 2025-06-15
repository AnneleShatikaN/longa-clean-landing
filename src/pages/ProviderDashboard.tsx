import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useProviderData } from '@/hooks/useProviderData';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { EmptyState } from '@/components/EmptyState';
import { EmailVerificationPrompt } from '@/components/auth/EmailVerificationPrompt';
import Footer from '@/components/Footer';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ProviderOverviewTab from '@/components/provider/ProviderOverviewTab';
import ProviderJobsTab from '@/components/provider/ProviderJobsTab';
import ProviderPayoutsTab from '@/components/provider/ProviderPayoutsTab';
import ProviderProfileTab from '@/components/provider/ProviderProfileTab';
import AvailabilityToggle from '@/components/AvailabilityToggle';
import NotificationSystem from '@/components/NotificationSystem';
import WorkLocationSelector from '@/components/provider/WorkLocationSelector';
import { NotificationBell } from '@/components/notifications/NotificationBell';
import { 
  LogOut, AlertCircle, Database,
  Home, Briefcase, Wallet, User
} from 'lucide-react';

const ProviderDashboard = () => {
  const { user, logout } = useAuth();
  const { data, isLoading, error, updateJobStatus, isValidProvider, refetch } = useProviderData();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [showEmailVerification, setShowEmailVerification] = useState(false);
  const [isAvailable, setIsAvailable] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  // Check email verification status
  useEffect(() => {
    if (user && user.email && !user.isEmailVerified) {
      setShowEmailVerification(true);
    }
  }, [user]);

  // Handle non-provider users
  useEffect(() => {
    if (user && !isValidProvider && !isLoading) {
      toast({
        title: "Access Denied",
        description: "You don't have provider access. Please contact your administrator.",
        variant: "destructive"
      });
      navigate('/');
    }
  }, [user, isValidProvider, isLoading, navigate, toast]);

  const handleLogout = async () => {
    try {
      await logout();
      toast({
        title: "Success",
        description: "You have been logged out successfully.",
      });
      navigate('/');
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to logout. Please try again.",
        variant: "destructive"
      });
    }
  };

  const acceptJob = async (jobId: string) => {
    await updateJobStatus(jobId, 'accepted');
    toast({
      title: "Job Accepted",
      description: "You have successfully accepted the job",
    });
  };

  const declineJob = (jobId: string) => {
    console.log(`Declined job ${jobId}`);
    toast({
      title: "Job Declined",
      description: "The job has been declined",
    });
  };

  const completeJob = async (jobId: string) => {
    await updateJobStatus(jobId, 'completed');
    toast({
      title: "Job Completed",
      description: "Job marked as completed successfully",
    });
  };

  const handleUpdateProfile = async (profileData: any) => {
    // This would normally update the profile in the database
    console.log('Updating profile:', profileData);
    toast({
      title: "Profile Updated",
      description: "Your profile has been updated successfully.",
    });
  };

  const handleLocationUpdate = (location: string) => {
    // Refetch data to get location-filtered jobs
    refetch();
    toast({
      title: "Location updated successfully 🌍",
      description: "You'll now see jobs relevant to your selected location.",
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <EmptyState
          icon={AlertCircle}
          title="Error Loading Dashboard"
          description={error}
          action={{
            label: "Try Again",
            onClick: () => window.location.reload()
          }}
        />
      </div>
    );
  }

  // Handle case where user is not a valid provider
  if (!isValidProvider) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <EmailVerificationPrompt
          isOpen={showEmailVerification}
          onClose={() => setShowEmailVerification(false)}
          email={user?.email || ''}
        />

        <header className="bg-white shadow-sm border-b sticky top-0 z-30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <h1 className="text-xl sm:text-2xl font-bold text-purple-600">Longa Provider</h1>
              <Button variant="ghost" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </header>

        <div className="flex-1 flex items-center justify-center p-4">
          <EmptyState
            icon={AlertCircle}
            title="Access Denied"
            description="You don't have provider access. Please contact your administrator."
            className="max-w-md"
            action={{
              label: "Go to Home",
              onClick: () => navigate('/')
            }}
          />
        </div>
        
        <Footer />
      </div>
    );
  }

  // Handle case where no data is available from admin configuration
  if (!data) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <EmailVerificationPrompt
          isOpen={showEmailVerification}
          onClose={() => setShowEmailVerification(false)}
          email={user?.email || ''}
        />

        <header className="bg-white shadow-sm border-b sticky top-0 z-30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <h1 className="text-xl sm:text-2xl font-bold text-purple-600">Longa Provider</h1>
              <Button variant="ghost" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </header>

        <div className="flex-1 flex items-center justify-center p-4">
          <EmptyState
            icon={Database}
            title="No Data Configured"
            description="The admin has not configured a data source yet. Please contact your administrator or check back later."
            className="max-w-md"
          />
        </div>
        
        <Footer />
      </div>
    );
  }

  // At this point, we have valid data (even if arrays are empty)
  const providerProfile = data.profile || {
    name: user?.name || user?.full_name || 'Provider',
    email: user?.email || '',
    phone: user?.phone || '',
    rating: user?.rating || 0,
    totalJobs: user?.total_jobs || 0,
    location: user?.current_work_location || 'windhoek',
    joinDate: user?.created_at || '',
    lastActive: ''
  };

  const jobs = data.jobs || [];
  const notifications = data.notifications || [];
  const monthlyEarnings = data.monthlyEarnings || [];

  const availableJobs = jobs.filter(job => job.status === 'requested');
  const myJobs = jobs.filter(job => job.status === 'accepted' || job.status === 'completed');
  const completedJobs = jobs.filter(job => job.status === 'completed');

  const pendingPayouts = completedJobs.filter(job => job.payoutStatus === 'pending');
  const totalPendingAmount = pendingPayouts.reduce((sum, job) => sum + job.expectedPayout, 0);
  const thisWeekCompleted = completedJobs.filter(job => {
    if (!job.completedDate) return false;
    const jobDate = new Date(job.completedDate);
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return jobDate >= weekAgo;
  });
  const thisWeekEarnings = thisWeekCompleted.reduce((sum, job) => sum + job.expectedPayout, 0);
  const totalEarnings = completedJobs.reduce((sum, job) => sum + job.expectedPayout, 0);
  const averageRating = data.ratings?.length > 0 
    ? data.ratings.reduce((sum, rating) => sum + rating.rating, 0) / data.ratings.length 
    : 0;

  const stats = {
    totalEarnings,
    pendingPayouts: totalPendingAmount,
    thisWeekEarnings,
    availableJobs: availableJobs.length,
    completedJobs: completedJobs.length,
    averageRating
  };

  // Check if user has set work location
  const hasWorkLocation = user?.current_work_location && user.current_work_location.trim() !== '';

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <EmailVerificationPrompt
        isOpen={showEmailVerification}
        onClose={() => setShowEmailVerification(false)}
        email={user?.email || ''}
      />

      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <h1 className="text-xl sm:text-2xl font-bold text-purple-600">Longa Provider</h1>
            </div>
            <div className="flex items-center space-x-4">
              <NotificationBell />
              <Button variant="ghost" onClick={handleLogout} size="sm">
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Show work location selector only if user has already set location */}
          {hasWorkLocation && (
            <div className="mb-6">
              <WorkLocationSelector 
                currentLocation={user?.current_work_location}
                onLocationUpdate={handleLocationUpdate}
              />
            </div>
          )}

          {/* Availability Toggle */}
          <div className="mb-6">
            <AvailabilityToggle 
              isAvailable={isAvailable}
              onToggle={setIsAvailable}
            />
          </div>

          {/* Mobile-First Tabbed Interface */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4 mb-8 bg-white border">
              <TabsTrigger 
                value="overview" 
                className="flex flex-col items-center py-3 space-y-1 data-[state=active]:bg-purple-100 data-[state=active]:text-purple-600"
              >
                <Home className="h-5 w-5" />
                <span className="text-xs font-medium">Overview</span>
              </TabsTrigger>
              <TabsTrigger 
                value="bookings" 
                className="flex flex-col items-center py-3 space-y-1 data-[state=active]:bg-purple-100 data-[state=active]:text-purple-600"
              >
                <Briefcase className="h-5 w-5" />
                <span className="text-xs font-medium">Bookings</span>
              </TabsTrigger>
              <TabsTrigger 
                value="earnings" 
                className="flex flex-col items-center py-3 space-y-1 data-[state=active]:bg-purple-100 data-[state=active]:text-purple-600"
              >
                <Wallet className="h-5 w-5" />
                <span className="text-xs font-medium">Earnings</span>
              </TabsTrigger>
              <TabsTrigger 
                value="settings" 
                className="flex flex-col items-center py-3 space-y-1 data-[state=active]:bg-purple-100 data-[state=active]:text-purple-600"
              >
                <User className="h-5 w-5" />
                <span className="text-xs font-medium">Settings</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="mt-0">
              <ProviderOverviewTab profile={providerProfile} stats={stats} />
            </TabsContent>

            <TabsContent value="bookings" className="mt-0">
              <ProviderJobsTab
                availableJobs={availableJobs}
                myJobs={myJobs}
                onAcceptJob={acceptJob}
                onDeclineJob={declineJob}
                onCompleteJob={completeJob}
                isAvailable={isAvailable}
              />
            </TabsContent>

            <TabsContent value="earnings" className="mt-0">
              <ProviderPayoutsTab
                monthlyEarnings={monthlyEarnings}
                completedJobs={completedJobs}
                pendingPayouts={totalPendingAmount}
                totalEarnings={totalEarnings}
              />
            </TabsContent>

            <TabsContent value="settings" className="mt-0">
              <ProviderProfileTab
                profile={providerProfile}
                onUpdateProfile={handleUpdateProfile}
              />
            </TabsContent>
          </Tabs>

          {/* Notifications - Mobile-friendly sidebar */}
          <div className="mt-8">
            <NotificationSystem
              notifications={notifications}
              onMarkAsRead={() => {}}
              onMarkAllAsRead={() => {}}
              onDismiss={() => {}}
            />
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default ProviderDashboard;
