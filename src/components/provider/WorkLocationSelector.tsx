
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MapPin, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

const NAMIBIAN_TOWNS = [
  { value: 'windhoek', label: 'Windhoek' },
  { value: 'walvis-bay', label: 'Walvis Bay' },
  { value: 'swakopmund', label: 'Swakopmund' },
  { value: 'oshakati', label: 'Oshakati' },
  { value: 'rundu', label: 'Rundu' },
  { value: 'otjiwarongo', label: 'Otjiwarongo' },
  { value: 'gobabis', label: 'Gobabis' },
  { value: 'katima-mulilo', label: 'Katima Mulilo' },
  { value: 'tsumeb', label: 'Tsumeb' },
  { value: 'keetmanshoop', label: 'Keetmanshoop' },
  { value: 'rehoboth', label: 'Rehoboth' },
  { value: 'mariental', label: 'Mariental' }
];

interface WorkLocationSelectorProps {
  currentLocation?: string;
  onLocationUpdate?: (location: string) => void;
}

const WorkLocationSelector: React.FC<WorkLocationSelectorProps> = ({ 
  currentLocation, 
  onLocationUpdate 
}) => {
  const [selectedLocation, setSelectedLocation] = useState(currentLocation || '');
  const [isUpdating, setIsUpdating] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const handleUpdateLocation = async () => {
    if (!user || !selectedLocation) return;

    setIsUpdating(true);
    
    try {
      const { error } = await supabase
        .from('users')
        .update({ current_work_location: selectedLocation })
        .eq('id', user.id);

      if (error) throw error;

      toast({
        title: "Location updated successfully 🌍",
        description: "You'll now see jobs relevant to your selected location.",
      });

      onLocationUpdate?.(selectedLocation);
    } catch (error) {
      console.error('Error updating location:', error);
      toast({
        title: "Failed to update location",
        description: "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const getCurrentLocationLabel = () => {
    const town = NAMIBIAN_TOWNS.find(t => t.value === currentLocation);
    return town ? town.label : 'Not set';
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <MapPin className="h-5 w-5 text-purple-600" />
          Set Work Location
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="text-sm text-gray-600 mb-3">
            Your selected location helps us show you the most relevant jobs near you.
          </p>
          
          {currentLocation && (
            <div className="mb-3 p-2 bg-purple-50 rounded-lg">
              <p className="text-sm">
                <span className="font-medium text-purple-700">Current location:</span>{' '}
                <span className="text-purple-600">{getCurrentLocationLabel()}</span>
              </p>
            </div>
          )}
        </div>

        <div className="space-y-3">
          <Select value={selectedLocation} onValueChange={setSelectedLocation}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select your work location" />
            </SelectTrigger>
            <SelectContent className="bg-white">
              {NAMIBIAN_TOWNS.map((town) => (
                <SelectItem key={town.value} value={town.value}>
                  {town.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button
            onClick={handleUpdateLocation}
            disabled={!selectedLocation || selectedLocation === currentLocation || isUpdating}
            className="w-full bg-purple-600 hover:bg-purple-700"
          >
            <Save className="w-4 h-4 mr-2" />
            {isUpdating ? 'Updating...' : 'Update Location'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default WorkLocationSelector;
