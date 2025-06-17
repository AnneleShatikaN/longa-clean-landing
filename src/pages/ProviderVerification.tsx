
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { ProviderVerificationForm } from '@/components/provider/ProviderVerificationForm';
import { VerificationProgressTracker } from '@/components/provider/VerificationProgressTracker';
import { UnverifiedProviderMessage } from '@/components/provider/UnverifiedProviderMessage';

const ProviderVerification = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [verificationData, setVerificationData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user?.role === 'provider') {
      fetchVerificationData();
    }
  }, [user]);

  const fetchVerificationData = async () => {
    if (!user) return;

    try {
      const [userRes, docsRes, bankingRes, refsRes] = await Promise.all([
        supabase.from('users').select('*').eq('id', user.id).single(),
        supabase.from('provider_documents').select('*').eq('provider_id', user.id),
        supabase.from('provider_banking_details').select('*').eq('provider_id', user.id),
        supabase.from('provider_references').select('*').eq('provider_id', user.id)
      ]);

      setVerificationData({
        user: userRes.data,
        documents: docsRes.data || [],
        banking: bankingRes.data || [],
        references: refsRes.data || []
      });
    } catch (error) {
      console.error('Error fetching verification data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!user || user.role !== 'provider') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600 mb-6">This page is only accessible to service providers</p>
          <Button onClick={() => navigate('/auth')}>
            Sign In as Provider
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
          <p className="text-gray-600">Loading verification data...</p>
        </div>
      </div>
    );
  }

  const verificationStatus = verificationData?.user?.verification_status || 'pending';
  const isVerificationComplete = verificationStatus === 'verified';
  const hasSubmitted = verificationData?.user?.verification_submitted_at;

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
          ) : hasSubmitted ? (
            <div className="space-y-6">
              <VerificationProgressTracker
                verificationStatus={verificationStatus}
                documentsUploaded={verificationData?.documents?.length || 0}
                totalDocuments={4}
                bankingDetailsComplete={verificationData?.banking?.length > 0}
                referencesComplete={verificationData?.references?.length >= 2}
              />
              <UnverifiedProviderMessage 
                verificationStatus={verificationStatus}
                onStartVerification={() => {
                  // Reset to allow resubmission if needed
                  window.location.reload();
                }}
              />
            </div>
          ) : (
            <ProviderVerificationForm />
          )}
        </div>
      </div>
    </div>
  );
};

export default ProviderVerification;
