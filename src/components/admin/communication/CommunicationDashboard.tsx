
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  MessageSquare, 
  Mail, 
  Phone, 
  Bell,
  TrendingUp,
  Users,
  Clock,
  CheckCircle,
  AlertTriangle,
  BarChart3
} from 'lucide-react';
import { useNotificationService } from '@/hooks/useNotificationService';
import { TemplateManager } from './TemplateManager';
import { NotificationRulesManager } from './NotificationRulesManager';
import { CommunicationAnalytics } from './CommunicationAnalytics';

export const CommunicationDashboard: React.FC = () => {
  const { analytics, fetchAnalytics, isLoading } = useNotificationService();
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  const mockStats = {
    totalSent: 1247,
    deliveryRate: analytics?.delivery_rate || 94.2,
    responseRate: analytics?.response_rate || 23.8,
    avgCostPerMessage: 0.15
  };

  const channelStats = [
    { name: 'In-App', sent: 892, delivered: 889, rate: 99.7, cost: 0.00, icon: Bell },
    { name: 'Email', sent: 456, delivered: 423, rate: 92.8, cost: 0.02, icon: Mail },
    { name: 'SMS', sent: 123, delivered: 119, rate: 96.7, cost: 0.25, icon: Phone },
    { name: 'Push', sent: 334, delivered: 298, rate: 89.2, cost: 0.01, icon: MessageSquare }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Communication Center</h2>
          <p className="text-gray-600">Manage notifications and communication analytics</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="rules">Rules</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <MessageSquare className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Total Sent</p>
                    <p className="text-2xl font-bold">{mockStats.totalSent.toLocaleString()}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Delivery Rate</p>
                    <p className="text-2xl font-bold">{mockStats.deliveryRate}%</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <TrendingUp className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Response Rate</p>
                    <p className="text-2xl font-bold">{mockStats.responseRate}%</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <BarChart3 className="h-5 w-5 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Avg Cost</p>
                    <p className="text-2xl font-bold">N${mockStats.avgCostPerMessage}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Channel Performance */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Channel Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {channelStats.map((channel) => (
                  <div key={channel.name} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-gray-100 rounded-lg">
                        <channel.icon className="h-4 w-4 text-gray-600" />
                      </div>
                      <div>
                        <p className="font-medium">{channel.name}</p>
                        <p className="text-sm text-gray-600">
                          {channel.delivered}/{channel.sent} delivered
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge 
                        variant={channel.rate > 95 ? "default" : channel.rate > 90 ? "secondary" : "destructive"}
                        className="mb-1"
                      >
                        {channel.rate}%
                      </Badge>
                      <p className="text-xs text-gray-500">N${channel.cost}/msg</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { type: 'Booking Confirmation', count: 23, time: '5 min ago', success: true },
                  { type: 'Payment Reminder', count: 8, time: '12 min ago', success: true },
                  { type: 'Provider Alert', count: 3, time: '1 hour ago', success: false },
                ].map((activity, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {activity.success ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : (
                        <AlertTriangle className="h-4 w-4 text-red-600" />
                      )}
                      <div>
                        <p className="font-medium">{activity.type}</p>
                        <p className="text-sm text-gray-600">{activity.count} messages</p>
                      </div>
                    </div>
                    <p className="text-sm text-gray-500">{activity.time}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="templates">
          <TemplateManager />
        </TabsContent>

        <TabsContent value="rules">
          <NotificationRulesManager />
        </TabsContent>

        <TabsContent value="analytics">
          <CommunicationAnalytics analytics={analytics} />
        </TabsContent>
      </Tabs>
    </div>
  );
};
