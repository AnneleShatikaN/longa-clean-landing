
import React from 'react';
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface LoadingProps {
  variant?: 'spinner' | 'skeleton' | 'pulse' | 'dots';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  text?: string;
  fullScreen?: boolean;
}

export const Loading: React.FC<LoadingProps> = ({ 
  variant = 'spinner', 
  size = 'md', 
  className,
  text,
  fullScreen = false
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  const containerClass = fullScreen 
    ? "fixed inset-0 bg-white/80 backdrop-blur-sm z-50 flex items-center justify-center"
    : "flex items-center justify-center";

  if (variant === 'skeleton') {
    return (
      <div className={cn("space-y-2", className)}>
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
      </div>
    );
  }

  if (variant === 'pulse') {
    return (
      <div className={cn("animate-pulse bg-gray-200 rounded", className)} />
    );
  }

  if (variant === 'dots') {
    return (
      <div className={cn(containerClass, className)}>
        <div className="flex space-x-1">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className={cn(
                "rounded-full bg-purple-600 animate-pulse",
                size === 'sm' ? 'w-2 h-2' : size === 'lg' ? 'w-4 h-4' : 'w-3 h-3'
              )}
              style={{
                animationDelay: `${i * 0.2}s`,
                animationDuration: '1s'
              }}
            />
          ))}
        </div>
        {text && (
          <p className="text-sm text-gray-600 animate-pulse ml-3">{text}</p>
        )}
      </div>
    );
  }

  return (
    <div className={cn(containerClass, className)}>
      <div className="flex flex-col items-center space-y-2">
        <div 
          className={cn(
            "animate-spin rounded-full border-2 border-gray-300 border-t-purple-600",
            sizeClasses[size]
          )}
          role="status"
          aria-label="Loading"
        />
        {text && (
          <p className="text-sm text-gray-600 animate-pulse">{text}</p>
        )}
      </div>
    </div>
  );
};

export const TableSkeleton: React.FC<{ rows?: number; columns?: number }> = ({ 
  rows = 5, 
  columns = 4 
}) => {
  return (
    <div className="space-y-2">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex space-x-4">
          {Array.from({ length: columns }).map((_, j) => (
            <Skeleton key={j} className="h-10 flex-1" />
          ))}
        </div>
      ))}
    </div>
  );
};

export const CardSkeleton: React.FC = () => {
  return (
    <div className="p-6 space-y-4">
      <Skeleton className="h-6 w-1/3" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-2/3" />
      <div className="flex space-x-2">
        <Skeleton className="h-8 w-20" />
        <Skeleton className="h-8 w-20" />
      </div>
    </div>
  );
};

export const PageLoader: React.FC<{ text?: string }> = ({ text = "Loading page..." }) => {
  return <Loading variant="spinner" size="lg" text={text} fullScreen />;
};

export const InlineLoader: React.FC<{ text?: string }> = ({ text }) => {
  return <Loading variant="dots" size="sm" text={text} className="py-4" />;
};
