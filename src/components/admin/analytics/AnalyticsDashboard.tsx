
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BusinessIntelligenceDashboard } from './BusinessIntelligenceDashboard';
import { SystemMonitoring } from './SystemMonitoring';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  BarChart3, 
  TrendingUp, 
  Activity, 
  Database,
  Users,
  DollarSign
} from 'lucide-react';

export const AnalyticsDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('business-intelligence');

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <BarChart3 className="h-6 w-6" />
        <h1 className="text-2xl font-bold">Analytics & Monitoring</h1>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="business-intelligence" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Business Intelligence
          </TabsTrigger>
          <TabsTrigger value="system-monitoring" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            System Monitoring
          </TabsTrigger>
        </TabsList>

        <TabsContent value="business-intelligence" className="space-y-6">
          <BusinessIntelligenceDashboard />
        </TabsContent>

        <TabsContent value="system-monitoring" className="space-y-6">
          <SystemMonitoring />
        </TabsContent>
      </Tabs>
    </div>
  );
};
