
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Package, Plus, Edit, Trash2, DollarSign, Eye } from 'lucide-react';
import { EnhancedPackageCreationForm } from './EnhancedPackageCreationForm';
import { useServices } from '@/contexts/ServiceContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface PackageWithInclusions {
  id: string;
  name: string;
  description: string;
  price: number;
  total_price: number;
  total_provider_payout: number;
  gross_profit: number;
  is_active: boolean;
  created_at: string;
  package_service_inclusions: Array<{
    service_id: string;
    quantity_per_package: number;
    provider_fee_per_job: number;
    services: {
      id: string;
      name: string;
      client_price: number;
    };
  }>;
}

export const EnhancedPackageManagement: React.FC = () => {
  const { services } = useServices();
  const { toast } = useToast();
  const [packages, setPackages] = useState<PackageWithInclusions[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingPackage, setEditingPackage] = useState<PackageWithInclusions | null>(null);

  const fetchPackages = async () => {
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
            services(id, name, client_price)
          )
        `)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPackages(data || []);
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
  }, []);

  const handleCreatePackage = () => {
    setEditingPackage(null);
    setIsFormOpen(true);
  };

  const handleEditPackage = (pkg: PackageWithInclusions) => {
    setEditingPackage(pkg);
    setIsFormOpen(true);
  };

  const handleDeletePackage = async (packageId: string) => {
    if (!confirm('Are you sure you want to delete this package?')) return;

    try {
      const { error } = await supabase
        .from('subscription_packages')
        .update({ is_active: false })
        .eq('id', packageId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Package deleted successfully",
      });

      fetchPackages();
    } catch (error) {
      console.error('Error deleting package:', error);
      toast({
        title: "Error",
        description: "Failed to delete package",
        variant: "destructive"
      });
    }
  };

  const handleFormSuccess = () => {
    setIsFormOpen(false);
    setEditingPackage(null);
    fetchPackages();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Package Management</h2>
          <p className="text-gray-600">Create and manage service packages with custom pricing</p>
        </div>
        <Button onClick={handleCreatePackage} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Create Package
        </Button>
      </div>

      {/* Packages Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {packages.map((pkg) => {
          const totalServices = pkg.package_service_inclusions?.length || 0;
          const totalQuantity = pkg.package_service_inclusions?.reduce((sum, inc) => sum + inc.quantity_per_package, 0) || 0;
          
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
                        N${pkg.total_price}
                      </Badge>
                      {pkg.gross_profit > 0 && (
                        <Badge variant="outline" className="text-green-600">
                          +N${pkg.gross_profit.toFixed(0)} profit
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="sm" onClick={() => handleEditPackage(pkg)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-red-600 hover:text-red-700"
                      onClick={() => handleDeletePackage(pkg.id)}
                    >
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
                    <span className="font-medium">Services:</span>
                    <span className="text-gray-500">{totalServices} types</span>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">Total Quantity:</span>
                    <span className="text-gray-500">{totalQuantity} jobs</span>
                  </div>
                  
                  <div className="space-y-2">
                    {pkg.package_service_inclusions?.slice(0, 3).map((inclusion, index) => (
                      <div key={index} className="flex items-center justify-between text-sm">
                        <span className="truncate">{inclusion.services?.name || 'Unknown Service'}</span>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className="text-xs">
                            {inclusion.quantity_per_package}x
                          </Badge>
                          <span className="text-gray-500 text-xs">
                            N${inclusion.provider_fee_per_job}/job
                          </span>
                        </div>
                      </div>
                    ))}
                    {totalServices > 3 && (
                      <div className="text-sm text-gray-500">
                        +{totalServices - 3} more services
                      </div>
                    )}
                  </div>

                  <div className="pt-3 border-t">
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-gray-500">Provider Payout:</span>
                        <div className="font-medium">N${pkg.total_provider_payout?.toFixed(2) || '0.00'}</div>
                      </div>
                      <div>
                        <span className="text-gray-500">Gross Profit:</span>
                        <div className={`font-medium ${(pkg.gross_profit || 0) > 0 ? 'text-green-600' : 'text-red-600'}`}>
                          N${pkg.gross_profit?.toFixed(2) || '0.00'}
                        </div>
                      </div>
                    </div>
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
                Create your first package by combining multiple services with custom pricing.
              </p>
              <Button onClick={handleCreatePackage}>
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Package
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Create/Edit Package Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingPackage ? 'Edit Package' : 'Create New Package'}
            </DialogTitle>
          </DialogHeader>
          <EnhancedPackageCreationForm
            onClose={() => setIsFormOpen(false)}
            onSuccess={handleFormSuccess}
            editingPackage={editingPackage}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};
