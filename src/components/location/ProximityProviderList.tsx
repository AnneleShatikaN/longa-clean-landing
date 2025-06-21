
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Star, Briefcase, Clock } from 'lucide-react';
import { getAvailableProvidersForLocation } from '@/utils/jobAssignment';

interface ProximityProviderListProps {
  town: string;
  suburb: string;
  serviceId?: string;
  onProviderSelect?: (providerId: string) => void;
}

interface ProviderMatch {
  id: string;
  town: string;
  suburb: string;
  max_distance: number;
  rating: number;
  total_jobs: number;
  is_available: boolean;
  distance: number;
}

const ProximityProviderList: React.FC<ProximityProviderListProps> = ({
  town,
  suburb,
  serviceId,
  onProviderSelect
}) => {
  const [providers, setProviders] = useState<ProviderMatch[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (town && suburb) {
      loadProviders();
    }
  }, [town, suburb, serviceId]);

  const loadProviders = async () => {
    setIsLoading(true);
    try {
      const matches = await getAvailableProvidersForLocation(town, suburb, serviceId);
      setProviders(matches);
    } catch (error) {
      console.error('Error loading providers:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getDistanceLabel = (distance: number) => {
    switch (distance) {
      case 0: return 'Same suburb';
      case 1: return 'Adjacent suburb';
      case 2: return 'Nearby suburb';
      case 3: return 'Further suburb';
      case 4: return 'Across town';
      default: return `${distance} levels away`;
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Available Providers
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          Available Providers in {suburb}, {town}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {providers.length === 0 ? (
          <div className="text-center py-8">
            <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Providers Available</h3>
            <p className="text-gray-600">
              No verified providers are currently available in or near {suburb}.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {providers.map((provider) => (
              <div
                key={provider.id}
                className={`p-4 border rounded-lg transition-colors ${
                  onProviderSelect ? 'cursor-pointer hover:bg-gray-50' : ''
                }`}
                onClick={() => onProviderSelect?.(provider.id)}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                      <Briefcase className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <h4 className="font-medium">Provider #{provider.id.slice(-8)}</h4>
                      <p className="text-sm text-gray-600">{provider.suburb}, {provider.town}</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {getDistanceLabel(provider.distance)}
                  </Badge>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 text-yellow-500" />
                      <span>{provider.rating.toFixed(1)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Briefcase className="h-4 w-4 text-gray-500" />
                      <span>{provider.total_jobs} jobs</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4 text-green-500" />
                      <span>Available</span>
                    </div>
                  </div>
                  
                  {provider.distance === 0 && (
                    <Badge className="bg-green-100 text-green-800">
                      Local
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ProximityProviderList;
