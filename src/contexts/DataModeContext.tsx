
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';

export type DataMode = 'live' | 'mock' | 'none';

interface DataModeContextType {
  dataMode: DataMode;
  setDataMode: (mode: DataMode) => void;
  mockData: any;
  isLoading: boolean;
  isDevelopmentMode: boolean;
}

const DataModeContext = createContext<DataModeContextType | undefined>(undefined);

export const DataModeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Detect development mode
  const isDevelopmentMode = import.meta.env.DEV || window.location.hostname === 'localhost';
  
  // Initialize from localStorage as fallback or default to 'live'
  const [dataMode, setDataModeState] = useState<DataMode>(() => {
    const saved = localStorage.getItem('longa-data-mode');
    return (saved as DataMode) || 'live';
  });
  const [mockData, setMockData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch global settings from database
  const fetchGlobalSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('global_settings')
        .select('key, value')
        .eq('key', 'data_mode')
        .single();

      if (error) {
        console.log('[DataModeContext] Could not fetch global settings, using fallback:', error.message);
        return;
      }

      if (data?.value) {
        const newMode = JSON.parse(data.value) as DataMode;
        if (newMode !== dataMode) {
          setDataModeState(newMode);
          localStorage.setItem('longa-data-mode', newMode);
          console.log(`[DataModeContext] Fetched data mode from database: ${newMode}`);
        }
      }
    } catch (error) {
      console.error('[DataModeContext] Error fetching global settings:', error);
    }
  };

  // Enhanced setDataMode for admin users to update database
  const setDataMode = async (mode: DataMode) => {
    const previousMode = dataMode;
    
    try {
      // Try to update in database first (only works for admins)
      const { data, error } = await supabase.rpc('update_global_setting', {
        setting_key: 'data_mode',
        setting_value: JSON.stringify(mode)
      });

      if (error) {
        console.log('[DataModeContext] Could not update database, updating locally only:', error.message);
      } else if (data?.success) {
        console.log('[DataModeContext] Successfully updated global data mode in database');
      }
    } catch (error) {
      console.error('[DataModeContext] Error updating global setting:', error);
    }

    // Update local state regardless
    setDataModeState(mode);
    localStorage.setItem('longa-data-mode', mode);
    
    // Broadcast the change to other tabs/windows
    window.dispatchEvent(new CustomEvent('datamode-changed', { 
      detail: { newMode: mode, previousMode } 
    }));
    
    console.log(`[DataModeContext] Data mode changed from ${previousMode} to ${mode}`);
  };

  // Fetch global settings on mount
  useEffect(() => {
    fetchGlobalSettings();
  }, []);

  // Listen for real-time changes to global_settings
  useEffect(() => {
    const channel = supabase
      .channel('global_settings_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'global_settings',
          filter: 'key=eq.data_mode'
        },
        (payload) => {
          console.log('[DataModeContext] Received real-time global settings update:', payload);
          
          if (payload.new && payload.new.value) {
            const newMode = JSON.parse(payload.new.value) as DataMode;
            if (newMode !== dataMode) {
              const previousMode = dataMode;
              setDataModeState(newMode);
              localStorage.setItem('longa-data-mode', newMode);
              
              // Broadcast to other components
              window.dispatchEvent(new CustomEvent('datamode-changed', { 
                detail: { newMode, previousMode } 
              }));
              
              console.log(`[DataModeContext] Real-time update: data mode changed to ${newMode}`);
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [dataMode]);

  // Listen for data mode changes from other tabs/windows
  useEffect(() => {
    const handleDataModeChange = (event: CustomEvent) => {
      const { newMode } = event.detail;
      setDataModeState(newMode);
      console.log(`[DataModeContext] Received data mode change event: ${newMode}`);
    };

    // Listen for storage changes (cross-tab synchronization)
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'longa-data-mode' && event.newValue) {
        const newMode = event.newValue as DataMode;
        setDataModeState(newMode);
        console.log(`[DataModeContext] Data mode synchronized from storage: ${newMode}`);
      }
    };

    window.addEventListener('datamode-changed', handleDataModeChange as EventListener);
    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('datamode-changed', handleDataModeChange as EventListener);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  useEffect(() => {
    const loadMockData = async () => {
      if (dataMode === 'mock') {
        setIsLoading(true);
        try {
          // Load admin, launch, and provider mock data
          const [adminResponse, launchResponse, providerResponse] = await Promise.all([
            fetch('/data/admin_mock.json'),
            fetch('/data/launch_mock.json'),
            fetch('/data/provider_mock_data.json')
          ]);

          const adminData = await adminResponse.json();
          const launchData = await launchResponse.json();
          const providerData = await providerResponse.json();

          const merged = {
            admin: adminData,
            launch: launchData,
            provider: providerData,
          };

          setMockData(merged);
          console.log('[DataModeContext] Set mockData:', merged);
        } catch (error) {
          console.error('[DataModeContext] Failed to load mock data:', error);
          setMockData(null);
        } finally {
          setIsLoading(false);
        }
      } else {
        setMockData(null);
        console.log('[DataModeContext] Cleared mock data (not in mock mode)');
      }
    };

    loadMockData();
  }, [dataMode]);

  return (
    <DataModeContext.Provider value={{
      dataMode,
      setDataMode,
      mockData,
      isLoading,
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
