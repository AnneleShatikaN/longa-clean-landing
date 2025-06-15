
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

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
  
  // Initialize from localStorage or default to 'live'
  const [dataMode, setDataModeState] = useState<DataMode>(() => {
    const saved = localStorage.getItem('longa-data-mode');
    return (saved as DataMode) || 'live';
  });
  const [mockData, setMockData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Enhanced setDataMode with global state broadcasting
  const setDataMode = (mode: DataMode) => {
    const previousMode = dataMode;
    setDataModeState(mode);
    localStorage.setItem('longa-data-mode', mode);
    
    // Broadcast the change to other tabs/windows
    window.dispatchEvent(new CustomEvent('datamode-changed', { 
      detail: { newMode: mode, previousMode } 
    }));
    
    console.log(`[DataModeContext] Data mode changed from ${previousMode} to ${mode}`);
  };

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
