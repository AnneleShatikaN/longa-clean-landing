
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Mail, CheckCircle, RefreshCw } from 'lucide-react';
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface EmailVerificationPromptProps {
  email: string;
  onBackToSignIn: () => void;
  onBackToSignUp: () => void;
}

export const EmailVerificationPrompt: React.FC<EmailVerificationPromptProps> = ({
  email,
  onBackToSignIn,
  onBackToSignUp
}) => {
  const [isResending, setIsResending] = useState(false);

  const handleResendVerification = async () => {
    setIsResending(true);
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email,
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <Mail className="h-6 w-6 text-green-600" />
            </div>
            <CardTitle>Check Your Email</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-gray-600">
              We've sent a verification link to:
            </p>
            <p className="font-semibold text-gray-900 break-all">{email}</p>
            
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                Click the verification link in your email to activate your account, then return here to sign in.
              </AlertDescription>
            </Alert>

            <div className="space-y-2">
              <Button
                onClick={onBackToSignIn}
                className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800"
              >
                I've verified my email - Sign In
              </Button>
              
              <Button
                onClick={handleResendVerification}
                disabled={isResending}
                variant="outline"
                className="w-full"
              >
                {isResending ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Resending...
                  </>
                ) : (
                  'Resend verification email'
                )}
              </Button>
              
              <Button
                variant="ghost"
                onClick={onBackToSignUp}
                className="w-full"
              >
                Back to Sign Up
              </Button>
            </div>

            <div className="text-sm text-gray-500 mt-4">
              <p>Didn't receive the email?</p>
              <ul className="text-left mt-2 space-y-1">
                <li>• Check your spam/junk folder</li>
                <li>• Make sure the email address is correct</li>
                <li>• Try resending the verification email</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
