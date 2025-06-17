
import React from 'react';
import { MapPin } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useLocation } from '@/contexts/LocationContext';

interface LocationSelectorProps {
  className?: string;
  showIcon?: boolean;
}

export const LocationSelector: React.FC<LocationSelectorProps> = ({ 
  className = "",
  showIcon = true 
}) => {
  const { selectedLocation, setSelectedLocation, availableLocations } = useLocation();

  const selectedLocationLabel = availableLocations.find(
    loc => loc.value === selectedLocation
  )?.label || 'Select Location';

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {showIcon && <MapPin className="h-4 w-4 text-muted-foreground" />}
      <Select value={selectedLocation} onValueChange={setSelectedLocation}>
        <SelectTrigger className="w-[150px]">
          <SelectValue>{selectedLocationLabel}</SelectValue>
        </SelectTrigger>
        <SelectContent>
          {availableLocations.map((location) => (
            <SelectItem key={location.value} value={location.value}>
              {location.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
