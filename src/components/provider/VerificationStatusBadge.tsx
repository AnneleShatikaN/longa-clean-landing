
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Shield, Clock, CheckCircle, XCircle } from 'lucide-react';

interface VerificationStatusBadgeProps {
  status: string;
  size?: 'sm' | 'md' | 'lg';
}

export const VerificationStatusBadge: React.FC<VerificationStatusBadgeProps> = ({
  status,
  size = 'md'
}) => {
  const getStatusConfig = () => {
    switch (status) {
      case 'verified':
        return {
          icon: CheckCircle,
          label: 'Verified',
          className: 'bg-green-100 text-green-800 border-green-200'
        };
      case 'under_review':
        return {
          icon: Clock,
          label: 'Under Review',
          className: 'bg-blue-100 text-blue-800 border-blue-200'
        };
      case 'rejected':
        return {
          icon: XCircle,
          label: 'Rejected',
          className: 'bg-red-100 text-red-800 border-red-200'
        };
      case 'pending':
      default:
        return {
          icon: Shield,
          label: 'Pending',
          className: 'bg-yellow-100 text-yellow-800 border-yellow-200'
        };
    }
  };

  const config = getStatusConfig();
  const Icon = config.icon;
  const iconSize = size === 'sm' ? 'h-3 w-3' : size === 'lg' ? 'h-5 w-5' : 'h-4 w-4';

  return (
    <Badge variant="outline" className={`${config.className} flex items-center gap-1`}>
      <Icon className={iconSize} />
      {config.label}
    </Badge>
  );
};
