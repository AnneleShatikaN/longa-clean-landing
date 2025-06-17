
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Shield, Clock, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';

interface VerificationStatusBadgeProps {
  status: string;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
}

export const VerificationStatusBadge: React.FC<VerificationStatusBadgeProps> = ({ 
  status, 
  size = 'md',
  showIcon = true 
}) => {
  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'verified':
        return {
          label: 'Verified',
          variant: 'default' as const,
          className: 'bg-green-100 text-green-800 border-green-200',
          icon: CheckCircle
        };
      case 'under_review':
        return {
          label: 'Under Review',
          variant: 'secondary' as const,
          className: 'bg-blue-100 text-blue-800 border-blue-200',
          icon: Clock
        };
      case 'rejected':
        return {
          label: 'Rejected',
          variant: 'destructive' as const,
          className: 'bg-red-100 text-red-800 border-red-200',
          icon: XCircle
        };
      case 'pending':
        return {
          label: 'Pending',
          variant: 'outline' as const,
          className: 'bg-yellow-100 text-yellow-800 border-yellow-200',
          icon: AlertTriangle
        };
      default:
        return {
          label: 'Unknown',
          variant: 'outline' as const,
          className: 'bg-gray-100 text-gray-800 border-gray-200',
          icon: Shield
        };
    }
  };

  const config = getStatusConfig(status);
  const Icon = config.icon;
  
  const sizeClasses = {
    sm: 'text-xs px-2 py-1',
    md: 'text-sm px-2.5 py-1',
    lg: 'text-base px-3 py-1.5'
  };

  const iconSizes = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5'
  };

  return (
    <Badge 
      variant={config.variant}
      className={`${config.className} ${sizeClasses[size]} flex items-center gap-1.5`}
    >
      {showIcon && <Icon className={iconSizes[size]} />}
      {config.label}
    </Badge>
  );
};
