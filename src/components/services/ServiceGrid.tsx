import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Clock, DollarSign, MapPin, Package, Search, Star } from 'lucide-react';
import { useServicesEnhanced, ServiceData } from '@/hooks/useServicesEnhanced';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

interface ServiceGridProps {
  showBookingButton?: boolean;
  onServiceSelect?: (serviceId: string) => void;
  onBookService?: (serviceId: string) => void;
  filterType?: 'all' | 'one-off' | 'subscription';
  maxItems?: number;
  className?: string;
}

export const ServiceGrid: React.FC<ServiceGridProps> = ({
  showBookingButton = true,
  onServiceSelect,
  onBookService,
  filterType = 'all',
  maxItems,
  className = ''
}) => {
  const navigate = useNavigate();
  const {
    services,
    isLoading,
    error,
    searchServices,
    getServicesByType,
    activeServices
  } = useServicesEnhanced();

  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'price' | 'duration'>('name');
  const [typeFilter, setTypeFilter] = useState<'all' | 'one-off' | 'subscription'>(filterType);

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
    }
    return `${mins}m`;
  };

  const handleServiceAction = (service: ServiceData) => {
    console.log('ServiceGrid: Handling service action for service:', service);
    
    // Use callback props if provided, otherwise navigate directly
    if (onServiceSelect) {
      onServiceSelect(service.id);
    } else if (onBookService) {
      onBookService(service.id);
      toast.success('Service selected', {
        description: `${service.name} ready for booking`
      });
    } else {
      // Default navigation behavior
      console.log('ServiceGrid: Navigating to service details page');
      navigate(`/service/${service.id}`);
    }
  };

  // Filter and sort services
  let filteredServices = activeServices;

  // Apply search
  if (searchQuery.trim()) {
    filteredServices = searchServices(searchQuery);
  }

  // Apply type filter
  if (typeFilter !== 'all') {
    filteredServices = getServicesByType(typeFilter);
  }

  // Apply sorting
  filteredServices.sort((a, b) => {
    switch (sortBy) {
      case 'price':
        return a.client_price - b.client_price;
      case 'duration':
        return a.duration_minutes - b.duration_minutes;
      case 'name':
      default:
        return a.name.localeCompare(b.name);
    }
  });

  // Apply max items limit
  if (maxItems) {
    filteredServices = filteredServices.slice(0, maxItems);
  }

  if (isLoading) {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-10 bg-gray-200 rounded"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`text-center py-12 ${className}`}>
        <Package className="mx-auto h-16 w-16 text-red-400 mb-4" />
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          Error Loading Services
        </h3>
        <p className="text-gray-600 mb-4">{error}</p>
        <Button onClick={() => window.location.reload()}>
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Search and Filter Controls */}
      {!maxItems && (
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search services..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <Select value={typeFilter} onValueChange={(value: any) => setTypeFilter(value)}>
            <SelectTrigger className="w-[150px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="one-off">One-time</SelectItem>
              <SelectItem value="subscription">Packages</SelectItem>
            </SelectContent>
          </Select>
          <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
            <SelectTrigger className="w-[150px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name">Name</SelectItem>
              <SelectItem value="price">Price</SelectItem>
              <SelectItem value="duration">Duration</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Services Grid */}
      {filteredServices.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredServices.map((service) => (
            <Card key={service.id} className="hover:shadow-lg transition-shadow group">
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg mb-2 group-hover:text-purple-600 transition-colors">
                      {service.name}
                    </CardTitle>
                    <div className="flex gap-2 mb-2">
                      <Badge variant={service.service_type === 'one-off' ? 'default' : 'secondary'}>
                        {service.service_type === 'one-off' ? 'One-time' : 'Package'}
                      </Badge>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-purple-600">
                      N${service.client_price}
                    </div>
                    {service.service_type === 'subscription' && (
                      <div className="text-sm text-gray-500">per month</div>
                    )}
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <p className="text-sm text-gray-600 line-clamp-2">
                  {service.description || 'Professional service'}
                </p>
                
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span>{formatDuration(service.duration_minutes)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    <span>{service.coverage_areas.length} area{service.coverage_areas.length !== 1 ? 's' : ''}</span>
                  </div>
                </div>

                {service.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {service.tags.slice(0, 3).map((tag, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
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

                {showBookingButton && (
                  <div className="space-y-2">
                    <Button 
                      className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800"
                      onClick={() => handleServiceAction(service)}
                    >
                      {service.service_type === 'subscription' ? 'View Package' : 'Book Now'}
                    </Button>
                    <Button 
                      variant="outline"
                      className="w-full"
                      onClick={() => navigate(`/service/${service.id}`)}
                    >
                      View Details
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="text-center py-12">
            <Search className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No services found</h3>
            <p className="text-gray-600">
              {searchQuery ? 'Try adjusting your search criteria' : 'No services are currently available'}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
