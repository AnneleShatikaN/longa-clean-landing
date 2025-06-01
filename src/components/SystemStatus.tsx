
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, XCircle, AlertTriangle, Clock, RefreshCw, TrendingUp } from 'lucide-react';
import { config } from '@/config/environment';

interface ServiceStatus {
  name: string;
  status: 'operational' | 'degraded' | 'outage' | 'maintenance';
  lastChecked: string;
  responseTime: number;
  uptime: number;
}

interface SystemHealth {
  overall: 'healthy' | 'degraded' | 'critical';
  services: ServiceStatus[];
  lastUpdated: string;
}

const mockSystemHealth: SystemHealth = {
  overall: 'healthy',
  lastUpdated: new Date().toISOString(),
  services: [
    {
      name: 'API Gateway',
      status: 'operational',
      lastChecked: new Date().toISOString(),
      responseTime: 120,
      uptime: 99.9,
    },
    {
      name: 'Database',
      status: 'operational',
      lastChecked: new Date().toISOString(),
      responseTime: 45,
      uptime: 99.95,
    },
    {
      name: 'Payment Processing',
      status: 'operational',
      lastChecked: new Date().toISOString(),
      responseTime: 250,
      uptime: 99.8,
    },
    {
      name: 'File Storage',
      status: 'operational',
      lastChecked: new Date().toISOString(),
      responseTime: 180,
      uptime: 99.7,
    },
    {
      name: 'Notification Service',
      status: 'degraded',
      lastChecked: new Date().toISOString(),
      responseTime: 500,
      uptime: 98.5,
    },
  ],
};

export const SystemStatus: React.FC = () => {
  const [systemHealth, setSystemHealth] = useState<SystemHealth>(mockSystemHealth);
  const [isLoading, setIsLoading] = useState(false);

  const fetchSystemStatus = async () => {
    setIsLoading(true);
    try {
      // In production, this would fetch from a real status API
      const response = await fetch('/api/system-status');
      if (response.ok) {
        const data = await response.json();
        setSystemHealth(data);
      } else {
        throw new Error('Failed to fetch status');
      }
    } catch (error) {
      console.warn('Failed to fetch system status:', error);
      // Use mock data as fallback
      setSystemHealth(mockSystemHealth);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSystemStatus();
    const interval = setInterval(fetchSystemStatus, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const getStatusIcon = (status: ServiceStatus['status']) => {
    switch (status) {
      case 'operational':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'degraded':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'outage':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'maintenance':
        return <Clock className="h-4 w-4 text-blue-500" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: ServiceStatus['status']) => {
    const variants = {
      operational: 'default',
      degraded: 'secondary',
      outage: 'destructive',
      maintenance: 'outline',
    } as const;

    return (
      <Badge variant={variants[status]} className="capitalize">
        {status}
      </Badge>
    );
  };

  const getOverallStatusColor = (overall: SystemHealth['overall']) => {
    switch (overall) {
      case 'healthy':
        return 'text-green-600 bg-green-50';
      case 'degraded':
        return 'text-yellow-600 bg-yellow-50';
      case 'critical':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5" />
              <span>System Status</span>
            </CardTitle>
            <Button 
              onClick={fetchSystemStatus} 
              variant="outline" 
              size="sm"
              disabled={isLoading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Alert className={getOverallStatusColor(systemHealth.overall)}>
            <AlertDescription className="flex items-center justify-between">
              <span className="font-medium capitalize">
                System Status: {systemHealth.overall}
              </span>
              <span className="text-sm">
                Last updated: {new Date(systemHealth.lastUpdated).toLocaleTimeString()}
              </span>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      <div className="grid gap-4">
        <h3 className="text-lg font-semibold">Service Health</h3>
        {systemHealth.services.map((service, index) => (
          <Card key={index}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {getStatusIcon(service.status)}
                  <div>
                    <h4 className="font-medium">{service.name}</h4>
                    <p className="text-sm text-gray-500">
                      Last checked: {new Date(service.lastChecked).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
                <div className="text-right space-y-1">
                  {getStatusBadge(service.status)}
                  <div className="text-sm text-gray-500">
                    <div>Response: {service.responseTime}ms</div>
                    <div>Uptime: {service.uptime}%</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {config.environment === 'development' && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Development mode: Status data is simulated. In production, this would connect to real monitoring services.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default SystemStatus;
