
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface DataModeContextType {
  isDataMode: boolean;
  setDataMode: (mode: boolean) => void;
  isLoading: boolean;
}

const DataModeContext = createContext<DataModeContextType | undefined>(undefined);

export const DataModeProvider = ({ children }: { children: ReactNode }) => {
  const [isDataMode, setIsDataMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const fetchGlobalSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('global_settings')
        .select('key, value')
        .eq('key', 'data_mode')
        .maybeSingle(); // Use maybeSingle instead of single to handle no rows

      if (error) {
        console.info('[DataModeContext] Could not fetch global settings, using fallback:', error.message);
        setIsDataMode(false);
        return;
      }

      if (data) {
        const mode = data.value === '"mock"' || data.value === 'mock';
        setIsDataMode(mode);
        console.info('[DataModeContext] Data mode set to:', mode ? 'mock' : 'production');
      } else {
        console.info('[DataModeContext] No global settings found, defaulting to production mode');
        setIsDataMode(false);
      }
    } catch (error) {
      console.error('[DataModeContext] Error fetching global settings:', error);
      setIsDataMode(false);
    } finally {
      setIsLoading(false);
    }
  };

  const setDataMode = async (mode: boolean) => {
    setIsDataMode(mode);
    
    if (!mode) {
      console.info('[DataModeContext] Cleared mock data (not in mock mode)');
    }

    try {
      // Try to update the setting in the database
      const { error } = await supabase
        .from('global_settings')
        .upsert({
          key: 'data_mode',
          value: mode ? '"mock"' : '"production"',
          updated_at: new Date().toISOString()
        });

      if (error) {
        console.warn('[DataModeContext] Could not save data mode to database:', error.message);
      }
    } catch (error) {
      console.warn('[DataModeContext] Error saving data mode:', error);
    }
  };

  useEffect(() => {
    fetchGlobalSettings();
  }, []);

  return (
    <DataModeContext.Provider value={{ isDataMode, setDataMode, isLoading }}>
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

