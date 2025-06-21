
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, Save, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import TownSuburbSelector from '@/components/location/TownSuburbSelector';

const ProviderLocationSettings = () => {
  const { user, refreshUser } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // Location state
  const [town, setTown] = useState(user?.town || '');
  const [suburb, setSuburb] = useState(user?.suburb || '');
  const [maxDistance, setMaxDistance] = useState(user?.max_distance || 2);

  // Update local state when user data changes
  useEffect(() => {
    if (user) {
      setTown(user.town || '');
      setSuburb(user.suburb || '');
      setMaxDistance(user.max_distance || 2);
    }
  }, [user]);

  const handleSave = async () => {
    if (!user) return;

    if (!town || !suburb) {
      toast({
        title: "Missing Information",
        description: "Please select both town and suburb before saving.",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('users')
        .update({
          town,
          suburb,
          max_distance: maxDistance,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (error) throw error;

      // Refresh user data
      await refreshUser();

      toast({
        title: "Location Updated",
        description: `Your work location has been set to ${suburb}, ${town}. You'll now receive job assignments within ${maxDistance} distance levels.`,
      });
    } catch (error) {
      console.error('Error updating location:', error);
      toast({
        title: "Update Failed",
        description: "Failed to update your location. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const hasChanges = user?.town !== town || user?.suburb !== suburb || user?.max_distance !== maxDistance;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          Work Location Settings
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Current Location Display */}
        {user?.town && user?.suburb && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Badge className="bg-green-100 text-green-800">Current Location</Badge>
            </div>
            <p className="text-sm">
              <strong>{user.suburb}, {user.town}</strong>
            </p>
            <p className="text-xs text-gray-600 mt-1">
              Maximum distance: {user.max_distance} levels
            </p>
          </div>
        )}

        {/* Information Alert */}
        <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-1">Location-Based Job Assignment</p>
            <p>
              Set your preferred work location to receive automatic job assignments. 
              Jobs will be assigned based on proximity to your selected suburb and maximum distance preference.
            </p>
          </div>
        </div>

        {/* Location Form */}
        <div className="space-y-4">
          <TownSuburbSelector
            town={town}
            suburb={suburb}
            onTownChange={setTown}
            onSuburbChange={setSuburb}
            disabled={isSaving}
            showMaxDistance={true}
            maxDistance={maxDistance}
            onMaxDistanceChange={setMaxDistance}
            prefilterTown={user?.current_work_location ? 
              user.current_work_location.charAt(0).toUpperCase() + user.current_work_location.slice(1).replace('-', ' ') 
              : undefined
            }
          />
        </div>

        {/* Distance Explanation */}
        <div className="p-3 bg-gray-50 rounded-lg">
          <h4 className="text-sm font-medium mb-2">Distance Levels Explained:</h4>
          <ul className="text-xs space-y-1 text-gray-600">
            <li><strong>0:</strong> Same suburb only</li>
            <li><strong>1:</strong> Adjacent suburbs</li>
            <li><strong>2:</strong> Nearby suburbs (recommended)</li>
            <li><strong>3:</strong> Further suburbs</li>
            <li><strong>4:</strong> All suburbs in town</li>
          </ul>
        </div>

        {/* Save Button */}
        <Button 
          onClick={handleSave}
          disabled={isSaving || !hasChanges}
          className="w-full"
        >
          <Save className="h-4 w-4 mr-2" />
          {isSaving ? 'Saving Location...' : 'Save Location Settings'}
        </Button>

        {!hasChanges && user?.town && user?.suburb && (
          <p className="text-xs text-center text-gray-500">
            No changes to save
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default ProviderLocationSettings;
