
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { CheckCircle, X, Clock, AlertCircle } from 'lucide-react';
import { LoadingState, ErrorState } from '@/components/common/ErrorBoundaryWrapper';

type BookingStatus = 'pending' | 'accepted' | 'in_progress' | 'completed' | 'cancelled';

interface ProviderActionsProps {
  jobId: string;
  currentStatus: BookingStatus;
  onStatusChange: (newStatus: BookingStatus) => void;
}

export const EnhancedProviderActions: React.FC<ProviderActionsProps> = ({
  jobId,
  currentStatus,
  onStatusChange
}) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleAction = async (action: string, newStatus: BookingStatus) => {
    setIsLoading(action);
    setError(null);

    try {
      const { error: updateError } = await supabase
        .from('bookings')
        .update({ 
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', jobId);

      if (updateError) throw updateError;

      onStatusChange(newStatus);

      toast({
        title: "Action Completed",
        description: `Job ${action} successfully`,
      });

    } catch (err: any) {
      const errorMessage = err.message || 'An unexpected error occurred';
      setError(errorMessage);
      
      toast({
        title: "Action Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(null);
    }
  };

  const retryAction = () => {
    setError(null);
  };

  if (error) {
    return (
      <ErrorState
        title="Action Failed"
        message={error}
        onRetry={retryAction}
      />
    );
  }

  return (
    <div className="flex gap-2">
      {currentStatus === 'pending' && (
        <>
          <Button
            onClick={() => handleAction('accepted', 'accepted')}
            disabled={isLoading !== null}
            className="bg-green-600 hover:bg-green-700"
          >
            {isLoading === 'accepted' ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Accepting...</span>
              </div>
            ) : (
              <>
                <CheckCircle className="h-4 w-4 mr-2" />
                Accept
              </>
            )}
          </Button>
          <Button
            onClick={() => handleAction('declined', 'cancelled')}
            disabled={isLoading !== null}
            variant="outline"
            className="border-red-300 text-red-600 hover:bg-red-50"
          >
            {isLoading === 'declined' ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                <span>Declining...</span>
              </div>
            ) : (
              <>
                <X className="h-4 w-4 mr-2" />
                Decline
              </>
            )}
          </Button>
        </>
      )}

      {currentStatus === 'accepted' && (
        <Button
          onClick={() => handleAction('started', 'in_progress')}
          disabled={isLoading !== null}
          className="bg-blue-600 hover:bg-blue-700"
        >
          {isLoading === 'started' ? (
            <div className="flex items-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              <span>Starting...</span>
            </div>
          ) : (
            <>
              <Clock className="h-4 w-4 mr-2" />
              Start Job
            </>
          )}
        </Button>
      )}

      {currentStatus === 'in_progress' && (
        <Button
          onClick={() => handleAction('completed', 'completed')}
          disabled={isLoading !== null}
          className="bg-green-600 hover:bg-green-700"
        >
          {isLoading === 'completed' ? (
            <div className="flex items-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              <span>Completing...</span>
            </div>
          ) : (
            <>
              <CheckCircle className="h-4 w-4 mr-2" />
              Complete
            </>
          )}
        </Button>
      )}
    </div>
  );
};
