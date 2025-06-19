
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Shield, Clock, XCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface VerificationStatusBannerProps {
  verificationStatus: string;
  className?: string;
}

export const VerificationStatusBanner: React.FC<VerificationStatusBannerProps> = ({
  verificationStatus,
  className = ''
}) => {
  const navigate = useNavigate();

  if (verificationStatus === 'verified') {
    return null; // Don't show banner if already verified
  }

  const getStatusConfig = () => {
    switch (verificationStatus) {
      case 'pending':
        return {
          icon: AlertTriangle,
          title: 'Verification Required',
          message: 'Complete your verification to start receiving job assignments.',
          actionText: 'Start Verification',
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200',
          textColor: 'text-yellow-800',
          iconColor: 'text-yellow-600'
        };
      case 'under_review':
        return {
          icon: Clock,
          title: 'Verification Under Review',
          message: 'Your verification is being processed. This usually takes 2-3 business days.',
          actionText: 'View Status',
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200',
          textColor: 'text-blue-800',
          iconColor: 'text-blue-600'
        };
      case 'rejected':
        return {
          icon: XCircle,
          title: 'Verification Rejected',
          message: 'Your verification was rejected. Please review feedback and resubmit.',
          actionText: 'Resubmit',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          textColor: 'text-red-800',
          iconColor: 'text-red-600'
        };
      default:
        return {
          icon: Shield,
          title: 'Complete Verification',
          message: 'Verify your account to start receiving job assignments.',
          actionText: 'Get Verified',
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-200',
          textColor: 'text-gray-800',
          iconColor: 'text-gray-600'
        };
    }
  };

  const config = getStatusConfig();
  const Icon = config.icon;

  return (
    <Card className={`${config.bgColor} ${config.borderColor} border-2 ${className}`}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Icon className={`h-5 w-5 ${config.iconColor}`} />
            <div>
              <h3 className={`font-medium ${config.textColor}`}>{config.title}</h3>
              <p className={`text-sm ${config.textColor} opacity-80`}>{config.message}</p>
            </div>
          </div>
          <Button
            onClick={() => navigate('/provider-verification')}
            size="sm"
            className={`${config.iconColor.replace('text-', 'bg-').replace('600', '600')} hover:${config.iconColor.replace('text-', 'bg-').replace('600', '700')} text-white`}
          >
            {config.actionText}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
