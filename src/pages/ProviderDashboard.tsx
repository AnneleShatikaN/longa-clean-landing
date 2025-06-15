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
import { 
  LogOut, Bell, AlertCircle, Database, 
  Home, Briefcase, Wallet, User, HelpCircle, Menu, X
} from 'lucide-react';

const ProviderDashboard = () => {
  const { user, logout } = useAuth();
  const { data, isLoading, error, updateJobStatus, isValidProvider } = useProviderData();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
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

  if (!data || !isValidProvider || (data.jobs.length === 0 && data.notifications.length === 0 && data.monthlyEarnings.length === 0)) {
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
            icon={!isValidProvider ? AlertCircle : Database}
            title={!isValidProvider ? "Access Denied" : "No Data Loaded"}
            description={!isValidProvider 
              ? "You don't have provider access. Please contact your administrator."
              : "The admin has not configured a data source yet. Please contact your administrator or check back later."
            }
            className="max-w-md"
            action={!isValidProvider ? {
              label: "Go to Home",
              onClick: () => navigate('/')
            } : undefined}
          />
        </div>
        
        <Footer />
      </div>
    );
  }

  const providerProfile = data?.profile || {
    name: user?.name || user?.full_name || 'Provider',
    email: user?.email || '',
    phone: user?.phone || '',
    rating: user?.rating || 0,
    totalJobs: user?.total_jobs || 0,
    location: 'windhoek',
    joinDate: user?.created_at || '',
    lastActive: ''
  };

  const jobs = data?.jobs || [];
  const notifications = data?.notifications || [];
  const monthlyEarnings = data?.monthlyEarnings || [];

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
  const averageRating = data?.ratings?.length > 0 
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

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <EmailVerificationPrompt
        isOpen={showEmailVerification}
        onClose={() => setShowEmailVerification(false)}
        email={user?.email || ''}
      />

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <h1 className="text-xl sm:text-2xl font-bold text-purple-600">Longa Provider</h1>
              <span className="text-gray-300 hidden sm:inline">|</span>
              <div className="hidden sm:block">
                <h2 className="text-lg text-gray-700">Welcome, {providerProfile.name}</h2>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
              
              <div className="relative hidden sm:block">
                <Bell className="h-6 w-6 text-gray-600" />
                {notifications.filter(n => !n.read).length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {notifications.filter(n => !n.read).length}
                  </span>
                )}
              </div>
              <Button variant="ghost" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Logout</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 lg:gap-8">
            {/* Main Content */}
            <div className="lg:col-span-3">
              {/* Availability Toggle */}
              <div className="mb-6">
                <AvailabilityToggle 
                  isAvailable={isAvailable}
                  onToggle={setIsAvailable}
                />
              </div>

              {/* Tabbed Interface */}
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-5 mb-6">
                  <TabsTrigger value="overview" className="flex items-center space-x-1">
                    <Home className="h-4 w-4" />
                    <span className="hidden sm:inline">Overview</span>
                  </TabsTrigger>
                  <TabsTrigger value="jobs" className="flex items-center space-x-1">
                    <Briefcase className="h-4 w-4" />
                    <span className="hidden sm:inline">Jobs</span>
                  </TabsTrigger>
                  <TabsTrigger value="payouts" className="flex items-center space-x-1">
                    <Wallet className="h-4 w-4" />
                    <span className="hidden sm:inline">Payouts</span>
                  </TabsTrigger>
                  <TabsTrigger value="profile" className="flex items-center space-x-1">
                    <User className="h-4 w-4" />
                    <span className="hidden sm:inline">Profile</span>
                  </TabsTrigger>
                  <TabsTrigger value="support" className="flex items-center space-x-1">
                    <HelpCircle className="h-4 w-4" />
                    <span className="hidden sm:inline">Support</span>
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="overview">
                  <ProviderOverviewTab profile={providerProfile} stats={stats} />
                </TabsContent>

                <TabsContent value="jobs">
                  <ProviderJobsTab
                    availableJobs={availableJobs}
                    myJobs={myJobs}
                    onAcceptJob={acceptJob}
                    onDeclineJob={declineJob}
                    onCompleteJob={completeJob}
                    isAvailable={isAvailable}
                  />
                </TabsContent>

                <TabsContent value="payouts">
                  <ProviderPayoutsTab
                    monthlyEarnings={monthlyEarnings}
                    completedJobs={completedJobs}
                    pendingPayouts={totalPendingAmount}
                    totalEarnings={totalEarnings}
                  />
                </TabsContent>

                <TabsContent value="profile">
                  <ProviderProfileTab
                    profile={providerProfile}
                    onUpdateProfile={handleUpdateProfile}
                  />
                </TabsContent>

                <TabsContent value="support">
                  <div className="text-center py-12">
                    <HelpCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Support Center</h3>
                    <p className="text-gray-600">Contact support for help with your account.</p>
                  </div>
                </TabsContent>
              </Tabs>
            </div>

            {/* Sidebar */}
            <div className={`space-y-6 ${isMobileMenuOpen ? 'fixed inset-y-0 right-0 w-80 bg-white z-50 p-6 shadow-lg lg:relative lg:inset-auto lg:w-auto lg:bg-transparent lg:z-auto lg:p-0 lg:shadow-none' : 'hidden lg:block'}`}>
              {isMobileMenuOpen && (
                <div className="flex justify-end mb-4 lg:hidden">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>
              )}

              <NotificationSystem
                notifications={notifications}
                onMarkAsRead={() => {}}
                onMarkAllAsRead={() => {}}
                onDismiss={() => {}}
              />
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default ProviderDashboard;
