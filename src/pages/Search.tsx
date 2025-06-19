
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useServices } from '@/contexts/ServiceContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useNavigate } from 'react-router-dom';
import { 
  Search as SearchIcon, 
  Filter, 
  ArrowLeft, 
  Home, 
  Sparkles, 
  Zap, 
  Clock, 
  DollarSign,
  Loader2,
  MapPin
} from 'lucide-react';

const Search = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { services, isLoading, searchServices, getActiveServices } = useServices();
  const [searchQuery, setSearchQuery] = useState('');
  const [serviceType, setServiceType] = useState('all');
  const [sortBy, setSortBy] = useState('popularity');
  const [priceRange, setPriceRange] = useState('all');

  const activeServices = getActiveServices();

  const serviceIcons = {
    'home-cleaning': Home,
    'deep-clean': Sparkles,
    'move-in': Zap,
    'default': Home
  };

  const getServiceIcon = (serviceName: string) => {
    const name = serviceName.toLowerCase().replace(/\s+/g, '-');
    return serviceIcons[name as keyof typeof serviceIcons] || serviceIcons.default;
  };

  // Filter and sort services
  const filteredServices = React.useMemo(() => {
    let filtered = searchQuery 
      ? searchServices(searchQuery)
      : activeServices;

    // Filter by service type
    if (serviceType !== 'all') {
      filtered = filtered.filter(service => service.type === serviceType);
    }

    // Filter by price range
    if (priceRange !== 'all') {
      const ranges = {
        'under-100': [0, 100],
        '100-300': [100, 300],
        '300-500': [300, 500],
        'over-500': [500, Infinity]
      };
      const [min, max] = ranges[priceRange as keyof typeof ranges] || [0, Infinity];
      filtered = filtered.filter(service => 
        service.clientPrice >= min && service.clientPrice <= max
      );
    }

    // Sort services
    switch (sortBy) {
      case 'price-low':
        filtered.sort((a, b) => a.clientPrice - b.clientPrice);
        break;
      case 'price-high':
        filtered.sort((a, b) => b.clientPrice - a.clientPrice);
        break;
      case 'name':
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'popularity':
      default:
        filtered.sort((a, b) => b.popularity - a.popularity);
        break;
    }

    return filtered;
  }, [searchQuery, serviceType, priceRange, sortBy, activeServices, searchServices]);

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-white flex items-center justify-center p-4">
        <div className="text-center">
          <SearchIcon className="h-16 w-16 text-purple-600 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Please Sign In</h1>
          <p className="text-gray-600 mb-6">You need to be logged in to search and book services</p>
          <Button 
            onClick={() => navigate('/auth')}
            className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white rounded-full px-8"
          >
            Sign In
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 border-purple-200 text-purple-700 hover:bg-purple-50"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <div>
            <h1 className="text-4xl font-bold text-gray-900 font-['Inter']">Find Services</h1>
            <p className="text-xl text-gray-600 mt-2">
              Search and book professional cleaning services
            </p>
          </div>
        </div>

        {/* Search and Filters */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="space-y-4 md:space-y-0 md:grid md:grid-cols-2 lg:grid-cols-5 md:gap-4">
              {/* Search Input */}
              <div className="relative lg:col-span-2">
                <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search services..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 border-purple-200 focus:border-purple-400"
                />
              </div>

              {/* Service Type Filter */}
              <Select value={serviceType} onValueChange={setServiceType}>
                <SelectTrigger className="border-purple-200 focus:border-purple-400">
                  <SelectValue placeholder="Service type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="one-off">One-time</SelectItem>
                  <SelectItem value="subscription">Subscription</SelectItem>
                </SelectContent>
              </Select>

              {/* Price Range Filter */}
              <Select value={priceRange} onValueChange={setPriceRange}>
                <SelectTrigger className="border-purple-200 focus:border-purple-400">
                  <SelectValue placeholder="Price range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Any Price</SelectItem>
                  <SelectItem value="under-100">Under N$100</SelectItem>
                  <SelectItem value="100-300">N$100 - N$300</SelectItem>
                  <SelectItem value="300-500">N$300 - N$500</SelectItem>
                  <SelectItem value="over-500">Over N$500</SelectItem>
                </SelectContent>
              </Select>

              {/* Sort By */}
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="border-purple-200 focus:border-purple-400">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="popularity">Most Popular</SelectItem>
                  <SelectItem value="price-low">Price: Low to High</SelectItem>
                  <SelectItem value="price-high">Price: High to Low</SelectItem>
                  <SelectItem value="name">Name A-Z</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Clear Filters */}
            {(searchQuery || serviceType !== 'all' || priceRange !== 'all' || sortBy !== 'popularity') && (
              <div className="mt-4 pt-4 border-t">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSearchQuery('');
                    setServiceType('all');
                    setPriceRange('all');
                    setSortBy('popularity');
                  }}
                  className="border-purple-200 text-purple-700 hover:bg-purple-50"
                >
                  Clear All Filters
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Results Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-semibold text-gray-900">
              {isLoading ? 'Loading...' : `${filteredServices.length} service${filteredServices.length !== 1 ? 's' : ''} found`}
            </h2>
            <div className="flex items-center gap-1 text-sm text-gray-500">
              <MapPin className="h-4 w-4" />
              <span>Windhoek & surrounding areas</span>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="text-center py-12">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-purple-600" />
            <p className="text-gray-600">Loading services...</p>
          </div>
        )}

        {/* No Results */}
        {!isLoading && filteredServices.length === 0 && (
          <Card className="text-center py-12">
            <CardContent>
              <SearchIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No services found</h3>
              <p className="text-gray-600 mb-6">
                Try adjusting your search terms or filters to find what you're looking for
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setSearchQuery('');
                    setServiceType('all');
                    setPriceRange('all');
                    setSortBy('popularity');
                  }}
                  className="border-purple-200 text-purple-700 hover:bg-purple-50"
                >
                  Clear Filters
                </Button>
                <Button 
                  onClick={() => navigate('/subscription-packages')}
                  className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white rounded-full"
                >
                  View Packages
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Services Grid */}
        {!isLoading && filteredServices.length > 0 && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredServices.map((service) => {
              const IconComponent = getServiceIcon(service.name);
              return (
                <Card key={service.id} className="hover:shadow-xl transition-all duration-300 border-0 shadow-lg group">
                  <CardHeader className="text-center pb-4">
                    <div className="bg-gradient-to-r from-purple-100 to-purple-200 p-4 rounded-full w-fit mx-auto mb-4 group-hover:scale-110 transition-transform">
                      <IconComponent className="h-8 w-8 text-purple-600" />
                    </div>
                    <CardTitle className="text-xl font-bold font-['Inter']">{service.name}</CardTitle>
                    <Badge variant={service.type === 'subscription' ? 'default' : 'secondary'} className="w-fit mx-auto">
                      {service.type === 'subscription' ? 'Subscription' : 'One-time'}
                    </Badge>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <p className="text-gray-600 text-center line-clamp-2">
                        {service.description || 'Professional cleaning service'}
                      </p>
                      
                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          <span>{Math.floor(service.duration.hours * 60 + service.duration.minutes)} min</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <DollarSign className="h-4 w-4" />
                          <span className="font-semibold text-lg text-gray-900">N${service.clientPrice}</span>
                        </div>
                      </div>

                      {service.tags && service.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {service.tags.slice(0, 3).map((tag, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}

                      <div className="space-y-2">
                        <Button 
                          onClick={() => navigate(`/one-off-booking?service_id=${service.id}`)} 
                          className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white rounded-full"
                        >
                          Book Now
                        </Button>
                        <Button 
                          variant="outline" 
                          onClick={() => navigate(`/service/${service.id}`)}
                          className="w-full border-purple-200 text-purple-700 hover:bg-purple-50 rounded-full"
                        >
                          View Details
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Call to Action */}
        <div className="mt-16 text-center bg-white p-8 rounded-2xl shadow-lg">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 font-['Inter']">
            Save with Subscription Packages
          </h2>
          <p className="text-gray-600 mb-6">
            Get regular cleaning services at a discounted rate with our subscription packages
          </p>
          <Button 
            onClick={() => navigate('/subscription-packages')}
            className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white rounded-full px-8"
          >
            View Packages & Save
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Search;
