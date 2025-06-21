
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Mail, CheckCircle, ArrowLeft } from "lucide-react";
import { toast } from 'sonner';

const EmailVerification = () => {
  const navigate = useNavigate();
  const { resendVerificationEmail } = useAuth();
  const [isResending, setIsResending] = useState(false);

  const handleResendVerification = async () => {
    try {
      setIsResending(true);
      await resendVerificationEmail();
      toast.success('Verification email sent! Please check your inbox.');
    } catch (error: any) {
      toast.error(error.message || 'Failed to resend verification email');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card>
          <CardHeader className="text-center">
            <Button
              variant="ghost"
              className="absolute top-4 left-4"
              onClick={() => navigate('/auth')}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div className="mx-auto mb-4 w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <Mail className="h-6 w-6 text-blue-600" />
            </div>
            <CardTitle>Verify Your Email</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-gray-600">
              We've sent a verification link to your email address. Please click the link to verify your account.
            </p>
            
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                After clicking the verification link, you'll be automatically signed in and redirected to your dashboard.
              </AlertDescription>
            </Alert>

            <div className="space-y-3">
              <Button
                onClick={handleResendVerification}
                disabled={isResending}
                className="w-full"
                variant="outline"
              >
                {isResending ? 'Sending...' : 'Resend Verification Email'}
              </Button>
              
              <Button
                onClick={() => navigate('/auth')}
                className="w-full"
              >
                Back to Sign In
              </Button>
            </div>

            <div className="text-xs text-gray-500 space-y-1">
              <p>Check your spam folder if you don't see the email.</p>
              <p>The verification link will expire in 24 hours.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EmailVerification;
