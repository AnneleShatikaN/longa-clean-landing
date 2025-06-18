
import React, { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TrendingUp, TrendingDown, DollarSign, Users, Calendar, Download } from 'lucide-react';
import { useFinancialAnalytics } from '@/hooks/useFinancialAnalytics';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { Badge } from '@/components/ui/badge';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export const PredictiveAnalytics: React.FC = () => {
  const {
    financialOverview,
    revenueForecasts,
    serviceProfitability,
    providerRankings,
    customerLTV,
    isLoading,
    fetchAllAnalytics,
    exportAnalyticsData
  } = useFinancialAnalytics();

  useEffect(() => {
    fetchAllAnalytics();
  }, [fetchAllAnalytics]);

  const handleExportData = (dataType: string) => {
    const dataMap = {
      'financial-overview': financialOverview,
      'revenue-forecasts': revenueForecasts,
      'service-profitability': serviceProfitability,
      'provider-rankings': providerRankings,
      'customer-ltv': customerLTV
    };

    const data = dataMap[dataType as keyof typeof dataMap];
    if (data && data.length > 0) {
      exportAnalyticsData(data, `${dataType}-${new Date().toISOString().split('T')[0]}`);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const totalRevenue = financialOverview.reduce((sum, month) => sum + (month.revenue || 0), 0);
  const avgMonthlyGrowth = financialOverview.length > 1 
    ? ((financialOverview[0]?.revenue || 0) - (financialOverview[1]?.revenue || 0)) / (financialOverview[1]?.revenue || 1) * 100
    : 0;

  const topServices = serviceProfitability.slice(0, 5);
  const topProviders = providerRankings.slice(0, 10);

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Predicted Revenue (3 months)</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              N${revenueForecasts.reduce((sum, forecast) => sum + forecast.predicted_revenue, 0).toLocaleString()}
            </div>
            <div className="flex items-center text-xs text-muted-foreground">
              {avgMonthlyGrowth >= 0 ? (
                <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
              ) : (
                <TrendingDown className="h-3 w-3 mr-1 text-red-500" />
              )}
              {Math.abs(avgMonthlyGrowth).toFixed(1)}% from last month
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Customer LTV</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              N${(customerLTV.reduce((sum, customer) => sum + customer.customer_lifetime_value, 0) / (customerLTV.length || 1)).toFixed(0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Based on {customerLTV.length} customers
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Top Service Profit Margin</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {topServices[0] ? `${((topServices[0].profit_margin / topServices[0].total_revenue) * 100).toFixed(1)}%` : '0%'}
            </div>
            <p className="text-xs text-muted-foreground">
              {topServices[0]?.service_name || 'No data'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Provider Performance</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {topProviders.length > 0 ? `${topProviders[0].completion_rate.toFixed(1)}%` : '0%'}
            </div>
            <p className="text-xs text-muted-foreground">
              Top completion rate
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Forecast Chart */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Revenue Forecast & Historical Trends</CardTitle>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => handleExportData('revenue-forecasts')}
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={[...financialOverview.slice(0, 6), ...revenueForecasts]}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value: any) => [`N$${value?.toLocaleString()}`, 'Revenue']} />
              <Line 
                type="monotone" 
                dataKey="revenue" 
                stroke="#8884d8" 
                strokeWidth={2}
                name="Historical Revenue"
              />
              <Line 
                type="monotone" 
                dataKey="predicted_revenue" 
                stroke="#82ca9d" 
                strokeDasharray="5 5"
                strokeWidth={2}
                name="Predicted Revenue"
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Service Profitability Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Service Profitability</CardTitle>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => handleExportData('service-profitability')}
            >
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={topServices}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="service_name" angle={-45} textAnchor="end" height={60} />
                <YAxis />
                <Tooltip formatter={(value: any) => [`N$${value?.toLocaleString()}`, 'Profit']} />
                <Bar dataKey="profit_margin" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Service Type Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={serviceProfitability.reduce((acc: any[], service) => {
                    const existing = acc.find(item => item.type === service.service_type);
                    if (existing) {
                      existing.value += service.total_revenue;
                    } else {
                      acc.push({ type: service.service_type, value: service.total_revenue });
                    }
                    return acc;
                  }, [])}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ type, percent }: any) => `${type} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {serviceProfitability.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: any) => [`N$${value?.toLocaleString()}`, 'Revenue']} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Provider Rankings */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Top Provider Performance (30 Days)</CardTitle>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => handleExportData('provider-rankings')}
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {topProviders.map((provider, index) => (
              <div key={provider.provider_id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold">
                    {index + 1}
                  </div>
                  <div>
                    <h4 className="font-medium">{provider.provider_name}</h4>
                    <p className="text-sm text-gray-600">
                      {provider.completed_30_days} jobs completed
                    </p>
                  </div>
                </div>
                <div className="text-right space-y-1">
                  <Badge variant="outline">
                    {provider.completion_rate.toFixed(1)}% completion
                  </Badge>
                  <div className="text-sm text-gray-600">
                    N${provider.revenue_30_days.toLocaleString()} revenue
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Customer Lifetime Value Analysis */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Customer Lifetime Value Distribution</CardTitle>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => handleExportData('customer-ltv')}
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={customerLTV.slice(0, 20)}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="client_id" hide />
              <YAxis />
              <Tooltip 
                formatter={(value: any) => [`N$${value?.toLocaleString()}`, 'LTV']}
                labelFormatter={(label: any) => `Customer: ${label}`}
              />
              <Bar dataKey="customer_lifetime_value" fill="#82ca9d" />
            </BarChart>
          </ResponsiveContainer>
          <div className="mt-4 text-sm text-gray-600">
            <p>
              Average LTV: N${(customerLTV.reduce((sum, c) => sum + c.customer_lifetime_value, 0) / (customerLTV.length || 1)).toFixed(0)} | 
              Total Customers: {customerLTV.length} | 
              High-Value Customers (>N$1000): {customerLTV.filter(c => c.customer_lifetime_value > 1000).length}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
