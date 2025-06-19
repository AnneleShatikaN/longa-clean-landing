
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { useProviderData } from '@/hooks/useProviderData';
import { ProviderOverviewTab } from '@/components/provider/ProviderOverviewTab';
import { RealTimeBookingManager } from '@/components/booking/RealTimeBookingManager';
import { VerificationStatusBanner } from '@/components/provider/VerificationStatusBanner';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { 
  Calendar, 
  DollarSign, 
  ArrowLeft 
} from 'lucide-react';

const ProviderDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { data: providerData, isLoading, error, isValidProvider } = useProviderData();
  const [verificationStatus, setVerificationStatus] = useState<string>('pending');

  useEffect(() => {
    if (user) {
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

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Please Sign In</h1>
          <p className="text-gray-600 mb-6">You need to be logged in as a provider to access this dashboard</p>
          <Button onClick={() => navigate('/auth')}>
            Sign In
          </Button>
        </div>
      </div>
    );
  }

  if (!isValidProvider) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600 mb-6">This dashboard is only accessible to active service providers</p>
          <Button onClick={() => navigate('/')}>
            Go Home
          </Button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Error Loading Dashboard</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <Button onClick={() => window.location.reload()}>
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(-1)}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Provider Dashboard
            </h1>
            <p className="text-gray-600">
              Welcome back, {providerData?.profile?.name || user.full_name}!
            </p>
          </div>
        </div>

        {/* Verification Status Banner - only show if not verified */}
        {verificationStatus !== 'verified' && (
          <div className="mb-6">
            <VerificationStatusBanner verificationStatus={verificationStatus} />
          </div>
        )}

        {/* Dashboard Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="jobs">Jobs & Bookings</TabsTrigger>
            <TabsTrigger value="earnings">Earnings</TabsTrigger>
            <TabsTrigger value="profile">Profile</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <ProviderOverviewTab 
              profile={providerData?.profile}
              stats={{
                totalEarnings: providerData?.monthlyEarnings.reduce((sum, month) => sum + month.amount, 0) || 0,
                pendingPayouts: 0,
                thisWeekEarnings: 0,
                availableJobs: providerData?.jobs.filter(j => j.status === 'requested').length || 0,
                completedJobs: providerData?.jobs.filter(j => j.status === 'completed').length || 0,
                averageRating: providerData?.profile?.rating || 0
              }}
            />
          </TabsContent>

          <TabsContent value="jobs">
            <RealTimeBookingManager />
          </TabsContent>

          <TabsContent value="earnings">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Earnings Overview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Detailed earnings breakdown and payout history will be displayed here.
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle>Profile Settings</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Profile management and settings will be displayed here.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ProviderDashboard;
