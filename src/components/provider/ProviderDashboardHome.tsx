
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  DollarSign, 
  Star,
  CheckCircle,
  AlertCircle,
  HeadphonesIcon
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';

interface TodayJob {
  id: string;
  client_name: string;
  client_avatar?: string;
  booking_time: string;
  location_town: string;
  service_name: string;
  status: string;
  total_amount: number;
}

interface NextJob {
  booking_date: string;
  booking_time: string;
  service_name: string;
}

interface WeeklyStats {
  totalEarnings: number;
  completedJobs: number;
  upcomingPayout: number;
}

export const ProviderDashboardHome: React.FC = () => {
  const { user } = useAuth();
  const [todayJob, setTodayJob] = useState<TodayJob | null>(null);
  const [nextJob, setNextJob] = useState<NextJob | null>(null);
  const [weeklyStats, setWeeklyStats] = useState<WeeklyStats>({
    totalEarnings: 0,
    completedJobs: 0,
    upcomingPayout: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const fetchDashboardData = async () => {
    if (!user) return;

    try {
      const today = new Date().toISOString().split('T')[0];
      const weekStart = new Date();
      weekStart.setDate(weekStart.getDate() - weekStart.getDay());
      
      // Fetch today's job
      const { data: todayData } = await supabase
        .from('bookings')
        .select(`
          id,
          booking_time,
          location_town,
          status,
          total_amount,
          service:services(name),
          client:users!bookings_client_id_fkey(full_name, avatar_url)
        `)
        .eq('provider_id', user.id)
        .eq('booking_date', today)
        .in('status', ['accepted', 'in_progress'])
        .order('booking_time')
        .limit(1);

      if (todayData && todayData.length > 0) {
        const job = todayData[0];
        setTodayJob({
          id: job.id,
          client_name: job.client?.full_name || 'Unknown Client',
          client_avatar: job.client?.avatar_url,
          booking_time: job.booking_time,
          location_town: job.location_town || 'Windhoek',
          service_name: job.service?.name || 'Service',
          status: job.status,
          total_amount: job.total_amount
        });
      }

      // Fetch next upcoming job
      const { data: nextData } = await supabase
        .from('bookings')
        .select(`
          booking_date,
          booking_time,
          service:services(name)
        `)
        .eq('provider_id', user.id)
        .gte('booking_date', today)
        .in('status', ['accepted', 'pending'])
        .order('booking_date')
        .order('booking_time')
        .limit(1);

      if (nextData && nextData.length > 0) {
        const job = nextData[0];
        setNextJob({
          booking_date: job.booking_date,
          booking_time: job.booking_time,
          service_name: job.service?.name || 'Service'
        });
      }

      // Fetch weekly stats
      const { data: weeklyData } = await supabase
        .from('bookings')
        .select('total_amount, status')
        .eq('provider_id', user.id)
        .gte('booking_date', weekStart.toISOString().split('T')[0]);

      if (weeklyData) {
        const completed = weeklyData.filter(b => b.status === 'completed');
        const totalEarnings = completed.reduce((sum, b) => sum + (b.total_amount * 0.85), 0); // 85% after commission
        
        setWeeklyStats({
          totalEarnings,
          completedJobs: completed.length,
          upcomingPayout: totalEarnings * 0.9 // Assuming 10% withholding
        });
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [user]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'accepted': return 'bg-blue-100 text-blue-800';
      case 'in_progress': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="p-4 space-y-4">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-3/4"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
          <div className="grid grid-cols-2 gap-4">
            <div className="h-24 bg-gray-200 rounded"></div>
            <div className="h-24 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 pb-20 space-y-6 bg-gray-50 min-h-screen">
      {/* Welcome Message */}
      <div className="text-center py-4">
        <h1 className="text-2xl font-bold text-gray-900">
          {getGreeting()}, {user?.full_name || user?.name} 🌞
        </h1>
        <p className="text-gray-600 mt-1">Ready to make today amazing!</p>
      </div>

      {/* Today's Job */}
      {todayJob ? (
        <Card className="border-l-4 border-l-purple-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-lg">Today's Job</h3>
              <Badge className={getStatusColor(todayJob.status)}>
                {todayJob.status === 'in_progress' ? 'In Progress' : 'Accepted'}
              </Badge>
            </div>
            
            <div className="flex items-center space-x-3 mb-3">
              <Avatar className="h-12 w-12">
                <AvatarImage src={todayJob.client_avatar} />
                <AvatarFallback>
                  {todayJob.client_name.split(' ').map(n => n[0]).join('').toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <p className="font-medium text-gray-900">{todayJob.client_name}</p>
                <p className="text-sm text-gray-600">{todayJob.service_name}</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-green-600">N${todayJob.total_amount}</p>
              </div>
            </div>

            <div className="flex items-center justify-between text-sm text-gray-600">
              <div className="flex items-center space-x-1">
                <Clock className="h-4 w-4" />
                <span>{todayJob.booking_time}</span>
              </div>
              <div className="flex items-center space-x-1">
                <MapPin className="h-4 w-4" />
                <span>{todayJob.location_town}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-dashed border-2 border-gray-300">
          <CardContent className="p-4 text-center">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-600">No jobs scheduled for today</p>
            <p className="text-sm text-gray-500">Enjoy your free day!</p>
          </CardContent>
        </Card>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <DollarSign className="h-8 w-8 text-green-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900">N${weeklyStats.totalEarnings.toFixed(0)}</p>
            <p className="text-sm text-gray-600">This Week's Earnings</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <CheckCircle className="h-8 w-8 text-blue-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900">{weeklyStats.completedJobs}</p>
            <p className="text-sm text-gray-600">Jobs Completed</p>
          </CardContent>
        </Card>
      </div>

      {/* Next Job */}
      {nextJob && (
        <Card>
          <CardContent className="p-4">
            <h3 className="font-semibold text-lg mb-3">Next Job</h3>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">{nextJob.service_name}</p>
                <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                  <div className="flex items-center space-x-1">
                    <Calendar className="h-4 w-4" />
                    <span>{format(new Date(nextJob.booking_date), 'MMM dd')}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Clock className="h-4 w-4" />
                    <span>{nextJob.booking_time}</span>
                  </div>
                </div>
              </div>
              <Star className="h-6 w-6 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <div className="space-y-3">
        <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3">
          <Calendar className="h-5 w-5 mr-2" />
          Update Availability
        </Button>
        
        <Button variant="outline" className="w-full py-3">
          <CheckCircle className="h-5 w-5 mr-2" />
          See All Jobs
        </Button>
        
        <Button variant="outline" className="w-full py-3">
          <HeadphonesIcon className="h-5 w-5 mr-2" />
          Request Support
        </Button>
      </div>

      {/* Upcoming Payout Notice */}
      {weeklyStats.upcomingPayout > 0 && (
        <Card className="bg-green-50 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <DollarSign className="h-6 w-6 text-green-600" />
              <div>
                <p className="font-medium text-green-800">Payout This Thursday</p>
                <p className="text-sm text-green-700">N${weeklyStats.upcomingPayout.toFixed(0)} will be transferred to your bank</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
