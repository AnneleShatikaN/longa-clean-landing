
import React from 'react';
import { Loader2 } from 'lucide-react';

interface EnhancedLoadingProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const EnhancedLoading: React.FC<EnhancedLoadingProps> = ({ 
  message = 'Loading...',
  size = 'md',
  className = ''
}) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12'
  };

  return (
    <div className={`flex flex-col items-center justify-center space-y-2 ${className}`}>
      <Loader2 className={`${sizeClasses[size]} animate-spin text-purple-600`} />
      {message && <p className="text-sm text-gray-600">{message}</p>}
    </div>
  );
};
