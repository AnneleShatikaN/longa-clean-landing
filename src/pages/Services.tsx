
import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useServices } from '@/contexts/ServiceContext';
import { ArrowLeft, Home, Sparkles, Zap, Clock, DollarSign, Loader2, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ServiceErrorBoundary } from '@/components/common/ServiceErrorBoundary';

const ServicesContent = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { services, isLoading, getActiveServices } = useServices();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

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

  const handleServiceClick = (serviceId: string) => {
    console.log('Services: Navigating to service details for ID:', serviceId);
    if (!serviceId) {
      console.error('Services: No service ID provided');
      return;
    }
    navigate(`/service/${serviceId}`);
  };

  const handleBookService = (serviceId: string) => {
    console.log('Services: Book service clicked for ID:', serviceId);
    if (!user) {
      navigate('/auth');
      return;
    }
    if (!serviceId) {
      console.error('Services: No service ID provided for booking');
      return;
    }
    navigate(`/service/${serviceId}/book`);
  };

  const filteredServices = activeServices.filter(service => {
    const matchesSearch = service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         service.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || service.type === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = [
    { value: 'all', label: 'All Services' },
    { value: 'one-off', label: 'One-time Services' },
    { value: 'subscription', label: 'Package Services' }
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-purple-600" />
          <p className="text-gray-600">Loading services...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-white">
      <div className="container mx-auto px-4 py-4 sm:py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6 sm:mb-8">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 border-purple-200 text-purple-700 hover:bg-purple-50 w-fit"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 font-['Inter']">Our Services</h1>
            <p className="text-lg sm:text-xl text-gray-600 mt-2">
              Discover professional cleaning services in your area
            </p>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="mb-6 sm:mb-8 space-y-4 md:space-y-0 md:flex md:items-center md:gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search services..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 border-purple-200 focus:border-purple-400"
            />
          </div>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-full md:w-48 border-purple-200 focus:border-purple-400">
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category.value} value={category.value}>
                  {category.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6 sm:mb-8">
          {user ? (
            <Button 
              onClick={() => navigate('/search')} 
              className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white rounded-full px-6 sm:px-8"
            >
              Browse & Book Services
            </Button>
          ) : (
            <Button 
              onClick={() => navigate('/auth')} 
              className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white rounded-full px-6 sm:px-8"
            >
              Sign In to Book Services
            </Button>
          )}
          <Button 
            variant="outline" 
            onClick={() => navigate('/subscription-packages')}
            className="border-purple-200 text-purple-700 hover:bg-purple-50 rounded-full px-6 sm:px-8"
          >
            View Packages & Save
          </Button>
        </div>

        {/* Services Grid */}
        {filteredServices.length === 0 ? (
          <Card className="text-center py-8 sm:py-12">
            <CardContent>
              <Search className="h-12 sm:h-16 w-12 sm:w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">No services found</h3>
              <p className="text-gray-600 mb-6">
                {searchQuery ? 'Try adjusting your search terms' : 'No services are currently available'}
              </p>
              {searchQuery && (
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('all');
                  }}
                  className="border-purple-200 text-purple-700 hover:bg-purple-50"
                >
                  Clear Search
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {filteredServices.map((service) => {
              const IconComponent = getServiceIcon(service.name);
              return (
                <Card key={service.id} className="hover:shadow-xl transition-all duration-300 border-0 shadow-lg group cursor-pointer">
                  <CardHeader className="text-center pb-4">
                    <div className="bg-gradient-to-r from-purple-100 to-purple-200 p-3 sm:p-4 rounded-full w-fit mx-auto mb-4 group-hover:scale-110 transition-transform">
                      <IconComponent className="h-6 w-6 sm:h-8 sm:w-8 text-purple-600" />
                    </div>
                    <CardTitle className="text-lg sm:text-xl font-bold font-['Inter']">{service.name}</CardTitle>
                    <Badge variant={service.type === 'subscription' ? 'default' : 'secondary'} className="w-fit mx-auto">
                      {service.type === 'subscription' ? 'Package' : 'One-time'}
                    </Badge>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <p className="text-gray-600 text-center line-clamp-2 text-sm sm:text-base">
                        {service.description || 'Professional cleaning service'}
                      </p>
                      
                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          <span>{Math.floor(service.duration.hours * 60 + service.duration.minutes)} min</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <DollarSign className="h-4 w-4" />
                          <span className="font-semibold text-base sm:text-lg text-gray-900">N${service.clientPrice}</span>
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
                          onClick={() => handleBookService(service.id)} 
                          className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white rounded-full text-sm sm:text-base"
                        >
                          {user ? 'Book Now' : 'Sign In to Book'}
                        </Button>
                        <Button 
                          variant="outline" 
                          onClick={() => handleServiceClick(service.id)}
                          className="w-full border-purple-200 text-purple-700 hover:bg-purple-50 rounded-full text-sm sm:text-base"
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
        <div className="mt-12 sm:mt-16 text-center bg-white p-6 sm:p-8 rounded-2xl shadow-lg">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 font-['Inter']">
            Can't find what you're looking for?
          </h2>
          <p className="text-gray-600 mb-6">
            Contact our support team to discuss custom cleaning solutions
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              onClick={() => navigate('/contact')}
              className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white rounded-full px-6 sm:px-8"
            >
              Contact Support
            </Button>
            <Button 
              variant="outline" 
              onClick={() => navigate('/subscription-packages')}
              className="border-purple-200 text-purple-700 hover:bg-purple-50 rounded-full px-6 sm:px-8"
            >
              View Packages
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

const Services = () => {
  return (
    <ServiceErrorBoundary>
      <ServicesContent />
    </ServiceErrorBoundary>
  );
};

export default Services;
