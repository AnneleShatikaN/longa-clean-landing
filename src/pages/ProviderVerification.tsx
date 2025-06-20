import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, AlertTriangle, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import ProviderVerificationForm from '@/components/provider/ProviderVerificationForm';

const ProviderVerification = () => {
  const navigate = useNavigate();
  const { user, isLoading: authLoading, isInitialized } = useAuth();
  const [verificationData, setVerificationData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Console logging for debugging
  console.log('ProviderVerification - Auth Debug:', {
    user,
    userRole: user?.role,
    authLoading,
    isInitialized,
    userId: user?.id
  });

  useEffect(() => {
    if (isInitialized && user?.role === 'provider') {
      fetchVerificationData();
    } else if (isInitialized) {
      setIsLoading(false);
    }
  }, [user, isInitialized]);

  const fetchVerificationData = async () => {
    if (!user) return;

    try {
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();

      if (userError) throw userError;

      setVerificationData({
        user: userData,
        documents: [],
        banking: [],
        references: []
      });
    } catch (error) {
      console.error('Error fetching verification data:', error);
      setError('Failed to load verification data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Show loading while auth is initializing
  if (!isInitialized || authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Card className="max-w-md mx-auto">
          <CardContent className="text-center p-8">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
            <p className="text-gray-600">Loading...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Access control - show clear access denied message
  if (!user || user.role !== 'provider') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle className="text-center text-red-600 flex items-center justify-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Access Denied
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-gray-600">
              This page is only accessible to service providers.
            </p>
            <div className="text-sm text-gray-500 space-y-1">
              <p>Current user: {user?.email || 'Not logged in'}</p>
              <p>Current role: {user?.role || 'No role assigned'}</p>
            </div>
            <div className="flex gap-2 justify-center">
              <Button variant="outline" onClick={() => navigate('/auth')}>
                Sign In as Provider
              </Button>
              <Button onClick={() => navigate('/')}>
                Go Home
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Loading state for verification data
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Loading verification data...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center gap-4 mb-8">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate(-1)}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            <h1 className="text-3xl font-bold text-gray-900">Provider Verification</h1>
          </div>
          
          <div className="max-w-2xl mx-auto">
            <Card className="border-red-200 bg-red-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-red-600">
                  <AlertTriangle className="h-5 w-5" />
                  Error Loading Verification
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-red-700">{error}</p>
                <div className="flex gap-2">
                  <Button 
                    onClick={() => window.location.reload()}
                    variant="outline"
                  >
                    Try Again
                  </Button>
                  <Button 
                    onClick={() => navigate('/provider-dashboard')}
                  >
                    Back to Dashboard
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  const verificationStatus = verificationData?.user?.verification_status || 'pending';
  const isVerificationComplete = verificationStatus === 'verified';

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(-1)}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <h1 className="text-3xl font-bold text-gray-900">Provider Verification</h1>
        </div>

        <div className="max-w-4xl mx-auto">
          {isVerificationComplete ? (
            <Card>
              <CardHeader>
                <CardTitle className="text-green-600">Verification Complete!</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  Your provider verification is complete. You can now start accepting bookings.
                </p>
                <Button onClick={() => navigate('/provider-dashboard')}>
                  Go to Provider Dashboard
                </Button>
              </CardContent>
            </Card>
          ) : (
            <ProviderVerificationForm />
          )}
        </div>
      </div>
    </div>
  );
};

export default ProviderVerification;
