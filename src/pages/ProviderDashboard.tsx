import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useProviderData } from '@/hooks/useProviderData';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { EmptyState } from '@/components/EmptyState';
import { EmailVerificationPrompt } from '@/components/auth/EmailVerificationPrompt';
import Footer from '@/components/Footer';
import { 
  Calendar, User, LogOut, MapPin, DollarSign, Clock, 
  Phone, Mail, Star, Filter, Bell, Calculator, Percent, Banknote,
  TrendingUp, Wallet, CheckCircle, XCircle, AlertCircle, Menu, X,
  FileText, Database, Ban
} from 'lucide-react';
import JobFilters from '@/components/JobFilters';
import AvailabilityToggle from '@/components/AvailabilityToggle';
import RatingSystem from '@/components/RatingSystem';
import EarningsTracker from '@/components/EarningsTracker';
import NotificationSystem from '@/components/NotificationSystem';

// Use the same interfaces as in useProviderData to avoid conflicts
interface Job {
  id: string; // Using string to match Supabase UUID
  service: string;
  clientName: string;
  clientPhone: string;
  clientEmail: string;
  location: string;
  amount: number;
  date: string;
  status: 'requested' | 'accepted' | 'completed';
  duration: string;
  completedDate?: string;
  rating?: number;
  reviewComment?: string;
  jobType: 'one-off' | 'subscription';
  expectedPayout: number;
  actualPayout?: number;
  commissionPercentage?: number;
  providerFee?: number;
  payoutStatus?: 'pending' | 'processing' | 'paid';
  payoutDate?: string;
}

interface Notification {
  id: number;
  type: 'new_job' | 'job_completed' | 'rating_received' | 'payment_received';
  title: string;
  message: string;
  time: string;
  read: boolean;
  actionable?: boolean;
}

const ProviderDashboard = () => {
  const { user, logout } = useAuth();
  const { data, isLoading, error, updateJobStatus, isValidProvider } = useProviderData();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showEmailVerification, setShowEmailVerification] = useState(false);

  // State management
  const [isAvailable, setIsAvailable] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [locationFilter, setLocationFilter] = useState('all');

  // Check email verification status
  useEffect(() => {
    // Check if user exists and email verification status
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

  // Use mock profile data if available, otherwise fall back to user data
  const providerProfile = data?.profile || {
    name: user?.name || user?.full_name || 'Provider',
    email: user?.email || '',
    phone: user?.phone || '',
    rating: user?.rating || 0,
    totalJobs: user?.total_jobs || 0,
    specialties: [],
    available: true,
    location: '',
    joinDate: user?.created_at || '',
    lastActive: ''
  };

  const jobs: Job[] = data?.jobs || [];
  const notifications: Notification[] = data?.notifications || [];
  const ratings = data?.ratings || [];
  const monthlyEarnings = data?.monthlyEarnings || [];

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

  // Job management functions
  const acceptJob = async (jobId: string) => {
    await updateJobStatus(jobId, 'accepted');
    
    addNotification({
      type: 'new_job',
      title: 'Job Accepted',
      message: 'You have successfully accepted the job',
      time: 'Just now'
    });
  };

  const declineJob = (jobId: string) => {
    console.log(`Declined job ${jobId}`);
  };

  const completeJob = async (jobId: string) => {
    await updateJobStatus(jobId, 'completed');
    
    addNotification({
      type: 'job_completed',
      title: 'Job Completed',
      message: 'Job marked as completed successfully',
      time: 'Just now'
    });
  };

  // Notification functions
  const addNotification = (notification: Omit<Notification, 'id' | 'read'>) => {
    // This would normally update the notifications in the data source
    console.log('Adding notification:', notification);
  };

  const markAsRead = (id: number) => {
    console.log('Marking notification as read:', id);
  };

  const markAllAsRead = () => {
    console.log('Marking all notifications as read');
  };

  const dismissNotification = (id: number) => {
    console.log('Dismissing notification:', id);
  };

  // Filter and search functions
  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.service.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.location.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || job.status === statusFilter;
    const matchesLocation = locationFilter === 'all' || job.location === locationFilter;
    
    return matchesSearch && matchesStatus && matchesLocation;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'accepted': return 'bg-blue-100 text-blue-800';
      case 'requested': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getJobTypeColor = (jobType: 'one-off' | 'subscription') => {
    return jobType === 'one-off' 
      ? 'bg-blue-100 text-blue-800' 
      : 'bg-green-100 text-green-800';
  };

  const getPayoutStatusColor = (status?: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'processing': return 'bg-yellow-100 text-yellow-800';
      case 'pending': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPayoutStatusIcon = (status?: string) => {
    switch (status) {
      case 'paid': return CheckCircle;
      case 'processing': return AlertCircle;
      case 'pending': return Clock;
      default: return XCircle;
    }
  };

  const getPayoutCalculationInfo = (job: Job) => {
    if (job.jobType === 'one-off') {
      return {
        icon: Percent,
        label: `${job.commissionPercentage}% commission`,
        calculation: `N$${job.amount} - ${job.commissionPercentage}% = N$${job.expectedPayout}`
      };
    } else {
      return {
        icon: Banknote,
        label: 'Fixed fee',
        calculation: `Fixed provider fee: N$${job.expectedPayout}`
      };
    }
  };

  const availableJobs = filteredJobs.filter(job => job.status === 'requested');
  const myJobs = filteredJobs.filter(job => job.status === 'accepted' || job.status === 'completed');

  // Enhanced calculations for earnings summary
  const completedJobs = jobs.filter(job => job.status === 'completed');
  const pendingPayouts = completedJobs.filter(job => job.payoutStatus === 'pending');
  const totalPendingAmount = pendingPayouts.reduce((sum, job) => sum + job.expectedPayout, 0);
  
  // This week's calculations (mock - last 7 days)
  const thisWeekCompleted = completedJobs.filter(job => {
    if (!job.completedDate) return false;
    const jobDate = new Date(job.completedDate);
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return jobDate >= weekAgo;
  });
  
  const thisWeekEarnings = thisWeekCompleted.reduce((sum, job) => sum + job.expectedPayout, 0);
  
  // Average payouts by job type
  const oneOffJobs = completedJobs.filter(job => job.jobType === 'one-off');
  const subscriptionJobs = completedJobs.filter(job => job.jobType === 'subscription');
  const avgOneOffPayout = oneOffJobs.length > 0 ? oneOffJobs.reduce((sum, job) => sum + job.expectedPayout, 0) / oneOffJobs.length : 0;
  const avgSubscriptionPayout = subscriptionJobs.length > 0 ? subscriptionJobs.reduce((sum, job) => sum + job.expectedPayout, 0) / subscriptionJobs.length : 0;

  const totalEarnings = completedJobs.reduce((sum, job) => sum + job.expectedPayout, 0);
  const currentMonthEarnings = monthlyEarnings[monthlyEarnings.length - 1]?.earnings || 0;

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

  // Show empty state when no data mode is selected or user is not a provider
  if (!data || !isValidProvider || (jobs.length === 0 && notifications.length === 0 && monthlyEarnings.length === 0)) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <EmailVerificationPrompt
          isOpen={showEmailVerification}
          onClose={() => setShowEmailVerification(false)}
          email={user?.email || ''}
        />

        {/* Header */}
        <header className="bg-white shadow-sm border-b sticky top-0 z-30">
          <div className="max-w-7xl mx-auto mobile-container">
            <div className="mobile-header h-16">
              <div className="flex items-center space-x-4">
                <h1 className="text-xl sm:text-2xl font-bold text-purple-600">Longa Provider</h1>
              </div>
              <div className="flex items-center space-x-4">
                <Button 
                  variant="ghost" 
                  onClick={handleLogout}
                  className="text-gray-600 hover:text-gray-900"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  <span className="mobile-hide">Logout</span>
                </Button>
              </div>
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
          className="mobile-sidebar-overlay"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Header with enhanced provider info */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-30">
        <div className="max-w-7xl mx-auto mobile-container">
          <div className="mobile-header h-16">
            <div className="flex items-center space-x-4">
              <h1 className="text-xl sm:text-2xl font-bold text-purple-600">Longa Provider</h1>
              <span className="text-gray-300 mobile-hide">|</span>
              <div className="mobile-hide">
                <h2 className="text-sm sm:text-lg text-gray-700">Welcome back, {providerProfile.name}</h2>
                {providerProfile.rating > 0 && (
                  <div className="flex items-center text-sm text-gray-500">
                    <Star className="h-4 w-4 text-yellow-400 fill-current mr-1" />
                    <span>{providerProfile.rating} • {providerProfile.totalJobs} jobs completed</span>
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                aria-label="Toggle mobile menu"
              >
                {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
              
              <div className="relative mobile-hide">
                <Bell className="h-6 w-6 text-gray-600" />
                {notifications.filter(n => !n.read).length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {notifications.filter(n => !n.read).length}
                  </span>
                )}
              </div>
              <Button 
                variant="ghost" 
                onClick={handleLogout}
                className="text-gray-600 hover:text-gray-900"
              >
                <LogOut className="h-4 w-4 mr-2" />
                <span className="mobile-hide">Logout</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex-1">
        <div className="max-w-7xl mx-auto mobile-container py-4 sm:py-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 lg:gap-8">
            {/* Main Content */}
            <div className="lg:col-span-3 space-y-6 lg:space-y-8">
              {/* Enhanced Provider Profile Card */}
              {providerProfile.rating > 0 && (
                <Card className="bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-4">
                      <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center">
                        <User className="h-8 w-8 text-purple-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold text-gray-900">{providerProfile.name}</h3>
                        <div className="flex items-center space-x-4 mt-1">
                          <div className="flex items-center">
                            <Star className="h-4 w-4 text-yellow-400 fill-current mr-1" />
                            <span className="text-sm font-medium">{providerProfile.rating}</span>
                          </div>
                          <span className="text-sm text-gray-600">{providerProfile.totalJobs} jobs completed</span>
                          <span className="text-sm text-gray-600">{providerProfile.location}</span>
                        </div>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {providerProfile.specialties.map((specialty) => (
                            <Badge key={specialty} variant="outline" className="text-xs bg-purple-50 text-purple-700">
                              {specialty}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Earnings Summary Cards */}
              <div className="stats-grid">
                <Card>
                  <CardContent className="mobile-card">
                    <div className="flex items-center space-x-2">
                      <Wallet className="h-4 w-4 text-orange-600 flex-shrink-0" />
                      <span className="text-sm text-gray-600">Pending Payouts</span>
                    </div>
                    <p className="text-xl sm:text-2xl font-bold text-orange-600">N${totalPendingAmount}</p>
                    <p className="text-xs text-gray-500">{pendingPayouts.length} jobs pending</p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="mobile-card">
                    <div className="flex items-center space-x-2">
                      <TrendingUp className="h-4 w-4 text-green-600 flex-shrink-0" />
                      <span className="text-sm text-gray-600">This Week</span>
                    </div>
                    <p className="text-xl sm:text-2xl font-bold text-green-600">N${thisWeekEarnings}</p>
                    <p className="text-xs text-gray-500">{thisWeekCompleted.length} jobs completed</p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="mobile-card">
                    <div className="flex items-center space-x-2">
                      <DollarSign className="h-4 w-4 text-blue-600 flex-shrink-0" />
                      <span className="text-sm text-gray-600">Avg One-Off</span>
                    </div>
                    <p className="text-xl sm:text-2xl font-bold text-blue-600">N${avgOneOffPayout.toFixed(0)}</p>
                    <p className="text-xs text-gray-500">Per job average</p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="mobile-card">
                    <div className="flex items-center space-x-2">
                      <Banknote className="h-4 w-4 text-purple-600 flex-shrink-0" />
                      <span className="text-sm text-gray-600">Avg Package</span>
                    </div>
                    <p className="text-xl sm:text-2xl font-bold text-purple-600">N${avgSubscriptionPayout.toFixed(0)}</p>
                    <p className="text-xs text-gray-500">Per package average</p>
                  </CardContent>
                </Card>
              </div>

              {/* Availability Toggle */}
              <AvailabilityToggle 
                isAvailable={isAvailable}
                onToggle={setIsAvailable}
              />

              {/* Job Filters */}
              <JobFilters
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                statusFilter={statusFilter}
                onStatusFilterChange={setStatusFilter}
                locationFilter={locationFilter}
                onLocationFilterChange={setLocationFilter}
              />

              {/* Available Jobs - Enhanced with better data display */}
              {isAvailable && (
                <div>
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">
                    Available Jobs ({availableJobs.length})
                  </h3>
                  <div className="space-y-4">
                    {availableJobs.map((job) => (
                      <Card key={job.id} className="hover:shadow-md transition-shadow border-purple-100">
                        <CardHeader className="pb-4">
                          <div className="mobile-stack">
                            <div className="flex-1">
                              <CardTitle className="text-base sm:text-lg font-semibold text-gray-900">
                                {job.service}
                              </CardTitle>
                              <div className="space-y-1 mt-2">
                                <p className="text-sm text-gray-600 flex items-center">
                                  <User className="h-4 w-4 mr-1 flex-shrink-0" />
                                  {job.clientName}
                                </p>
                                <p className="text-sm text-gray-600 flex items-center">
                                  <Phone className="h-4 w-4 mr-1 flex-shrink-0" />
                                  {job.clientPhone}
                                </p>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Badge className="text-xs bg-yellow-100 text-yellow-800">
                                {job.status}
                              </Badge>
                              <Badge className="text-xs bg-blue-100 text-blue-800">
                                {job.jobType === 'one-off' ? 'One-Off' : 'Package'}
                              </Badge>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="pt-0">
                          <div className="space-y-3">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-gray-600">
                              <div className="flex items-center">
                                <MapPin className="h-4 w-4 mr-2 flex-shrink-0" />
                                {job.location}
                              </div>
                              <div className="flex items-center">
                                <Calendar className="h-4 w-4 mr-2 flex-shrink-0" />
                                {job.date}
                              </div>
                              <div className="flex items-center">
                                <Clock className="h-4 w-4 mr-2 flex-shrink-0" />
                                {job.duration}
                              </div>
                              <div className="flex items-center">
                                <Mail className="h-4 w-4 mr-2 flex-shrink-0" />
                                {job.clientEmail}
                              </div>
                            </div>
                            
                            {/* Enhanced Payout Information */}
                            <div className="bg-purple-50 p-3 rounded-lg">
                              <div className="flex items-center text-sm text-purple-700 mb-1">
                                {job.jobType === 'one-off' ? (
                                  <Percent className="h-4 w-4 mr-2" />
                                ) : (
                                  <Banknote className="h-4 w-4 mr-2" />
                                )}
                                {job.jobType === 'one-off' ? `${job.commissionPercentage}% commission` : 'Fixed fee'}
                              </div>
                              <div className="text-lg font-semibold text-purple-600">
                                Expected: N${job.expectedPayout}
                              </div>
                              <div className="text-xs text-purple-500 mt-1">
                                Client pays: N${job.amount}
                              </div>
                            </div>
                            
                            <div className="mobile-button-group pt-2">
                              <Button 
                                onClick={() => acceptJob(job.id)}
                                className="bg-green-600 hover:bg-green-700 mobile-button"
                                size="sm"
                              >
                                Accept
                              </Button>
                              <Button 
                                onClick={() => declineJob(job.id)}
                                variant="outline"
                                className="mobile-button"
                                size="sm"
                              >
                                Decline
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                  {availableJobs.length === 0 && (
                    <EmptyState
                      title="No Available Jobs"
                      description="No available jobs match your current filters. Try adjusting your search or filters!"
                    />
                  )}
                </div>
              )}

              {/* My Jobs - Enhanced with comprehensive data display */}
              <div>
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">
                  My Jobs ({myJobs.length})
                </h3>
                
                {myJobs.length === 0 ? (
                  <EmptyState
                    title="No Jobs Yet"
                    description="You haven't accepted any jobs yet. Available jobs will appear above when you're marked as available."
                  />
                ) : (
                  <>
                    {/* Enhanced mobile card view */}
                    <div className="space-y-4 lg:hidden">
                      {myJobs.map((job) => (
                        <Card key={job.id} className="hover:shadow-md transition-shadow">
                          <CardContent className="mobile-card">
                            <div className="mobile-stack mb-3">
                              <div className="flex-1">
                                <h4 className="font-semibold text-gray-900">{job.service}</h4>
                                <p className="text-sm text-gray-600">{job.clientName}</p>
                                <p className="text-sm text-gray-500">{job.date}</p>
                                <p className="text-sm text-gray-500">{job.location}</p>
                              </div>
                              <div className="flex flex-col space-y-1">
                                <Badge className={`text-xs ${getStatusColor(job.status)}`}>
                                  {job.status}
                                </Badge>
                                <Badge className={`text-xs ${getJobTypeColor(job.jobType)}`}>
                                  {job.jobType === 'one-off' ? 'One-Off' : 'Package'}
                                </Badge>
                              </div>
                            </div>
                            
                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between">
                                <span className="text-gray-600">Expected Payout:</span>
                                <span className="font-medium text-purple-600">N${job.expectedPayout}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">Duration:</span>
                                <span className="text-gray-900">{job.duration}</span>
                              </div>
                              {job.payoutStatus && (
                                <div className="flex justify-between">
                                  <span className="text-gray-600">Payout Status:</span>
                                  <Badge className={`text-xs ${getPayoutStatusColor(job.payoutStatus)}`}>
                                    {job.payoutStatus}
                                  </Badge>
                                </div>
                              )}
                              {job.rating && (
                                <div className="flex justify-between">
                                  <span className="text-gray-600">Rating:</span>
                                  <div className="flex items-center">
                                    <Star className="h-3 w-3 text-yellow-400 fill-current mr-1" />
                                    <span>{job.rating}/5</span>
                                  </div>
                                </div>
                              )}
                            </div>
                            
                            {job.status === 'accepted' && (
                              <Button 
                                onClick={() => completeJob(job.id)}
                                size="sm"
                                className="bg-green-600 hover:bg-green-700 w-full mt-3"
                              >
                                Mark Complete
                              </Button>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                    </div>

                    {/* Enhanced desktop table view */}
                    <Card className="overflow-hidden mobile-hide">
                      <CardContent className="p-0">
                        <div className="overflow-x-auto">
                          <table className="w-full">
                            <thead className="bg-gray-50">
                              <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Service & Client</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location & Date</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payout Info</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status & Rating</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                              </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                              {myJobs.map((job) => {
                                const payoutInfo = getPayoutCalculationInfo(job);
                                const PayoutIcon = payoutInfo.icon;
                                const PayoutStatusIcon = getPayoutStatusIcon(job.payoutStatus);
                                
                                return (
                                  <tr key={job.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                      <div>
                                        <div className="text-sm font-medium text-gray-900">{job.service}</div>
                                        <div className="text-sm text-gray-600">{job.clientName}</div>
                                        <div className="text-xs text-gray-500">{job.clientPhone}</div>
                                        <Badge className={`${getJobTypeColor(job.jobType)} text-xs mt-1`}>
                                          {job.jobType === 'one-off' ? 'One-Off' : 'Package'}
                                        </Badge>
                                      </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                      <div className="flex flex-col">
                                        <span className="font-medium">{job.location}</span>
                                        <span>{job.date}</span>
                                        <span className="text-xs text-gray-500">{job.duration}</span>
                                        {job.completedDate && (
                                          <span className="text-xs text-green-600">Completed: {job.completedDate}</span>
                                        )}
                                      </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                      <div className="flex flex-col space-y-1">
                                        <div className="flex items-center text-sm text-purple-600 font-medium">
                                          <PayoutIcon className="h-3 w-3 mr-1" />
                                          N${job.expectedPayout}
                                          {job.actualPayout && job.actualPayout !== job.expectedPayout && (
                                            <span className="text-xs text-gray-500 ml-1">
                                              (Actual: N${job.actualPayout})
                                            </span>
                                          )}
                                        </div>
                                        <div className="text-xs text-gray-500">
                                          {job.jobType === 'one-off' ? `${job.commissionPercentage}% commission` : 'Fixed fee'}
                                        </div>
                                        {job.payoutStatus && (
                                          <div className="flex items-center">
                                            <PayoutStatusIcon className="h-3 w-3 mr-1" />
                                            <Badge className={`${getPayoutStatusColor(job.payoutStatus)} text-xs`}>
                                              {job.payoutStatus}
                                            </Badge>
                                          </div>
                                        )}
                                        {job.payoutDate && (
                                          <div className="text-xs text-green-600">
                                            Paid: {job.payoutDate}
                                          </div>
                                        )}
                                      </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                      <div className="flex flex-col">
                                        <Badge className={`${getStatusColor(job.status)} border-0 mb-1`}>
                                          {job.status}
                                        </Badge>
                                        {job.rating && (
                                          <div className="flex items-center">
                                            <Star className="h-3 w-3 text-yellow-400 fill-current mr-1" />
                                            <span className="text-xs text-gray-600">{job.rating}/5</span>
                                          </div>
                                        )}
                                        {job.reviewComment && (
                                          <div className="text-xs text-gray-500 mt-1 max-w-32 truncate">
                                            "{job.reviewComment}"
                                          </div>
                                        )}
                                      </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                      {job.status === 'accepted' && (
                                        <Button 
                                          onClick={() => completeJob(job.id)}
                                          size="sm"
                                          className="bg-green-600 hover:bg-green-700"
                                        >
                                          Mark Complete
                                        </Button>
                                      )}
                                      {job.status === 'completed' && (
                                        <span className="text-green-600 font-medium">✓ Completed</span>
                                      )}
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      </CardContent>
                    </Card>
                  </>
                )}
              </div>
            </div>

            {/* Enhanced Sidebar with better data display */}
            <div className={`space-y-6 ${isMobileMenuOpen ? 'mobile-sidebar-panel' : 'mobile-sidebar'}`}>
              {/* Mobile sidebar close button */}
              {isMobileMenuOpen && (
                <div className="flex justify-end lg:hidden mb-4 pt-4 px-4">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsMobileMenuOpen(false)}
                    aria-label="Close sidebar"
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>
              )}

              <div className={`space-y-6 ${isMobileMenuOpen ? 'p-6' : ''}`}>
                {/* Notifications */}
                <NotificationSystem
                  notifications={notifications}
                  onMarkAsRead={markAsRead}
                  onMarkAllAsRead={markAllAsRead}
                  onDismiss={dismissNotification}
                />

                {/* Enhanced Earnings Tracker */}
                <EarningsTracker
                  currentMonthEarnings={currentMonthEarnings}
                  totalEarnings={totalEarnings}
                  monthlyData={monthlyEarnings}
                  completedJobs={completedJobs.length}
                />

                {/* Ratings & Reviews */}
                <RatingSystem ratings={ratings} />

                {/* Enhanced Quick Stats */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Performance Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Overall Rating</span>
                      <div className="flex items-center">
                        <Star className="h-4 w-4 text-yellow-400 fill-current mr-1" />
                        <span className="font-semibold text-yellow-600">{providerProfile.rating}/5</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Pending Payouts</span>
                      <span className="font-semibold text-orange-600">N${totalPendingAmount}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">This Week Earnings</span>
                      <span className="font-semibold text-green-600">N${thisWeekEarnings}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Jobs Available</span>
                      <span className="font-semibold text-yellow-600">{availableJobs.length}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Total Reviews</span>
                      <span className="font-semibold text-blue-600">{ratings.length}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Active Since</span>
                      <span className="font-semibold text-purple-600">
                        {providerProfile.joinDate ? new Date(providerProfile.joinDate).toLocaleDateString() : 'N/A'}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default ProviderDashboard;
