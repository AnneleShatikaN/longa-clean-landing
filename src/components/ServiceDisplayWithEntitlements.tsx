
import React, { useEffect, useState } from 'react';
import { useServices } from '@/contexts/ServiceContext';
import { useServiceEntitlements } from '@/hooks/useServiceEntitlements';
import { useLocationServices } from '@/hooks/useLocationServices';
import { useLocation } from '@/contexts/LocationContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LocationSelector } from '@/components/location/LocationSelector';
import { ProviderListModal } from '@/components/providers/ProviderListModal';
import { Clock, DollarSign, Package, ShoppingBag, Users, MapPin, Eye, Star } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface ServiceDisplayWithEntitlementsProps {
  onBookService: (serviceId: string) => void;
  showBookingButton?: boolean;
  allowIndividualBooking?: boolean;
}

interface ServiceAnalytics {
  service_id: string;
  avg_rating: number;
  total_bookings: number;
  provider_count: number;
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
  const [selectedServiceForProviders, setSelectedServiceForProviders] = useState<{id: string, name: string} | null>(null);
  const [serviceAnalytics, setServiceAnalytics] = useState<Record<string, ServiceAnalytics>>({});
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  
  const hasActivePackage = serviceUsage.length > 0;

  // Fetch services based on selected location
  useEffect(() => {
    getServicesByLocation(selectedLocation);
  }, [selectedLocation, getServicesByLocation]);

  // Fetch real analytics data for services
  useEffect(() => {
    const fetchServiceAnalytics = async () => {
      if (locationServices.length === 0) return;
      
      setAnalyticsLoading(true);
      try {
        const serviceIds = locationServices.map(service => service.id);
        
        // Get real booking statistics
        const { data: bookingStats } = await supabase
          .from('bookings')
          .select(`
            service_id,
            rating,
            status,
            services!inner(name)
          `)
          .in('service_id', serviceIds);

        // Get provider counts per service
        const { data: providerStats } = await supabase
          .from('users')
          .select('id, service_coverage_areas')
          .eq('role', 'provider')
          .eq('is_active', true);

        // Calculate analytics for each service
        const analytics: Record<string, ServiceAnalytics> = {};
        
        for (const service of locationServices) {
          const serviceBookings = bookingStats?.filter(b => b.service_id === service.id) || [];
          const completedBookings = serviceBookings.filter(b => b.status === 'completed');
          
          // Calculate average rating from completed bookings with ratings
          const ratingsData = completedBookings.filter(b => b.rating && b.rating > 0);
          const avgRating = ratingsData.length > 0 
            ? ratingsData.reduce((sum, b) => sum + (b.rating || 0), 0) / ratingsData.length 
            : 0;

          // Count providers that can serve this location
          const availableProviders = providerStats?.filter(provider => 
            provider.service_coverage_areas?.includes(selectedLocation)
          ) || [];

          analytics[service.id] = {
            service_id: service.id,
            avg_rating: Math.round(avgRating * 10) / 10, // Round to 1 decimal
            total_bookings: serviceBookings.length,
            provider_count: availableProviders.length
          };
        }
        
        setServiceAnalytics(analytics);
      } catch (error) {
        console.error('Error fetching service analytics:', error);
      } finally {
        setAnalyticsLoading(false);
      }
    };

    fetchServiceAnalytics();
  }, [locationServices, selectedLocation]);

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

  const handleViewProviders = (serviceId: string, serviceName: string) => {
    setSelectedServiceForProviders({ id: serviceId, name: serviceName });
  };

  const closeProviderModal = () => {
    setSelectedServiceForProviders(null);
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
    <>
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
            const analytics = serviceAnalytics[service.id];

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
                      <span>
                        {analyticsLoading ? '...' : analytics?.provider_count || 0} providers
                      </span>
                    </div>
                  </div>

                  {/* Real Analytics Display */}
                  {analytics && (
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      {analytics.avg_rating > 0 && (
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span>{analytics.avg_rating.toFixed(1)}</span>
                        </div>
                      )}
                      {analytics.total_bookings > 0 && (
                        <span>{analytics.total_bookings} booking{analytics.total_bookings !== 1 ? 's' : ''}</span>
                      )}
                    </div>
                  )}

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

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    {/* View Providers Button */}
                    <Button
                      onClick={() => handleViewProviders(service.id, service.name)}
                      variant="outline"
                      size="sm"
                      className="flex-1"
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      View Providers
                    </Button>

                    {/* Booking Button */}
                    {showBookingButton && (
                      <Button
                        onClick={() => onBookService(service.id)}
                        disabled={!allowIndividualBooking && !canBook}
                        variant={getBookingButtonVariant(service.id)}
                        size="sm"
                        className="flex-1"
                      >
                        <ShoppingBag className="h-4 w-4 mr-1" />
                        Book
                      </Button>
                    )}
                  </div>

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

      {/* Provider List Modal */}
      {selectedServiceForProviders && (
        <ProviderListModal
          isOpen={true}
          onClose={closeProviderModal}
          serviceId={selectedServiceForProviders.id}
          serviceName={selectedServiceForProviders.name}
          showBookingButtons={true}
          onSelectProvider={(providerId) => {
            // Navigate to booking with selected provider
            onBookService(selectedServiceForProviders.id);
            closeProviderModal();
          }}
        />
      )}
    </>
  );
};
