
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapPin, Save, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import TownSuburbSelector from '@/components/location/TownSuburbSelector';

const ProviderLocationSettings: React.FC = () => {
  const { user, refreshUser } = useAuth();
  const { toast } = useToast();
  
  const [town, setTown] = useState(user?.town || '');
  const [suburb, setSuburb] = useState(user?.suburb || '');
  const [maxDistance, setMaxDistance] = useState(user?.max_distance || 2);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if (user) {
      setTown(user.town || '');
      setSuburb(user.suburb || '');
      setMaxDistance(user.max_distance || 2);
    }
  }, [user]);

  const handleSave = async () => {
    if (!user || !town || !suburb) {
      toast({
        title: "Missing Information",
        description: "Please select both town and suburb",
        variant: "destructive",
      });
      return;
    }

    setIsUpdating(true);
    
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

      await refreshUser();
      
      toast({
        title: "Location Updated",
        description: `Your work location has been set to ${suburb}, ${town} with a ${maxDistance}-unit service radius.`,
      });
    } catch (error) {
      console.error('Error updating location:', error);
      toast({
        title: "Update Failed",
        description: "Failed to update your location settings. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5 text-blue-600" />
          Location & Service Area
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-blue-50 p-4 rounded-lg">
          <p className="text-sm text-blue-700">
            Set your work location and service radius. You'll automatically receive job assignments 
            within your specified distance from clients in your area.
          </p>
        </div>

        <TownSuburbSelector
          town={town}
          suburb={suburb}
          onTownChange={setTown}
          onSuburbChange={setSuburb}
          showMaxDistance={true}
          maxDistance={maxDistance}
          onMaxDistanceChange={setMaxDistance}
          disabled={isUpdating}
        />

        <Button
          onClick={handleSave}
          disabled={!town || !suburb || isUpdating}
          className="w-full"
        >
          {isUpdating ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Updating...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Save Location Settings
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};

export default ProviderLocationSettings;
