
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type DataMode = 'live' | 'mock' | 'none';

interface DataModeContextType {
  dataMode: DataMode;
  setDataMode: (mode: DataMode) => void;
  mockData: any;
  isLoading: boolean;
}

const DataModeContext = createContext<DataModeContextType | undefined>(undefined);

export const DataModeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [dataMode, setDataMode] = useState<DataMode>('live');
  const [mockData, setMockData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const loadMockData = async () => {
      if (dataMode === 'mock') {
        setIsLoading(true);
        try {
          const response = await fetch('/data/admin_mock.json');
          const data = await response.json();
          setMockData(data);
        } catch (error) {
          console.error('Failed to load mock data:', error);
          setMockData(null);
        } finally {
          setIsLoading(false);
        }
      }
    };

    loadMockData();
  }, [dataMode]);

  return (
    <DataModeContext.Provider value={{
      dataMode,
      setDataMode,
      mockData,
      isLoading
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
