
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Package, Plus, Edit, Trash2, DollarSign, Clock } from 'lucide-react';
import { PackageForm } from './PackageForm';
import { useServices } from '@/contexts/ServiceContext';
import { useDataMode } from '@/contexts/DataModeContext';
import { useToast } from '@/hooks/use-toast';

interface PackageData {
  id?: string;
  name: string;
  price: number;
  description?: string;
  serviceIds: string[];
  createdAt?: string;
}

export const PackageManager: React.FC = () => {
  const { services } = useServices();
  const { dataMode } = useDataMode();
  const { toast } = useToast();
  const [packages, setPackages] = useState<PackageData[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<PackageData | null>(null);

  const handleCreatePackage = async (packageData: PackageData) => {
    try {
      const newPackage: PackageData = {
        ...packageData,
        id: Math.random().toString(36).substr(2, 9),
        createdAt: new Date().toISOString()
      };

      if (dataMode === 'live') {
        // In live mode, we would save to Supabase
        // For now, storing in memory since packages aren't in the services table
        toast({
          title: "Note",
          description: "Live mode package creation will be implemented when package storage is configured",
          variant: "default"
        });
      }

      // Add to local state (works for both mock and live mode for now)
      setPackages(prev => [...prev, newPackage]);
      
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

  const getServicesByIds = (serviceIds: string[]) => {
    return services.filter(service => serviceIds.includes(service.id));
  };

  const calculateTotalDuration = (serviceIds: string[]) => {
    const packageServices = getServicesByIds(serviceIds);
    const totalMinutes = packageServices.reduce((total, service) => {
      return total + (service.duration.hours * 60) + service.duration.minutes;
    }, 0);
    
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return { hours, minutes };
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Package Management</h2>
          <p className="text-gray-600">Create and manage service packages</p>
        </div>
        <Button onClick={() => setIsFormOpen(true)} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Create New Package
        </Button>
      </div>

      {/* Packages Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {packages.map((pkg) => {
          const packageServices = getServicesByIds(pkg.serviceIds);
          const totalDuration = calculateTotalDuration(pkg.serviceIds);
          
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
                      <Badge variant="outline" className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {totalDuration.hours}h {totalDuration.minutes}m
                      </Badge>
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
                    <span className="font-medium">Included Services:</span>
                    <span className="text-gray-500">{packageServices.length} services</span>
                  </div>
                  
                  <div className="space-y-2">
                    {packageServices.slice(0, 3).map((service) => (
                      <div key={service.id} className="flex items-center justify-between text-sm">
                        <span className="truncate">{service.name}</span>
                        <span className="text-gray-500">N${service.clientPrice}</span>
                      </div>
                    ))}
                    {packageServices.length > 3 && (
                      <div className="text-sm text-gray-500">
                        +{packageServices.length - 3} more services
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}

        {packages.length === 0 && (
          <Card className="col-span-full">
            <CardContent className="text-center py-12">
              <Package className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No packages created yet</h3>
              <p className="text-gray-600 mb-4">
                Create your first package by combining multiple services with special pricing.
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
          <PackageForm
            onClose={() => setIsFormOpen(false)}
            onSave={handleCreatePackage}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};
