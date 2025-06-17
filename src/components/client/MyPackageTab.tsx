
import React from 'react';
import { useSubscriptionPackages } from '@/hooks/useSubscriptionPackages';
import { useServiceEntitlements } from '@/hooks/useServiceEntitlements';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Package, Star, Calendar, Eye, RefreshCw, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const MyPackageTab = () => {
  const { userActivePackage, isLoading: packagesLoading } = useSubscriptionPackages();
  const { serviceUsage, isLoading: usageLoading } = useServiceEntitlements();
  const navigate = useNavigate();

  const isLoading = packagesLoading || usageLoading;

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Card>
          <CardContent className="p-8 text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Loading package information...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!userActivePackage) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">No Active Package</h3>
          <p className="text-gray-600 mb-6">
            You don't have an active package. Get one to access multiple services at a better rate.
          </p>
          <Button onClick={() => navigate('/subscription-packages')}>
            Browse Packages
          </Button>
        </CardContent>
      </Card>
    );
  }

  const daysRemaining = Math.ceil(
    (new Date(userActivePackage.expiry_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
  );

  return (
    <div className="space-y-6">
      {/* Package Overview Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-600">
            <Package className="h-5 w-5" />
            {userActivePackage.package.name}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                N${userActivePackage.package.price}
              </div>
              <p className="text-sm text-gray-600">Monthly Value</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {daysRemaining}
              </div>
              <p className="text-sm text-gray-600">Days Remaining</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {serviceUsage.length}
              </div>
              <p className="text-sm text-gray-600">Included Services</p>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">
                Valid until: {new Date(userActivePackage.expiry_date).toLocaleDateString()}
              </p>
              {userActivePackage.package.description && (
                <p className="text-sm text-gray-500 mt-1">
                  {userActivePackage.package.description}
                </p>
              )}
            </div>
            <Badge variant="default" className="bg-green-100 text-green-800">
              Active
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Service Usage Cards */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="font-semibold text-gray-900">Included Services</h4>
          <Button variant="outline" size="sm" onClick={() => navigate('/subscription-packages')}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Upgrade Package
          </Button>
        </div>
        
        {serviceUsage.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-gray-600">No service usage data available</p>
            </CardContent>
          </Card>
        ) : (
          serviceUsage.map((usage) => {
            const usagePercentage = (usage.used_count / usage.allowed_count) * 100;
            const canBook = usage.remaining_count > 0;
            
            return (
              <Card key={usage.service_id}>
                <CardContent className="p-4">
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h5 className="font-medium mb-1">{usage.service_name}</h5>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <span>{usage.used_count}/{usage.allowed_count} bookings used</span>
                          <Badge variant={canBook ? "default" : "secondary"}>
                            {canBook ? `${usage.remaining_count} Available` : "Limit Reached"}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Usage this cycle</span>
                        <span>{Math.round(usagePercentage)}%</span>
                      </div>
                      <Progress value={usagePercentage} className="h-2" />
                    </div>
                    
                    <div className="flex flex-wrap gap-2">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => navigate(`/one-off-booking?service_id=${usage.service_id}`)}
                      >
                        <Eye className="h-3 w-3 mr-1" />
                        View Service
                      </Button>
                      <Button 
                        size="sm" 
                        disabled={!canBook}
                        onClick={() => navigate(`/one-off-booking?service_id=${usage.service_id}`)}
                      >
                        <Calendar className="h-3 w-3 mr-1" />
                        {canBook ? 'Book Now' : 'No Credits Left'}
                      </Button>
                    </div>

                    {!canBook && (
                      <div className="bg-orange-50 p-3 rounded-lg border border-orange-200">
                        <p className="text-sm text-orange-800">
                          You've used all your allocated bookings for this service this cycle. 
                          Upgrade your package or wait for the next cycle.
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
};
