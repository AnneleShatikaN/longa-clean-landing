
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Mail, CheckCircle, RefreshCw, ArrowLeft } from 'lucide-react';
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

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
  const { toast } = useToast();

  const handleResendVerification = async () => {
    setIsResending(true);
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`
        }
      });

      if (error) {
        throw error;
      }

      toast({
        title: 'Verification email sent!',
        description: 'Please check your inbox and spam folder.',
      });
    } catch (error: any) {
      console.error('Error resending verification:', error);
      toast({
        title: 'Failed to resend email',
        description: error.message || 'Please try again later.',
        variant: 'destructive'
      });
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="shadow-lg">
          <CardHeader className="text-center pb-4">
            <div className="mx-auto mb-4 w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <Mail className="h-8 w-8 text-green-600" />
            </div>
            <CardTitle className="text-2xl text-gray-900">Check Your Email</CardTitle>
            <p className="text-gray-600 mt-2">
              Thanks for signing up! We've sent you a verification link.
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center">
              <p className="text-gray-700 mb-2">
                We sent a verification link to:
              </p>
              <p className="font-semibold text-gray-900 bg-gray-50 p-3 rounded-lg break-all">
                {email}
              </p>
            </div>
            
            <Alert className="border-blue-200 bg-blue-50">
              <CheckCircle className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-800">
                <strong>Next steps:</strong>
                <ol className="list-decimal list-inside mt-2 space-y-1">
                  <li>Check your email inbox (and spam folder)</li>
                  <li>Click the verification link in the email</li>
                  <li>Return here to sign in to your account</li>
                </ol>
              </AlertDescription>
            </Alert>

            <div className="space-y-3">
              <Button
                onClick={onBackToSignIn}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
                size="lg"
              >
                I've verified my email - Sign In
              </Button>
              
              <Button
                onClick={handleResendVerification}
                disabled={isResending}
                variant="outline"
                className="w-full"
                size="lg"
              >
                {isResending ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Resending verification email...
                  </>
                ) : (
                  <>
                    <Mail className="h-4 w-4 mr-2" />
                    Resend verification email
                  </>
                )}
              </Button>
              
              <Button
                variant="ghost"
                onClick={onBackToSignUp}
                className="w-full"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Sign Up
              </Button>
            </div>

            <div className="text-sm text-gray-500 bg-gray-50 p-4 rounded-lg">
              <p className="font-medium mb-2">Didn't receive the email?</p>
              <ul className="space-y-1">
                <li>• Check your spam/junk folder</li>
                <li>• Make sure the email address is correct</li>
                <li>• Try clicking "Resend verification email"</li>
                <li>• Wait a few minutes - emails can sometimes be delayed</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
