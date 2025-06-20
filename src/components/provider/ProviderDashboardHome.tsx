
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Calendar, 
  DollarSign, 
  Clock, 
  TrendingUp, 
  MapPin, 
  Star,
  CheckCircle,
  AlertCircle,
  XCircle
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { ProviderCategoryDisplay } from './ProviderCategoryDisplay';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ProviderStats {
  totalJobs: number;
  completedJobs: number;
  pendingJobs: number;
  totalEarnings: number;
  averageRating: number;
  thisWeekJobs: number;
}

interface RecentJob {
  id: string;
  service_name: string;
  client_name: string;
  booking_date: string;
  booking_time: string;
  status: string;
  total_amount: number;
  location_town: string;
}

export const ProviderDashboardHome: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<ProviderStats>({
    totalJobs: 0,
    completedJobs: 0,
    pendingJobs: 0,
    totalEarnings: 0,
    averageRating: 0,
    thisWeekJobs: 0
  });
  const [recentJobs, setRecentJobs] = useState<RecentJob[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      fetchProviderStats();
      fetchRecentJobs();
    }
  }, [user?.id]);

  const fetchProviderStats = async () => {
    try {
      if (!user?.id) return;

      // Fetch booking statistics
      const { data: bookingsData, error: bookingsError } = await supabase
        .from('bookings')
        .select('status, total_amount, rating, created_at')
        .eq('provider_id', user.id);

      if (bookingsError) throw bookingsError;

      const now = new Date();
      const weekStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay());

      const totalJobs = bookingsData?.length || 0;
      const completedJobs = bookingsData?.filter(b => b.status === 'completed').length || 0;
      const pendingJobs = bookingsData?.filter(b => ['pending', 'accepted', 'in_progress'].includes(b.status)).length || 0;
      const totalEarnings = bookingsData?.filter(b => b.status === 'completed').reduce((sum, b) => sum + (b.total_amount || 0), 0) || 0;
      const ratings = bookingsData?.filter(b => b.rating).map(b => b.rating) || [];
      const averageRating = ratings.length > 0 ? ratings.reduce((sum, r) => sum + r, 0) / ratings.length : 0;
      const thisWeekJobs = bookingsData?.filter(b => new Date(b.created_at) >= weekStart).length || 0;

      setStats({
        totalJobs,
        completedJobs,
        pendingJobs,
        totalEarnings,
        averageRating,
        thisWeekJobs
      });
    } catch (error) {
      console.error('Error fetching provider stats:', error);
      toast.error('Failed to load dashboard statistics');
    }
  };

  const fetchRecentJobs = async () => {
    try {
      if (!user?.id) return;

      const { data, error } = await supabase
        .from('bookings')
        .select(`
          id,
          booking_date,
          booking_time,
          status,
          total_amount,
          location_town,
          services (name),
          users!bookings_client_id_fkey (full_name)
        `)
        .eq('provider_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) throw error;

      const formattedJobs: RecentJob[] = data?.map(job => ({
        id: job.id,
        service_name: job.services?.name || 'Unknown Service',
        client_name: job.users?.full_name || 'Unknown Client',
        booking_date: job.booking_date,
        booking_time: job.booking_time,
        status: job.status,
        total_amount: job.total_amount,
        location_town: job.location_town
      })) || [];

      setRecentJobs(formattedJobs);
    } catch (error) {
      console.error('Error fetching recent jobs:', error);
      toast.error('Failed to load recent jobs');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { color: 'bg-yellow-100 text-yellow-800', icon: Clock },
      accepted: { color: 'bg-blue-100 text-blue-800', icon: CheckCircle },
      in_progress: { color: 'bg-purple-100 text-purple-800', icon: Clock },
      completed: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
      cancelled: { color: 'bg-red-100 text-red-800', icon: XCircle }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <Badge className={`${config.color} flex items-center gap-1`}>
        <Icon className="h-3 w-3" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-purple-600 to-purple-700 rounded-lg p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">Welcome back, {user?.full_name || user?.name}!</h1>
        <p className="text-purple-100">
          Here's your service provider dashboard overview
        </p>
      </div>

      {/* Provider Category Display */}
      <ProviderCategoryDisplay />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Jobs</p>
                <p className="text-2xl font-bold">{stats.totalJobs}</p>
              </div>
              <Calendar className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-green-600">{stats.completedJobs}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Earnings</p>
                <p className="text-2xl font-bold text-blue-600">N${stats.totalEarnings.toFixed(2)}</p>
              </div>
              <DollarSign className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Average Rating</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.averageRating.toFixed(1)}</p>
              </div>
              <Star className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Jobs */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Jobs</CardTitle>
        </CardHeader>
        <CardContent>
          {recentJobs.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Clock className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No recent jobs found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {recentJobs.map((job) => (
                <div key={job.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium">{job.service_name}</h3>
                      {getStatusBadge(job.status)}
                    </div>
                    <p className="text-sm text-gray-600">Client: {job.client_name}</p>
                    <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                      <span>{new Date(job.booking_date).toLocaleDateString()}</span>
                      <span>{job.booking_time}</span>
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {job.location_town}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">N${job.total_amount}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              Pending Jobs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-orange-600 mb-2">{stats.pendingJobs}</p>
            <p className="text-sm text-gray-600 mb-4">Jobs waiting for your response</p>
            <Button className="w-full" onClick={() => window.location.href = '/provider-dashboard?tab=jobs'}>
              View Pending Jobs
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              This Week
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-purple-600 mb-2">{stats.thisWeekJobs}</p>
            <p className="text-sm text-gray-600 mb-4">New jobs this week</p>
            <Button variant="outline" className="w-full" onClick={() => window.location.href = '/provider-dashboard?tab=earnings'}>
              View Earnings
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
