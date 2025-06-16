
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Trash2, Plus, DollarSign } from 'lucide-react';
import { useServices } from '@/contexts/ServiceContext';

interface PackageInclusion {
  service_id: string;
  quantity_per_package: number;
  provider_fee_per_job: number;
}

interface PackageData {
  name: string;
  price: number;
  description?: string;
  duration_days: number;
  inclusions: PackageInclusion[];
}

interface EnhancedPackageFormProps {
  onClose: () => void;
  onSave: (packageData: PackageData) => void;
}

export const EnhancedPackageForm: React.FC<EnhancedPackageFormProps> = ({
  onClose,
  onSave
}) => {
  const { services } = useServices();
  const [formData, setFormData] = useState<PackageData>({
    name: '',
    price: 0,
    description: '',
    duration_days: 30,
    inclusions: []
  });

  const addServiceInclusion = () => {
    setFormData(prev => ({
      ...prev,
      inclusions: [...prev.inclusions, {
        service_id: '',
        quantity_per_package: 1,
        provider_fee_per_job: 0
      }]
    }));
  };

  const updateInclusion = (index: number, field: keyof PackageInclusion, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      inclusions: prev.inclusions.map((inclusion, i) => 
        i === index ? { ...inclusion, [field]: value } : inclusion
      )
    }));
  };

  const removeInclusion = (index: number) => {
    setFormData(prev => ({
      ...prev,
      inclusions: prev.inclusions.filter((_, i) => i !== index)
    }));
  };

  const calculateTotalValue = () => {
    return formData.inclusions.reduce((total, inclusion) => {
      const service = services.find(s => s.id === inclusion.service_id);
      return total + (service?.clientPrice || 0) * inclusion.quantity_per_package;
    }, 0);
  };

  const calculateTotalProviderCost = () => {
    return formData.inclusions.reduce((total, inclusion) => {
      return total + inclusion.provider_fee_per_job * inclusion.quantity_per_package;
    }, 0);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || formData.price <= 0) {
      return;
    }

    if (formData.inclusions.length === 0) {
      return;
    }

    // Validate all inclusions have required data
    const hasInvalidInclusions = formData.inclusions.some(
      inclusion => !inclusion.service_id || inclusion.quantity_per_package <= 0 || inclusion.provider_fee_per_job < 0
    );

    if (hasInvalidInclusions) {
      return;
    }

    onSave(formData);
  };

  const totalValue = calculateTotalValue();
  const totalProviderCost = calculateTotalProviderCost();
  const potentialSavings = totalValue - formData.price;
  const grossProfit = formData.price - totalProviderCost;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Package Name</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Enter package name"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="price">Package Price (N$)</Label>
          <Input
            id="price"
            type="number"
            step="0.01"
            value={formData.price}
            onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
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
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Describe what's included in this package..."
          rows={3}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="duration">Duration (Days)</Label>
        <Input
          id="duration"
          type="number"
          value={formData.duration_days}
          onChange={(e) => setFormData({ ...formData, duration_days: parseInt(e.target.value) || 30 })}
          placeholder="30"
          required
        />
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Service Inclusions</CardTitle>
            <Button type="button" onClick={addServiceInclusion} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Service
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {formData.inclusions.map((inclusion, index) => {
            const selectedService = services.find(s => s.id === inclusion.service_id);
            
            return (
              <div key={index} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">Service {index + 1}</h4>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeInclusion(index)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="space-y-2">
                    <Label>Service</Label>
                    <Select
                      value={inclusion.service_id}
                      onValueChange={(value) => updateInclusion(index, 'service_id', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select service" />
                      </SelectTrigger>
                      <SelectContent>
                        {services.filter(service => 
                          !formData.inclusions.some((inc, i) => i !== index && inc.service_id === service.id)
                        ).map((service) => (
                          <SelectItem key={service.id} value={service.id}>
                            {service.name} (N${service.clientPrice})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Quantity</Label>
                    <Input
                      type="number"
                      min="1"
                      value={inclusion.quantity_per_package}
                      onChange={(e) => updateInclusion(index, 'quantity_per_package', parseInt(e.target.value) || 1)}
                      placeholder="1"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Provider Fee per Job (N$)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      value={inclusion.provider_fee_per_job}
                      onChange={(e) => updateInclusion(index, 'provider_fee_per_job', parseFloat(e.target.value) || 0)}
                      placeholder="0.00"
                    />
                  </div>
                </div>

                {selectedService && (
                  <div className="bg-gray-50 p-3 rounded text-sm">
                    <div className="flex justify-between">
                      <span>Service Value:</span>
                      <span>N${(selectedService.clientPrice * inclusion.quantity_per_package).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Total Provider Cost:</span>
                      <span>N${(inclusion.provider_fee_per_job * inclusion.quantity_per_package).toFixed(2)}</span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {formData.inclusions.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <p>No services added yet. Click "Add Service" to get started.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Package Summary */}
      {formData.inclusions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Package Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="space-y-1">
                <p className="text-gray-500">Total Service Value</p>
                <p className="text-lg font-semibold">N${totalValue.toFixed(2)}</p>
              </div>
              <div className="space-y-1">
                <p className="text-gray-500">Package Price</p>
                <p className="text-lg font-semibold">N${formData.price.toFixed(2)}</p>
              </div>
              <div className="space-y-1">
                <p className="text-gray-500">Customer Savings</p>
                <p className={`text-lg font-semibold ${potentialSavings > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  N${potentialSavings.toFixed(2)}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-gray-500">Gross Profit</p>
                <p className={`text-lg font-semibold ${grossProfit > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  N${grossProfit.toFixed(2)}
                </p>
              </div>
            </div>

            {potentialSavings > 0 && (
              <Badge variant="default" className="mt-3">
                <DollarSign className="h-3 w-3 mr-1" />
                {((potentialSavings / totalValue) * 100).toFixed(1)}% savings for customers
              </Badge>
            )}
          </CardContent>
        </Card>
      )}

      <div className="flex justify-end space-x-3">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button 
          type="submit"
          disabled={!formData.name || formData.price <= 0 || formData.inclusions.length === 0}
        >
          Create Package
        </Button>
      </div>
    </form>
  );
};
