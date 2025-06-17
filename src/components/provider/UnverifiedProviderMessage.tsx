
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Shield, FileText, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface UnverifiedProviderMessageProps {
  verificationStatus: string;
  onStartVerification?: () => void;
}

export const UnverifiedProviderMessage: React.FC<UnverifiedProviderMessageProps> = ({
  verificationStatus,
  onStartVerification
}) => {
  const navigate = useNavigate();

  const getStatusMessage = () => {
    switch (verificationStatus) {
      case 'pending':
        return {
          title: 'Verification Required',
          message: 'You need to complete the verification process before you can start receiving bookings.',
          action: 'Start Verification',
          icon: AlertTriangle,
          color: 'yellow'
        };
      case 'under_review':
        return {
          title: 'Verification Under Review',
          message: 'Your verification is currently being reviewed. This process typically takes 2-3 business days.',
          action: 'View Progress',
          icon: Clock,
          color: 'blue'
        };
      case 'rejected':
        return {
          title: 'Verification Rejected',
          message: 'Your verification was rejected. Please review the feedback and resubmit your application.',
          action: 'Resubmit Verification',
          icon: AlertTriangle,
          color: 'red'
        };
      default:
        return {
          title: 'Verification Incomplete',
          message: 'Please complete your verification to start receiving bookings.',
          action: 'Complete Verification',
          icon: Shield,
          color: 'gray'
        };
    }
  };

  const status = getStatusMessage();
  const Icon = status.icon;

  const colorClasses = {
    yellow: {
      bg: 'bg-yellow-50',
      border: 'border-yellow-200',
      icon: 'text-yellow-600',
      title: 'text-yellow-800',
      text: 'text-yellow-700',
      button: 'bg-yellow-600 hover:bg-yellow-700'
    },
    blue: {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      icon: 'text-blue-600',
      title: 'text-blue-800',
      text: 'text-blue-700',
      button: 'bg-blue-600 hover:bg-blue-700'
    },
    red: {
      bg: 'bg-red-50',
      border: 'border-red-200',
      icon: 'text-red-600',
      title: 'text-red-800',
      text: 'text-red-700',
      button: 'bg-red-600 hover:bg-red-700'
    },
    gray: {
      bg: 'bg-gray-50',
      border: 'border-gray-200',
      icon: 'text-gray-600',
      title: 'text-gray-800',
      text: 'text-gray-700',
      button: 'bg-gray-600 hover:bg-gray-700'
    }
  };

  const classes = colorClasses[status.color as keyof typeof colorClasses];

  return (
    <Card className={`${classes.bg} ${classes.border} border-2`}>
      <CardHeader>
        <CardTitle className={`flex items-center gap-3 ${classes.title}`}>
          <Icon className={`h-6 w-6 ${classes.icon}`} />
          {status.title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className={`${classes.text} leading-relaxed`}>
          {status.message}
        </p>

        {verificationStatus === 'pending' && (
          <div className={`p-4 rounded-lg border ${classes.border} bg-white`}>
            <h4 className="font-medium mb-2 flex items-center gap-2">
              <FileText className="h-4 w-4" />
              What you'll need:
            </h4>
            <ul className="text-sm space-y-1 text-gray-600">
              <li>• National ID or Passport</li>
              <li>• Proof of residence</li>
              <li>• Banking details for payments</li>
              <li>• Professional references (2 minimum)</li>
              <li>• Skills certificates (if applicable)</li>
            </ul>
          </div>
        )}

        {verificationStatus === 'under_review' && (
          <div className={`p-4 rounded-lg border ${classes.border} bg-white`}>
            <h4 className="font-medium mb-2">What's happening now:</h4>
            <ul className="text-sm space-y-1 text-gray-600">
              <li>• Our team is reviewing your documents</li>
              <li>• We may contact your references</li>
              <li>• Background checks are being processed</li>
              <li>• You'll receive an email when complete</li>
            </ul>
          </div>
        )}

        <div className="flex gap-3">
          <Button
            onClick={onStartVerification || (() => navigate('/provider-verification'))}
            className={`${classes.button} text-white`}
          >
            <Shield className="h-4 w-4 mr-2" />
            {status.action}
          </Button>
          
          <Button variant="outline" onClick={() => navigate('/provider-dashboard')}>
            Back to Dashboard
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
