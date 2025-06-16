import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Settings, DollarSign, Percent, Package, Wrench, Save } from 'lucide-react';

interface Service {
  id: string;
  name: string;
  service_type: 'one-off' | 'subscription';
  client_price: number;
  provider_fee?: number;
  commission_percentage?: number;
}

interface PayoutConfig {
  serviceId: string;
  serviceName: string;
  serviceType: 'one-off' | 'subscription';
  clientPrice: number;
  providerFee?: number;
  commissionPercentage?: number;
}

export const JobPayoutConfiguration: React.FC = () => {
  const { toast } = useToast();
  const [services, setServices] = useState<Service[]>([]);
  const [payoutConfigs, setPayoutConfigs] = useState<PayoutConfig[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('services')
        .select('id, name, service_type, client_price, provider_fee, commission_percentage')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;

      // Cast service_type to proper type and ensure it matches our interface
      const typedServices: Service[] = (data || []).map(service => ({
        ...service,
        service_type: service.service_type as 'one-off' | 'subscription'
      }));

      setServices(typedServices);
      
      // Convert to payout configs
      const configs: PayoutConfig[] = typedServices.map(service => ({
        serviceId: service.id,
        serviceName: service.name,
        serviceType: service.service_type,
        clientPrice: service.client_price,
        providerFee: service.provider_fee,
        commissionPercentage: service.commission_percentage
      }));
      
      setPayoutConfigs(configs);
    } catch (error) {
      console.error('Error fetching services:', error);
      toast({
        title: "Error",
        description: "Failed to load services",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updatePayoutConfig = (serviceId: string, field: keyof PayoutConfig, value: number) => {
    setPayoutConfigs(prev => prev.map(config => 
      config.serviceId === serviceId 
        ? { ...config, [field]: value }
        : config
    ));
  };

  const calculateProviderEarnings = (config: PayoutConfig) => {
    if (config.serviceType === 'subscription') {
      return config.providerFee || 0;
    } else {
      const commission = config.commissionPercentage || 15;
      return config.clientPrice * (1 - commission / 100);
    }
  };

  const validateConfig = (config: PayoutConfig): string | null => {
    if (config.serviceType === 'subscription') {
      if (!config.providerFee || config.providerFee <= 0) {
        return 'Provider fee must be greater than 0';
      }
    } else {
      if (!config.commissionPercentage || config.commissionPercentage < 0 || config.commissionPercentage > 100) {
        return 'Commission percentage must be between 0 and 100';
      }
    }
    return null;
  };

  const saveAllConfigs = async () => {
    setIsSaving(true);
    
    // Validate all configs
    const errors = payoutConfigs
      .map(config => ({ serviceId: config.serviceId, error: validateConfig(config) }))
      .filter(item => item.error);

    if (errors.length > 0) {
      toast({
        title: "Validation Error",
        description: `Please fix configuration errors before saving`,
        variant: "destructive",
      });
      setIsSaving(false);
      return;
    }

    try {
      // Update each service
      const updates = payoutConfigs.map(config => ({
        id: config.serviceId,
        provider_fee: config.serviceType === 'subscription' ? config.providerFee : null,
        commission_percentage: config.serviceType === 'one-off' ? config.commissionPercentage : null
      }));

      for (const update of updates) {
        const { error } = await supabase
          .from('services')
          .update({
            provider_fee: update.provider_fee,
            commission_percentage: update.commission_percentage
          })
          .eq('id', update.id);

        if (error) throw error;
      }

      toast({
        title: "Settings Saved",
        description: "Job payout configurations have been updated successfully",
        className: "border-green-200 bg-green-50",
      });

      // Refresh data
      await fetchServices();
    } catch (error) {
      console.error('Error saving configurations:', error);
      toast({
        title: "Error",
        description: "Failed to save payout configurations",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900"></div>
            <span className="ml-2">Loading payout configurations...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Job Payout Configuration
        </CardTitle>
        <p className="text-sm text-gray-600">
          Configure how providers are paid for different types of services
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Package className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-800">Package Services</span>
            </div>
            <div className="text-2xl font-bold text-blue-900">
              {payoutConfigs.filter(c => c.serviceType === 'subscription').length}
            </div>
            <div className="text-xs text-blue-600">Fixed payout amounts</div>
          </div>
          
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Wrench className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium text-green-800">Individual Services</span>
            </div>
            <div className="text-2xl font-bold text-green-900">
              {payoutConfigs.filter(c => c.serviceType === 'one-off').length}
            </div>
            <div className="text-xs text-green-600">Percentage-based payouts</div>
          </div>
          
          <div className="bg-orange-50 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="h-4 w-4 text-orange-600" />
              <span className="text-sm font-medium text-orange-800">Avg Provider Earnings</span>
            </div>
            <div className="text-2xl font-bold text-orange-900">
              N${(payoutConfigs.reduce((sum, config) => sum + calculateProviderEarnings(config), 0) / payoutConfigs.length || 0).toFixed(0)}
            </div>
            <div className="text-xs text-orange-600">Per service average</div>
          </div>
        </div>

        {/* Configuration Table */}
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Service Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Client Price</TableHead>
                <TableHead>Payout Config</TableHead>
                <TableHead>Provider Earnings</TableHead>
                <TableHead>Platform Share</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payoutConfigs.map((config) => {
                const validationError = validateConfig(config);
                const providerEarnings = calculateProviderEarnings(config);
                const platformShare = config.clientPrice - providerEarnings;
                
                return (
                  <TableRow key={config.serviceId}>
                    <TableCell className="font-medium">{config.serviceName}</TableCell>
                    <TableCell>
                      <Badge 
                        variant="outline" 
                        className={config.serviceType === 'subscription' ? 'text-blue-600' : 'text-green-600'}
                      >
                        {config.serviceType === 'subscription' ? (
                          <>
                            <Package className="h-3 w-3 mr-1" />
                            Package
                          </>
                        ) : (
                          <>
                            <Wrench className="h-3 w-3 mr-1" />
                            Individual
                          </>
                        )}
                      </Badge>
                    </TableCell>
                    <TableCell>N${config.clientPrice.toFixed(2)}</TableCell>
                    <TableCell>
                      {config.serviceType === 'subscription' ? (
                        <div className="space-y-1">
                          <Label className="text-xs">Fixed Amount (NAD)</Label>
                          <Input
                            type="number"
                            min="0"
                            step="1"
                            value={config.providerFee || ''}
                            onChange={(e) => updatePayoutConfig(
                              config.serviceId, 
                              'providerFee', 
                              Number(e.target.value)
                            )}
                            className={`w-24 ${validationError ? 'border-red-500' : ''}`}
                            placeholder="0"
                          />
                        </div>
                      ) : (
                        <div className="space-y-1">
                          <Label className="text-xs">Commission (%)</Label>
                          <div className="flex items-center gap-1">
                            <Input
                              type="number"
                              min="0"
                              max="100"
                              step="1"
                              value={config.commissionPercentage || ''}
                              onChange={(e) => updatePayoutConfig(
                                config.serviceId, 
                                'commissionPercentage', 
                                Number(e.target.value)
                              )}
                              className={`w-16 ${validationError ? 'border-red-500' : ''}`}
                              placeholder="15"
                            />
                            <Percent className="h-3 w-3 text-gray-500" />
                          </div>
                        </div>
                      )}
                      {validationError && (
                        <div className="text-xs text-red-600 mt-1">{validationError}</div>
                      )}
                    </TableCell>
                    <TableCell>
                      <span className="font-medium text-green-600">
                        N${providerEarnings.toFixed(2)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="font-medium text-blue-600">
                        N${platformShare.toFixed(2)}
                      </span>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button 
            onClick={saveAllConfigs}
            disabled={isSaving}
            className="min-w-[120px]"
          >
            <Save className="h-4 w-4 mr-2" />
            {isSaving ? 'Saving...' : 'Save All Configurations'}
          </Button>
        </div>

        {/* Information */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="font-medium text-gray-900 mb-2">Configuration Guidelines</h4>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• <strong>Package services:</strong> Set a fixed payout amount (e.g., N$500 per package service)</li>
            <li>• <strong>Individual services:</strong> Set commission percentage (e.g., 15% = provider gets 85%)</li>
            <li>• Weekend bonuses are configured separately in Weekend Settings</li>
            <li>• Changes are applied immediately to new bookings</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};
