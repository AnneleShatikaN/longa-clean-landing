
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { ServiceDisplayWithEntitlements } from '@/components/ServiceDisplayWithEntitlements';
import { PackagePrompt } from '@/components/client/PackagePrompt';
import { AdvancedServiceSearch } from '@/components/search/AdvancedServiceSearch';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { useServiceEntitlements } from '@/hooks/useServiceEntitlements';
import { Search as SearchIcon, Grid, Package, ArrowLeft } from 'lucide-react';

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
            <h1 className="text-3xl font-bold text-gray-900">Search Services</h1>
            <p className="text-gray-600 mt-2">Find and book the services you need</p>
          </div>
          <Badge variant={hasActivePackage ? "default" : "secondary"}>
            {hasActivePackage ? "Active Package" : "No Package"}
          </Badge>
        </div>

        {!hasActivePackage && (
          <div className="mb-8">
            <PackagePrompt onUpgrade={handleUpgradeToPackages} />
          </div>
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
            {hasActivePackage ? (
              <ServiceDisplayWithEntitlements
                onBookService={handleServiceSelection}
                showBookingButton={true}
              />
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5 text-gray-400" />
                    Services Locked
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">
                    Subscribe to a package to unlock access to our services and start booking.
                  </p>
                  <Button onClick={handleUpgradeToPackages}>
                    View Available Packages
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="advanced" className="space-y-6">
            {hasActivePackage ? (
              <AdvancedServiceSearch />
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <SearchIcon className="h-5 w-5 text-gray-400" />
                    Advanced Search Unavailable
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">
                    Advanced search features are available with an active package subscription.
                  </p>
                  <Button onClick={handleUpgradeToPackages}>
                    Subscribe to Access
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Search;
