import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Calendar, 
  DollarSign, 
  Star, 
  TrendingUp, 
  Clock, 
  CheckCircle,
  User,
  CreditCard,
  Settings,
  Shield,
  Briefcase,
  MapPin,
  AlertTriangle
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { ProviderBankingDetails } from '@/components/provider/ProviderBankingDetails';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';

interface ProviderStats {
  totalJobs: number;
  monthlyJobs: number;
  monthlyEarnings: number;
  rating: number;
}

interface RecentJob {
  id: string;
  service_name: string;
  description: string;
  status: string;
  booking_date: string;
  total_amount: number;
}

interface AssignedJob {
  id: string;
  service_name: string;
  client_name: string;
  booking_date: string;
  booking_time: string;
  service_address: string;
  status: string;
  total_amount: number;
}

interface EarningsData {
  thisWeek: number;
  thisMonth: number;
  totalEarnings: number;
  pendingPayout: number;
}

const ProviderDashboard = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState<ProviderStats>({
    totalJobs: 0,
    monthlyJobs: 0,
    monthlyEarnings: 0,
    rating: 0
  });
  const [recentJobs, setRecentJobs] = useState<RecentJob[]>([]);
  const [assignedJobs, setAssignedJobs] = useState<AssignedJob[]>([]);
  const [earnings, setEarnings] = useState<EarningsData>({
    thisWeek: 0,
    thisMonth: 0,
    totalEarnings: 0,
    pendingPayout: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingJobs, setIsLoadingJobs] = useState(false);

  const fetchProviderData = async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      
      // Fetch all bookings for this provider
      const { data: bookings, error: bookingsError } = await supabase
        .from('bookings')
        .select(`
          *,
          service:services(name, description)
        `)
        .eq('provider_id', user.id)
        .order('created_at', { ascending: false });

      if (bookingsError) throw bookingsError;

      const now = new Date();
      const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const thisWeek = new Date(now.setDate(now.getDate() - now.getDay()));

      const completedJobs = bookings?.filter(b => b.status === 'completed') || [];
      const monthlyJobs = completedJobs.filter(b => new Date(b.booking_date) >= thisMonth);
      const weeklyJobs = completedJobs.filter(b => new Date(b.booking_date) >= thisWeek);

      // Calculate stats
      setStats({
        totalJobs: completedJobs.length,
        monthlyJobs: monthlyJobs.length,
        monthlyEarnings: monthlyJobs.reduce((sum, job) => sum + (job.provider_payout || job.total_amount * 0.85), 0),
        rating: user.rating || 0
      });

      // Set recent jobs
      const recentJobsData = (bookings || []).slice(0, 3).map(job => ({
        id: job.id,
        service_name: job.service?.name || 'Service',
        description: job.service?.description || 'Service booking',
        status: job.status,
        booking_date: job.booking_date,
        total_amount: job.total_amount
      }));
      setRecentJobs(recentJobsData);

      // Calculate earnings
      const totalEarnings = completedJobs.reduce((sum, job) => sum + (job.provider_payout || job.total_amount * 0.85), 0);
      const weeklyEarnings = weeklyJobs.reduce((sum, job) => sum + (job.provider_payout || job.total_amount * 0.85), 0);
      const monthlyEarnings = monthlyJobs.reduce((sum, job) => sum + (job.provider_payout || job.total_amount * 0.85), 0);
      
      // Fetch pending payouts
      const { data: pendingPayouts } = await supabase
        .from('payouts')
        .select('amount')
        .eq('provider_id', user.id)
        .eq('status', 'pending');

      const pendingAmount = pendingPayouts?.reduce((sum, payout) => sum + payout.amount, 0) || 0;

      setEarnings({
        thisWeek: weeklyEarnings,
        thisMonth: monthlyEarnings,
        totalEarnings,
        pendingPayout: pendingAmount
      });

    } catch (error) {
      console.error('Error fetching provider data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAssignedJobs = async () => {
    if (!user) return;

    try {
      setIsLoadingJobs(true);

      const { data: jobs, error } = await supabase
        .from('bookings')
        .select(`
          id,
          booking_date,
          booking_time,
          service_address,
          status,
          total_amount,
          service:services(name),
          client:users!bookings_client_id_fkey(full_name)
        `)
        .eq('provider_id', user.id)
        .in('status', ['pending', 'accepted', 'in_progress'])
        .order('booking_date', { ascending: true });

      if (error) throw error;

      const assignedJobsData = (jobs || []).map(job => ({
        id: job.id,
        service_name: job.service?.name || 'Service',
        client_name: job.client?.full_name || 'Client',
        booking_date: job.booking_date,
        booking_time: job.booking_time,
        service_address: job.service_address || 'Address not provided',
        status: job.status,
        total_amount: job.total_amount
      }));

      setAssignedJobs(assignedJobsData);
    } catch (error) {
      console.error('Error fetching assigned jobs:', error);
    } finally {
      setIsLoadingJobs(false);
    }
  };

  useEffect(() => {
    fetchProviderData();
  }, [user]);

  useEffect(() => {
    if (activeTab === 'assigned-jobs') {
      fetchAssignedJobs();
    }
  }, [activeTab, user]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-800">Completed</Badge>;
      case 'in_progress':
        return <Badge className="bg-blue-100 text-blue-800">In Progress</Badge>;
      case 'accepted':
        return <Badge className="bg-yellow-100 text-yellow-800">Scheduled</Badge>;
      case 'pending':
        return <Badge className="bg-orange-100 text-orange-800">Pending</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const needsVerification = !user?.verification_status || user?.verification_status === 'unverified' || user?.verification_status === 'pending';

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Provider Dashboard</h1>
            <p className="text-gray-600">Welcome back, {user?.full_name}</p>
          </div>
          <div className="flex items-center gap-4">
            <Badge variant="outline" className="flex items-center gap-1">
              <Star className="h-4 w-4" />
              {stats.rating.toFixed(1)}/5
            </Badge>
            <Button onClick={signOut} variant="outline">
              Sign Out
            </Button>
          </div>
        </div>

        {/* Verification Alert */}
        {needsVerification && (
          <div className="mb-8">
            <Card className="border-yellow-200 bg-yellow-50">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="h-5 w-5 text-yellow-600" />
                  <div className="flex-1">
                    <h3 className="font-semibold text-yellow-800">Verification Required</h3>
                    <p className="text-sm text-yellow-700">
                      Complete your provider verification to start accepting bookings.
                    </p>
                  </div>
                  <Button 
                    onClick={() => setActiveTab('verification')}
                    className="bg-yellow-600 hover:bg-yellow-700"
                  >
                    Complete Verification
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Jobs</CardTitle>
              <Briefcase className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalJobs}</div>
              <p className="text-xs text-muted-foreground">
                Completed successfully
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">This Month</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.monthlyJobs}</div>
              <p className="text-xs text-muted-foreground">
                Jobs completed
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Earnings</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">N${stats.monthlyEarnings.toFixed(0)}</div>
              <p className="text-xs text-muted-foreground">
                This month
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Rating</CardTitle>
              <Star className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.rating.toFixed(1)}/5</div>
              <p className="text-xs text-muted-foreground">
                Average rating
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="jobs" className="flex items-center gap-2">
              <Briefcase className="h-4 w-4" />
              Jobs
            </TabsTrigger>
            <TabsTrigger value="assigned-jobs" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Assigned Jobs
            </TabsTrigger>
            <TabsTrigger value="banking" className="flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              Banking
            </TabsTrigger>
            <TabsTrigger value="verification" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Verification
            </TabsTrigger>
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Profile
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Recent Jobs
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentJobs.length > 0 ? (
                      recentJobs.map((job) => (
                        <div key={job.id} className="flex items-center justify-between p-3 border rounded">
                          <div>
                            <h4 className="font-medium">{job.service_name}</h4>
                            <p className="text-sm text-gray-600">{job.description}</p>
                            <p className="text-xs text-gray-500">
                              {format(new Date(job.booking_date), 'MMM dd, yyyy')}
                            </p>
                          </div>
                          <div className="text-right">
                            {getStatusBadge(job.status)}
                            <p className="text-sm font-medium mt-1">N${job.total_amount}</p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <Briefcase className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                        <p>No recent jobs</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5" />
                    Earnings Overview
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">This Week</span>
                      <span className="font-medium">N${earnings.thisWeek.toFixed(0)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">This Month</span>
                      <span className="font-medium">N${earnings.thisMonth.toFixed(0)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Total Earnings</span>
                      <span className="font-medium">N${earnings.totalEarnings.toFixed(0)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Pending Payout</span>
                      <span className="font-medium text-orange-600">N${earnings.pendingPayout.toFixed(0)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="jobs">
            <Card>
              <CardHeader>
                <CardTitle>Job History</CardTitle>
              </CardHeader>
              <CardContent>
                {recentJobs.length > 0 ? (
                  <div className="space-y-4">
                    {recentJobs.map((job) => (
                      <div key={job.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex-1">
                          <h3 className="font-medium">{job.service_name}</h3>
                          <p className="text-sm text-gray-600">{job.description}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            {format(new Date(job.booking_date), 'MMMM dd, yyyy')}
                          </p>
                        </div>
                        <div className="text-right">
                          {getStatusBadge(job.status)}
                          <p className="text-lg font-semibold mt-1">N${job.total_amount}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Briefcase className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Jobs Yet</h3>
                    <p className="text-gray-600">Your completed jobs will appear here</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="assigned-jobs">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Assigned Jobs
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoadingJobs ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading assigned jobs...</p>
                  </div>
                ) : assignedJobs.length > 0 ? (
                  <div className="space-y-4">
                    {assignedJobs.map((job) => (
                      <div key={job.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex-1">
                          <h3 className="font-medium">{job.service_name}</h3>
                          <p className="text-sm text-gray-600 flex items-center gap-1">
                            <User className="h-3 w-3" />
                            Client: {job.client_name}
                          </p>
                          <p className="text-sm text-gray-600 flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {format(new Date(job.booking_date), 'MMM dd, yyyy')} at {job.booking_time}
                          </p>
                          <p className="text-sm text-gray-600 flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {job.service_address}
                          </p>
                        </div>
                        <div className="text-right">
                          {getStatusBadge(job.status)}
                          <p className="text-lg font-semibold mt-1">N${job.total_amount}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Briefcase className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Assigned Jobs</h3>
                    <p className="text-gray-600">You don't have any assigned jobs at the moment</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="banking">
            <ProviderBankingDetails />
          </TabsContent>

          <TabsContent value="verification">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Provider Verification
                </CardTitle>
              </CardHeader>
              <CardContent>
                {needsVerification ? (
                  <div className="space-y-4">
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <h3 className="font-semibold text-yellow-800 mb-2">Verification Required</h3>
                      <p className="text-yellow-700 mb-4">
                        You need to complete the verification process to start accepting bookings. 
                        This includes uploading required documents and providing banking details.
                      </p>
                      <Button 
                        onClick={() => navigate('/provider-verification')}
                        className="bg-yellow-600 hover:bg-yellow-700"
                      >
                        Start Verification Process
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 border rounded bg-green-50">
                      <div className="flex items-center gap-3">
                        <CheckCircle className="h-6 w-6 text-green-600" />
                        <div>
                          <h4 className="font-medium text-green-800">Verification Complete</h4>
                          <p className="text-sm text-green-600">Your provider verification is complete</p>
                        </div>
                      </div>
                      <Badge className="bg-green-100 text-green-800">Verified</Badge>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="flex items-center justify-between p-4 border rounded">
                        <div>
                          <h4 className="font-medium">Identity Verification</h4>
                          <p className="text-sm text-gray-600">Document verification</p>
                        </div>
                        <Badge className="bg-green-100 text-green-800">✓ Verified</Badge>
                      </div>
                      <div className="flex items-center justify-between p-4 border rounded">
                        <div>
                          <h4 className="font-medium">Background Check</h4>
                          <p className="text-sm text-gray-600">Criminal background verification</p>
                        </div>
                        <Badge className="bg-green-100 text-green-800">✓ Completed</Badge>
                      </div>
                      <div className="flex items-center justify-between p-4 border rounded">
                        <div>
                          <h4 className="font-medium">Banking Details</h4>
                          <p className="text-sm text-gray-600">Payment information</p>
                        </div>
                        <Badge className="bg-green-100 text-green-800">✓ Verified</Badge>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Profile Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-600">Full Name</label>
                      <p className="text-sm">{user?.full_name}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Email</label>
                      <p className="text-sm">{user?.email}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Phone</label>
                      <p className="text-sm">{user?.phone || 'Not provided'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Location</label>
                      <p className="text-sm">{user?.current_work_location || 'Not specified'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Service Areas</label>
                      <p className="text-sm">{user?.service_coverage_areas?.join(', ') || 'Not specified'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Status</label>
                      <p className="text-sm">
                        <Badge variant={user?.is_active ? 'default' : 'secondary'}>
                          {user?.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </p>
                    </div>
                  </div>
                  <Button variant="outline">
                    <Settings className="h-4 w-4 mr-2" />
                    Edit Profile
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ProviderDashboard;
