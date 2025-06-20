
import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Mail, RefreshCw } from 'lucide-react';
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

export const EmailVerificationBanner = () => {
  const { session } = useAuth();
  const [isResending, setIsResending] = useState(false);

  // Only show if user is signed in but email is not verified
  const needsVerification = session?.user && !session.user.email_confirmed_at;

  const handleResendVerification = async () => {
    if (!session?.user?.email) return;

    setIsResending(true);
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: session.user.email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth`
        }
      });

      if (error) {
        throw error;
      }

      toast.success('Verification email sent! Please check your inbox.');
    } catch (error: any) {
      console.error('Error resending verification:', error);
      toast.error('Failed to resend verification email. Please try again.');
    } finally {
      setIsResending(false);
    }
  };

  if (!needsVerification) return null;

  return (
    <Alert className="mb-6 bg-yellow-50 border-yellow-200">
      <Mail className="h-4 w-4" />
      <AlertDescription className="flex items-center justify-between">
        <span>Please verify your email address to access all features.</span>
        <Button
          variant="outline"
          size="sm"
          onClick={handleResendVerification}
          disabled={isResending}
          className="ml-4"
        >
          {isResending ? (
            <>
              <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
              Sending...
            </>
          ) : (
            <>
              <RefreshCw className="h-3 w-3 mr-1" />
              Resend
            </>
          )}
        </Button>
      </AlertDescription>
    </Alert>
  );
};
