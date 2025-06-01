
import { useEffect, useRef } from 'react';
import { useDebounce } from './useDebounce';
import { useToast } from '@/hooks/use-toast';

interface UseAutoSaveOptions<T> {
  delay?: number;
  onSave: (data: T) => Promise<void>;
  enabled?: boolean;
}

export const useAutoSave = <T>(
  data: T,
  options: UseAutoSaveOptions<T>
) => {
  const { delay = 2000, onSave, enabled = true } = options;
  const debouncedData = useDebounce(data, delay);
  const previousDataRef = useRef<T>();
  const isFirstRender = useRef(true);
  const { toast } = useToast();

  useEffect(() => {
    // Skip first render
    if (isFirstRender.current) {
      isFirstRender.current = false;
      previousDataRef.current = debouncedData;
      return;
    }

    // Only save if data has changed and auto-save is enabled
    if (
      enabled &&
      JSON.stringify(debouncedData) !== JSON.stringify(previousDataRef.current)
    ) {
      const saveData = async () => {
        try {
          await onSave(debouncedData);
          toast({
            title: "Auto-saved",
            description: "Your changes have been saved automatically.",
          });
        } catch (error) {
          console.error('Auto-save failed:', error);
          toast({
            title: "Auto-save failed",
            description: "Your changes could not be saved. Please save manually.",
            variant: "destructive"
          });
        }
      };

      saveData();
      previousDataRef.current = debouncedData;
    }
  }, [debouncedData, enabled, onSave, toast]);
};
