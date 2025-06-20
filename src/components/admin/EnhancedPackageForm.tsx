
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Plus, Minus, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useEnhancedPackages } from '@/hooks/useEnhancedPackages';
import { useServicesEnhanced } from '@/hooks/useServicesEnhanced';

interface PackageFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

interface ServiceInclusion {
  service_id: string;
  quantity: number;
  provider_payout: number;
}

const EnhancedPackageForm: React.FC<PackageFormProps> = ({ onSuccess, onCancel }) => {
  const { toast } = useToast();
  const { createPackage } = useEnhancedPackages();
  const { services } = useServicesEnhanced();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    total_price: '',
    service_inclusions: [] as ServiceInclusion[]
  });

  const addServiceInclusion = () => {
    setFormData(prev => ({
      ...prev,
      service_inclusions: [
        ...prev.service_inclusions,
        { service_id: '', quantity: 1, provider_payout: 0 }
      ]
    }));
  };

  const removeServiceInclusion = (index: number) => {
    setFormData(prev => ({
      ...prev,
      service_inclusions: prev.service_inclusions.filter((_, i) => i !== index)
    }));
  };

  const updateServiceInclusion = (index: number, field: keyof ServiceInclusion, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      service_inclusions: prev.service_inclusions.map((inclusion, i) =>
        i === index ? { ...inclusion, [field]: value } : inclusion
      )
    }));
  };

  const calculateTotals = () => {
    const totalProviderPayout = formData.service_inclusions.reduce(
      (sum, inc) => sum + (inc.provider_payout * inc.quantity), 0
    );
    const totalPrice = parseFloat(formData.total_price) || 0;
    const grossProfit = totalPrice - totalProviderPayout;
    
    return { totalProviderPayout, grossProfit };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.total_price || formData.service_inclusions.length === 0) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields and add at least one service.",
        variant: "destructive",
      });
      return;
    }

    // Validate service inclusions
    const invalidInclusions = formData.service_inclusions.some(
      inc => !inc.service_id || inc.quantity <= 0 || inc.provider_payout <= 0
    );

    if (invalidInclusions) {
      toast({
        title: "Validation Error",
        description: "Please ensure all service inclusions have valid service, quantity, and payout amounts.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSubmitting(true);
      
      console.log('Creating package with data:', formData);
      
      await createPackage({
        name: formData.name,
        description: formData.description,
        total_price: parseFloat(formData.total_price),
        service_inclusions: formData.service_inclusions
      });
      
      console.log('Package created successfully');
      
      toast({
        title: "Success!",
        description: `Package "${formData.name}" has been created successfully.`,
      });
      
      onSuccess();
    } catch (error) {
      console.error('Error creating package:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create package. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const { totalProviderPayout, grossProfit } = calculateTotals();

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Create New Package</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Package Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., Premium Home Care Package"
                required
              />
            </div>
            <div>
              <Label htmlFor="total_price">Total Price (N$) *</Label>
              <Input
                id="total_price"
                type="number"
                step="0.01"
                min="0"
                value={formData.total_price}
                onChange={(e) => setFormData(prev => ({ ...prev, total_price: e.target.value }))}
                placeholder="0.00"
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Describe what this package includes..."
              rows={3}
            />
          </div>

          {/* Service Inclusions */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <Label className="text-lg font-semibold">Service Inclusions *</Label>
              <Button type="button" onClick={addServiceInclusion} variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Add Service
              </Button>
            </div>

            {formData.service_inclusions.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No services added yet. Click "Add Service" to get started.</p>
            ) : (
              <div className="space-y-4">
                {formData.service_inclusions.map((inclusion, index) => (
                  <Card key={index} className="p-4">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                      <div>
                        <Label>Service</Label>
                        <Select
                          value={inclusion.service_id}
                          onValueChange={(value) => updateServiceInclusion(index, 'service_id', value)}
                        >
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
                        <Label>Quantity</Label>
                        <Input
                          type="number"
                          min="1"
                          value={inclusion.quantity}
                          onChange={(e) => updateServiceInclusion(index, 'quantity', parseInt(e.target.value) || 1)}
                        />
                      </div>

                      <div>
                        <Label>Provider Payout (N$)</Label>
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          value={inclusion.provider_payout}
                          onChange={(e) => updateServiceInclusion(index, 'provider_payout', parseFloat(e.target.value) || 0)}
                        />
                      </div>

                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={() => removeServiceInclusion(index)}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Financial Summary */}
          {formData.service_inclusions.length > 0 && (
            <Card className="p-4 bg-gray-50">
              <h3 className="font-semibold mb-3">Financial Summary</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Total Price:</span>
                  <p className="font-semibold text-lg">N${parseFloat(formData.total_price || '0').toFixed(2)}</p>
                </div>
                <div>
                  <span className="text-gray-600">Total Provider Payouts:</span>
                  <p className="font-semibold text-lg text-orange-600">N${totalProviderPayout.toFixed(2)}</p>
                </div>
                <div>
                  <span className="text-gray-600">Gross Profit:</span>
                  <p className={`font-semibold text-lg ${grossProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    N${grossProfit.toFixed(2)}
                  </p>
                </div>
              </div>
            </Card>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              <Save className="h-4 w-4 mr-2" />
              {isSubmitting ? 'Creating Package...' : 'Create Package'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default EnhancedPackageForm;
