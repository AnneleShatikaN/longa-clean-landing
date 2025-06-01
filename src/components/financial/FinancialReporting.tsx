
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CalendarIcon, Download, TrendingUp, TrendingDown, DollarSign, Users, FileText, BarChart3 } from 'lucide-react';
import { format, subDays, startOfMonth, endOfMonth, startOfYear, endOfYear } from 'date-fns';
import { cn } from '@/lib/utils';
import { formatCurrency } from '@/utils/financialCalculations';
import { useToast } from '@/hooks/use-toast';

interface FinancialMetrics {
  totalRevenue: number;
  platformCommission: number;
  totalPayouts: number;
  taxesWithheld: number;
  activeProviders: number;
  completedJobs: number;
  averageJobValue: number;
  revenueGrowth: number;
}

interface RevenueBreakdown {
  oneOffServices: number;
  subscriptionServices: number;
  emergencyBookings: number;
  commissions: number;
}

interface ProviderEarnings {
  providerId: number;
  providerName: string;
  totalEarnings: number;
  jobsCompleted: number;
  averageRating: number;
  taxesWithheld: number;
  lastPayout: string;
}

export const FinancialReporting = () => {
  const { toast } = useToast();
  const [dateFrom, setDateFrom] = useState<Date>(startOfMonth(new Date()));
  const [dateTo, setDateTo] = useState<Date>(endOfMonth(new Date()));
  const [reportType, setReportType] = useState<'overview' | 'revenue' | 'providers' | 'taxes'>('overview');

  // Mock data - in real implementation, this would come from API
  const metrics: FinancialMetrics = {
    totalRevenue: 125750,
    platformCommission: 18862.50,
    totalPayouts: 89325.50,
    taxesWithheld: 17562.00,
    activeProviders: 45,
    completedJobs: 342,
    averageJobValue: 367.69,
    revenueGrowth: 12.5
  };

  const revenueBreakdown: RevenueBreakdown = {
    oneOffServices: 89500,
    subscriptionServices: 28750,
    emergencyBookings: 7500,
    commissions: 18862.50
  };

  const topProviders: ProviderEarnings[] = [
    {
      providerId: 1,
      providerName: "John Cleaning Services",
      totalEarnings: 12450,
      jobsCompleted: 28,
      averageRating: 4.8,
      taxesWithheld: 2245.50,
      lastPayout: "2024-05-25"
    },
    {
      providerId: 2,
      providerName: "Maria's Home Care",
      totalEarnings: 9875,
      jobsCompleted: 22,
      averageRating: 4.9,
      taxesWithheld: 1777.50,
      lastPayout: "2024-05-25"
    }
  ];

  const generateReport = (type: string, formatType: 'pdf' | 'csv' | 'excel') => {
    // Simulate report generation
    toast({
      title: "Report Generated",
      description: `${type} report generated in ${formatType.toUpperCase()} format and will be downloaded shortly.`,
    });

    // In real implementation, this would trigger actual file generation and download
    console.log(`Generating ${type} report in ${formatType} format for period ${format(dateFrom, 'yyyy-MM-dd')} to ${format(dateTo, 'yyyy-MM-dd')}`);
  };

  const setQuickDateRange = (range: 'thisMonth' | 'lastMonth' | 'thisYear' | 'lastYear') => {
    const now = new Date();
    
    switch (range) {
      case 'thisMonth':
        setDateFrom(startOfMonth(now));
        setDateTo(endOfMonth(now));
        break;
      case 'lastMonth':
        const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        setDateFrom(startOfMonth(lastMonth));
        setDateTo(endOfMonth(lastMonth));
        break;
      case 'thisYear':
        setDateFrom(startOfYear(now));
        setDateTo(endOfYear(now));
        break;
      case 'lastYear':
        const lastYear = new Date(now.getFullYear() - 1, 0, 1);
        setDateFrom(startOfYear(lastYear));
        setDateTo(endOfYear(lastYear));
        break;
    }
  };

  return (
    <div className="space-y-6">
      {/* Date Range and Report Type Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Financial Reporting</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div>
              <label className="text-sm font-medium mb-2 block">Date From</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !dateFrom && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateFrom ? format(dateFrom, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={dateFrom}
                    onSelect={setDateFrom}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Date To</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !dateTo && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateTo ? format(dateTo, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={dateTo}
                    onSelect={setDateTo}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Quick Ranges</label>
              <Select onValueChange={(value: any) => setQuickDateRange(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="thisMonth">This Month</SelectItem>
                  <SelectItem value="lastMonth">Last Month</SelectItem>
                  <SelectItem value="thisYear">This Year</SelectItem>
                  <SelectItem value="lastYear">Last Year</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Report Type</label>
              <Select value={reportType} onValueChange={(value: any) => setReportType(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="overview">Overview</SelectItem>
                  <SelectItem value="revenue">Revenue Analysis</SelectItem>
                  <SelectItem value="providers">Provider Earnings</SelectItem>
                  <SelectItem value="taxes">Tax Reports</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex space-x-2">
            <Button onClick={() => generateReport(reportType, 'pdf')}>
              <FileText className="h-4 w-4 mr-2" />
              Export PDF
            </Button>
            <Button variant="outline" onClick={() => generateReport(reportType, 'csv')}>
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
            <Button variant="outline" onClick={() => generateReport(reportType, 'excel')}>
              <BarChart3 className="h-4 w-4 mr-2" />
              Export Excel
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{formatCurrency(metrics.totalRevenue)}</div>
            <p className="text-xs text-muted-foreground flex items-center">
              <TrendingUp className="h-3 w-3 mr-1 text-green-600" />
              +{metrics.revenueGrowth}% from last period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Platform Commission</CardTitle>
            <TrendingUp className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(metrics.platformCommission)}</div>
            <p className="text-xs text-muted-foreground">
              {((metrics.platformCommission / metrics.totalRevenue) * 100).toFixed(1)}% of total revenue
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Provider Payouts</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{formatCurrency(metrics.totalPayouts)}</div>
            <p className="text-xs text-muted-foreground">
              To {metrics.activeProviders} providers
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxes Withheld</CardTitle>
            <FileText className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{formatCurrency(metrics.taxesWithheld)}</div>
            <p className="text-xs text-muted-foreground">
              {((metrics.taxesWithheld / metrics.totalPayouts) * 100).toFixed(1)}% of payouts
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Reports Based on Type */}
      {reportType === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Revenue Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span>One-off Services</span>
                  <span className="font-medium">{formatCurrency(revenueBreakdown.oneOffServices)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Subscription Services</span>
                  <span className="font-medium">{formatCurrency(revenueBreakdown.subscriptionServices)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Emergency Bookings</span>
                  <span className="font-medium">{formatCurrency(revenueBreakdown.emergencyBookings)}</span>
                </div>
                <hr />
                <div className="flex justify-between items-center font-bold">
                  <span>Platform Commission</span>
                  <span className="text-purple-600">{formatCurrency(revenueBreakdown.commissions)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Job Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span>Total Jobs Completed</span>
                  <span className="font-medium">{metrics.completedJobs}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Average Job Value</span>
                  <span className="font-medium">{formatCurrency(metrics.averageJobValue)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Active Providers</span>
                  <span className="font-medium">{metrics.activeProviders}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Jobs per Provider</span>
                  <span className="font-medium">{(metrics.completedJobs / metrics.activeProviders).toFixed(1)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {reportType === 'providers' && (
        <Card>
          <CardHeader>
            <CardTitle>Top Provider Earnings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topProviders.map((provider) => (
                <div key={provider.providerId} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div>
                      <h4 className="font-medium">{provider.providerName}</h4>
                      <p className="text-sm text-gray-600">
                        {provider.jobsCompleted} jobs completed • ⭐ {provider.averageRating}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-green-600">{formatCurrency(provider.totalEarnings)}</div>
                    <div className="text-sm text-gray-600">
                      Tax withheld: {formatCurrency(provider.taxesWithheld)}
                    </div>
                    <div className="text-xs text-gray-500">
                      Last payout: {provider.lastPayout}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {reportType === 'taxes' && (
        <Card>
          <CardHeader>
            <CardTitle>Tax Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-4 border rounded-lg">
                <h4 className="font-medium text-gray-600">Income Tax Withheld</h4>
                <p className="text-2xl font-bold text-orange-600">{formatCurrency(metrics.taxesWithheld * 0.64)}</p>
                <p className="text-sm text-gray-500">18% of gross earnings</p>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <h4 className="font-medium text-gray-600">Withholding Tax</h4>
                <p className="text-2xl font-bold text-orange-600">{formatCurrency(metrics.taxesWithheld * 0.36)}</p>
                <p className="text-sm text-gray-500">10% of gross earnings</p>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <h4 className="font-medium text-gray-600">Total Tax Liability</h4>
                <p className="text-2xl font-bold text-red-600">{formatCurrency(metrics.taxesWithheld)}</p>
                <p className="text-sm text-gray-500">Due to NamRA</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
