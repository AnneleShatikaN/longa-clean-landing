
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  TrendingUp, 
  DollarSign, 
  Calendar, 
  FileText, 
  Download,
  RefreshCw,
  AlertCircle 
} from 'lucide-react';
import { useDataMode } from '@/contexts/DataModeContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface FinancialData {
  totalRevenue: number;
  totalPayouts: number;
  platformCommission: number;
  pendingPayouts: number;
  monthlyRevenue: Array<{ month: string; revenue: number; payouts: number }>;
  topServices: Array<{ name: string; revenue: number; bookings: number }>;
}

export const FinancialOverview: React.FC = () => {
  const { dataMode, isLoading: dataModeLoading } = useDataMode();
  const { toast } = useToast();
  const [data, setData] = useState<FinancialData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('last-30-days');
  const [error, setError] = useState<string | null>(null);

  const fetchFinancialData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Only fetch live data since we're in live-only mode
      const { data: bookings, error: bookingsError } = await supabase
        .from('bookings')
        .select('*');

      if (bookingsError) throw bookingsError;

      const { data: payouts, error: payoutsError } = await supabase
        .from('payouts')
        .select('*');

      if (payoutsError) throw payoutsError;

      // Calculate financial metrics from live data
      const completedBookings = bookings?.filter(b => b.status === 'completed') || [];
      const totalRevenue = completedBookings.reduce((sum, b) => sum + (b.total_amount || 0), 0);
      const totalPayouts = payouts?.reduce((sum, p) => sum + (p.amount || 0), 0) || 0;
      const platformCommission = totalRevenue - totalPayouts;
      const pendingPayouts = payouts?.filter(p => p.status === 'pending')
        .reduce((sum, p) => sum + (p.amount || 0), 0) || 0;

      setData({
        totalRevenue,
        totalPayouts,
        platformCommission,
        pendingPayouts,
        monthlyRevenue: [], // Could be calculated from bookings data
        topServices: [] // Could be calculated from services and bookings
      });

    } catch (error) {
      console.error('Error fetching financial data:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to load financial data';
      setError(errorMessage);
      toast({
        title: "Error Loading Data",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!dataModeLoading) {
      fetchFinancialData();
    }
  }, [dataModeLoading, selectedPeriod]);

  const handleRefresh = () => {
    fetchFinancialData();
  };

  const exportData = () => {
    if (!data) return;
    
    const csvContent = `Financial Summary
Total Revenue,${data.totalRevenue}
Total Payouts,${data.totalPayouts}
Platform Commission,${data.platformCommission}
Pending Payouts,${data.pendingPayouts}`;

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `financial-overview-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    
    toast({
      title: "Export Complete",
      description: "Financial data has been exported successfully.",
    });
  };

  if (isLoading || dataModeLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <RefreshCw className="h-5 w-5 animate-spin" />
          <p>Loading financial overview...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-red-200">
        <CardContent className="p-6">
          <div className="flex items-center gap-3 text-red-600">
            <AlertCircle className="h-5 w-5" />
            <div>
              <p className="font-medium">Failed to load financial data</p>
              <p className="text-sm">{error}</p>
              <Button onClick={handleRefresh} variant="outline" size="sm" className="mt-2">
                Try Again
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!data) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-gray-500">No financial data available</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Financial Overview</h2>
          <p className="text-gray-600">Live financial data and analytics</p>
        </div>
        <div className="flex gap-2">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="last-7-days">Last 7 Days</SelectItem>
              <SelectItem value="last-30-days">Last 30 Days</SelectItem>
              <SelectItem value="last-90-days">Last 90 Days</SelectItem>
              <SelectItem value="this-year">This Year</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={handleRefresh} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={exportData} variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold">N${data.totalRevenue.toLocaleString()}</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Provider Payouts</p>
                <p className="text-2xl font-bold">N${data.totalPayouts.toLocaleString()}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Platform Commission</p>
                <p className="text-2xl font-bold">N${data.platformCommission.toLocaleString()}</p>
              </div>
              <Calendar className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Payouts</p>
                <p className="text-2xl font-bold">N${data.pendingPayouts.toLocaleString()}</p>
                {data.pendingPayouts > 0 && (
                  <Badge variant="secondary" className="mt-1">
                    Requires Action
                  </Badge>
                )}
              </div>
              <FileText className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics */}
      <Tabs defaultValue="revenue" className="space-y-4">
        <TabsList>
          <TabsTrigger value="revenue">Revenue Analytics</TabsTrigger>
          <TabsTrigger value="payouts">Payout Analytics</TabsTrigger>
          <TabsTrigger value="services">Service Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="revenue" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Revenue Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-500">Revenue analytics will be displayed here based on live data.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payouts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Payout Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-500">Payout trends and analytics will be displayed here.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="services" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Top Performing Services</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-500">Service performance metrics will be displayed here.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
