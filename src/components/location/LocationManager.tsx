
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { MapPin, Navigation, Clock, DollarSign } from 'lucide-react';
import { 
  NAMIBIAN_CITIES, 
  SERVICE_AREAS, 
  validateNamibianAddress, 
  validateNamibianPhone,
  formatNamibianPhone,
  formatNAD,
  findClosestServiceArea,
  calculateLocationPriceAdjustment
} from '@/utils/locationUtils';
import { toast } from 'sonner';

interface LocationData {
  street: string;
  suburb: string;
  city: string;
  district: string;
  postalCode: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

interface LocationManagerProps {
  userType: 'client' | 'provider';
  onLocationUpdate?: (location: LocationData) => void;
  currentLocation?: LocationData;
}

export const LocationManager: React.FC<LocationManagerProps> = ({
  userType,
  onLocationUpdate,
  currentLocation
}) => {
  const [location, setLocation] = useState<LocationData>({
    street: currentLocation?.street || '',
    suburb: currentLocation?.suburb || '',
    city: currentLocation?.city || 'Windhoek',
    district: currentLocation?.district || '',
    postalCode: currentLocation?.postalCode || '',
    coordinates: currentLocation?.coordinates
  });

  const [phone, setPhone] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [serviceArea, setServiceArea] = useState(null);
  const [priceAdjustment, setPriceAdjustment] = useState(0);

  const selectedCity = NAMIBIAN_CITIES[location.city.toLowerCase().replace(' ', '')];

  useEffect(() => {
    if (location.coordinates) {
      const area = findClosestServiceArea(location.coordinates);
      setServiceArea(area);
      
      if (area) {
        setPriceAdjustment(area.priceAdjustment);
      }
    }
  }, [location.coordinates]);

  const handleCityChange = (cityKey: string) => {
    const cityData = NAMIBIAN_CITIES[cityKey];
    setLocation(prev => ({
      ...prev,
      city: cityData.name,
      district: '',
      coordinates: cityData.coordinates
    }));
  };

  const handleDistrictChange = (district: string) => {
    setLocation(prev => ({
      ...prev,
      district
    }));
  };

  const validateLocation = async () => {
    setIsValidating(true);
    
    try {
      // Validate address format
      const isValidAddress = validateNamibianAddress({
        street: location.street,
        suburb: location.suburb,
        city: location.city,
        postalCode: location.postalCode
      });
      
      if (!isValidAddress) {
        toast.error('Please provide a valid Namibian address');
        return false;
      }
      
      // Validate phone number if provided
      if (phone && !validateNamibianPhone(phone)) {
        toast.error('Please provide a valid Namibian phone number (+264)');
        return false;
      }
      
      // Simulate geocoding validation
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Check if location is in service area
      if (location.coordinates) {
        const area = findClosestServiceArea(location.coordinates);
        if (!area) {
          toast.error('Sorry, we don\'t currently service this area');
          return false;
        }
      }
      
      toast.success('Location validated successfully');
      return true;
      
    } catch (error) {
      toast.error('Failed to validate location');
      return false;
    } finally {
      setIsValidating(false);
    }
  };

  const handleSaveLocation = async () => {
    const isValid = await validateLocation();
    if (isValid && onLocationUpdate) {
      const formattedLocation = {
        ...location,
        phone: phone ? formatNamibianPhone(phone) : undefined
      };
      onLocationUpdate(formattedLocation);
      toast.success('Location updated successfully');
    }
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coords = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          
          setLocation(prev => ({
            ...prev,
            coordinates: coords
          }));
          
          toast.success('Current location detected');
        },
        (error) => {
          toast.error('Unable to get current location');
          console.error('Geolocation error:', error);
        }
      );
    } else {
      toast.error('Geolocation not supported by this browser');
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            {userType === 'provider' ? 'Service Location & Coverage' : 'Service Address'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Current Location Detection */}
          <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
            <span className="text-sm text-gray-600">Use current location</span>
            <Button variant="outline" size="sm" onClick={getCurrentLocation}>
              <Navigation className="h-4 w-4 mr-2" />
              Detect Location
            </Button>
          </div>

          {/* Address Form */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="street">Street Address</Label>
              <Input
                id="street"
                value={location.street}
                onChange={(e) => setLocation(prev => ({ ...prev, street: e.target.value }))}
                placeholder="123 Independence Avenue"
              />
            </div>
            
            <div>
              <Label htmlFor="suburb">Suburb</Label>
              <Input
                id="suburb"
                value={location.suburb}
                onChange={(e) => setLocation(prev => ({ ...prev, suburb: e.target.value }))}
                placeholder="Klein Windhoek"
              />
            </div>
            
            <div>
              <Label htmlFor="city">City</Label>
              <Select value={location.city.toLowerCase().replace(' ', '')} onValueChange={handleCityChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select city" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(NAMIBIAN_CITIES).map(([key, city]) => (
                    <SelectItem key={key} value={key}>
                      {city.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="district">District</Label>
              <Select value={location.district} onValueChange={handleDistrictChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select district" />
                </SelectTrigger>
                <SelectContent>
                  {selectedCity?.districts.map((district) => (
                    <SelectItem key={district} value={district}>
                      {district}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="postalCode">Postal Code (Optional)</Label>
              <Input
                id="postalCode"
                value={location.postalCode}
                onChange={(e) => setLocation(prev => ({ ...prev, postalCode: e.target.value }))}
                placeholder="10001"
                maxLength={5}
              />
            </div>
            
            <div>
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+264 61 123 4567"
              />
            </div>
          </div>

          {/* Service Area Information */}
          {serviceArea && (
            <div className="p-4 bg-blue-50 rounded-lg">
              <h4 className="font-medium mb-2">Service Area: {serviceArea.name}</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Coverage Radius:</span>
                  <span className="ml-2 font-medium">{serviceArea.radius}km</span>
                </div>
                <div>
                  <span className="text-gray-600">Price Adjustment:</span>
                  <span className="ml-2 font-medium">
                    {priceAdjustment > 0 ? `+${priceAdjustment}%` : 'Standard'}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Provider-specific options */}
          {userType === 'provider' && (
            <div className="space-y-4">
              <h4 className="font-medium">Service Coverage Settings</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Maximum Travel Distance (km)</Label>
                  <Input type="number" placeholder="25" />
                </div>
                <div>
                  <Label>Travel Rate (per km)</Label>
                  <Input type="number" placeholder="5.00" />
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button 
              onClick={handleSaveLocation}
              disabled={isValidating}
              className="flex-1"
            >
              {isValidating ? 'Validating...' : 'Save Location'}
            </Button>
            <Button 
              variant="outline" 
              onClick={validateLocation}
              disabled={isValidating}
            >
              Validate Address
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Service Areas Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Available Service Areas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {SERVICE_AREAS.map((area) => (
              <div key={area.id} className="p-3 border rounded-lg">
                <h4 className="font-medium">{area.name}</h4>
                <p className="text-sm text-gray-600">{area.city}</p>
                <div className="flex justify-between items-center mt-2">
                  <Badge variant="outline">
                    {area.radius}km radius
                  </Badge>
                  {area.priceAdjustment > 0 && (
                    <Badge variant="secondary">
                      +{area.priceAdjustment}%
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LocationManager;
