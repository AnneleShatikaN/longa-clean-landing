import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, ListChecks, DollarSign, Users, ShieldCheck } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useSupabaseBookings } from '@/contexts/SupabaseBookingContext';
import { supabase } from '@/integrations/supabase/client';
import { UnverifiedProviderMessage } from './UnverifiedProviderMessage';

export const ProviderOverviewTab: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { bookings } = useSupabaseBookings();
  const [totalJobs, setTotalJobs] = useState(0);
  const [completedJobs, setCompletedJobs] = useState(0);
  const [totalEarnings, setTotalEarnings] = useState(0);
  const [verificationStatus, setVerificationStatus] = useState<string>('pending');

  useEffect(() => {
    if (user) {
      fetchProviderData();
      fetchVerificationStatus();
    }
  }, [user]);

  const fetchVerificationStatus = async () => {
    if (!user) return;
    
    try {
      const { data } = await supabase
        .from('users')
        .select('verification_status')
        .eq('id', user.id)
        .single();
        
      if (data) {
        setVerificationStatus(data.verification_status || 'pending');
      }
    } catch (error) {
      console.error('Error fetching verification status:', error);
    }
  };

  const fetchProviderData = async () => {
    if (!user) return;

    // Calculate total jobs and earnings from bookings
    const providerBookings = bookings.filter(booking => booking.provider_id === user.id);
    const completedProviderBookings = providerBookings.filter(booking => booking.status === 'completed');

    setTotalJobs(providerBookings.length);
    setCompletedJobs(completedProviderBookings.length);
    setTotalEarnings(completedProviderBookings.reduce((sum, booking) => sum + (booking.total_amount || 0), 0));
  };

  const isVerified = verificationStatus === 'verified';

  return (
    <div className="space-y-6">
      {/* Verification Status Alert */}
      {!isVerified && (
        <UnverifiedProviderMessage 
          verificationStatus={verificationStatus}
          onStartVerification={() => navigate('/provider-verification')}
        />
      )}

      {/* Only show dashboard content if verified */}
      {isVerified && (
        <>
          {/* Dashboard Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ListChecks className="h-4 w-4" />
                  Total Jobs
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalJobs}</div>
                <p className="text-gray-500">All jobs assigned to you</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Completed Jobs
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{completedJobs}</div>
                <p className="text-gray-500">Jobs marked as completed</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  Total Earnings
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">N${totalEarnings}</div>
                <p className="text-gray-500">Earnings from completed jobs</p>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button onClick={() => navigate('/provider-jobs')} className="flex items-center gap-2">
                <ListChecks className="h-4 w-4" />
                View Available Jobs
              </Button>
              <Button onClick={() => navigate('/provider-availability')} className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Manage Availability
              </Button>
            </CardContent>
          </Card>

          {/* Team Performance (Example) */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Team Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                This section will display your performance metrics compared to other providers.
              </p>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};

export { ProviderOverviewTab };
export default ProviderOverviewTab;
