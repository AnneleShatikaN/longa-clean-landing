
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MapPin, CheckCircle } from 'lucide-react';
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

interface FirstTimeLocationSetupProps {
  isOpen: boolean;
  onComplete: (location: string) => void;
}

const FirstTimeLocationSetup: React.FC<FirstTimeLocationSetupProps> = ({ 
  isOpen, 
  onComplete 
}) => {
  const [selectedLocation, setSelectedLocation] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const handleSetLocation = async () => {
    if (!user || !selectedLocation) return;

    setIsUpdating(true);
    
    try {
      const { error } = await supabase
        .from('users')
        .update({ current_work_location: selectedLocation })
        .eq('id', user.id);

      if (error) throw error;

      setIsCompleted(true);
      
      setTimeout(() => {
        onComplete(selectedLocation);
        toast({
          title: "Welcome to Longa! 🎉",
          description: "Your work location has been set. You can update it anytime in settings.",
        });
      }, 2000);
    } catch (error) {
      console.error('Error setting location:', error);
      toast({
        title: "Failed to set location",
        description: "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  if (isCompleted) {
    return (
      <Dialog open={isOpen} onOpenChange={() => {}}>
        <DialogContent className="sm:max-w-md" hideCloseButton>
          <div className="text-center py-6">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-green-700 mb-2">
              Location Set Successfully!
            </h2>
            <p className="text-gray-600">
              You're all set to start receiving job opportunities in your area.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-lg" hideCloseButton>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <MapPin className="h-6 w-6 text-purple-600" />
            Welcome to Longa!
          </DialogTitle>
          <DialogDescription className="text-base">
            To get started, please set your work location. This helps us show you the most relevant job opportunities in your area.
          </DialogDescription>
        </DialogHeader>
        
        <Card className="border-purple-100">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg text-purple-700">
              Choose Your Work Location
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                <SelectTrigger className="w-full h-12">
                  <SelectValue placeholder="Select your primary work location" />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  {NAMIBIAN_TOWNS.map((town) => (
                    <SelectItem key={town.value} value={town.value}>
                      {town.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <div className="text-sm text-gray-600 bg-purple-50 p-3 rounded-lg">
                💡 <strong>Tip:</strong> You can change your work location anytime in your profile settings.
              </div>

              <Button
                onClick={handleSetLocation}
                disabled={!selectedLocation || isUpdating}
                className="w-full h-12 bg-purple-600 hover:bg-purple-700 text-lg"
              >
                {isUpdating ? 'Setting Location...' : 'Set My Location'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  );
};

export default FirstTimeLocationSetup;
