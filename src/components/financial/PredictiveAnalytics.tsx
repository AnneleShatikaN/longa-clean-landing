
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend,
  Area,
  AreaChart
} from 'recharts';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Users, 
  Calendar,
  Target,
  Brain,
  Download,
  Zap
} from 'lucide-react';
import { useFinancialAnalytics } from '@/hooks/useFinancialAnalytics';
import { useToast } from '@/hooks/use-toast';

interface PredictiveAnalyticsProps {
  className?: string;
}

export const PredictiveAnalytics: React.FC<PredictiveAnalyticsProps> = ({ className }) => {
  const { 
    financialOverview, 
    revenueForecasts, 
    serviceProfitability, 
    providerRankings,
    customerLTV,
    isLoading, 
    fetchAllAnalytics,
    fetchRevenueForecasts,
    exportAnalyticsData
  } = useFinancialAnalytics();
  
  const { toast } = useToast();
  const [forecastPeriod, setForecastPeriod] = useState('6');
  const [selectedMetric, setSelectedMetric] = useState('revenue');

  useEffect(() => {
    fetchAllAnalytics();
  }, [fetchAllAnalytics]);

  const handleForecastPeriodChange = async (period: string) => {
    setForecastPeriod(period);
    await fetchRevenueForecasts(parseInt(period));
  };

  const exportData = (dataType: string) => {
    switch (dataType) {
      case 'forecasts':
        exportAnalyticsData(revenueForecasts, 'revenue_forecasts');
        break;
      case 'profitability':
        exportAnalyticsData(serviceProfitability, 'service_profitability');
        break;
      case 'providers':
        exportAnalyticsData(providerRankings, 'provider_rankings');
        break;
      case 'customers':
        exportAnalyticsData(customerLTV, 'customer_ltv');
        break;
      default:
        toast({
          title: 'Error',
          description: 'Unknown data type for export',
          variant: 'destructive'
        });
    }
  };

  const formatCurrency = (value: number) => `N$${value.toLocaleString()}`;

  const calculateGrowthRate = (data: any[], valueKey: string) => {
    if (data.length < 2) return 0;
    const latest = data[0]?.[valueKey] || 0;
    const previous = data[1]?.[valueKey] || 0;
    return previous !== 0 ? ((latest - previous) / previous) * 100 : 0;
  };

  const getGrowthIndicator = (growth: number) => {
    if (growth > 0) {
      return <TrendingUp className="h-4 w-4 text-green-600" />;
    } else if (growth < 0) {
      return <TrendingDown className="h-4 w-4 text-red-600" />;
    }
    return <div className="h-4 w-4" />;
  };

  const revenueGrowth = calculateGrowthRate(financialOverview, 'revenue');
  const bookingsGrowth = calculateGrowthRate(financialOverview, 'total_bookings');

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/3"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Predictive Analytics</h2>
          <p className="text-gray-600">AI-powered business intelligence and forecasting</p>
        </div>
        <div className="flex gap-2">
          <Select value={forecastPeriod} onValueChange={handleForecastPeriodChange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="3">3 Months</SelectItem>
              <SelectItem value="6">6 Months</SelectItem>
              <SelectItem value="12">12 Months</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Key Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Revenue Growth</p>
                <div className="flex items-center gap-2">
                  <p className="text-2xl font-bold">{revenueGrowth.toFixed(1)}%</p>
                  {getGrowthIndicator(revenueGrowth)}
                </div>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Booking Growth</p>
                <div className="flex items-center gap-2">
                  <p className="text-2xl font-bold">{bookingsGrowth.toFixed(1)}%</p>
                  {getGrowthIndicator(bookingsGrowth)}
                </div>
              </div>
              <Calendar className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Providers</p>
                <p className="text-2xl font-bold">{providerRankings.length}</p>
              </div>
              <Users className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg. Customer LTV</p>
                <p className="text-2xl font-bold">
                  {formatCurrency(
                    customerLTV.reduce((sum, customer) => sum + customer.customer_lifetime_value, 0) / 
                    Math.max(customerLTV.length, 1)
                  )}
                </p>
              </div>
              <Target className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Analytics Tabs */}
      <Tabs defaultValue="forecasting" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="forecasting">Revenue Forecasting</TabsTrigger>
          <TabsTrigger value="profitability">Service Profitability</TabsTrigger>
          <TabsTrigger value="providers">Provider Rankings</TabsTrigger>
          <TabsTrigger value="customers">Customer Analytics</TabsTrigger>
        </TabsList>

        {/* Revenue Forecasting Tab */}
        <TabsContent value="forecasting" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5" />
                  Revenue Forecast - Next {forecastPeriod} Months
                </CardTitle>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => exportData('forecasts')}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <AreaChart data={revenueForecasts}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis tickFormatter={formatCurrency} />
                  <Tooltip 
                    formatter={(value: number) => [formatCurrency(value), 'Predicted Revenue']}
                    labelFormatter={(label) => `Month: ${label}`}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="predicted_revenue" 
                    stroke="#8884d8" 
                    fill="#8884d8" 
                    fillOpacity={0.3}
                  />
                </AreaChart>
              </ResponsiveContainer>
              
              <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                {revenueForecasts.slice(0, 3).map((forecast, index) => (
                  <div key={index} className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">Month {index + 1}</span>
                      <Badge variant="outline">
                        {(forecast.confidence_level * 100).toFixed(0)}% Confidence
                      </Badge>
                    </div>
                    <p className="text-lg font-bold">{formatCurrency(forecast.predicted_revenue)}</p>
                    <p className="text-sm text-gray-600">{forecast.predicted_bookings} bookings</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Service Profitability Tab */}
        <TabsContent value="profitability" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Service Profitability Analysis</CardTitle>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => exportData('profitability')}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={serviceProfitability.slice(0, 10)}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="service_name" angle={-45} textAnchor="end" height={100} />
                  <YAxis tickFormatter={formatCurrency} />
                  <Tooltip 
                    formatter={(value: number) => [formatCurrency(value), 'Profit Margin']}
                  />
                  <Bar dataKey="profit_margin" fill="#82ca9d" />
                </BarChart>
              </ResponsiveContainer>

              <div className="mt-6 space-y-4">
                <h4 className="font-semibold">Top Performing Services</h4>
                {serviceProfitability.slice(0, 5).map((service, index) => (
                  <div key={service.service_id} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                    <div>
                      <span className="font-medium">{service.service_name}</span>
                      <div className="flex gap-4 text-sm text-gray-600">
                        <span>{service.completed_bookings} completed</span>
                        <span>Rating: {service.avg_rating?.toFixed(1) || 'N/A'}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-green-600">{formatCurrency(service.profit_margin)}</p>
                      <p className="text-sm text-gray-600">Profit</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Provider Rankings Tab */}
        <TabsContent value="providers" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Provider Performance Rankings</CardTitle>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => exportData('providers')}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {providerRankings.slice(0, 10).map((provider, index) => (
                  <div key={provider.provider_id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-full">
                        <span className="text-sm font-bold text-blue-600">#{index + 1}</span>
                      </div>
                      <div>
                        <h4 className="font-medium">{provider.provider_name}</h4>
                        <div className="flex gap-4 text-sm text-gray-600">
                          <span>{provider.completed_30_days} completed</span>
                          <span>{provider.completion_rate.toFixed(1)}% completion rate</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">{formatCurrency(provider.revenue_30_days)}</p>
                      <div className="flex items-center gap-1">
                        <span className="text-sm text-gray-600">Rating:</span>
                        <span className="text-sm font-medium">{provider.recent_rating?.toFixed(1) || 'N/A'}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Customer Analytics Tab */}
        <TabsContent value="customers" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Customer Lifetime Value Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'High Value (N$1000+)', value: customerLTV.filter(c => c.customer_lifetime_value >= 1000).length },
                        { name: 'Medium Value (N$500-999)', value: customerLTV.filter(c => c.customer_lifetime_value >= 500 && c.customer_lifetime_value < 1000).length },
                        { name: 'Low Value (<N$500)', value: customerLTV.filter(c => c.customer_lifetime_value < 500).length }
                      ]}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {COLORS.map((color, index) => (
                        <Cell key={`cell-${index}`} fill={color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Top Customers by LTV</CardTitle>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => exportData('customers')}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {customerLTV.slice(0, 8).map((customer, index) => (
                    <div key={customer.client_id} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">Customer #{index + 1}</span>
                          {customer.churn_risk_score > 0.7 && (
                            <Badge variant="destructive" className="text-xs">High Churn Risk</Badge>
                          )}
                        </div>
                        <div className="text-sm text-gray-600">
                          {customer.total_bookings} bookings • Avg: {formatCurrency(customer.avg_booking_value)}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">{formatCurrency(customer.customer_lifetime_value)}</p>
                        <p className="text-sm text-gray-600">LTV</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
