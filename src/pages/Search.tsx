
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { ServiceDisplayWithEntitlements } from '@/components/ServiceDisplayWithEntitlements';
import { PackagePrompt } from '@/components/client/PackagePrompt';
import AdvancedServiceSearch from '@/components/search/AdvancedServiceSearch';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { useServiceEntitlements } from '@/hooks/useServiceEntitlements';
import { Search as SearchIcon, Grid, Package, ArrowLeft, Info } from 'lucide-react';

const Search = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { serviceUsage } = useServiceEntitlements();
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null);

  const hasActivePackage = serviceUsage.length > 0;

  const handleServiceSelection = (serviceId: string) => {
    setSelectedServiceId(serviceId);
    // Navigate to booking page with selected service
    navigate('/one-off-booking', { state: { serviceId } });
  };

  const handleUpgradeToPackages = () => {
    navigate('/subscription-packages');
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Please Sign In</h1>
          <p className="text-gray-600 mb-6">You need to be logged in to search and book services</p>
          <Button onClick={() => navigate('/auth')}>
            Sign In
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(-1)}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900">Browse Services</h1>
            <p className="text-gray-600 mt-2">Find and book individual services or explore packages</p>
          </div>
          <Badge variant={hasActivePackage ? "default" : "secondary"}>
            {hasActivePackage ? "Package Member" : "Individual Booking"}
          </Badge>
        </div>

        {/* Package Promotion for Non-Package Users */}
        {!hasActivePackage && (
          <Card className="mb-8 border-blue-200 bg-blue-50">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Info className="h-5 w-5 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-blue-900 mb-2">Save with a Package</h3>
                  <p className="text-blue-700 mb-4">
                    Get better value and priority booking by subscribing to one of our service packages.
                  </p>
                  <Button onClick={handleUpgradeToPackages} size="sm" variant="outline" className="border-blue-300 text-blue-700 hover:bg-blue-100">
                    View Packages
                    <Package className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Tabs defaultValue="browse" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="browse" className="flex items-center gap-2">
              <Grid className="h-4 w-4" />
              Browse Services
            </TabsTrigger>
            <TabsTrigger value="advanced" className="flex items-center gap-2">
              <SearchIcon className="h-4 w-4" />
              Advanced Search
            </TabsTrigger>
          </TabsList>

          <TabsContent value="browse" className="space-y-6">
            <ServiceDisplayWithEntitlements
              onBookService={handleServiceSelection}
              showBookingButton={true}
              allowIndividualBooking={true}
            />
          </TabsContent>

          <TabsContent value="advanced" className="space-y-6">
            <AdvancedServiceSearch />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Search;
