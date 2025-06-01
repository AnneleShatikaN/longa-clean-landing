
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Wrench, Clock, Phone, Mail, RefreshCw, AlertTriangle } from 'lucide-react';
import { config } from '@/config/environment';

interface MaintenanceConfig {
  isEnabled: boolean;
  title: string;
  message: string;
  estimatedDuration: string;
  startTime: string;
  endTime: string;
  allowedPaths: string[];
  emergencyContact: {
    phone: string;
    email: string;
  };
}

const defaultMaintenanceConfig: MaintenanceConfig = {
  isEnabled: false,
  title: 'Scheduled Maintenance',
  message: 'We are currently performing scheduled maintenance to improve our services. We apologize for any inconvenience.',
  estimatedDuration: '2 hours',
  startTime: new Date().toISOString(),
  endTime: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
  allowedPaths: ['/maintenance', '/admin'],
  emergencyContact: {
    phone: '+264 61 123 4567',
    email: 'support@yourapp.com',
  },
};

export const MaintenanceMode: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [maintenanceConfig, setMaintenanceConfig] = useState<MaintenanceConfig>(defaultMaintenanceConfig);
  const [timeRemaining, setTimeRemaining] = useState<string>('');

  useEffect(() => {
    // Check maintenance status from API or config
    const checkMaintenanceStatus = async () => {
      try {
        // In production, this would fetch from an API
        const response = await fetch('/api/maintenance-status');
        if (response.ok) {
          const config = await response.json();
          setMaintenanceConfig(config);
        }
      } catch (error) {
        console.warn('Failed to fetch maintenance status:', error);
        // Fallback to config
        setMaintenanceConfig({
          ...defaultMaintenanceConfig,
          isEnabled: config.maintenanceMode,
        });
      }
    };

    checkMaintenanceStatus();
    const interval = setInterval(checkMaintenanceStatus, 60000); // Check every minute

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!maintenanceConfig.isEnabled) return;

    const updateTimeRemaining = () => {
      const now = new Date();
      const endTime = new Date(maintenanceConfig.endTime);
      const diff = endTime.getTime() - now.getTime();

      if (diff <= 0) {
        setTimeRemaining('Maintenance should be completed soon');
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

      setTimeRemaining(`${hours}h ${minutes}m remaining`);
    };

    updateTimeRemaining();
    const interval = setInterval(updateTimeRemaining, 60000);

    return () => clearInterval(interval);
  }, [maintenanceConfig]);

  const handleRefresh = () => {
    window.location.reload();
  };

  // Check if current path is allowed during maintenance
  const currentPath = window.location.pathname;
  const isAllowedPath = maintenanceConfig.allowedPaths.some(path => 
    currentPath.startsWith(path)
  );

  if (!maintenanceConfig.isEnabled || isAllowedPath) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-orange-100 rounded-full">
              <Wrench className="h-8 w-8 text-orange-600" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">
            {maintenanceConfig.title}
          </CardTitle>
          <Badge variant="outline" className="w-fit mx-auto mt-2">
            <Clock className="h-3 w-3 mr-1" />
            {timeRemaining}
          </Badge>
        </CardHeader>

        <CardContent className="space-y-6">
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription className="text-center">
              {maintenanceConfig.message}
            </AlertDescription>
          </Alert>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h3 className="font-semibold text-gray-900">Maintenance Details</h3>
              <div className="text-sm text-gray-600 space-y-1">
                <div className="flex justify-between">
                  <span>Started:</span>
                  <span>{new Date(maintenanceConfig.startTime).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Expected end:</span>
                  <span>{new Date(maintenanceConfig.endTime).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Duration:</span>
                  <span>{maintenanceConfig.estimatedDuration}</span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="font-semibold text-gray-900">Need Help?</h3>
              <div className="text-sm text-gray-600 space-y-2">
                <div className="flex items-center space-x-2">
                  <Phone className="h-4 w-4" />
                  <span>{maintenanceConfig.emergencyContact.phone}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Mail className="h-4 w-4" />
                  <span>{maintenanceConfig.emergencyContact.email}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="text-center">
            <Button onClick={handleRefresh} variant="outline" className="w-full sm:w-auto">
              <RefreshCw className="h-4 w-4 mr-2" />
              Check Again
            </Button>
          </div>

          <div className="text-xs text-gray-500 text-center">
            We appreciate your patience and will have the service restored as soon as possible.
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Admin component to toggle maintenance mode
export const MaintenanceAdmin: React.FC = () => {
  const [config, setConfig] = useState<MaintenanceConfig>(defaultMaintenanceConfig);

  const toggleMaintenance = () => {
    const newConfig = { ...config, isEnabled: !config.isEnabled };
    setConfig(newConfig);
    
    // In production, this would update the API
    console.log('Maintenance mode toggled:', newConfig.isEnabled);
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Maintenance Mode Control</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <span>Maintenance Mode</span>
          <Badge variant={config.isEnabled ? "destructive" : "secondary"}>
            {config.isEnabled ? "Active" : "Inactive"}
          </Badge>
        </div>
        
        <Button 
          onClick={toggleMaintenance}
          variant={config.isEnabled ? "destructive" : "default"}
          className="w-full"
        >
          {config.isEnabled ? "Disable" : "Enable"} Maintenance Mode
        </Button>
      </CardContent>
    </Card>
  );
};
