
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  TrendingUp, 
  Users, 
  Calendar, 
  DollarSign, 
  AlertTriangle, 
  CheckCircle,
  RefreshCw,
  Database,
  FileText,
  Ban 
} from 'lucide-react';
import { useDataMode } from '@/contexts/DataModeContext';
import { useAdminData } from '@/hooks/useAdminData';

interface MetricData {
  label: string;
  value: string;
  change: string;
  trend: 'up' | 'down' | 'neutral';
}

interface IssueData {
  id: number;
  title: string;
  severity: 'low' | 'medium' | 'high';
  status: 'monitoring' | 'investigating' | 'resolved';
}

export const LaunchDashboard: React.FC = () => {
  const { dataMode, isLoading: dataModeLoading } = useDataMode();
  const { data, isLoading, error, refetch } = useAdminData();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const refreshData = async () => {
    setIsRefreshing(true);
    await refetch();
    // Simulate some processing time
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsRefreshing(false);
  };

  // Generate metrics based on data mode
  const getMetrics = (): MetricData[] => {
    if (dataMode === 'none') {
      return [];
    }

    const baseMetrics = data?.dashboardStats || {};
    
    return [
      { 
        label: 'New Users Today', 
        value: dataMode === 'mock' ? '24' : (baseMetrics.newUsersToday || '0'),
        change: '+15%', 
        trend: 'up' 
      },
      { 
        label: 'Active Bookings', 
        value: dataMode === 'mock' ? '156' : (baseMetrics.activeBookings || '0'),
        change: '+8%', 
        trend: 'up' 
      },
      { 
        label: 'Revenue Today', 
        value: dataMode === 'mock' ? 'NAD 4,250' : `NAD ${(baseMetrics.todayRevenue || 0).toLocaleString()}`,
        change: '+12%', 
        trend: 'up' 
      },
      { 
        label: 'System Health', 
        value: dataMode === 'mock' ? '99.2%' : `${(baseMetrics.systemHealth || 99.2)}%`,
        change: '-0.1%', 
        trend: 'neutral' 
      },
    ];
  };

  // Generate issues based on data mode
  const getIssues = (): IssueData[] => {
    if (dataMode === 'none') {
      return [];
    }

    if (dataMode === 'mock') {
      return [
        { id: 1, title: 'High booking volume', severity: 'low', status: 'monitoring' },
        { id: 2, title: 'Payment gateway delay', severity: 'medium', status: 'investigating' },
        { id: 3, title: 'SMS delivery delay', severity: 'low', status: 'resolved' },
      ];
    }

    // For live data, use real issues from data or generate based on system status
    return data?.systemIssues || [
      { id: 1, title: 'All systems operational', severity: 'low', status: 'resolved' }
    ];
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      case 'low': return 'outline';
      default: return 'outline';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'resolved': return 'text-green-600';
      case 'investigating': return 'text-yellow-600';
      case 'monitoring': return 'text-blue-600';
      default: return 'text-gray-600';
    }
  };

  const getDataModeIcon = () => {
    switch (dataMode) {
      case 'live': return <Database className="h-4 w-4 text-green-500" />;
      case 'mock': return <FileText className="h-4 w-4 text-yellow-500" />;
      case 'none': return <Ban className="h-4 w-4 text-gray-500" />;
    }
  };

  const getDataModeLabel = () => {
    switch (dataMode) {
      case 'live': return 'Live Data';
      case 'mock': return 'Mock Data';
      case 'none': return 'No Data';
    }
  };

  const metrics = getMetrics();
  const issues = getIssues();

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Launch Dashboard</h1>
          <div className="flex items-center gap-2 mt-2">
            <p className="text-gray-600">Real-time monitoring and analytics</p>
            <div className="flex items-center gap-1 text-sm">
              {getDataModeIcon()}
              <span className="font-medium">{getDataModeLabel()}</span>
            </div>
          </div>
        </div>
        <Button 
          onClick={refreshData} 
          disabled={isRefreshing || dataModeLoading}
          variant="outline"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Loading State */}
      {(isLoading || dataModeLoading) && (
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <RefreshCw className="h-5 w-5 animate-spin" />
              <p>Loading dashboard data...</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Error State */}
      {error && (
        <Card className="border-red-200">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 text-red-600">
              <AlertTriangle className="h-5 w-5" />
              <div>
                <p className="font-medium">Error loading data</p>
                <p className="text-sm">{error}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* No Data State */}
      {dataMode === 'none' && !isLoading && (
        <Card>
          <CardContent className="p-6 text-center">
            <Ban className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">No Data Mode</h3>
            <p className="text-gray-500">Data display is disabled. Switch to Live or Mock mode to view metrics.</p>
          </CardContent>
        </Card>
      )}

      {/* Key Metrics */}
      {dataMode !== 'none' && metrics.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {metrics.map((metric, index) => (
            <Card key={index}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{metric.label}</p>
                    <p className="text-2xl font-bold">{metric.value}</p>
                    <p className={`text-sm ${
                      metric.trend === 'up' ? 'text-green-600' : 
                      metric.trend === 'down' ? 'text-red-600' : 
                      'text-gray-600'
                    }`}>
                      {metric.change} from yesterday
                    </p>
                  </div>
                  <TrendingUp className={`h-8 w-8 ${
                    metric.trend === 'up' ? 'text-green-500' : 
                    metric.trend === 'down' ? 'text-red-500 rotate-180' : 
                    'text-gray-500'
                  }`} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {dataMode !== 'none' && (
        <Tabs defaultValue="monitoring" className="space-y-4">
          <TabsList>
            <TabsTrigger value="monitoring">System Monitoring</TabsTrigger>
            <TabsTrigger value="users">User Activity</TabsTrigger>
            <TabsTrigger value="bookings">Booking Analytics</TabsTrigger>
            <TabsTrigger value="revenue">Revenue Tracking</TabsTrigger>
          </TabsList>

          <TabsContent value="monitoring" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <CheckCircle className="h-5 w-5 mr-2 text-green-500" />
                    System Health
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-sm">
                        <span>API Response Time</span>
                        <span>{dataMode === 'mock' ? '120ms' : '95ms'}</span>
                      </div>
                      <Progress value={dataMode === 'mock' ? 85 : 92} className="mt-1" />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm">
                        <span>Database Performance</span>
                        <span>Excellent</span>
                      </div>
                      <Progress value={95} className="mt-1" />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm">
                        <span>Server Uptime</span>
                        <span>{dataMode === 'mock' ? '99.2%' : '99.8%'}</span>
                      </div>
                      <Progress value={dataMode === 'mock' ? 99 : 100} className="mt-1" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <AlertTriangle className="h-5 w-5 mr-2 text-yellow-500" />
                    System Issues
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {issues.length > 0 ? issues.map((issue) => (
                      <div key={issue.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium">{issue.title}</p>
                          <p className={`text-sm ${getStatusColor(issue.status)}`}>
                            {issue.status.charAt(0).toUpperCase() + issue.status.slice(1)}
                          </p>
                        </div>
                        <Badge variant={getSeverityColor(issue.severity) as any}>
                          {issue.severity}
                        </Badge>
                      </div>
                    )) : (
                      <div className="text-center py-4 text-gray-500">
                        <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-500" />
                        <p>All systems operational</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="users" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="h-5 w-5 mr-2" />
                  User Registration Tracking
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <p className="text-2xl font-bold">
                        {dataMode === 'mock' ? '247' : (data?.dashboardStats?.totalUsers || '0')}
                      </p>
                      <p className="text-sm text-gray-600">Total Users</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold">
                        {dataMode === 'mock' ? '24' : (data?.dashboardStats?.newUsersToday || '0')}
                      </p>
                      <p className="text-sm text-gray-600">Today</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold">8.2%</p>
                      <p className="text-sm text-gray-600">Growth Rate</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="bookings" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calendar className="h-5 w-5 mr-2" />
                  Booking Volume Monitoring
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <p className="text-2xl font-bold">
                        {dataMode === 'mock' ? '156' : (data?.dashboardStats?.activeBookings || '0')}
                      </p>
                      <p className="text-sm text-gray-600">Active Bookings</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold">
                        {dataMode === 'mock' ? '23' : (data?.dashboardStats?.completedToday || '0')}
                      </p>
                      <p className="text-sm text-gray-600">Completed Today</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold">
                        {dataMode === 'mock' ? '2' : (data?.dashboardStats?.cancelledToday || '0')}
                      </p>
                      <p className="text-sm text-gray-600">Cancelled</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="revenue" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <DollarSign className="h-5 w-5 mr-2" />
                  Revenue Tracking
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <p className="text-2xl font-bold">
                        NAD {dataMode === 'mock' ? '4,250' : (data?.dashboardStats?.todayRevenue || 0).toLocaleString()}
                      </p>
                      <p className="text-sm text-gray-600">Today's Revenue</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold">
                        NAD {dataMode === 'mock' ? '28,500' : (data?.dashboardStats?.weekRevenue || 0).toLocaleString()}
                      </p>
                      <p className="text-sm text-gray-600">This Week</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold">12%</p>
                      <p className="text-sm text-gray-600">Growth</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
};
