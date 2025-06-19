
import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Mail, RefreshCw } from 'lucide-react';
import { useAuthEnhanced } from '@/hooks/useAuthEnhanced';

export const EmailVerificationBanner = () => {
  const { needsVerification, resendVerificationEmail } = useAuthEnhanced();

  if (!needsVerification) return null;

  return (
    <Alert className="mb-6 bg-yellow-50 border-yellow-200">
      <Mail className="h-4 w-4" />
      <AlertDescription className="flex items-center justify-between">
        <span>Please verify your email address to access all features.</span>
        <Button
          variant="outline"
          size="sm"
          onClick={resendVerificationEmail}
          className="ml-4"
        >
          <RefreshCw className="h-3 w-3 mr-1" />
          Resend
        </Button>
      </AlertDescription>
    </Alert>
  );
};
