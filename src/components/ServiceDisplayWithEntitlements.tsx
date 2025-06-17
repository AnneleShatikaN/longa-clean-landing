
import React, { useEffect } from 'react';
import { useServices } from '@/contexts/ServiceContext';
import { useServiceEntitlements } from '@/hooks/useServiceEntitlements';
import { useLocationServices } from '@/hooks/useLocationServices';
import { useLocation } from '@/contexts/LocationContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LocationSelector } from '@/components/location/LocationSelector';
import { Clock, DollarSign, Package, ShoppingBag, Users, MapPin } from 'lucide-react';

interface ServiceDisplayWithEntitlementsProps {
  onBookService: (serviceId: string) => void;
  showBookingButton?: boolean;
  allowIndividualBooking?: boolean;
}

export const ServiceDisplayWithEntitlements: React.FC<ServiceDisplayWithEntitlementsProps> = ({
  onBookService,
  showBookingButton = true,
  allowIndividualBooking = false
}) => {
  const { isLoading: servicesLoading } = useServices();
  const { serviceUsage, checkAccess } = useServiceEntitlements();
  const { services: locationServices, isLoading: locationLoading, getServicesByLocation } = useLocationServices();
  const { selectedLocation } = useLocation();
  
  const hasActivePackage = serviceUsage.length > 0;

  // Fetch services based on selected location
  useEffect(() => {
    getServicesByLocation(selectedLocation);
  }, [selectedLocation, getServicesByLocation]);

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
    }
    return `${mins}m`;
  };

  const getServiceUsage = (serviceId: string) => {
    return serviceUsage.find(usage => usage.service_id === serviceId);
  };

  const canBookService = (serviceId: string) => {
    if (allowIndividualBooking) return true;
    const usage = getServiceUsage(serviceId);
    return usage && usage.used_count < usage.allowed_count;
  };

  const getBookingButtonText = (serviceId: string) => {
    if (allowIndividualBooking) {
      const usage = getServiceUsage(serviceId);
      if (usage && usage.used_count < usage.allowed_count) {
        return "Use Package Credit";
      }
      return "Book Individual Service";
    }
    return "Book Service";
  };

  const getBookingButtonVariant = (serviceId: string) => {
    if (allowIndividualBooking) {
      const usage = getServiceUsage(serviceId);
      if (usage && usage.used_count < usage.allowed_count) {
        return "default";
      }
      return "outline";
    }
    return "default";
  };

  if (servicesLoading || locationLoading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">Loading services...</p>
      </div>
    );
  }

  if (locationServices.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Services Available</h3>
          <p className="text-muted-foreground mb-4">
            No services are currently available in your selected location.
          </p>
          <div className="flex justify-center">
            <LocationSelector />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Available Services</h2>
        <div className="flex items-center gap-4">
          <LocationSelector />
          <Badge variant="secondary">
            {locationServices.length} service{locationServices.length !== 1 ? 's' : ''} available
          </Badge>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {locationServices.map((service) => {
          const usage = getServiceUsage(service.id);
          const canBook = canBookService(service.id);
          const isPackageService = usage !== undefined;

          return (
            <Card key={service.id} className="relative">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-lg">{service.name}</CardTitle>
                  <div className="flex flex-col gap-1">
                    <Badge variant={service.service_type === 'one-off' ? 'default' : 'secondary'}>
                      {service.service_type}
                    </Badge>
                    {isPackageService && (
                      <Badge variant="outline" className="text-xs">
                        <Package className="h-3 w-3 mr-1" />
                        In Package
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {service.description}
                </p>
                
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1">
                    <DollarSign className="h-4 w-4" />
                    <span>N${service.client_price}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span>{formatDuration(service.duration_minutes)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    <span>{service.provider_count} providers</span>
                  </div>
                </div>

                {/* Package Usage Display */}
                {isPackageService && (
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-blue-900">Package Credits</span>
                      <span className="text-sm text-blue-700">
                        {usage.used_count}/{usage.allowed_count} used
                      </span>
                    </div>
                    <div className="w-full bg-blue-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${(usage.used_count / usage.allowed_count) * 100}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Coverage Areas */}
                {service.coverage_areas && service.coverage_areas.length > 0 && (
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    <span>Available in {service.coverage_areas.length} area{service.coverage_areas.length !== 1 ? 's' : ''}</span>
                  </div>
                )}

                {/* Service Tags */}
                {service.tags && service.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {service.tags.slice(0, 3).map(tag => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                    {service.tags.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{service.tags.length - 3}
                      </Badge>
                    )}
                  </div>
                )}

                {/* Booking Button */}
                {showBookingButton && (
                  <Button
                    onClick={() => onBookService(service.id)}
                    disabled={!allowIndividualBooking && !canBook}
                    variant={getBookingButtonVariant(service.id)}
                    className="w-full"
                  >
                    <ShoppingBag className="h-4 w-4 mr-2" />
                    {getBookingButtonText(service.id)}
                  </Button>
                )}

                {/* Status Messages */}
                {!allowIndividualBooking && !canBook && (
                  <p className="text-xs text-muted-foreground text-center">
                    No package credits remaining for this service
                  </p>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
