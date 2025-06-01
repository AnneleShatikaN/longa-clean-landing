
import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

interface UseRetryOptions {
  maxAttempts?: number;
  delay?: number;
  backoff?: boolean;
  onError?: (error: Error, attempt: number) => void;
}

export const useRetry = <T extends (...args: any[]) => Promise<any>>(
  fn: T,
  options: UseRetryOptions = {}
) => {
  const {
    maxAttempts = 3,
    delay = 1000,
    backoff = true,
    onError
  } = options;

  const [isRetrying, setIsRetrying] = useState(false);
  const [attemptCount, setAttemptCount] = useState(0);
  const { toast } = useToast();

  const executeWithRetry = useCallback(
    async (...args: Parameters<T>): Promise<Awaited<ReturnType<T>>> => {
      setIsRetrying(true);
      setAttemptCount(0);

      for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
          setAttemptCount(attempt);
          const result = await fn(...args);
          setIsRetrying(false);
          setAttemptCount(0);
          return result;
        } catch (error) {
          const isLastAttempt = attempt === maxAttempts;
          
          onError?.(error as Error, attempt);
          
          if (isLastAttempt) {
            setIsRetrying(false);
            setAttemptCount(0);
            
            toast({
              title: "Operation Failed",
              description: `Failed after ${maxAttempts} attempts. Please try again later.`,
              variant: "destructive"
            });
            
            throw error;
          }

          // Wait before retry with optional backoff
          const waitTime = backoff ? delay * Math.pow(2, attempt - 1) : delay;
          await new Promise(resolve => setTimeout(resolve, waitTime));
        }
      }

      throw new Error('Unexpected end of retry loop');
    },
    [fn, maxAttempts, delay, backoff, onError, toast]
  );

  return {
    executeWithRetry,
    isRetrying,
    attemptCount
  };
};
