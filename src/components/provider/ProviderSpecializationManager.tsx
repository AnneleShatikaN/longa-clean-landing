
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Trash2, Star } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const EXPERTISE_LEVELS = [
  { value: 'beginner', label: 'Beginner', color: 'bg-gray-100 text-gray-800' },
  { value: 'intermediate', label: 'Intermediate', color: 'bg-blue-100 text-blue-800' },
  { value: 'advanced', label: 'Advanced', color: 'bg-green-100 text-green-800' },
  { value: 'expert', label: 'Expert', color: 'bg-purple-100 text-purple-800' }
];

export const ProviderSpecializationManager: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [specializations, setSpecializations] = useState([]);
  const [services, setServices] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddSpecialization, setShowAddSpecialization] = useState(false);

  const [newSpecialization, setNewSpecialization] = useState({
    service_id: '',
    expertise_level: 'intermediate',
    years_experience: 0,
    certification_details: ''
  });

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      // Fetch current specializations
      const { data: specializationsData, error: specializationsError } = await supabase
        .from('provider_specializations')
        .select(`
          *,
          service:services(*)
        `)
        .eq('provider_id', user.id);

      if (specializationsError) throw specializationsError;

      // Fetch all available services
      const { data: servicesData, error: servicesError } = await supabase
        .from('services')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (servicesError) throw servicesError;

      setSpecializations(specializationsData || []);
      setServices(servicesData || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: "Error",
        description: "Failed to fetch specialization data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddSpecialization = async () => {
    try {
      const certificationDetails = newSpecialization.certification_details ? 
        { notes: newSpecialization.certification_details } : {};

      const { error } = await supabase
        .from('provider_specializations')
        .insert({
          provider_id: user.id,
          service_id: newSpecialization.service_id,
          expertise_level: newSpecialization.expertise_level,
          years_experience: newSpecialization.years_experience,
          certification_details: certificationDetails
        });

      if (error) throw error;

      toast({
        title: "Specialization Added",
        description: "Your specialization has been added successfully.",
      });

      setNewSpecialization({
        service_id: '',
        expertise_level: 'intermediate',
        years_experience: 0,
        certification_details: ''
      });
      setShowAddSpecialization(false);
      fetchData();
    } catch (error) {
      console.error('Error adding specialization:', error);
      toast({
        title: "Error",
        description: "Failed to add specialization",
        variant: "destructive",
      });
    }
  };

  const handleDeleteSpecialization = async (id: string) => {
    try {
      const { error } = await supabase
        .from('provider_specializations')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Specialization Removed",
        description: "Specialization has been removed.",
      });
      fetchData();
    } catch (error) {
      console.error('Error deleting specialization:', error);
      toast({
        title: "Error",
        description: "Failed to remove specialization",
        variant: "destructive",
      });
    }
  };

  const getExpertiseConfig = (level: string) => {
    return EXPERTISE_LEVELS.find(l => l.value === level) || EXPERTISE_LEVELS[0];
  };

  const getAvailableServices = () => {
    const specializedServiceIds = specializations.map(s => s.service_id);
    return services.filter(service => !specializedServiceIds.includes(service.id));
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <p className="text-gray-600">Loading specialization data...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Service Specializations</CardTitle>
          <Dialog open={showAddSpecialization} onOpenChange={setShowAddSpecialization}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" disabled={getAvailableServices().length === 0}>
                <Plus className="h-4 w-4 mr-1" />
                Add Specialization
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Service Specialization</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Service</Label>
                  <Select
                    value={newSpecialization.service_id}
                    onValueChange={(value) => setNewSpecialization({
                      ...newSpecialization,
                      service_id: value
                    })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a service" />
                    </SelectTrigger>
                    <SelectContent>
                      {getAvailableServices().map((service) => (
                        <SelectItem key={service.id} value={service.id}>
                          {service.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Expertise Level</Label>
                  <Select
                    value={newSpecialization.expertise_level}
                    onValueChange={(value) => setNewSpecialization({
                      ...newSpecialization,
                      expertise_level: value
                    })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {EXPERTISE_LEVELS.map((level) => (
                        <SelectItem key={level.value} value={level.value}>
                          {level.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Years of Experience</Label>
                  <Input
                    type="number"
                    min="0"
                    value={newSpecialization.years_experience}
                    onChange={(e) => setNewSpecialization({
                      ...newSpecialization,
                      years_experience: parseInt(e.target.value) || 0
                    })}
                  />
                </div>

                <div>
                  <Label>Certifications / Additional Notes (Optional)</Label>
                  <Textarea
                    value={newSpecialization.certification_details}
                    onChange={(e) => setNewSpecialization({
                      ...newSpecialization,
                      certification_details: e.target.value
                    })}
                    placeholder="Relevant certifications, training, or additional details..."
                    rows={3}
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setShowAddSpecialization(false)}>
                    Cancel
                  </Button>
                  <Button
                    onClick={handleAddSpecialization}
                    disabled={!newSpecialization.service_id}
                  >
                    Add Specialization
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
        <p className="text-sm text-gray-600">
          Add your service specializations to help administrators assign relevant jobs to you
        </p>
      </CardHeader>
      <CardContent>
        {specializations.length === 0 ? (
          <p className="text-center text-gray-600 py-8">
            No specializations added yet. Add your expertise to receive more relevant job assignments.
          </p>
        ) : (
          <div className="space-y-4">
            {specializations.map((spec) => {
              const expertiseConfig = getExpertiseConfig(spec.expertise_level);
              return (
                <div key={spec.id} className="flex items-center justify-between p-4 border rounded">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="font-medium">{spec.service?.name}</h4>
                      <Badge className={expertiseConfig.color}>
                        {expertiseConfig.label}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Star className="h-3 w-3" />
                        <span>{spec.years_experience} years experience</span>
                      </div>
                    </div>

                    {spec.certification_details?.notes && (
                      <p className="text-sm text-gray-600 mt-2">
                        {spec.certification_details.notes}
                      </p>
                    )}
                  </div>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteSpecialization(spec.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              );
            })}
          </div>
        )}

        {getAvailableServices().length === 0 && specializations.length > 0 && (
          <p className="text-sm text-gray-500 mt-4 text-center">
            You have added specializations for all available services.
          </p>
        )}
      </CardContent>
    </Card>
  );
};
