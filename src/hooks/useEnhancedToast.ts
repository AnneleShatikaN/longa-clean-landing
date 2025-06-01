
import { useToast as useOriginalToast } from '@/hooks/use-toast';
import { CheckCircle, AlertTriangle, XCircle, Info } from 'lucide-react';

export const useEnhancedToast = () => {
  const { toast: originalToast, ...rest } = useOriginalToast();

  const toast = {
    success: (title: string, description?: string) => {
      return originalToast({
        title,
        description,
        className: 'border-green-200 bg-green-50',
      });
    },

    error: (title: string, description?: string) => {
      return originalToast({
        title,
        description,
        variant: 'destructive',
      });
    },

    warning: (title: string, description?: string) => {
      return originalToast({
        title,
        description,
        className: 'border-yellow-200 bg-yellow-50',
      });
    },

    info: (title: string, description?: string) => {
      return originalToast({
        title,
        description,
        className: 'border-blue-200 bg-blue-50',
      });
    },

    promise: async <T,>(
      promise: Promise<T>,
      {
        loading = 'Loading...',
        success = 'Success!',
        error = 'Something went wrong'
      }: {
        loading?: string;
        success?: string | ((data: T) => string);
        error?: string | ((error: any) => string);
      }
    ) => {
      const loadingToast = originalToast({
        title: loading,
        description: 'Please wait...',
      });

      try {
        const data = await promise;
        loadingToast.dismiss();
        
        const successMessage = typeof success === 'function' ? success(data) : success;
        originalToast({
          title: successMessage,
          className: 'border-green-200 bg-green-50',
        });
        
        return data;
      } catch (err) {
        loadingToast.dismiss();
        
        const errorMessage = typeof error === 'function' ? error(err) : error;
        originalToast({
          title: errorMessage,
          variant: 'destructive',
        });
        
        throw err;
      }
    }
  };

  return { toast, ...rest };
};
