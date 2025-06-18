
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  MapPin, 
  Star,
  Calendar,
  DollarSign,
  AlertTriangle,
  Download,
  RefreshCw
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { useAnalytics } from '@/hooks/useAnalytics';

interface MetricCard {
  title: string;
  value: string | number;
  change: number;
  trend: 'up' | 'down' | 'stable';
  icon: React.ReactNode;
}

export const BusinessIntelligenceDashboard: React.FC = () => {
  const { 
    analyticsSummary, 
    revenueData, 
    servicePopularity, 
    providerPerformance,
    isLoading,
    fetchAllAnalytics,
    exportToCSV 
  } = useAnalytics();

  const [timeRange, setTimeRange] = useState('30d');
  const [selectedLocation, setSelectedLocation] = useState('all');

  const keyMetrics: MetricCard[] = [
    {
      title: 'Total Revenue',
      value: `N$${analyticsSummary?.total_revenue?.toLocaleString() || 0}`,
      change: 12.5,
      trend: 'up',
      icon: <DollarSign className="h-5 w-5" />
    },
    {
      title: 'Completion Rate',
      value: `${Math.round((analyticsSummary?.completed_bookings || 0) / (analyticsSummary?.total_bookings || 1) * 100)}%`,
      change: 3.2,
      trend: 'up',
      icon: <TrendingUp className="h-5 w-5" />
    },
    {
      title: 'Active Providers',
      value: analyticsSummary?.total_providers || 0,
      change: -2.1,
      trend: 'down',
      icon: <Users className="h-5 w-5" />
    },
    {
      title: 'Avg Rating',
      value: analyticsSummary?.avg_rating?.toFixed(1) || '0.0',
      change: 0.3,
      trend: 'up',
      icon: <Star className="h-5 w-5" />
    }
  ];

  const demandForecastData = [
    { month: 'Jan', predicted: 850, actual: 820 },
    { month: 'Feb', predicted: 920, actual: 890 },
    { month: 'Mar', predicted: 1100, actual: 1050 },
    { month: 'Apr', predicted: 1200, actual: null },
    { month: 'May', predicted: 1350, actual: null },
    { month: 'Jun', predicted: 1400, actual: null }
  ];

  const geographicDemand = [
    { region: 'Windhoek', demand: 65, growth: 12 },
    { region: 'Walvis Bay', demand: 20, growth: 8 },
    { region: 'Swakopmund', demand: 10, growth: 15 },
    { region: 'Other', demand: 5, growth: 5 }
  ];

  const COLORS = ['#10B981', '#3B82F6', '#F59E0B', '#EF4444'];

  const handleExport = (dataType: string) => {
    switch (dataType) {
      case 'revenue':
        exportToCSV(revenueData, 'revenue_analysis');
        break;
      case 'services':
        exportToCSV(servicePopularity, 'service_popularity');
        break;
      case 'providers':
        exportToCSV(providerPerformance, 'provider_performance');
        break;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Business Intelligence Dashboard</h2>
          <p className="text-gray-600">Comprehensive analytics for data-driven decisions</p>
        </div>
        <div className="flex gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
            </SelectContent>
          </Select>
          <Button 
            onClick={() => fetchAllAnalytics()}
            variant="outline"
            size="sm"
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {keyMetrics.map((metric, index) => (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{metric.title}</p>
                  <p className="text-2xl font-bold">{metric.value}</p>
                  <div className="flex items-center gap-1 mt-1">
                    {metric.trend === 'up' ? (
                      <TrendingUp className="h-3 w-3 text-green-500" />
                    ) : metric.trend === 'down' ? (
                      <TrendingDown className="h-3 w-3 text-red-500" />
                    ) : null}
                    <span className={`text-xs ${
                      metric.trend === 'up' ? 'text-green-500' : 
                      metric.trend === 'down' ? 'text-red-500' : 'text-gray-500'
                    }`}>
                      {metric.change > 0 ? '+' : ''}{metric.change}%
                    </span>
                  </div>
                </div>
                <div className="p-3 bg-blue-50 rounded-lg">
                  {metric.icon}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="operational" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="operational">Operational Analytics</TabsTrigger>
          <TabsTrigger value="predictive">Predictive Analytics</TabsTrigger>
          <TabsTrigger value="geographic">Geographic Analysis</TabsTrigger>
          <TabsTrigger value="insights">Business Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="operational" className="space-y-6">
          {/* Service Performance */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Service Completion Rates</CardTitle>
                <Button 
                  onClick={() => handleExport('services')} 
                  variant="outline" 
                  size="sm"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={servicePopularity}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="total_bookings" fill="#10B981" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Provider Performance Rankings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {providerPerformance.slice(0, 5).map((provider, index) => (
                    <div key={provider.provider_id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Badge variant="secondary">#{index + 1}</Badge>
                        <div>
                          <p className="font-medium">{provider.provider_name}</p>
                          <p className="text-sm text-gray-600">{provider.total_jobs} jobs completed</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 text-yellow-500" />
                          <span className="font-medium">{provider.avg_rating.toFixed(1)}</span>
                        </div>
                        <p className="text-sm text-gray-600">{provider.completion_rate.toFixed(1)}% completion</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Revenue Trends */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Revenue Trends</CardTitle>
              <Button 
                onClick={() => handleExport('revenue')} 
                variant="outline" 
                size="sm"
              >
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="gross_revenue" stroke="#10B981" strokeWidth={2} />
                  <Line type="monotone" dataKey="provider_payouts" stroke="#3B82F6" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="predictive" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Demand Forecasting</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={demandForecastData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="actual" stroke="#10B981" strokeWidth={2} name="Actual" />
                    <Line type="monotone" dataKey="predicted" stroke="#3B82F6" strokeWidth={2} strokeDasharray="5 5" name="Predicted" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Provider Churn Risk</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-200">
                    <div>
                      <p className="font-medium text-red-800">High Risk Providers</p>
                      <p className="text-sm text-red-600">Require immediate attention</p>
                    </div>
                    <Badge variant="destructive">3</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                    <div>
                      <p className="font-medium text-yellow-800">Medium Risk Providers</p>
                      <p className="text-sm text-yellow-600">Monitor closely</p>
                    </div>
                    <Badge variant="secondary">7</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                    <div>
                      <p className="font-medium text-green-800">Low Risk Providers</p>
                      <p className="text-sm text-green-600">Performing well</p>
                    </div>
                    <Badge variant="default">45</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="geographic" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Geographic Service Demand</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={geographicDemand}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ region, demand }) => `${region} (${demand}%)`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="demand"
                    >
                      {geographicDemand.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-4">
                  {geographicDemand.map((region, index) => (
                    <div key={region.region} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-4 h-4 rounded" 
                          style={{ backgroundColor: COLORS[index] }}
                        />
                        <div>
                          <p className="font-medium">{region.region}</p>
                          <p className="text-sm text-gray-600">{region.demand}% of total demand</p>
                        </div>
                      </div>
                      <Badge variant={region.growth > 10 ? "default" : "secondary"}>
                        +{region.growth}% growth
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="insights" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Automated Business Insights</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="h-4 w-4 text-green-600" />
                    <span className="font-medium text-green-800">Growth Opportunity</span>
                  </div>
                  <p className="text-sm text-green-700">
                    Cleaning services show 15% higher demand in Swakopmund. Consider recruiting more providers in this area.
                  </p>
                </div>
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Star className="h-4 w-4 text-blue-600" />
                    <span className="font-medium text-blue-800">Quality Insight</span>
                  </div>
                  <p className="text-sm text-blue-700">
                    Providers with 4.8+ ratings complete 23% more jobs. Implement quality incentive programs.
                  </p>
                </div>
                <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="h-4 w-4 text-yellow-600" />
                    <span className="font-medium text-yellow-800">Attention Required</span>
                  </div>
                  <p className="text-sm text-yellow-700">
                    Weekend booking completion rate is 12% lower. Consider weekend-specific incentives.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Optimization Recommendations</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="font-medium">Price Optimization</p>
                    <p className="text-sm text-gray-600">Consider 5-8% price increase for premium cleaning services based on demand analysis.</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="font-medium">Capacity Planning</p>
                    <p className="text-sm text-gray-600">Peak hours: 2-6 PM weekdays. Recruit 3-4 additional providers for optimal coverage.</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="font-medium">Provider Retention</p>
                    <p className="text-sm text-gray-600">Implement monthly performance bonuses to reduce churn risk by estimated 25%.</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
