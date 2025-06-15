
import { useEffect } from 'react';
import { useDataMode } from '@/contexts/DataModeContext';
import { useToast } from '@/hooks/use-toast';

export const useGlobalDataMode = () => {
  const { dataMode, isDevelopmentMode } = useDataMode();
  const { toast } = useToast();

  useEffect(() => {
    const handleDataModeChange = (event: CustomEvent) => {
      const { newMode, previousMode } = event.detail;
      
      // Only show notification to users when data mode changes
      if (newMode !== previousMode) {
        const modeLabels = {
          live: 'Live Data',
          mock: 'Mock Data',
          none: 'No Data'
        };
        
        toast({
          title: "Data Source Updated",
          description: `Application switched to ${modeLabels[newMode]} mode by admin.`,
          duration: 4000,
        });
        
        console.log(`[useGlobalDataMode] Data mode changed to ${newMode}`);
      }
    };

    window.addEventListener('datamode-changed', handleDataModeChange as EventListener);
    
    return () => {
      window.removeEventListener('datamode-changed', handleDataModeChange as EventListener);
    };
  }, [toast]);

  return {
    dataMode,
    isDevelopmentMode
  };
};
