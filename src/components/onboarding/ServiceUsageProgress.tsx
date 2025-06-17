
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Package, Clock } from 'lucide-react';
import { useServiceEntitlements } from '@/hooks/useServiceEntitlements';

export const ServiceUsageProgress: React.FC = () => {
  const { serviceUsage, isLoading } = useServiceEntitlements();

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-2 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Package className="h-5 w-5 text-blue-600" />
        <h3 className="font-semibold">Your Package Usage</h3>
      </div>

      {serviceUsage.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center">
            <TrendingUp className="h-8 w-8 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-600">No active package found</p>
            <p className="text-sm text-gray-500">Subscribe to a package to start tracking usage</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {serviceUsage.map((usage) => {
            const progressPercentage = (usage.used_count / usage.allowed_count) * 100;
            const isNearLimit = progressPercentage > 80;
            const isExceeded = progressPercentage >= 100;
            
            return (
              <Card key={usage.service_id} className={isExceeded ? 'border-red-200' : ''}>
                <CardContent className="pt-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium text-sm">{usage.service_name}</h4>
                      {isNearLimit && (
                        <Badge variant={isExceeded ? 'destructive' : 'outline'} className="text-xs">
                          {isExceeded ? 'Limit Reached' : 'Near Limit'}
                        </Badge>
                      )}
                    </div>
                    <div className="text-sm text-gray-600">
                      {usage.used_count} / {usage.allowed_count}
                    </div>
                  </div>
                  
                  <Progress 
                    value={Math.min(progressPercentage, 100)} 
                    className={`h-2 ${isExceeded ? 'bg-red-100' : ''}`}
                  />
                  
                  <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
                    <span>Current cycle</span>
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span>{usage.cycle_days || 30} days</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};
