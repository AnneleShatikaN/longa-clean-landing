
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, BookOpen, CheckCircle, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

export const UnverifiedProviderMessage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const startVerification = () => {
    // Check if provider category is set
    if (!user?.provider_category) {
      console.log('Provider category not set, redirecting to profile');
      navigate('/provider-profile', { 
        state: { 
          message: 'Please set your provider category first',
          highlightCategory: true,
          from: 'verification'
        }
      });
      return;
    }
    
    navigate('/provider-verification');
  };

  const startTraining = () => {
    // Check if provider category is set
    if (!user?.provider_category) {
      console.log('Provider category not set, redirecting to profile');
      navigate('/provider-profile', { 
        state: { 
          message: 'Please set your provider category to access training materials',
          highlightCategory: true,
          from: 'training'
        }
      });
      return;
    }
    
    navigate('/provider-academy');
  };

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Complete Your Provider Setup
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {!user?.provider_category && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Your provider category is not set. Please update your profile first.
              </AlertDescription>
            </Alert>
          )}
          
          <p className="text-gray-600">
            Welcome to our platform! To start receiving job requests, you need to complete your verification process.
          </p>
          
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 border rounded-lg">
              <BookOpen className="h-5 w-5 text-blue-500" />
              <div className="flex-1">
                <h3 className="font-medium">Step 1: Complete Training</h3>
                <p className="text-sm text-gray-600">
                  Learn about our platform standards and service requirements
                </p>
              </div>
              <Button onClick={startTraining} variant="outline" size="sm">
                Start Training
              </Button>
            </div>
            
            <div className="flex items-center gap-3 p-3 border rounded-lg">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <div className="flex-1">
                <h3 className="font-medium">Step 2: Submit Verification</h3>
                <p className="text-sm text-gray-600">
                  Upload required documents and complete verification
                </p>
              </div>
              <Button onClick={startVerification} size="sm">
                Start Verification
              </Button>
            </div>
          </div>
          
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-700">
              <strong>Need help?</strong> Contact our support team if you encounter any issues during the setup process.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
