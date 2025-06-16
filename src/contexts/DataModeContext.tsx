
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';

export type DataMode = 'live' | 'mock' | 'none';

interface DataModeContextType {
  isDataMode: boolean;
  dataMode: DataMode;
  setDataMode: (mode: boolean | DataMode) => void;
  isLoading: boolean;
  isDevelopmentMode: boolean;
  mockData?: any;
}

const DataModeContext = createContext<DataModeContextType | undefined>(undefined);

export const DataModeProvider = ({ children }: { children: ReactNode }) => {
  const [isDataMode, setIsDataMode] = useState(false);
  const [dataMode, setDataModeState] = useState<DataMode>('live');
  const [isLoading, setIsLoading] = useState(true);
  const [mockData, setMockData] = useState<any>(null);

  // Check if we're in development mode
  const isDevelopmentMode = import.meta.env.DEV || false;

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
        setDataModeState('live');
        return;
      }

      if (data) {
        const mode = data.value === '"mock"' || data.value === 'mock';
        setIsDataMode(mode);
        setDataModeState(mode ? 'mock' : 'live');
        console.info('[DataModeContext] Data mode set to:', mode ? 'mock' : 'live');
      } else {
        console.info('[DataModeContext] No global settings found, defaulting to live mode');
        setIsDataMode(false);
        setDataModeState('live');
      }
    } catch (error) {
      console.error('[DataModeContext] Error fetching global settings:', error);
      setIsDataMode(false);
      setDataModeState('live');
    } finally {
      setIsLoading(false);
    }
  };

  const loadMockData = async () => {
    try {
      // Load mock data from public JSON files
      const [adminResponse, launchResponse] = await Promise.all([
        fetch('/data/admin_mock.json'),
        fetch('/data/launch_mock.json')
      ]);

      const adminData = adminResponse.ok ? await adminResponse.json() : null;
      const launchData = launchResponse.ok ? await launchResponse.json() : null;

      setMockData({
        admin: adminData,
        launchData: launchData
      });
    } catch (error) {
      console.warn('[DataModeContext] Could not load mock data:', error);
      setMockData(null);
    }
  };

  const setDataMode = async (mode: boolean | DataMode) => {
    let newMode: DataMode;
    let booleanMode: boolean;

    if (typeof mode === 'boolean') {
      booleanMode = mode;
      newMode = mode ? 'mock' : 'live';
    } else {
      newMode = mode;
      booleanMode = mode === 'mock';
    }

    setIsDataMode(booleanMode);
    setDataModeState(newMode);
    
    if (newMode === 'mock' && !mockData) {
      await loadMockData();
    }

    if (!booleanMode) {
      console.info('[DataModeContext] Cleared mock data (not in mock mode)');
    }

    try {
      // Try to update the setting in the database
      const { error } = await supabase
        .from('global_settings')
        .upsert({
          key: 'data_mode',
          value: booleanMode ? '"mock"' : '"live"',
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

  useEffect(() => {
    if (dataMode === 'mock' && !mockData) {
      loadMockData();
    }
  }, [dataMode, mockData]);

  return (
    <DataModeContext.Provider value={{ 
      isDataMode, 
      dataMode, 
      setDataMode, 
      isLoading, 
      isDevelopmentMode,
      mockData 
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
