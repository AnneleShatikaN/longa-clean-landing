
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  DollarSign, 
  Calendar, 
  TrendingUp, 
  CreditCard,
  CheckCircle,
  Clock
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { format, startOfWeek, endOfWeek } from 'date-fns';

interface WeeklySummary {
  bookingsCount: number;
  totalEarned: number;
  bonus: number;
  upcomingPayout: number;
}

interface EarningsHistory {
  id: string;
  date: string;
  job: string;
  amount: number;
  status: 'paid' | 'pending';
}

export const ProviderEarningsPage: React.FC = () => {
  const { user } = useAuth();
  const [weeklySummary, setWeeklySummary] = useState<WeeklySummary>({
    bookingsCount: 0,
    totalEarned: 0,
    bonus: 0,
    upcomingPayout: 0
  });
  const [earningsHistory, setEarningsHistory] = useState<EarningsHistory[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchEarningsData = async () => {
    if (!user) return;

    try {
      const weekStart = startOfWeek(new Date());
      const weekEnd = endOfWeek(new Date());

      // Fetch weekly bookings
      const { data: weeklyBookings, error: weeklyError } = await supabase
        .from('bookings')
        .select(`
          id,
          total_amount,
          booking_date,
          status,
          service:services(name)
        `)
        .eq('provider_id', user.id)
        .gte('booking_date', weekStart.toISOString().split('T')[0])
        .lte('booking_date', weekEnd.toISOString().split('T')[0])
        .eq('status', 'completed');

      if (weeklyError) throw weeklyError;

      // Calculate weekly summary
      const completedBookings = weeklyBookings || [];
      const totalEarned = completedBookings.reduce((sum, booking) => sum + (booking.total_amount * 0.85), 0); // 85% after commission
      const bonus = totalEarned > 1000 ? 100 : 0; // Bonus for high performers

      setWeeklySummary({
        bookingsCount: completedBookings.length,
        totalEarned: totalEarned,
        bonus: bonus,
        upcomingPayout: totalEarned * 0.9 // 90% after tax withholding
      });

      // Fetch earnings history
      const { data: historyData, error: historyError } = await supabase
        .from('bookings')
        .select(`
          id,
          booking_date,
          total_amount,
          status,
          service:services(name)
        `)
        .eq('provider_id', user.id)
        .eq('status', 'completed')
        .order('booking_date', { ascending: false })
        .limit(20);

      if (historyError) throw historyError;

      const processedHistory: EarningsHistory[] = (historyData || []).map(booking => ({
        id: booking.id,
        date: booking.booking_date,
        job: booking.service?.name || 'Service',
        amount: booking.total_amount * 0.85, // Provider's share
        status: Math.random() > 0.3 ? 'paid' : 'pending' // Simulate payment status
      }));

      setEarningsHistory(processedHistory);
    } catch (error) {
      console.error('Error fetching earnings data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEarningsData();
  }, [user]);

  const getStatusColor = (status: string) => {
    return status === 'paid' ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800';
  };

  if (isLoading) {
    return (
      <div className="p-4">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-2 gap-4">
            <div className="h-24 bg-gray-200 rounded"></div>
            <div className="h-24 bg-gray-200 rounded"></div>
          </div>
          <div className="h-48 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Earnings</h1>
        <p className="text-gray-600">Track your weekly income and payout history</p>
      </div>

      {/* Weekly Summary */}
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <Calendar className="h-8 w-8 text-purple-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900">{weeklySummary.bookingsCount}</p>
            <p className="text-sm text-gray-600">Bookings</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <DollarSign className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-green-600">N${weeklySummary.totalEarned.toFixed(0)}</p>
            <p className="text-sm text-gray-600">Total Earned</p>
          </CardContent>
        </Card>

        {weeklySummary.bonus > 0 && (
          <Card className="col-span-2">
            <CardContent className="p-4 text-center">
              <TrendingUp className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-yellow-600">N${weeklySummary.bonus}</p>
              <p className="text-sm text-gray-600">Performance Bonus</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Upcoming Payout */}
      <Card className="bg-green-50 border-green-200">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-green-600 rounded-full p-2">
                <CreditCard className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="font-medium text-green-800">Upcoming Payout</h3>
                <p className="text-sm text-green-700">Thursday, {format(new Date(), 'MMM dd')}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-green-600">N${weeklySummary.upcomingPayout.toFixed(0)}</p>
              <p className="text-sm text-green-700">Bank Transfer</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payout Method */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <CreditCard className="h-5 w-5" />
            <span>Payout Method</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Bank Transfer</p>
              <p className="text-sm text-gray-600">Standard Bank - ****1234</p>
            </div>
            <Badge className="bg-green-100 text-green-800">Active</Badge>
          </div>
        </CardContent>
      </Card>

      {/* Earnings History */}
      <Card>
        <CardHeader>
          <CardTitle>Earnings History</CardTitle>
        </CardHeader>
        <CardContent>
          {earningsHistory.length === 0 ? (
            <div className="text-center py-8">
              <DollarSign className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No earnings history yet</p>
              <p className="text-sm text-gray-500">Complete jobs to start earning</p>
            </div>
          ) : (
            <div className="space-y-3">
              {earningsHistory.map((earning) => (
                <div key={earning.id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
                  <div className="flex-1">
                    <p className="font-medium">{earning.job}</p>
                    <div className="flex items-center text-xs text-gray-500 mt-1">
                      <Calendar className="h-3 w-3 mr-1" />
                      {format(new Date(earning.date), 'MMM dd, yyyy')}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-green-600">N${earning.amount.toFixed(0)}</p>
                    <Badge className={`${getStatusColor(earning.status)} text-xs`}>
                      {earning.status === 'paid' ? (
                        <><CheckCircle className="h-3 w-3 mr-1" />Paid</>
                      ) : (
                        <><Clock className="h-3 w-3 mr-1" />Pending</>
                      )}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
