
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Calendar, DatePickerWithRange } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useAnalytics, DateRange } from '@/hooks/useAnalytics';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, Area, AreaChart 
} from 'recharts';
import { 
  Users, DollarSign, Calendar as CalendarIcon, TrendingUp, 
  Download, Filter, RefreshCw, Star, MapPin, Clock,
  Target, Briefcase, CreditCard, Award
} from 'lucide-react';
import { format } from 'date-fns';

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#0088fe'];

export const AnalyticsDashboard: React.FC = () => {
  const {
    analyticsSummary,
    userStats,
    revenueData,
    bookingAnalytics,
    providerPerformance,
    servicePopularity,
    mrrData,
    geographicData,
    isLoading,
    fetchAllAnalytics,
    exportToCSV
  } = useAnalytics();

  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [selectedMetric, setSelectedMetric] = useState('overview');

  const handleDateRangeChange = (range: DateRange) => {
    setDateRange(range);
    fetchAllAnalytics(range);
  };

  const handleExport = (data: any[], filename: string) => {
    exportToCSV(data, filename);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header with Controls */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
          <p className="text-gray-600">Comprehensive business insights and reporting</p>
        </div>
        <div className="flex items-center space-x-4">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline">
                <CalendarIcon className="h-4 w-4 mr-2" />
                Date Range
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <DatePickerWithRange
                onSelect={(range) => {
                  if (range?.from && range?.to) {
                    handleDateRangeChange({
                      startDate: format(range.from, 'yyyy-MM-dd'),
                      endDate: format(range.to, 'yyyy-MM-dd')
                    });
                  }
                }}
              />
            </PopoverContent>
          </Popover>
          <Button onClick={() => fetchAllAnalytics(dateRange)} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Key Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsSummary?.total_users || 0}</div>
            <p className="text-xs text-muted-foreground">
              {analyticsSummary?.total_providers || 0} providers active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              N${analyticsSummary?.total_revenue || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              {analyticsSummary?.completed_bookings || 0} completed bookings
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analyticsSummary?.avg_rating?.toFixed(1) || '0.0'}
            </div>
            <p className="text-xs text-muted-foreground">
              Out of 5.0 stars
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analyticsSummary && analyticsSummary.total_bookings > 0 
                ? Math.round((analyticsSummary.completed_bookings / analyticsSummary.total_bookings) * 100)
                : 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              Booking success rate
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Analytics Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="financial">Financial</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="services">Services</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Monthly Revenue Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={mrrData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Area type="monotone" dataKey="mrr" stroke="#8884d8" fill="#8884d8" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Booking Status Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={bookingAnalytics.reduce((acc, curr) => {
                        const existing = acc.find(item => item.status === curr.status);
                        if (existing) {
                          existing.count += curr.booking_count;
                        } else {
                          acc.push({ status: curr.status, count: curr.booking_count });
                        }
                        return acc;
                      }, [] as any[])}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ status, percent }) => `${status} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="count"
                    >
                      {bookingAnalytics.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>User Growth by Role</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={userStats}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="role" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="total_users" fill="#8884d8" />
                  <Bar dataKey="active_users" fill="#82ca9d" />
                  <Bar dataKey="new_users_30d" fill="#ffc658" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Financial Tab */}
        <TabsContent value="financial" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CreditCard className="h-5 w-5 mr-2" />
                  Revenue Breakdown
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {revenueData.map((revenue, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm font-medium">{revenue.service_type}</span>
                        <span className="text-sm">N${revenue.gross_revenue}</span>
                      </div>
                      <Progress 
                        value={(revenue.gross_revenue / Math.max(...revenueData.map(r => r.gross_revenue))) * 100} 
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Commission Earnings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">
                    N${revenueData.reduce((sum, r) => sum + r.platform_commission, 0)}
                  </div>
                  <p className="text-sm text-muted-foreground">Total Platform Commission</p>
                </div>
                <div className="mt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Gross Revenue</span>
                    <span>N${revenueData.reduce((sum, r) => sum + r.gross_revenue, 0)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Provider Payouts</span>
                    <span>N${revenueData.reduce((sum, r) => sum + r.provider_payouts, 0)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>MRR Growth</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-3xl font-bold">
                    {mrrData[mrrData.length - 1]?.growth_rate || 0}%
                  </div>
                  <p className="text-sm text-muted-foreground">Monthly Growth Rate</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Revenue Trends by Service Type</CardTitle>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => handleExport(revenueData, 'revenue-analysis')}
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
                  <Line type="monotone" dataKey="gross_revenue" stroke="#8884d8" strokeWidth={2} />
                  <Line type="monotone" dataKey="platform_commission" stroke="#82ca9d" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Performance Tab */}
        <TabsContent value="performance" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Top Performing Providers</CardTitle>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleExport(providerPerformance, 'provider-performance')}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {providerPerformance.slice(0, 10).map((provider, index) => (
                    <div key={provider.provider_id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Badge variant="outline">#{index + 1}</Badge>
                        <div>
                          <p className="font-medium">{provider.provider_name}</p>
                          <p className="text-sm text-gray-600">
                            {provider.total_jobs} jobs • {provider.avg_rating?.toFixed(1)}★
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">N${provider.total_earnings}</p>
                        <p className="text-sm text-green-600">{provider.completion_rate}% completion</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Service Popularity Rankings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {servicePopularity.slice(0, 8).map((service, index) => (
                    <div key={service.id} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Badge variant="outline">#{index + 1}</Badge>
                        <div>
                          <p className="font-medium">{service.name}</p>
                          <p className="text-sm text-gray-600">{service.service_type}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{service.total_bookings} bookings</p>
                        <p className="text-sm text-green-600">N${service.total_revenue}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Geographic Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={geographicData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="region" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="total_bookings" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Users Tab */}
        <TabsContent value="users" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {userStats.map((stat, index) => (
              <Card key={stat.role}>
                <CardHeader>
                  <CardTitle className="capitalize">{stat.role}s</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Total Users</span>
                      <span className="font-bold">{stat.total_users}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Active Users</span>
                      <span className="font-bold text-green-600">{stat.active_users}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>New (30d)</span>
                      <span className="font-bold text-blue-600">{stat.new_users_30d}</span>
                    </div>
                    <Progress 
                      value={(stat.active_users / stat.total_users) * 100} 
                      className="mt-2"
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Services Tab */}
        <TabsContent value="services" className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Service Performance Metrics</CardTitle>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => handleExport(servicePopularity, 'service-popularity')}
              >
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={servicePopularity}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="total_bookings" fill="#8884d8" />
                  <Bar dataKey="total_revenue" fill="#82ca9d" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Reports Tab */}
        <TabsContent value="reports" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Financial Reports</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => handleExport(revenueData, 'financial-summary')}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Revenue Summary
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => handleExport(providerPerformance, 'provider-earnings')}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Provider Earnings
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => handleExport(mrrData, 'mrr-analysis')}
                >
                  <Download className="h-4 w-4 mr-2" />
                  MRR Analysis
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Performance Reports</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => handleExport(servicePopularity, 'service-rankings')}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Service Rankings
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => handleExport(bookingAnalytics, 'booking-trends')}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Booking Trends
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => handleExport(geographicData, 'geographic-analysis')}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Geographic Analysis
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Custom Reports</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select report type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="weekly">Weekly Summary</SelectItem>
                    <SelectItem value="monthly">Monthly Report</SelectItem>
                    <SelectItem value="quarterly">Quarterly Analysis</SelectItem>
                    <SelectItem value="annual">Annual Report</SelectItem>
                  </SelectContent>
                </Select>
                <Button className="w-full">
                  Generate Custom Report
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
