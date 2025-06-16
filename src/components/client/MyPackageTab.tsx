
import React from 'react';
import { useServiceEntitlements } from '@/hooks/useServiceEntitlements';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Package, Star, Calendar, Eye, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const MyPackageTab = () => {
  const { serviceUsage, isLoading } = useServiceEntitlements();
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-6 bg-gray-200 rounded w-3/4"></div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (serviceUsage.length === 0) {
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

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-600">
            <Package className="h-5 w-5" />
            My Package
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center mb-6">
            <h3 className="text-lg font-semibold mb-2">Active Package</h3>
            <p className="text-gray-600">
              You have access to {serviceUsage.length} services
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <h4 className="font-semibold text-gray-900">Included Services</h4>
        {serviceUsage.map((usage) => {
          const usagePercentage = (usage.used_count / usage.allowed_count) * 100;
          const canBook = usage.used_count < usage.allowed_count;
          
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
                          {canBook ? "Available" : "Limit Reached"}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Usage</span>
                      <span>{Math.round(usagePercentage)}%</span>
                    </div>
                    <Progress value={usagePercentage} className="h-2" />
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => navigate(`/service/${usage.service_id}`)}
                    >
                      <Eye className="h-3 w-3 mr-1" />
                      View Details
                    </Button>
                    <Button 
                      size="sm" 
                      disabled={!canBook}
                      onClick={() => navigate(`/book/${usage.service_id}`)}
                    >
                      <Calendar className="h-3 w-3 mr-1" />
                      {canBook ? "Book Again" : "Limit Reached"}
                    </Button>
                    {usage.used_count > 0 && (
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => navigate(`/rate/${usage.service_id}`)}
                      >
                        <Star className="h-3 w-3 mr-1" />
                        Rate Service
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardContent className="p-4 text-center">
          <h4 className="font-medium mb-2">Need More Services?</h4>
          <p className="text-sm text-gray-600 mb-4">
            Upgrade your package or book individual services
          </p>
          <div className="flex flex-col sm:flex-row gap-2 justify-center">
            <Button variant="outline" onClick={() => navigate('/subscription-packages')}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Upgrade Package
            </Button>
            <Button variant="outline" onClick={() => navigate('/search')}>
              Book Individual Service
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
