import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Star, Clock, MapPin, Package, Lock, AlertCircle } from 'lucide-react';
import { useServices } from '@/contexts/ServiceContext';
import { useAuth } from '@/contexts/AuthContext';
import { checkServiceAccess, getUserServiceUsage, type ServiceUsage } from '@/utils/serviceEntitlements';
import { useToast } from '@/hooks/use-toast';

interface ServiceDisplayWithEntitlementsProps {
  onBookService?: (serviceId: string) => void;
  showBookingButton?: boolean;
}

export const ServiceDisplayWithEntitlements: React.FC<ServiceDisplayWithEntitlementsProps> = ({ 
  onBookService, 
  showBookingButton = false 
}) => {
  const { services, searchServices, isLoading, error } = useServices();
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'one-off' | 'subscription'>('all');
  const [sortBy, setSortBy] = useState<'popularity' | 'price' | 'rating'>('popularity');
  const [serviceUsage, setServiceUsage] = useState<ServiceUsage[]>([]);
  const [accessChecks, setAccessChecks] = useState<Record<string, {allowed: boolean, reason?: string}>>({});

  useEffect(() => {
    if (user) {
      loadUserServiceUsage();
    }
  }, [user]);

  useEffect(() => {
    if (user && services.length > 0) {
      checkAllServiceAccess();
    }
  }, [user, services]);

  const loadUserServiceUsage = async () => {
    if (!user) return;
    try {
      const usage = await getUserServiceUsage(user.id);
      setServiceUsage(usage);
    } catch (error) {
      console.error('Error loading service usage:', error);
    }
  };

  const checkAllServiceAccess = async () => {
    if (!user) return;
    
    const checks: Record<string, {allowed: boolean, reason?: string}> = {};
    
    for (const service of services) {
      try {
        const result = await checkServiceAccess(user.id, service.id);
        checks[service.id] = { allowed: result.allowed, reason: result.reason };
      } catch (error) {
        checks[service.id] = { allowed: false, reason: 'Error checking access' };
      }
    }
    
    setAccessChecks(checks);
  };

  const handleBookService = async (serviceId: string) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to book services",
        variant: "destructive"
      });
      return;
    }

    const accessCheck = accessChecks[serviceId];
    if (!accessCheck?.allowed) {
      toast({
        title: "Access Denied",
        description: accessCheck?.reason || "You don't have access to this service",
        variant: "destructive"
      });
      return;
    }

    if (onBookService) {
      onBookService(serviceId);
    }
  };

  const getServiceUsage = (serviceId: string): ServiceUsage | undefined => {
    return serviceUsage.find(usage => usage.service_id === serviceId);
  };

  const getFilteredAndSortedServices = () => {
    let filteredServices = services.filter(service => service.status === 'active');
    
    // Apply search
    if (searchTerm) {
      filteredServices = searchServices(searchTerm).filter(service => service.status === 'active');
    }
    
    // Apply type filter
    if (typeFilter !== 'all') {
      filteredServices = filteredServices.filter(service => service.type === typeFilter);
    }
    
    // Apply sorting
    filteredServices.sort((a, b) => {
      switch (sortBy) {
        case 'price':
          return a.clientPrice - b.clientPrice;
        case 'rating':
          return b.averageRating - a.averageRating;
        case 'popularity':
        default:
          return b.popularity - a.popularity;
      }
    });
    
    return filteredServices;
  };

  const filteredServices = getFilteredAndSortedServices();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 h-10 bg-gray-200 rounded animate-pulse"></div>
              <div className="w-[150px] h-10 bg-gray-200 rounded animate-pulse"></div>
              <div className="w-[150px] h-10 bg-gray-200 rounded animate-pulse"></div>
            </div>
          </CardContent>
        </Card>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-4">
                <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
                <div className="h-8 bg-gray-200 rounded w-2/3"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
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
      <div className="text-center py-12">
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

  if (services.length === 0) {
    return (
      <div className="text-center py-12">
        <Package className="mx-auto h-16 w-16 text-gray-400 mb-4" />
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          No Services Available
        </h3>
        <p className="text-gray-600">
          Services are being set up. Please check back soon!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search and Filter Controls */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search for services..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={typeFilter} onValueChange={(value: any) => setTypeFilter(value)}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Service Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Services</SelectItem>
                <SelectItem value="one-off">One-off</SelectItem>
                <SelectItem value="subscription">Packages</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="popularity">Most Popular</SelectItem>
                <SelectItem value="price">Price (Low to High)</SelectItem>
                <SelectItem value="rating">Highest Rated</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Services Grid */}
      {filteredServices.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredServices.map((service) => {
            const accessCheck = accessChecks[service.id];
            const usage = getServiceUsage(service.id);
            const hasAccess = accessCheck?.allowed;
            
            return (
              <Card key={service.id} className={`hover:shadow-lg transition-shadow ${!hasAccess ? 'opacity-75' : ''}`}>
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg mb-2 flex items-center gap-2">
                        {service.name}
                        {!hasAccess && <Lock className="h-4 w-4 text-gray-400" />}
                      </CardTitle>
                      <div className="flex gap-2 mb-2">
                        <Badge variant={service.type === 'one-off' ? 'default' : 'secondary'}>
                          {service.type === 'one-off' ? 'One-time' : 'Package'}
                        </Badge>
                        {service.popularity > 50 && (
                          <Badge variant="outline" className="text-orange-600 border-orange-200">
                            Popular
                          </Badge>
                        )}
                        {!hasAccess && (
                          <Badge variant="outline" className="text-red-600 border-red-200">
                            <Lock className="h-3 w-3 mr-1" />
                            Locked
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-blue-600">
                        N${service.clientPrice}
                      </div>
                      {service.type === 'subscription' && (
                        <div className="text-sm text-gray-500">per month</div>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <p className="text-sm text-gray-600 line-clamp-3">{service.description}</p>
                    
                    {/* Usage Information */}
                    {usage && (
                      <div className="p-2 bg-blue-50 rounded-lg">
                        <div className="text-sm font-medium text-blue-800">
                          Usage: {usage.used_count}/{usage.allowed_count}
                        </div>
                        <div className="w-full bg-blue-200 rounded-full h-2 mt-1">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ width: `${(usage.used_count / usage.allowed_count) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    )}

                    {/* Access Denied Reason */}
                    {!hasAccess && accessCheck?.reason && (
                      <div className="p-2 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
                        <AlertCircle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                        <div className="text-sm text-red-700">
                          {accessCheck.reason}
                        </div>
                      </div>
                    )}
                    
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        <span>{service.duration.hours}h {service.duration.minutes}m</span>
                      </div>
                      {service.averageRating > 0 && (
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span>{service.averageRating.toFixed(1)}</span>
                        </div>
                      )}
                    </div>

                    {service.totalBookings > 0 && (
                      <div className="text-sm text-gray-500">
                        {service.totalBookings} bookings completed
                      </div>
                    )}

                    {service.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {service.tags.slice(0, 3).map((tag) => (
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

                    {service.coverageAreas && service.coverageAreas.length > 0 && (
                      <div className="flex items-center gap-1 text-sm text-gray-500">
                        <MapPin className="h-4 w-4" />
                        <span>Available in {service.coverageAreas.length} areas</span>
                      </div>
                    )}
                    
                    {showBookingButton && (
                      <Button 
                        className="w-full mt-4"
                        disabled={!hasAccess}
                        onClick={() => handleBookService(service.id)}
                        variant={hasAccess ? "default" : "outline"}
                      >
                        {hasAccess ? "Book Now" : "Not Available"}
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card>
          <CardContent className="pt-8 pb-8 text-center">
            <Search className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No services found</h3>
            <p className="text-gray-600">Try adjusting your search or filter criteria</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
