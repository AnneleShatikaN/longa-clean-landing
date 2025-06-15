
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  Search, 
  Plus, 
  Filter, 
  Eye, 
  Edit, 
  Trash2, 
  MoreVertical,
  Clock,
  DollarSign,
  Users,
  Package,
  Settings,
  Ban,
  CheckCircle
} from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import ServiceForm from './ServiceForm';
import ServiceViewModal from './ServiceViewModal';
import ServiceEditModal from './ServiceEditModal';
import { PackageEntitlementManager } from './PackageEntitlementManager';
import { PackageManager } from './PackageManager';
import EmptyServicesState from './EmptyServicesState';
import { useServices } from '@/contexts/ServiceContext';
import { useToast } from '@/hooks/use-toast';

const ServiceManagement = () => {
  const { services, isLoading, error, createService, updateService, deleteService, toggleServiceStatus } = useServices();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [viewService, setViewService] = useState<string | null>(null);
  const [editService, setEditService] = useState<string | null>(null);
  const [deleteConfirmService, setDeleteConfirmService] = useState<string | null>(null);
  const [manageEntitlements, setManageEntitlements] = useState<{id: string, name: string} | null>(null);

  // Filter services based on search query and filters
  const filteredServices = services.filter(service => {
    const matchesSearch = 
      service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      service.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'active' && service.status === 'active') ||
      (statusFilter === 'inactive' && service.status === 'inactive');
    
    const matchesType = typeFilter === 'all' || service.type === typeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  const handleDeleteService = async (id: string) => {
    try {
      await deleteService(id);
      setDeleteConfirmService(null);
      toast({
        title: "Success",
        description: "Service deleted successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete service",
        variant: "destructive",
      });
    }
  };

  const handleToggleStatus = async (id: string) => {
    try {
      await toggleServiceStatus(id);
      toast({
        title: "Success",
        description: "Service status updated successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update service status",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Service Management</h2>
          <p className="text-gray-600">Manage your services and packages</p>
        </div>
      </div>

      {/* Main Tabs */}
      <Tabs defaultValue="services" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="services" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Services
          </TabsTrigger>
          <TabsTrigger value="packages" className="flex items-center gap-2">
            <Package className="h-4 w-4" />
            Packages
          </TabsTrigger>
        </TabsList>

        <TabsContent value="services" className="space-y-6">
          {/* Services Content - keep existing implementation */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex flex-col sm:flex-row gap-4 flex-1">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search services..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex gap-2">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="one-off">One-off</SelectItem>
                    <SelectItem value="subscription">Subscription</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button onClick={() => setIsFormOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Service
            </Button>
          </div>

          {/* Services Grid */}
          {filteredServices.length === 0 ? (
            <EmptyServicesState 
              hasServices={services.length > 0} 
              onCreateService={() => setIsFormOpen(true)} 
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredServices.map((service) => (
                <Card key={service.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          {service.name}
                          <Badge variant={service.status === 'active' ? 'default' : 'secondary'}>
                            {service.status === 'active' ? 'Active' : 'Inactive'}
                          </Badge>
                        </CardTitle>
                        <p className="text-sm text-gray-600 mt-1">
                          {service.type === 'one-off' ? 'One-off Service' : 'Subscription Service'}
                        </p>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => setViewService(service.id)}>
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setEditService(service.id)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit Service
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleToggleStatus(service.id)}>
                            {service.status === 'active' ? (
                              <>
                                <Ban className="h-4 w-4 mr-2" />
                                Deactivate
                              </>
                            ) : (
                              <>
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Activate
                              </>
                            )}
                          </DropdownMenuItem>
                          {service.type === 'subscription' && (
                            <DropdownMenuItem onClick={() => setManageEntitlements({id: service.id, name: service.name})}>
                              <Settings className="h-4 w-4 mr-2" />
                              Manage Entitlements
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem 
                            onClick={() => setDeleteConfirmService(service.id)}
                            className="text-red-600 hover:text-red-700 focus:text-red-700"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete Service
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {service.description || 'No description provided.'}
                      </p>
                      
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4 text-gray-500" />
                          <span>
                            {service.duration.hours}h {service.duration.minutes}m
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <DollarSign className="h-4 w-4 text-gray-500" />
                          <span>N${service.clientPrice}</span>
                        </div>
                      </div>
                      
                      <div className="flex flex-wrap gap-1">
                        {service.tags?.slice(0, 3).map((tag, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                        {(service.tags?.length || 0) > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{service.tags!.length - 3} more
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="packages" className="space-y-6">
          <PackageManager />
        </TabsContent>
      </Tabs>

      {/* Create Service Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add New Service</DialogTitle>
          </DialogHeader>
          <ServiceForm 
            onClose={() => setIsFormOpen(false)}
            onSave={async (data) => {
              try {
                await createService(data);
                setIsFormOpen(false);
                toast({
                  title: "Success",
                  description: "Service created successfully",
                });
              } catch (error) {
                // Error is handled in the context and displayed via toast there
              }
            }}
          />
        </DialogContent>
      </Dialog>

      {/* View Service Dialog */}
      {viewService && (
        <Dialog open={!!viewService} onOpenChange={() => setViewService(null)}>
          <DialogContent className="max-w-2xl">
            <ServiceViewModal 
              serviceId={viewService} 
              onClose={() => setViewService(null)}
              onEdit={() => {
                setEditService(viewService);
                setViewService(null);
              }}
            />
          </DialogContent>
        </Dialog>
      )}

      {/* Edit Service Dialog */}
      {editService && (
        <Dialog open={!!editService} onOpenChange={() => setEditService(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Service</DialogTitle>
            </DialogHeader>
            <ServiceEditModal 
              serviceId={editService}
              onClose={() => setEditService(null)}
              onSave={async (id, data) => {
                try {
                  await updateService(id, data);
                  setEditService(null);
                  toast({
                    title: "Success",
                    description: "Service updated successfully",
                  });
                } catch (error) {
                  // Error is handled in the context
                }
              }}
            />
          </DialogContent>
        </Dialog>
      )}

      {/* Delete Confirmation Dialog */}
      {deleteConfirmService && (
        <Dialog open={!!deleteConfirmService} onOpenChange={() => setDeleteConfirmService(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirm Deletion</DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <p>Are you sure you want to delete this service? This action cannot be undone.</p>
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setDeleteConfirmService(null)}>
                Cancel
              </Button>
              <Button 
                variant="destructive" 
                onClick={() => handleDeleteService(deleteConfirmService)}
              >
                Delete Service
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Manage Entitlements Dialog */}
      {manageEntitlements && (
        <Dialog open={!!manageEntitlements} onOpenChange={() => setManageEntitlements(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <PackageEntitlementManager
              packageId={manageEntitlements.id}
              packageName={manageEntitlements.name}
              onClose={() => setManageEntitlements(null)}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default ServiceManagement;
