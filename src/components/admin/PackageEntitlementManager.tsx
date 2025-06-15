
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Trash2, Plus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Service {
  id: string;
  name: string;
  service_type: string;
}

interface Entitlement {
  id: string;
  allowed_service_id: string;
  quantity_per_cycle: number;
  cycle_days: number;
  service_name?: string;
}

interface PackageEntitlementManagerProps {
  packageId: string;
  packageName: string;
  onClose: () => void;
}

export const PackageEntitlementManager: React.FC<PackageEntitlementManagerProps> = ({
  packageId,
  packageName,
  onClose
}) => {
  const [services, setServices] = useState<Service[]>([]);
  const [entitlements, setEntitlements] = useState<Entitlement[]>([]);
  const [newEntitlement, setNewEntitlement] = useState({
    serviceId: '',
    quantity: 1,
    cycleDays: 30
  });
  const { toast } = useToast();

  useEffect(() => {
    loadServices();
    loadEntitlements();
  }, [packageId]);

  const loadServices = async () => {
    try {
      const { data, error } = await supabase
        .from('services')
        .select('id, name, service_type')
        .eq('is_active', true)
        .neq('id', packageId); // Exclude the current package

      if (error) throw error;
      setServices(data || []);
    } catch (error) {
      console.error('Error loading services:', error);
    }
  };

  const loadEntitlements = async () => {
    try {
      const { data, error } = await supabase
        .from('package_entitlements')
        .select(`
          id,
          allowed_service_id,
          quantity_per_cycle,
          cycle_days,
          services!package_entitlements_allowed_service_id_fkey(name)
        `)
        .eq('package_id', packageId);

      if (error) throw error;
      
      const enrichedEntitlements = data?.map(item => ({
        id: item.id,
        allowed_service_id: item.allowed_service_id,
        quantity_per_cycle: item.quantity_per_cycle,
        cycle_days: item.cycle_days,
        service_name: (item.services as any)?.name
      })) || [];

      setEntitlements(enrichedEntitlements);
    } catch (error) {
      console.error('Error loading entitlements:', error);
    }
  };

  const addEntitlement = async () => {
    if (!newEntitlement.serviceId) {
      toast({
        title: "Error",
        description: "Please select a service",
        variant: "destructive"
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('package_entitlements')
        .insert({
          package_id: packageId,
          allowed_service_id: newEntitlement.serviceId,
          quantity_per_cycle: newEntitlement.quantity,
          cycle_days: newEntitlement.cycleDays
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Service entitlement added successfully"
      });

      setNewEntitlement({ serviceId: '', quantity: 1, cycleDays: 30 });
      loadEntitlements();
    } catch (error) {
      console.error('Error adding entitlement:', error);
      toast({
        title: "Error",
        description: "Failed to add service entitlement",
        variant: "destructive"
      });
    }
  };

  const removeEntitlement = async (entitlementId: string) => {
    try {
      const { error } = await supabase
        .from('package_entitlements')
        .delete()
        .eq('id', entitlementId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Service entitlement removed successfully"
      });

      loadEntitlements();
    } catch (error) {
      console.error('Error removing entitlement:', error);
      toast({
        title: "Error",
        description: "Failed to remove service entitlement",
        variant: "destructive"
      });
    }
  };

  return (
    <Card className="w-full max-w-4xl">
      <CardHeader>
        <CardTitle>Manage Service Entitlements - {packageName}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Current Entitlements */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Current Entitlements</h3>
          {entitlements.length > 0 ? (
            <div className="space-y-3">
              {entitlements.map((entitlement) => (
                <div key={entitlement.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <Badge variant="outline">{entitlement.service_name}</Badge>
                    <span className="text-sm text-gray-600">
                      {entitlement.quantity_per_cycle} uses per {entitlement.cycle_days} days
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeEntitlement(entitlement.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No service entitlements configured yet.</p>
          )}
        </div>

        {/* Add New Entitlement */}
        <div className="border-t pt-6">
          <h3 className="text-lg font-semibold mb-4">Add Service Entitlement</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="service">Service</Label>
              <Select value={newEntitlement.serviceId} onValueChange={(value) => 
                setNewEntitlement(prev => ({ ...prev, serviceId: value }))
              }>
                <SelectTrigger>
                  <SelectValue placeholder="Select service" />
                </SelectTrigger>
                <SelectContent>
                  {services.map((service) => (
                    <SelectItem key={service.id} value={service.id}>
                      {service.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="quantity">Quantity</Label>
              <Input
                type="number"
                min="1"
                value={newEntitlement.quantity}
                onChange={(e) => setNewEntitlement(prev => ({ 
                  ...prev, 
                  quantity: parseInt(e.target.value) || 1 
                }))}
              />
            </div>

            <div>
              <Label htmlFor="cycleDays">Cycle (Days)</Label>
              <Input
                type="number"
                min="1"
                value={newEntitlement.cycleDays}
                onChange={(e) => setNewEntitlement(prev => ({ 
                  ...prev, 
                  cycleDays: parseInt(e.target.value) || 30 
                }))}
              />
            </div>

            <div className="flex items-end">
              <Button onClick={addEntitlement} className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Add
              </Button>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
