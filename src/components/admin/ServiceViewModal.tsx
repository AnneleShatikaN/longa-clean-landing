
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, DollarSign, Percent, Calendar, Tag } from 'lucide-react';
import { useServices } from '@/contexts/ServiceContext';

interface ServiceViewModalProps {
  serviceId: string;
  isOpen: boolean;
  onClose: () => void;
}

const ServiceViewModal: React.FC<ServiceViewModalProps> = ({ 
  serviceId, 
  isOpen, 
  onClose 
}) => {
  const { getServiceById } = useServices();
  const service = getServiceById(serviceId);

  if (!service) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Service Not Found</DialogTitle>
          </DialogHeader>
          <div className="p-6 text-center">
            <p className="text-gray-600">The requested service could not be found.</p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            {service.name}
            <Badge variant={service.status === 'active' ? 'default' : 'destructive'}>
              {service.status}
            </Badge>
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Service Type</label>
                  <div className="mt-1">
                    <Badge variant={service.type === 'one-off' ? 'default' : 'secondary'}>
                      {service.type === 'one-off' ? 'One-time Service' : 'Subscription Package'}
                    </Badge>
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-600">Status</label>
                  <div className="mt-1">
                    <Badge variant={service.status === 'active' ? 'default' : 'destructive'}>
                      {service.status}
                    </Badge>
                  </div>
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-600">Description</label>
                <p className="mt-1 text-gray-900">{service.description}</p>
              </div>
            </CardContent>
          </Card>

          {/* Pricing Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Pricing Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">
                    N${service.clientPrice}
                  </div>
                  <div className="text-sm text-blue-600">Client Price</div>
                </div>
                
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {service.commissionPercentage}%
                  </div>
                  <div className="text-sm text-green-600">Commission</div>
                </div>
                
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">
                    N${service.providerFee}
                  </div>
                  <div className="text-sm text-purple-600">Provider Fee</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Duration */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Duration
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <div className="text-2xl font-bold text-orange-600">
                  {service.duration.hours}h {service.duration.minutes}m
                </div>
                <div className="text-sm text-orange-600">Estimated Duration</div>
              </div>
            </CardContent>
          </Card>

          {/* Tags */}
          {service.tags.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Tag className="h-5 w-5" />
                  Tags
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {service.tags.map((tag) => (
                    <Badge key={tag} variant="outline">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Metadata */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Service Metadata
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-600">Created:</span>
                  <span className="ml-2">{new Date(service.createdAt).toLocaleDateString()}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-600">Last Updated:</span>
                  <span className="ml-2">{new Date(service.updatedAt).toLocaleDateString()}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-600">Total Bookings:</span>
                  <span className="ml-2">{service.totalBookings}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-600">Average Rating:</span>
                  <span className="ml-2">{service.averageRating.toFixed(1)}/5.0</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ServiceViewModal;
