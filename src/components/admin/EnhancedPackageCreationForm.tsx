
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Trash2, Plus, DollarSign, Calculator } from 'lucide-react';
import { useServices } from '@/contexts/ServiceContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface ServiceInclusion {
  service_id: string;
  quantity: number;
  provider_payout: number;
}

interface PackageFormData {
  name: string;
  description: string;
  total_price: number;
  service_inclusions: ServiceInclusion[];
}

interface EnhancedPackageCreationFormProps {
  onClose: () => void;
  onSuccess: () => void;
  editingPackage?: any;
}

export const EnhancedPackageCreationForm: React.FC<EnhancedPackageCreationFormProps> = ({
  onClose,
  onSuccess,
  editingPackage
}) => {
  const { services } = useServices();
  const { toast } = useToast();
  const [formData, setFormData] = useState<PackageFormData>({
    name: editingPackage?.name || '',
    description: editingPackage?.description || '',
    total_price: editingPackage?.total_price || 0,
    service_inclusions: editingPackage?.package_service_inclusions?.map((inc: any) => ({
      service_id: inc.service_id,
      quantity: inc.quantity_per_package,
      provider_payout: inc.provider_fee_per_job
    })) || []
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const activeServices = services.filter(service => service.status === 'active');

  const addServiceInclusion = () => {
    setFormData(prev => ({
      ...prev,
      service_inclusions: [...prev.service_inclusions, {
        service_id: '',
        quantity: 1,
        provider_payout: 0
      }]
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

  const removeServiceInclusion = (index: number) => {
    setFormData(prev => ({
      ...prev,
      service_inclusions: prev.service_inclusions.filter((_, i) => i !== index)
    }));
  };

  // Real-time calculations
  const calculations = React.useMemo(() => {
    const totalServiceValue = formData.service_inclusions.reduce((total, inclusion) => {
      const service = services.find(s => s.id === inclusion.service_id);
      return total + (service?.clientPrice || 0) * inclusion.quantity;
    }, 0);

    const totalProviderPayout = formData.service_inclusions.reduce((total, inclusion) => {
      return total + inclusion.provider_payout * inclusion.quantity;
    }, 0);

    const clientSavings = totalServiceValue - formData.total_price;
    const grossProfit = formData.total_price - totalProviderPayout;

    return {
      totalServiceValue,
      totalProviderPayout,
      clientSavings,
      grossProfit,
      savingsPercentage: totalServiceValue > 0 ? (clientSavings / totalServiceValue) * 100 : 0
    };
  }, [formData, services]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast({
        title: "Error",
        description: "Package name is required",
        variant: "destructive"
      });
      return;
    }

    if (formData.total_price <= 0) {
      toast({
        title: "Error",
        description: "Package price must be greater than 0",
        variant: "destructive"
      });
      return;
    }

    if (formData.service_inclusions.length === 0) {
      toast({
        title: "Error",
        description: "Please add at least one service to the package",
        variant: "destructive"
      });
      return;
    }

    // Validate all service inclusions
    const hasInvalidInclusions = formData.service_inclusions.some(
      inclusion => !inclusion.service_id || inclusion.quantity <= 0 || inclusion.provider_payout < 0
    );

    if (hasInvalidInclusions) {
      toast({
        title: "Error",
        description: "Please fill in all service inclusion details correctly",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsSubmitting(true);

      // Single transaction to save package and inclusions
      const { data: packageData, error: packageError } = await supabase
        .from('subscription_packages')
        .upsert({
          id: editingPackage?.id,
          name: formData.name,
          description: formData.description,
          price: formData.total_price,
          total_price: formData.total_price,
          total_provider_payout: calculations.totalProviderPayout,
          gross_profit: calculations.grossProfit,
          is_active: true
        })
        .select()
        .single();

      if (packageError) throw packageError;

      // Delete existing inclusions if editing
      if (editingPackage?.id) {
        await supabase
          .from('package_service_inclusions')
          .delete()
          .eq('package_id', editingPackage.id);
      }

      // Insert new inclusions
      const inclusions = formData.service_inclusions.map(inclusion => ({
        package_id: packageData.id,
        service_id: inclusion.service_id,
        quantity_per_package: inclusion.quantity,
        provider_fee_per_job: inclusion.provider_payout
      }));

      const { error: inclusionsError } = await supabase
        .from('package_service_inclusions')
        .insert(inclusions);

      if (inclusionsError) throw inclusionsError;

      toast({
        title: "Success",
        description: `Package "${formData.name}" ${editingPackage ? 'updated' : 'created'} successfully`,
      });

      onSuccess();
    } catch (error) {
      console.error('Error saving package:', error);
      toast({
        title: "Error",
        description: `Failed to ${editingPackage ? 'update' : 'create'} package`,
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Package Info */}
      <Card>
        <CardHeader>
          <CardTitle>Package Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              <Label htmlFor="total_price">Package Price (N$) *</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  id="total_price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.total_price}
                  onChange={(e) => setFormData(prev => ({ ...prev, total_price: parseFloat(e.target.value) || 0 }))}
                  placeholder="0.00"
                  className="pl-10"
                  required
                />
              </div>
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
        </CardContent>
      </Card>

      {/* Service Inclusions */}
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
          {formData.service_inclusions.map((inclusion, index) => {
            const selectedService = services.find(s => s.id === inclusion.service_id);
            
            return (
              <div key={index} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">Service {index + 1}</h4>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeServiceInclusion(index)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="space-y-2">
                    <Label>Service *</Label>
                    <Select
                      value={inclusion.service_id}
                      onValueChange={(value) => updateServiceInclusion(index, 'service_id', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select service" />
                      </SelectTrigger>
                      <SelectContent>
                        {activeServices.filter(service => 
                          !formData.service_inclusions.some((inc, i) => i !== index && inc.service_id === service.id)
                        ).map((service) => (
                          <SelectItem key={service.id} value={service.id}>
                            {service.name} (N${service.clientPrice})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Quantity *</Label>
                    <Input
                      type="number"
                      min="1"
                      value={inclusion.quantity}
                      onChange={(e) => updateServiceInclusion(index, 'quantity', parseInt(e.target.value) || 1)}
                      placeholder="1"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Provider Payout per Job (N$) *</Label>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      value={inclusion.provider_payout}
                      onChange={(e) => updateServiceInclusion(index, 'provider_payout', parseFloat(e.target.value) || 0)}
                      placeholder="0.00"
                    />
                  </div>
                </div>

                {selectedService && (
                  <div className="bg-gray-50 p-3 rounded text-sm">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="font-medium">Service Value:</span>
                        <div>N${(selectedService.clientPrice * inclusion.quantity).toFixed(2)}</div>
                      </div>
                      <div>
                        <span className="font-medium">Total Provider Cost:</span>
                        <div>N${(inclusion.provider_payout * inclusion.quantity).toFixed(2)}</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {formData.service_inclusions.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <p>No services added yet. Click "Add Service" to get started.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Real-time Calculations */}
      {formData.service_inclusions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5" />
              Package Summary & Calculations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="space-y-1">
                <p className="text-gray-500">Total Service Value</p>
                <p className="text-lg font-semibold text-blue-600">N${calculations.totalServiceValue.toFixed(2)}</p>
              </div>
              <div className="space-y-1">
                <p className="text-gray-500">Package Price</p>
                <p className="text-lg font-semibold">N${formData.total_price.toFixed(2)}</p>
              </div>
              <div className="space-y-1">
                <p className="text-gray-500">Client Savings</p>
                <p className={`text-lg font-semibold ${calculations.clientSavings > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  N${calculations.clientSavings.toFixed(2)}
                </p>
                {calculations.savingsPercentage > 0 && (
                  <p className="text-xs text-green-600">
                    {calculations.savingsPercentage.toFixed(1)}% off
                  </p>
                )}
              </div>
              <div className="space-y-1">
                <p className="text-gray-500">Gross Profit</p>
                <p className={`text-lg font-semibold ${calculations.grossProfit > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  N${calculations.grossProfit.toFixed(2)}
                </p>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t">
              <div className="flex justify-between text-sm">
                <span>Total Provider Payout:</span>
                <span className="font-medium">N${calculations.totalProviderPayout.toFixed(2)}</span>
              </div>
            </div>

            {calculations.clientSavings > 0 && (
              <div className="mt-3">
                <Badge variant="default" className="bg-green-100 text-green-800">
                  <DollarSign className="h-3 w-3 mr-1" />
                  Great value for customers!
                </Badge>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Form Actions */}
      <div className="flex justify-end space-x-3">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button 
          type="submit" 
          disabled={isSubmitting || !formData.name || formData.total_price <= 0 || formData.service_inclusions.length === 0}
        >
          {isSubmitting ? 'Saving...' : (editingPackage ? 'Update Package' : 'Create Package')}
        </Button>
      </div>
    </form>
  );
};
