
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Search, Package, DollarSign } from 'lucide-react';
import { useServices } from '@/contexts/ServiceContext';
import { useToast } from '@/hooks/use-toast';

interface PackageFormProps {
  onClose: () => void;
  onSave: (packageData: PackageData) => void;
}

interface PackageData {
  name: string;
  price: number;
  description?: string;
  serviceIds: string[];
}

export const PackageForm: React.FC<PackageFormProps> = ({ onClose, onSave }) => {
  const { services, isLoading } = useServices();
  const { toast } = useToast();
  const [formData, setFormData] = useState<PackageData>({
    name: '',
    price: 0,
    description: '',
    serviceIds: []
  });
  const [searchQuery, setSearchQuery] = useState('');

  const activeServices = services.filter(service => service.status === 'active');
  const filteredServices = activeServices.filter(service =>
    service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    service.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleServiceToggle = (serviceId: string) => {
    setFormData(prev => ({
      ...prev,
      serviceIds: prev.serviceIds.includes(serviceId)
        ? prev.serviceIds.filter(id => id !== serviceId)
        : [...prev.serviceIds, serviceId]
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast({
        title: "Error",
        description: "Package name is required",
        variant: "destructive"
      });
      return;
    }

    if (formData.price <= 0) {
      toast({
        title: "Error",
        description: "Package price must be greater than 0",
        variant: "destructive"
      });
      return;
    }

    if (formData.serviceIds.length === 0) {
      toast({
        title: "Error",
        description: "Please select at least one service for this package",
        variant: "destructive"
      });
      return;
    }

    onSave(formData);
  };

  const getSelectedServicesTotal = () => {
    return formData.serviceIds.reduce((total, serviceId) => {
      const service = services.find(s => s.id === serviceId);
      return total + (service?.clientPrice || 0);
    }, 0);
  };

  const selectedServicesTotal = getSelectedServicesTotal();

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="h-5 w-5" />
          Create New Package
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Package Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="name">Package Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., Premium Home Care Package"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="price">Package Price (N$) *</Label>
              <Input
                id="price"
                type="number"
                min="0"
                step="0.01"
                value={formData.price}
                onChange={(e) => setFormData(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                placeholder="0.00"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Describe what this package includes and its benefits..."
              rows={3}
            />
          </div>

          {/* Service Selection */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Select Services</h3>
              <Badge variant="outline" className="flex items-center gap-1">
                <DollarSign className="h-3 w-3" />
                Individual Total: N${selectedServicesTotal.toFixed(2)}
              </Badge>
            </div>

            {/* Search Services */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search services..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Services List */}
            <div className="max-h-96 overflow-y-auto border rounded-md p-4 space-y-3">
              {isLoading ? (
                <div className="text-center py-8 text-gray-500">Loading services...</div>
              ) : filteredServices.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  {searchQuery ? 'No services found matching your search' : 'No active services available'}
                </div>
              ) : (
                filteredServices.map((service) => (
                  <div key={service.id} className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50">
                    <Checkbox
                      id={`service-${service.id}`}
                      checked={formData.serviceIds.includes(service.id)}
                      onCheckedChange={() => handleServiceToggle(service.id)}
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor={`service-${service.id}`} className="font-medium cursor-pointer">
                            {service.name}
                          </Label>
                          <p className="text-sm text-gray-600">{service.description}</p>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">N${service.clientPrice}</div>
                          <div className="text-sm text-gray-500">{service.duration.hours}h {service.duration.minutes}m</div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {formData.serviceIds.length > 0 && (
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">Selected Services ({formData.serviceIds.length})</span>
                  <span className="font-medium">Package Price: N${formData.price.toFixed(2)}</span>
                </div>
                {formData.price < selectedServicesTotal && (
                  <div className="text-sm text-blue-600">
                    Savings: N${(selectedServicesTotal - formData.price).toFixed(2)} 
                    ({(((selectedServicesTotal - formData.price) / selectedServicesTotal) * 100).toFixed(1)}% off)
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Form Actions */}
          <div className="flex justify-end gap-3 pt-6 border-t">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              Create Package
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
