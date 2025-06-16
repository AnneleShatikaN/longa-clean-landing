
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ProviderProfile } from './ProviderProfile';
import { useProviderSearch } from '@/hooks/useProviderSearch';
import { Search, MapPin, Star, Users } from 'lucide-react';

interface ProviderSelectionProps {
  serviceId: string;
  location?: string;
  onProviderSelected: (providerId: string) => void;
  selectedProviderId?: string;
}

export const ProviderSelection: React.FC<ProviderSelectionProps> = ({
  serviceId,
  location = 'windhoek',
  onProviderSelected,
  selectedProviderId
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'rating' | 'jobs' | 'availability'>('rating');
  const [selectedProvider, setSelectedProvider] = useState<string | undefined>(selectedProviderId);
  
  const { searchProviders, providers, isLoading } = useProviderSearch();

  useEffect(() => {
    // Search for providers when component mounts or filters change
    searchProviders({
      serviceType: 'one-off', // You can make this dynamic based on service
      minRating: 0,
      maxDistance: 50
    });
  }, [searchProviders]);

  const handleProviderSelect = (providerId: string) => {
    setSelectedProvider(providerId);
    onProviderSelected(providerId);
  };

  const handleMessageProvider = (phone: string) => {
    // This is handled in the ProviderProfile component
  };

  const handleCheckAvailability = (providerId: string) => {
    // TODO: Open availability calendar modal
    console.log('Check availability for provider:', providerId);
  };

  const filteredProviders = providers.filter(provider => {
    if (!searchTerm) return true;
    return provider.full_name.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const sortedProviders = [...filteredProviders].sort((a, b) => {
    switch (sortBy) {
      case 'rating':
        return b.rating - a.rating;
      case 'jobs':
        return b.total_jobs - a.total_jobs;
      case 'availability':
        return Number(b.available) - Number(a.available);
      default:
        return 0;
    }
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Finding Available Providers...
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="flex items-start gap-4">
                  <div className="h-16 w-16 bg-gray-200 rounded-full"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Available Providers
          <Badge variant="secondary" className="ml-auto">
            {sortedProviders.length} found
          </Badge>
        </CardTitle>
        
        {/* Search and Filter Controls */}
        <div className="flex flex-col sm:flex-row gap-4 mt-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search providers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          
          <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="rating">Highest Rated</SelectItem>
              <SelectItem value="jobs">Most Experienced</SelectItem>
              <SelectItem value="availability">Available First</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        {location && (
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4" />
            <span>Showing providers in {location.charAt(0).toUpperCase() + location.slice(1)}</span>
          </div>
        )}
      </CardHeader>
      
      <CardContent>
        {sortedProviders.length > 0 ? (
          <div className="space-y-4">
            {sortedProviders.map((provider) => (
              <ProviderProfile
                key={provider.id}
                id={provider.id}
                full_name={provider.full_name}
                rating={provider.rating}
                total_jobs={provider.total_jobs}
                isAvailable={provider.available}
                onSelectProvider={handleProviderSelect}
                onMessageProvider={handleMessageProvider}
                onCheckAvailability={handleCheckAvailability}
                isSelected={selectedProvider === provider.id}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Users className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No providers found</h3>
            <p className="text-gray-600">
              {searchTerm 
                ? "Try adjusting your search criteria"
                : "No providers are currently available for this service"
              }
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
