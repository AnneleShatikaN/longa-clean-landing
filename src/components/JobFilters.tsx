
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, Filter } from 'lucide-react';

interface JobFiltersProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  statusFilter: string;
  onStatusFilterChange: (status: string) => void;
  locationFilter: string;
  onLocationFilterChange: (location: string) => void;
}

const JobFilters: React.FC<JobFiltersProps> = ({
  searchTerm,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  locationFilter,
  onLocationFilterChange,
}) => {
  const statuses = ['all', 'available', 'accepted', 'completed'];
  const locations = ['all', 'Klein Windhoek', 'Olympia', 'Windhoek Central', 'Eros', 'Auasblick'];

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border space-y-4">
      <div className="flex items-center space-x-2">
        <Filter className="h-4 w-4 text-gray-500" />
        <span className="font-medium text-gray-700">Filters</span>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search jobs..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <div>
          <label className="text-sm font-medium text-gray-700 mb-2 block">Status</label>
          <div className="flex flex-wrap gap-2">
            {statuses.map((status) => (
              <Badge
                key={status}
                variant={statusFilter === status ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => onStatusFilterChange(status)}
              >
                {status === 'all' ? 'All' : status.charAt(0).toUpperCase() + status.slice(1)}
              </Badge>
            ))}
          </div>
        </div>
        
        <div>
          <label className="text-sm font-medium text-gray-700 mb-2 block">Location</label>
          <div className="flex flex-wrap gap-2">
            {locations.map((location) => (
              <Badge
                key={location}
                variant={locationFilter === location ? "default" : "outline"}
                className="cursor-pointer text-xs"
                onClick={() => onLocationFilterChange(location)}
              >
                {location === 'all' ? 'All' : location}
              </Badge>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobFilters;
