
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';

export type DataMode = 'live';

interface DataModeContextType {
  isDataMode: boolean;
  dataMode: DataMode;
  setDataMode: (mode: boolean | DataMode) => void;
  isLoading: boolean;
  isDevelopmentMode: boolean;
}

const DataModeContext = createContext<DataModeContextType | undefined>(undefined);

export const DataModeProvider = ({ children }: { children: ReactNode }) => {
  const [isDataMode] = useState(false); // Always false since we only use live mode
  const [dataMode] = useState<DataMode>('live'); // Always live
  const [isLoading, setIsLoading] = useState(false); // No loading needed for fixed mode

  // Check if we're in development mode
  const isDevelopmentMode = import.meta.env.DEV || false;

  const setDataMode = async (mode: boolean | DataMode) => {
    // No-op since we only support live mode
    console.info('[DataModeContext] Application is set to live mode only');
  };

  useEffect(() => {
    // Set loading to false immediately since we don't need to fetch settings
    setIsLoading(false);
  }, []);

  return (
    <DataModeContext.Provider value={{ 
      isDataMode: false, // Always false for live mode
      dataMode: 'live', 
      setDataMode, 
      isLoading: false, 
      isDevelopmentMode
    }}>
      {children}
    </DataModeContext.Provider>
  );
};

export const useDataMode = () => {
  const context = useContext(DataModeContext);
  if (context === undefined) {
    throw new Error('useDataMode must be used within a DataModeProvider');
  }
  return context;
};
