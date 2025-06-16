import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Package, Plus, Edit, Trash2, DollarSign, Clock, Users } from 'lucide-react';
import { EnhancedPackageForm } from './EnhancedPackageForm';
import { useServices } from '@/contexts/ServiceContext';
import { useDataMode } from '@/contexts/DataModeContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface PackageInclusion {
  service_id: string;
  quantity_per_package: number;
  provider_fee_per_job: number;
}

interface PackageData {
  id?: string;
  name: string;
  price: number;
  description?: string;
  duration_days: number;
  inclusions: PackageInclusion[];
  createdAt?: string;
}

interface ServiceWithDetails {
  id: string;
  name: string;
  client_price: number;
}

interface PackageWithInclusions extends PackageData {
  package_service_inclusions?: Array<{
    service_id: string;
    quantity_per_package: number;
    provider_fee_per_job: number;
    service?: ServiceWithDetails;
  }>;
}

export const PackageManager: React.FC = () => {
  const { services } = useServices();
  const { dataMode } = useDataMode();
  const { toast } = useToast();
  const [packages, setPackages] = useState<PackageWithInclusions[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<PackageWithInclusions | null>(null);

  const fetchPackages = async () => {
    if (dataMode !== 'live') return;
    
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('subscription_packages')
        .select(`
          *,
          package_service_inclusions(
            service_id,
            quantity_per_package,
            provider_fee_per_job,
            service:services(id, name, client_price)
          )
        `)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Transform the data to match our interface
      const transformedPackages = (data || []).map(pkg => ({
        ...pkg,
        inclusions: pkg.package_service_inclusions || []
      }));
      
      setPackages(transformedPackages);
    } catch (error) {
      console.error('Error fetching packages:', error);
      toast({
        title: "Error",
        description: "Failed to fetch packages",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPackages();
  }, [dataMode]);

  const handleCreatePackage = async (packageData: PackageData) => {
    try {
      if (dataMode === 'live') {
        // Create package in database
        const { data: newPackage, error: packageError } = await supabase
          .from('subscription_packages')
          .insert({
            name: packageData.name,
            description: packageData.description,
            price: packageData.price,
            duration_days: packageData.duration_days,
            is_active: true
          })
          .select()
          .single();

        if (packageError) throw packageError;

        // Create package inclusions
        if (packageData.inclusions.length > 0) {
          const inclusions = packageData.inclusions.map(inclusion => ({
            package_id: newPackage.id,
            service_id: inclusion.service_id,
            quantity_per_package: inclusion.quantity_per_package,
            provider_fee_per_job: inclusion.provider_fee_per_job
          }));

          const { error: inclusionsError } = await supabase
            .from('package_service_inclusions')
            .insert(inclusions);

          if (inclusionsError) throw inclusionsError;
        }

        await fetchPackages();
      } else {
        // Mock mode - add to local state
        const newPackage: PackageWithInclusions = {
          ...packageData,
          id: Math.random().toString(36).substr(2, 9),
          createdAt: new Date().toISOString()
        };
        setPackages(prev => [...prev, newPackage]);
      }
      
      toast({
        title: "Success",
        description: `Package "${packageData.name}" created successfully`,
      });

      setIsFormOpen(false);
    } catch (error) {
      console.error('Error creating package:', error);
      toast({
        title: "Error",
        description: "Failed to create package",
        variant: "destructive"
      });
    }
  };

  const getServicesByIds = (inclusions: PackageInclusion[]) => {
    return inclusions.map(inclusion => {
      const service = services.find(s => s.id === inclusion.service_id);
      return {
        ...inclusion,
        service
      };
    }).filter(item => item.service);
  };

  const calculateTotalValue = (packageItem: PackageWithInclusions) => {
    const inclusions = packageItem.package_service_inclusions || packageItem.inclusions || [];
    return inclusions.reduce((total, inclusion) => {
      const service = 'service' in inclusion && inclusion.service 
        ? inclusion.service as ServiceWithDetails
        : services.find(s => s.id === inclusion.service_id);
      return total + (service?.client_price || 0) * inclusion.quantity_per_package;
    }, 0);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Package Management</h2>
          <p className="text-gray-600">Create and manage service packages with custom provider fees</p>
        </div>
        <Button onClick={() => setIsFormOpen(true)} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Create New Package
        </Button>
      </div>

      {/* Packages Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {packages.map((pkg) => {
          const inclusions = pkg.package_service_inclusions || pkg.inclusions || [];
          const totalValue = calculateTotalValue(pkg);
          const savings = totalValue - pkg.price;
          
          return (
            <Card key={pkg.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Package className="h-5 w-5" />
                      {pkg.name}
                    </CardTitle>
                    <div className="flex items-center gap-4 mt-2">
                      <Badge variant="default" className="flex items-center gap-1">
                        <DollarSign className="h-3 w-3" />
                        N${pkg.price}
                      </Badge>
                      {savings > 0 && (
                        <Badge variant="outline" className="text-green-600">
                          Save N${savings.toFixed(0)}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="sm">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {pkg.description && (
                  <p className="text-gray-600 text-sm mb-4">{pkg.description}</p>
                )}
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">Duration:</span>
                    <span className="text-gray-500">{pkg.duration_days} days</span>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">Included Services:</span>
                    <span className="text-gray-500">{inclusions.length} services</span>
                  </div>
                  
                  <div className="space-y-2">
                    {inclusions.slice(0, 3).map((inclusion, index) => {
                      const service = 'service' in inclusion && inclusion.service 
                        ? inclusion.service as ServiceWithDetails
                        : services.find(s => s.id === inclusion.service_id);
                      return (
                        <div key={index} className="flex items-center justify-between text-sm">
                          <span className="truncate">{service?.name || 'Unknown Service'}</span>
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary" className="text-xs">
                              {inclusion.quantity_per_package}x
                            </Badge>
                            <span className="text-gray-500 text-xs">
                              N${inclusion.provider_fee_per_job}/job
                            </span>
                          </div>
                        </div>
                      );
                    })}
                    {inclusions.length > 3 && (
                      <div className="text-sm text-gray-500">
                        +{inclusions.length - 3} more services
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}

        {packages.length === 0 && !isLoading && (
          <Card className="col-span-full">
            <CardContent className="text-center py-12">
              <Package className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No packages created yet</h3>
              <p className="text-gray-600 mb-4">
                Create your first package by combining multiple services with special pricing and custom provider fees.
              </p>
              <Button onClick={() => setIsFormOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Package
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Create Package Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Package</DialogTitle>
          </DialogHeader>
          <EnhancedPackageForm
            onClose={() => setIsFormOpen(false)}
            onSave={() => {}} // Add proper handler
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};
