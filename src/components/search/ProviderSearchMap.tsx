
import React, { useState, useEffect } from 'react';
import { MapPin, Star, Clock, Phone, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useProviderSearch, ProviderSearchFilters } from '@/hooks/useProviderSearch';
import { useToast } from '@/hooks/use-toast';

const ProviderSearchMap: React.FC = () => {
  const [filters, setFilters] = useState<ProviderSearchFilters>({
    maxDistance: 25,
    minRating: 0,
    availableDate: new Date().toISOString().split('T')[0],
    availableTime: '09:00'
  });
  
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationPermission, setLocationPermission] = useState<'pending' | 'granted' | 'denied'>('pending');
  
  const { searchProviders, checkProviderAvailability, providers, isLoading } = useProviderSearch();
  const { toast } = useToast();

  useEffect(() => {
    getCurrentLocation();
  }, []);

  useEffect(() => {
    if (userLocation) {
      searchProviders({
        ...filters,
        latitude: userLocation.lat,
        longitude: userLocation.lng
      });
    }
  }, [filters, userLocation, searchProviders]);

  const getCurrentLocation = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
          setLocationPermission('granted');
          
          toast({
            title: "Location Access Granted",
            description: "Now showing providers near your location.",
          });
        },
        (error) => {
          console.error('Location error:', error);
          setLocationPermission('denied');
          
          // Use default location (Windhoek, Namibia)
          setUserLocation({
            lat: -22.5609,
            lng: 17.0658
          });
          
          toast({
            title: "Location Access Denied",
            description: "Using default location. You can still search for providers.",
            variant: "destructive",
          });
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000
        }
      );
    } else {
      setLocationPermission('denied');
      setUserLocation({
        lat: -22.5609,
        lng: 17.0658
      });
    }
  };

  const handleFilterChange = (key: keyof ProviderSearchFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleBookProvider = async (providerId: string) => {
    if (!filters.availableDate || !filters.availableTime) {
      toast({
        title: "Missing Information",
        description: "Please select a date and time for your booking.",
        variant: "destructive",
      });
      return;
    }

    const isAvailable = await checkProviderAvailability(
      providerId,
      filters.availableDate,
      filters.availableTime,
      120 // Default 2-hour duration
    );

    if (isAvailable) {
      toast({
        title: "Provider Available",
        description: "You can proceed with booking this provider.",
      });
      // Here you would typically navigate to the booking form
    } else {
      toast({
        title: "Provider Unavailable",
        description: "This provider is not available at the selected time.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Search Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Find Providers Near You
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium">Service Type</label>
              <Select value={filters.serviceType} onValueChange={(value) => handleFilterChange('serviceType', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Any service" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Any service</SelectItem>
                  <SelectItem value="one-off">One-off</SelectItem>
                  <SelectItem value="subscription">Subscription</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm font-medium">Max Distance (km)</label>
              <Select value={filters.maxDistance?.toString()} onValueChange={(value) => handleFilterChange('maxDistance', parseInt(value))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5 km</SelectItem>
                  <SelectItem value="10">10 km</SelectItem>
                  <SelectItem value="25">25 km</SelectItem>
                  <SelectItem value="50">50 km</SelectItem>
                  <SelectItem value="100">100 km</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm font-medium">Available Date</label>
              <Input
                type="date"
                value={filters.availableDate}
                onChange={(e) => handleFilterChange('availableDate', e.target.value)}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
            
            <div>
              <label className="text-sm font-medium">Available Time</label>
              <Input
                type="time"
                value={filters.availableTime}
                onChange={(e) => handleFilterChange('availableTime', e.target.value)}
              />
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div>
              <label className="text-sm font-medium">Minimum Rating</label>
              <Select value={filters.minRating?.toString()} onValueChange={(value) => handleFilterChange('minRating', parseFloat(value))}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">Any rating</SelectItem>
                  <SelectItem value="3">3+ stars</SelectItem>
                  <SelectItem value="4">4+ stars</SelectItem>
                  <SelectItem value="4.5">4.5+ stars</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {locationPermission === 'denied' && (
              <Button variant="outline" onClick={getCurrentLocation} className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Enable Location
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Location Status */}
      {userLocation && (
        <div className="text-sm text-muted-foreground flex items-center gap-2">
          <MapPin className="h-4 w-4" />
          {locationPermission === 'granted' 
            ? 'Showing providers near your current location'
            : 'Showing providers near Windhoek, Namibia'
          }
        </div>
      )}

      {/* Provider Results */}
      <div>
        {isLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-muted-foreground">Finding providers near you...</p>
          </div>
        ) : providers.length > 0 ? (
          <>
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-muted-foreground">
                Found {providers.length} providers
              </p>
            </div>
            
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {providers.map((provider) => (
                <Card key={provider.id} className="relative">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-lg">{provider.full_name}</CardTitle>
                      <div className="flex items-center gap-1">
                        {provider.available ? (
                          <Badge variant="default">Available</Badge>
                        ) : (
                          <Badge variant="secondary">Busy</Badge>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-current text-yellow-400" />
                        <span className="font-medium">{provider.rating.toFixed(1)}</span>
                        <span className="text-sm text-muted-foreground">
                          ({provider.total_jobs} jobs)
                        </span>
                      </div>
                      
                      {provider.distance_km !== undefined && (
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <MapPin className="h-4 w-4" />
                          <span>{provider.distance_km.toFixed(1)} km</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex gap-2">
                      <Button
                        variant="default"
                        size="sm"
                        className="flex-1"
                        onClick={() => handleBookProvider(provider.id)}
                        disabled={!provider.available}
                      >
                        <Calendar className="h-4 w-4 mr-1" />
                        Book Now
                      </Button>
                      
                      <Button variant="outline" size="sm">
                        <Phone className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    {!provider.available && (
                      <p className="text-xs text-muted-foreground">
                        Not available at selected time
                      </p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </>
        ) : (
          <div className="text-center py-12">
            <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No providers found</h3>
            <p className="text-muted-foreground">
              Try expanding your search radius or adjusting the time
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProviderSearchMap;
