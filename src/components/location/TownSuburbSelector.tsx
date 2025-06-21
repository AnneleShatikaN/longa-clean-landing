
import React from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface TownSuburbSelectorProps {
  town: string;
  suburb: string;
  onTownChange: (town: string) => void;
  onSuburbChange: (suburb: string) => void;
  disabled?: boolean;
  showMaxDistance?: boolean;
  maxDistance?: number;
  onMaxDistanceChange?: (distance: number) => void;
  prefilterTown?: string; // New prop to pre-filter based on provider's registered town
}

const TOWNS = [
  { value: 'Windhoek', label: 'Windhoek' },
  { value: 'Swakopmund', label: 'Swakopmund' },
  { value: 'Walvis Bay', label: 'Walvis Bay' }
];

const SUBURBS = {
  'Windhoek': [
    'Katutura', 'Wanaheda', 'Khomasdal', 'Havana', 'Otjomuise', 'Rocky Crest',
    'Hochland Park', 'Pioneerspark', 'Cimbebasia', 'Olympia', 'Suiderhof',
    'Kleine Kuppe', 'Auasblick', 'Eros', 'Windhoek West', 'CBD'
  ],
  'Swakopmund': [
    'Ocean View', 'Mile 4', 'Vineta', 'Kramersdorf', 'Swakop Central',
    'Mondesa', 'Tamariskia', 'DRC'
  ],
  'Walvis Bay': [
    'Meersig', 'Lagoon', 'Town', 'Narraville', 'Kuisebmond', 'Tutaleni'
  ]
};

const TownSuburbSelector: React.FC<TownSuburbSelectorProps> = ({
  town,
  suburb,
  onTownChange,
  onSuburbChange,
  disabled = false,
  showMaxDistance = false,
  maxDistance = 2,
  onMaxDistanceChange,
  prefilterTown
}) => {
  const handleTownChange = (newTown: string) => {
    onTownChange(newTown);
    // Reset suburb when town changes
    onSuburbChange('');
  };

  // Filter towns based on prefilterTown if provided
  const availableTowns = prefilterTown 
    ? TOWNS.filter(t => t.value === prefilterTown)
    : TOWNS;

  // Get suburbs for the selected town, or prefiltered town
  const selectedTown = town || prefilterTown;
  const availableSuburbs = selectedTown ? SUBURBS[selectedTown as keyof typeof SUBURBS] || [] : [];

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="town">Town</Label>
        <Select 
          value={town} 
          onValueChange={handleTownChange} 
          disabled={disabled || Boolean(prefilterTown)}
        >
          <SelectTrigger>
            <SelectValue placeholder={prefilterTown ? prefilterTown : "Select a town"} />
          </SelectTrigger>
          <SelectContent>
            {availableTowns.map((townOption) => (
              <SelectItem key={townOption.value} value={townOption.value}>
                {townOption.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {prefilterTown && (
          <p className="text-xs text-gray-600">
            Town is set based on your registration location: {prefilterTown}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="suburb">Suburb</Label>
        <Select 
          value={suburb} 
          onValueChange={onSuburbChange} 
          disabled={disabled || !selectedTown}
        >
          <SelectTrigger>
            <SelectValue placeholder={selectedTown ? "Select a suburb" : "Select a town first"} />
          </SelectTrigger>
          <SelectContent>
            {availableSuburbs.map((suburbOption) => (
              <SelectItem key={suburbOption} value={suburbOption}>
                {suburbOption}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {showMaxDistance && (
        <div className="space-y-2">
          <Label htmlFor="maxDistance">Maximum Distance (0 = same suburb, 4 = furthest)</Label>
          <Select 
            value={maxDistance.toString()} 
            onValueChange={(value) => onMaxDistanceChange?.(parseInt(value))}
            disabled={disabled}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="0">0 - Same suburb only</SelectItem>
              <SelectItem value="1">1 - Adjacent suburbs</SelectItem>
              <SelectItem value="2">2 - Nearby suburbs</SelectItem>
              <SelectItem value="3">3 - Further suburbs</SelectItem>
              <SelectItem value="4">4 - All suburbs in town</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}
    </div>
  );
};

export default TownSuburbSelector;
