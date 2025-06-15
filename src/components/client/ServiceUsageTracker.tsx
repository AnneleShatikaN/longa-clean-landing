
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Package, ArrowRight, Calendar, CheckCircle } from 'lucide-react';
import { getUserServiceUsage, type ServiceUsage } from '@/utils/serviceEntitlements';
import { useServices } from '@/contexts/ServiceContext';
import { useAuth } from '@/contexts/AuthContext';

interface ServiceUsageTrackerProps {
  onUpgrade?: () => void;
}

export const ServiceUsageTracker: React.FC<ServiceUsageTrackerProps> = ({ onUpgrade }) => {
  const { user } = useAuth();
  const { services } = useServices();
  const [serviceUsage, setServiceUsage] = useState<ServiceUsage[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadServiceUsage();
    }
  }, [user]);

  const loadServiceUsage = async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      const usage = await getUserServiceUsage(user.id);
      setServiceUsage(usage);
    } catch (error) {
      console.error('Error loading service usage:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getServiceName = (serviceId: string): string => {
    const service = services.find(s => s.id === serviceId);
    return service?.name || 'Unknown Service';
  };

  const calculateProgress = (used: number, allowed: number): number => {
    return Math.min((used / allowed) * 100, 100);
  };

  const getProgressColor = (used: number, allowed: number): string => {
    const percentage = (used / allowed) * 100;
    if (percentage >= 100) return 'bg-red-500';
    if (percentage >= 80) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getUsageStatus = (used: number, allowed: number): { text: string; variant: any } => {
    if (used >= allowed) {
      return { text: 'Quota Exceeded', variant: 'destructive' };
    }
    if (used / allowed >= 0.8) {
      return { text: 'Almost Full', variant: 'secondary' };
    }
    return { text: 'Available', variant: 'default' };
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Service Usage
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-2 bg-gray-200 rounded w-full"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (serviceUsage.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Service Usage
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Package className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Active Package</h3>
            <p className="text-gray-600 mb-4">
              Purchase a service package to start booking services.
            </p>
            {onUpgrade && (
              <Button onClick={onUpgrade}>
                <ArrowRight className="h-4 w-4 mr-2" />
                Browse Packages
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="h-5 w-5" />
          Service Usage
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {serviceUsage.map((usage) => {
            const progress = calculateProgress(usage.used_count, usage.allowed_count);
            const progressColor = getProgressColor(usage.used_count, usage.allowed_count);
            const status = getUsageStatus(usage.used_count, usage.allowed_count);
            
            return (
              <div key={usage.service_id} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{getServiceName(usage.service_id)}</span>
                    <Badge variant={status.variant} className="text-xs">
                      {status.text}
                    </Badge>
                  </div>
                  <span className="text-sm text-gray-600">
                    {usage.used_count}/{usage.allowed_count}
                  </span>
                </div>
                
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all duration-300 ${progressColor}`}
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
                
                {usage.used_count >= usage.allowed_count && (
                  <div className="flex items-center gap-2 text-sm text-red-600">
                    <CheckCircle className="h-4 w-4" />
                    <span>You've used all your available services for this cycle</span>
                  </div>
                )}
              </div>
            );
          })}
          
          {/* Upgrade Prompt */}
          <div className="pt-4 border-t">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Need more services?</p>
                <p className="text-xs text-gray-600">Upgrade your package for more bookings</p>
              </div>
              {onUpgrade && (
                <Button variant="outline" size="sm" onClick={onUpgrade}>
                  <ArrowRight className="h-4 w-4 mr-1" />
                  Upgrade
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
