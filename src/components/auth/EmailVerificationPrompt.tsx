
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Mail, AlertCircle } from 'lucide-react';

interface EmailVerificationPromptProps {
  isOpen: boolean;
  onClose: () => void;
  email: string;
  onResendVerification?: () => void;
}

export const EmailVerificationPrompt: React.FC<EmailVerificationPromptProps> = ({
  isOpen,
  onClose,
  email,
  onResendVerification
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5 text-purple-600" />
            Email Verification Required
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Please verify your email address before accessing the provider dashboard.
            </AlertDescription>
          </Alert>
          
          <div className="text-sm text-gray-600 space-y-2">
            <p>We've sent a verification email to:</p>
            <p className="font-medium text-gray-900 bg-gray-50 p-2 rounded">{email}</p>
            <p>Click the verification link in the email to activate your account and access all dashboard features.</p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-2">
            {onResendVerification && (
              <Button 
                variant="outline" 
                onClick={onResendVerification}
                className="flex-1"
              >
                Resend Email
              </Button>
            )}
            <Button 
              onClick={onClose}
              className="flex-1 bg-purple-600 hover:bg-purple-700"
            >
              I'll Check My Email
            </Button>
          </div>
          
          <div className="text-xs text-gray-500 text-center">
            Check your spam folder if you don't see the email within a few minutes.
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
