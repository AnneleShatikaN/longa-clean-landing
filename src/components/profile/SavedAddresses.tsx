
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { MapPin, Plus, Edit, Trash2, Home } from 'lucide-react';

interface Address {
  id: string;
  label: string;
  street_address: string;
  city: string;
  region?: string;
  postal_code?: string;
  is_default: boolean;
}

interface SavedAddressesProps {
  userId: string;
}

export const SavedAddresses: React.FC<SavedAddressesProps> = ({ userId }) => {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newAddress, setNewAddress] = useState({
    label: '',
    street_address: '',
    city: '',
    region: '',
    postal_code: ''
  });
  const { toast } = useToast();

  const fetchAddresses = async () => {
    try {
      const { data, error } = await supabase
        .from('user_addresses')
        .select('*')
        .eq('user_id', userId)
        .order('is_default', { ascending: false });

      if (error) throw error;
      setAddresses(data || []);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch addresses",
        variant: "destructive"
      });
    }
  };

  const saveAddress = async () => {
    try {
      const { error } = await supabase
        .from('user_addresses')
        .insert({
          user_id: userId,
          ...newAddress,
          is_default: addresses.length === 0
        });

      if (error) throw error;

      setNewAddress({
        label: '',
        street_address: '',
        city: '',
        region: '',
        postal_code: ''
      });
      setIsAddingNew(false);
      fetchAddresses();
      
      toast({
        title: "Address saved",
        description: "Your address has been saved successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save address",
        variant: "destructive"
      });
    }
  };

  const deleteAddress = async (addressId: string) => {
    try {
      const { error } = await supabase
        .from('user_addresses')
        .delete()
        .eq('id', addressId);

      if (error) throw error;
      
      fetchAddresses();
      toast({
        title: "Address deleted",
        description: "Address has been removed",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete address",
        variant: "destructive"
      });
    }
  };

  const setDefaultAddress = async (addressId: string) => {
    try {
      // First remove default from all addresses
      await supabase
        .from('user_addresses')
        .update({ is_default: false })
        .eq('user_id', userId);

      // Then set the selected address as default
      const { error } = await supabase
        .from('user_addresses')
        .update({ is_default: true })
        .eq('id', addressId);

      if (error) throw error;
      
      fetchAddresses();
      toast({
        title: "Default address updated",
        description: "Default address has been changed",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update default address",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, [userId]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <MapPin className="w-5 h-5" />
            <span>Saved Addresses</span>
          </div>
          <Button
            onClick={() => setIsAddingNew(true)}
            size="sm"
            disabled={isAddingNew}
          >
            <Plus className="w-4 h-4 mr-1" />
            Add Address
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {isAddingNew && (
          <div className="p-4 border rounded-lg space-y-4">
            <h4 className="font-medium">Add New Address</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="label">Label</Label>
                <Input
                  id="label"
                  value={newAddress.label}
                  onChange={(e) => setNewAddress(prev => ({ ...prev, label: e.target.value }))}
                  placeholder="Home, Work, etc."
                />
              </div>
              <div>
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  value={newAddress.city}
                  onChange={(e) => setNewAddress(prev => ({ ...prev, city: e.target.value }))}
                  placeholder="Windhoek"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="street">Street Address</Label>
              <Input
                id="street"
                value={newAddress.street_address}
                onChange={(e) => setNewAddress(prev => ({ ...prev, street_address: e.target.value }))}
                placeholder="123 Main Street"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="region">Region</Label>
                <Input
                  id="region"
                  value={newAddress.region}
                  onChange={(e) => setNewAddress(prev => ({ ...prev, region: e.target.value }))}
                  placeholder="Khomas"
                />
              </div>
              <div>
                <Label htmlFor="postal">Postal Code</Label>
                <Input
                  id="postal"
                  value={newAddress.postal_code}
                  onChange={(e) => setNewAddress(prev => ({ ...prev, postal_code: e.target.value }))}
                  placeholder="9000"
                />
              </div>
            </div>
            <div className="flex space-x-2">
              <Button onClick={saveAddress}>Save Address</Button>
              <Button
                variant="outline"
                onClick={() => {
                  setIsAddingNew(false);
                  setNewAddress({
                    label: '',
                    street_address: '',
                    city: '',
                    region: '',
                    postal_code: ''
                  });
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}

        {addresses.map((address) => (
          <div key={address.id} className="p-4 border rounded-lg">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <Home className="w-4 h-4" />
                  <span className="font-medium">{address.label}</span>
                  {address.is_default && (
                    <Badge variant="default">Default</Badge>
                  )}
                </div>
                <p className="text-sm text-gray-600">
                  {address.street_address}
                </p>
                <p className="text-sm text-gray-600">
                  {address.city}{address.region && `, ${address.region}`}
                  {address.postal_code && ` ${address.postal_code}`}
                </p>
              </div>
              <div className="flex space-x-2">
                {!address.is_default && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setDefaultAddress(address.id)}
                  >
                    Set Default
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => deleteAddress(address.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        ))}

        {addresses.length === 0 && !isAddingNew && (
          <p className="text-center text-gray-500 py-8">
            No saved addresses yet. Add your first address to get started.
          </p>
        )}
      </CardContent>
    </Card>
  );
};
