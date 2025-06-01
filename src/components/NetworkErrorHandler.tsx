
import React, { useState, useEffect } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { WifiOff, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface NetworkErrorHandlerProps {
  children: React.ReactNode;
}

export const NetworkErrorHandler: React.FC<NetworkErrorHandlerProps> = ({ children }) => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showRetryPrompt, setShowRetryPrompt] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowRetryPrompt(false);
      toast({
        title: "Connection Restored",
        description: "You're back online!",
      });
    };

    const handleOffline = () => {
      setIsOnline(false);
      toast({
        title: "Connection Lost",
        description: "You're currently offline. Some features may not work.",
        variant: "destructive"
      });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [toast]);

  const handleRetry = () => {
    if (navigator.onLine) {
      window.location.reload();
    } else {
      setShowRetryPrompt(true);
      setTimeout(() => setShowRetryPrompt(false), 3000);
    }
  };

  if (!isOnline) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Alert variant="destructive" className="m-4">
          <WifiOff className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>You're currently offline. Some features may not work properly.</span>
            <Button 
              size="sm" 
              variant="outline" 
              onClick={handleRetry}
              className="ml-4"
            >
              <RefreshCw className="h-4 w-4 mr-1" />
              Retry
            </Button>
          </AlertDescription>
        </Alert>
        
        {showRetryPrompt && (
          <Alert className="m-4 mt-0">
            <AlertDescription>
              Still offline. Please check your internet connection and try again.
            </AlertDescription>
          </Alert>
        )}
        
        <div className="flex-1 opacity-75 pointer-events-none">
          {children}
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

// Hook for network status
export const useNetworkStatus = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return { isOnline };
};
