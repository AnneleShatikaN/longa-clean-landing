
import React, { useState, useEffect, useMemo } from 'react';
import { Search, Filter, SlidersHorizontal, Star, Clock, DollarSign } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Separator } from '@/components/ui/separator';
import { useAdvancedSearch, SearchFilters } from '@/hooks/useAdvancedSearch';
import { useDebounce } from '@/hooks/useDebounce';

const AdvancedServiceSearch: React.FC = () => {
  const [filters, setFilters] = useState<SearchFilters>({
    query: '',
    serviceType: '',
    minPrice: 0,
    maxPrice: 1000,
    minDuration: 0,
    maxDuration: 480,
    minRating: 0,
    tags: [],
    sortBy: 'relevance',
    sortOrder: 'DESC'
  });

  const [showFilters, setShowFilters] = useState(false);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  
  const { searchServices, getSuggestions, trackResultClick, results, suggestions, isLoading } = useAdvancedSearch();
  const debouncedQuery = useDebounce(filters.query, 300);

  // Popular tags for suggestions
  const popularTags = [
    'cleaning', 'maintenance', 'repair', 'installation', 'inspection',
    'emergency', 'residential', 'commercial', 'outdoor', 'indoor'
  ];

  useEffect(() => {
    if (debouncedQuery.length >= 2) {
      getSuggestions(debouncedQuery);
    }
  }, [debouncedQuery, getSuggestions]);

  useEffect(() => {
    searchServices(filters);
  }, [filters, searchServices]);

  const handleFilterChange = (key: keyof SearchFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleTagToggle = (tag: string) => {
    const newTags = selectedTags.includes(tag)
      ? selectedTags.filter(t => t !== tag)
      : [...selectedTags, tag];
    
    setSelectedTags(newTags);
    handleFilterChange('tags', newTags);
  };

  const clearFilters = () => {
    setFilters({
      query: '',
      serviceType: '',
      minPrice: 0,
      maxPrice: 1000,
      minDuration: 0,
      maxDuration: 480,
      minRating: 0,
      tags: [],
      sortBy: 'relevance',
      sortOrder: 'DESC'
    });
    setSelectedTags([]);
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  return (
    <div className="space-y-6">
      {/* Search Header */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search for services..."
            value={filters.query}
            onChange={(e) => handleFilterChange('query', e.target.value)}
            className="pl-10"
          />
          
          {/* Search Suggestions */}
          {suggestions.length > 0 && filters.query && (
            <Card className="absolute top-full mt-1 w-full z-50 max-h-64 overflow-auto">
              <CardContent className="p-2">
                {suggestions.map((suggestion, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-2 hover:bg-accent rounded cursor-pointer"
                    onClick={() => handleFilterChange('query', suggestion.suggestion)}
                  >
                    <span>{suggestion.suggestion}</span>
                    <Badge variant="secondary">{suggestion.category}</Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
        
        <Popover open={showFilters} onOpenChange={setShowFilters}>
          <PopoverTrigger asChild>
            <Button variant="outline" className="flex items-center gap-2">
              <SlidersHorizontal className="h-4 w-4" />
              Filters
              {Object.values(filters).some(v => v && v !== '' && (Array.isArray(v) ? v.length > 0 : true)) && (
                <Badge variant="secondary" className="ml-1">Active</Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80" align="end">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold">Advanced Filters</h4>
                <Button variant="ghost" size="sm" onClick={clearFilters}>
                  Clear All
                </Button>
              </div>
              
              <Separator />
              
              {/* Service Type */}
              <div>
                <label className="text-sm font-medium">Service Type</label>
                <Select value={filters.serviceType} onValueChange={(value) => handleFilterChange('serviceType', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="All types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All types</SelectItem>
                    <SelectItem value="one-off">One-off</SelectItem>
                    <SelectItem value="subscription">Subscription</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {/* Price Range */}
              <div>
                <label className="text-sm font-medium">Price Range (N$)</label>
                <div className="px-2 pt-2">
                  <Slider
                    value={[filters.minPrice || 0, filters.maxPrice || 1000]}
                    onValueChange={([min, max]) => {
                      handleFilterChange('minPrice', min);
                      handleFilterChange('maxPrice', max);
                    }}
                    max={1000}
                    step={10}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>N${filters.minPrice}</span>
                    <span>N${filters.maxPrice}</span>
                  </div>
                </div>
              </div>
              
              {/* Duration Range */}
              <div>
                <label className="text-sm font-medium">Duration</label>
                <div className="px-2 pt-2">
                  <Slider
                    value={[filters.minDuration || 0, filters.maxDuration || 480]}
                    onValueChange={([min, max]) => {
                      handleFilterChange('minDuration', min);
                      handleFilterChange('maxDuration', max);
                    }}
                    max={480}
                    step={30}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>{formatDuration(filters.minDuration || 0)}</span>
                    <span>{formatDuration(filters.maxDuration || 480)}</span>
                  </div>
                </div>
              </div>
              
              {/* Minimum Rating */}
              <div>
                <label className="text-sm font-medium">Minimum Rating</label>
                <Select value={filters.minRating?.toString()} onValueChange={(value) => handleFilterChange('minRating', parseFloat(value))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Any rating" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">Any rating</SelectItem>
                    <SelectItem value="3">3+ stars</SelectItem>
                    <SelectItem value="4">4+ stars</SelectItem>
                    <SelectItem value="4.5">4.5+ stars</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {/* Tags */}
              <div>
                <label className="text-sm font-medium">Tags</label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {popularTags.map(tag => (
                    <Badge
                      key={tag}
                      variant={selectedTags.includes(tag) ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => handleTagToggle(tag)}
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
              
              {/* Sort Options */}
              <div>
                <label className="text-sm font-medium">Sort By</label>
                <Select value={filters.sortBy} onValueChange={(value) => handleFilterChange('sortBy', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="relevance">Relevance</SelectItem>
                    <SelectItem value="price">Price</SelectItem>
                    <SelectItem value="rating">Rating</SelectItem>
                    <SelectItem value="popularity">Popularity</SelectItem>
                    <SelectItem value="newest">Newest</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* Results */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-muted-foreground">Searching services...</p>
          </div>
        ) : results.length > 0 ? (
          <>
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Found {results.length} services
              </p>
            </div>
            
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {results.map((service) => (
                <Card 
                  key={service.id} 
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => trackResultClick(service.id)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-lg">{service.name}</CardTitle>
                      <Badge variant={service.service_type === 'one-off' ? 'default' : 'secondary'}>
                        {service.service_type}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
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
                        <Star className="h-4 w-4 fill-current text-yellow-400" />
                        <span>{service.avg_rating.toFixed(1)}</span>
                      </div>
                    </div>
                    
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
                    
                    <div className="text-xs text-muted-foreground">
                      {service.total_bookings} bookings completed
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </>
        ) : (
          <div className="text-center py-12">
            <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No services found</h3>
            <p className="text-muted-foreground">
              Try adjusting your search criteria or filters
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdvancedServiceSearch;
