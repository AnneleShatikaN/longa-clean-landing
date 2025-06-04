
import React, { useState } from 'react';
import { Search, Users, Calendar } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AdvancedServiceSearch from '@/components/search/AdvancedServiceSearch';
import ProviderSearchMap from '@/components/search/ProviderSearchMap';
import AdvancedBookingSearch from '@/components/search/AdvancedBookingSearch';

const SearchPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('services');

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Search & Discovery</h1>
        <p className="text-muted-foreground">
          Find services, providers, and manage your bookings with our advanced search tools
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="services" className="flex items-center gap-2">
            <Search className="h-4 w-4" />
            Services
          </TabsTrigger>
          <TabsTrigger value="providers" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Providers
          </TabsTrigger>
          <TabsTrigger value="bookings" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Bookings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="services" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Service Discovery</CardTitle>
              <p className="text-sm text-muted-foreground">
                Search and filter through all available services with advanced criteria
              </p>
            </CardHeader>
            <CardContent>
              <AdvancedServiceSearch />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="providers" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Provider Matching</CardTitle>
              <p className="text-sm text-muted-foreground">
                Find available providers near your location with real-time availability
              </p>
            </CardHeader>
            <CardContent>
              <ProviderSearchMap />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="bookings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Booking Management</CardTitle>
              <p className="text-sm text-muted-foreground">
                Search, filter, and export your booking history with advanced tools
              </p>
            </CardHeader>
            <CardContent>
              <AdvancedBookingSearch />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SearchPage;
