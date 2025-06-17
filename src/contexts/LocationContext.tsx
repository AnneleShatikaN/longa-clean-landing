
import React, { createContext, useContext, useState, useEffect } from 'react';

interface LocationContextType {
  selectedLocation: string;
  setSelectedLocation: (location: string) => void;
  availableLocations: { value: string; label: string }[];
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

const AVAILABLE_LOCATIONS = [
  { value: 'windhoek', label: 'Windhoek' },
  { value: 'walvis_bay', label: 'Walvis Bay' },
  { value: 'swakopmund', label: 'Swakopmund' },
  { value: 'oshakati', label: 'Oshakati' },
  { value: 'rundu', label: 'Rundu' },
  { value: 'katima_mulilo', label: 'Katima Mulilo' }
];

export const LocationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [selectedLocation, setSelectedLocation] = useState<string>('windhoek');

  // Load saved location from localStorage on mount
  useEffect(() => {
    const savedLocation = localStorage.getItem('selectedLocation');
    if (savedLocation && AVAILABLE_LOCATIONS.some(loc => loc.value === savedLocation)) {
      setSelectedLocation(savedLocation);
    }
  }, []);

  // Save location to localStorage when it changes
  const handleLocationChange = (location: string) => {
    setSelectedLocation(location);
    localStorage.setItem('selectedLocation', location);
  };

  return (
    <LocationContext.Provider value={{
      selectedLocation,
      setSelectedLocation: handleLocationChange,
      availableLocations: AVAILABLE_LOCATIONS
    }}>
      {children}
    </LocationContext.Provider>
  );
};

export const useLocation = () => {
  const context = useContext(LocationContext);
  if (context === undefined) {
    throw new Error('useLocation must be used within a LocationProvider');
  }
  return context;
};
