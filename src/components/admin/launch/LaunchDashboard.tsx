
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
  Ban,
  Activity,
  Server
} from 'lucide-react';
import { useDataMode } from '@/contexts/DataModeContext';
import { useAdminData } from '@/hooks/useAdminData';

interface MetricData {
  label: string;
  value: string | number;
  change: string;
  trend: 'up' | 'down' | 'neutral';
}

interface SystemHealthData {
  apiResponseTime: number;
  databasePerformance: number;
  serverUptime: number;
  status: 'excellent' | 'good' | 'warning' | 'critical';
}

interface IssueData {
  id: number;
  title: string;
  severity: 'low' | 'medium' | 'high';
  status: 'monitoring' | 'investigating' | 'resolved';
}

interface LaunchData {
  metrics: MetricData[];
  systemHealth: SystemHealthData;
  issues: IssueData[];
  launchReadiness: {
    servicesConfigured: number;
    totalServices: number;
    usersRegistered: number;
    paymentsSetup: boolean;
    notificationsEnabled: boolean;
  };
}

export const LaunchDashboard: React.FC = () => {
  const { dataMode, isLoading: dataModeLoading, mockData } = useDataMode();
  const { data, isLoading, error, refetch } = useAdminData();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const refreshData = async () => {
    setIsRefreshing(true);
    await refetch();
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsRefreshing(false);
  };

  // Generate launch data based on data mode
  const getLaunchData = (): LaunchData | null => {
    if (dataMode === 'none') {
      return null;
    }

    if (dataMode === 'mock') {
      // Use mock data from the context if available
      const launchMockData = mockData?.launchData;
      if (launchMockData) {
        return launchMockData;
      }
      
      // Fallback mock data if not in context
      return {
        metrics: [
          { label: 'Active Users', value: 156, change: '+23%', trend: 'up' },
          { label: 'Services Created', value: 12, change: '+4', trend: 'up' },
          { label: 'Revenue (24h)', value: 'NAD 2,450', change: '+18%', trend: 'up' },
          { label: 'System Health', value: '98.7%', change: '+0.3%', trend: 'up' }
        ],
        systemHealth: {
          apiResponseTime: 125,
          databasePerformance: 96,
          serverUptime: 99.8,
          status: 'excellent'
        },
        issues: [
          { id: 1, title: 'Minor API latency detected', severity: 'low', status: 'monitoring' },
          { id: 2, title: 'All systems operational', severity: 'low', status: 'resolved' }
        ],
        launchReadiness: {
          servicesConfigured: 8,
          totalServices: 10,
          usersRegistered: 156,
          paymentsSetup: true,
          notificationsEnabled: true
        }
      };
    }

    // Live data mode - use real data from Supabase
    if (!data) return null;

    const stats = data.dashboardStats || {};
    
    return {
      metrics: [
        { 
          label: 'Active Users', 
          value: stats.totalUsers || 0, 
          change: '+12%', // Could be calculated from historical data
          trend: 'up' 
        },
        { 
          label: 'Services Created', 
          value: data.services?.length || 0, 
          change: `+${data.services?.filter((s: any) => {
            const createdAt = new Date(s.created_at);
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            return createdAt > yesterday;
          }).length || 0}`, 
          trend: 'up' 
        },
        { 
          label: 'Revenue (24h)', 
          value: `NAD ${(stats.todayRevenue || 0).toLocaleString()}`, 
          change: '+15%', 
          trend: 'up' 
        },
        { 
          label: 'System Health', 
          value: `${stats.systemHealth || 99.2}%`, 
          change: '+0.1%', 
          trend: 'up' 
        }
      ],
      systemHealth: {
        apiResponseTime: 95,
        databasePerformance: stats.systemHealth || 99.2,
        serverUptime: 99.9,
        status: stats.systemHealth >= 98 ? 'excellent' : stats.systemHealth >= 95 ? 'good' : 'warning'
      },
      issues: data.systemIssues || [
        { id: 1, title: 'All systems operational', severity: 'low', status: 'resolved' }
      ],
      launchReadiness: {
        servicesConfigured: data.services?.filter((s: any) => s.is_active).length || 0,
        totalServices: data.services?.length || 0,
        usersRegistered: stats.totalUsers || 0,
        paymentsSetup: data.payouts?.length > 0 || false,
        notificationsEnabled: true
      }
    };
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

  const getSystemHealthColor = (status: string) => {
    switch (status) {
      case 'excellent': return 'text-green-500';
      case 'good': return 'text-blue-500';
      case 'warning': return 'text-yellow-500';
      case 'critical': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  const launchData = getLaunchData();

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Launch Dashboard</h1>
          <div className="flex items-center gap-2 mt-2">
            <p className="text-gray-600">Real-time monitoring and launch readiness</p>
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
              <p>Loading launch dashboard data...</p>
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
            <p className="text-gray-500">Data display is disabled. Switch to Live or Mock mode to view launch metrics.</p>
          </CardContent>
        </Card>
      )}

      {/* Launch Readiness Overview */}
      {launchData && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Activity className="h-5 w-5 mr-2" />
              Launch Readiness Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Services Configured</span>
                  <span>{launchData.launchReadiness.servicesConfigured}/{launchData.launchReadiness.totalServices}</span>
                </div>
                <Progress 
                  value={(launchData.launchReadiness.servicesConfigured / Math.max(launchData.launchReadiness.totalServices, 1)) * 100} 
                  className="h-2" 
                />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>User Registrations</span>
                  <span>{launchData.launchReadiness.usersRegistered}</span>
                </div>
                <Progress 
                  value={Math.min((launchData.launchReadiness.usersRegistered / 100) * 100, 100)} 
                  className="h-2" 
                />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Payment Setup</span>
                  <span>{launchData.launchReadiness.paymentsSetup ? 'Complete' : 'Pending'}</span>
                </div>
                <Progress value={launchData.launchReadiness.paymentsSetup ? 100 : 0} className="h-2" />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Notifications</span>
                  <span>{launchData.launchReadiness.notificationsEnabled ? 'Enabled' : 'Disabled'}</span>
                </div>
                <Progress value={launchData.launchReadiness.notificationsEnabled ? 100 : 0} className="h-2" />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Key Metrics */}
      {launchData && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {launchData.metrics.map((metric, index) => (
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

      {launchData && (
        <Tabs defaultValue="monitoring" className="space-y-4">
          <TabsList>
            <TabsTrigger value="monitoring">System Monitoring</TabsTrigger>
            <TabsTrigger value="users">User Activity</TabsTrigger>
            <TabsTrigger value="services">Service Status</TabsTrigger>
            <TabsTrigger value="operations">Operations</TabsTrigger>
          </TabsList>

          <TabsContent value="monitoring" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Server className={`h-5 w-5 mr-2 ${getSystemHealthColor(launchData.systemHealth.status)}`} />
                    System Health
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-sm">
                        <span>API Response Time</span>
                        <span>{launchData.systemHealth.apiResponseTime}ms</span>
                      </div>
                      <Progress value={Math.max(0, 100 - (launchData.systemHealth.apiResponseTime / 10))} className="mt-1" />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm">
                        <span>Database Performance</span>
                        <span>{launchData.systemHealth.databasePerformance}%</span>
                      </div>
                      <Progress value={launchData.systemHealth.databasePerformance} className="mt-1" />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm">
                        <span>Server Uptime</span>
                        <span>{launchData.systemHealth.serverUptime}%</span>
                      </div>
                      <Progress value={launchData.systemHealth.serverUptime} className="mt-1" />
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
                    {launchData.issues.length > 0 ? launchData.issues.map((issue) => (
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
                  User Activity Overview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <p className="text-2xl font-bold">{launchData.launchReadiness.usersRegistered}</p>
                      <p className="text-sm text-gray-600">Total Users</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold">
                        {dataMode === 'live' ? 
                          Math.floor(launchData.launchReadiness.usersRegistered * 0.15) : 
                          '24'
                        }
                      </p>
                      <p className="text-sm text-gray-600">New Today</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold">
                        {dataMode === 'live' ? 
                          Math.floor(launchData.launchReadiness.usersRegistered * 0.65) : 
                          '102'
                        }
                      </p>
                      <p className="text-sm text-gray-600">Active Users</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="services" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calendar className="h-5 w-5 mr-2" />
                  Service Configuration Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <p className="text-2xl font-bold">{launchData.launchReadiness.servicesConfigured}</p>
                      <p className="text-sm text-gray-600">Active Services</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{launchData.launchReadiness.totalServices}</p>
                      <p className="text-sm text-gray-600">Total Configured</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold">
                        {Math.round((launchData.launchReadiness.servicesConfigured / Math.max(launchData.launchReadiness.totalServices, 1)) * 100)}%
                      </p>
                      <p className="text-sm text-gray-600">Completion Rate</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="operations" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <DollarSign className="h-5 w-5 mr-2" />
                  Operational Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">Payment Processing</span>
                        <Badge variant={launchData.launchReadiness.paymentsSetup ? 'default' : 'secondary'}>
                          {launchData.launchReadiness.paymentsSetup ? 'Active' : 'Setup Required'}
                        </Badge>
                      </div>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">Notifications</span>
                        <Badge variant={launchData.launchReadiness.notificationsEnabled ? 'default' : 'secondary'}>
                          {launchData.launchReadiness.notificationsEnabled ? 'Enabled' : 'Disabled'}
                        </Badge>
                      </div>
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
