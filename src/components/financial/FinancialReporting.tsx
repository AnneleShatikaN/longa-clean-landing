import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Download, TrendingUp, DollarSign, Users, AlertCircle, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface ReportData {
  total_revenue: number;
  total_payouts: number;
  platform_commission: number;
  bookings: Array<{
    id: string;
    booking_date: string;
    total_amount: number;
    provider_payout: number;
    service_name: string;
    client_name: string;
    provider_name: string;
    status: string;
  }>;
  payouts: Array<{
    id: string;
    amount: number;
    status: string;
    created_at: string;
    provider_name: string;
    payment_method: string;
  }>;
}

export const FinancialReporting = () => {
  const { toast } = useToast();
  const [dateFrom, setDateFrom] = useState<Date>();
  const [dateTo, setDateTo] = useState<Date>();
  const [reportType, setReportType] = useState('monthly');
  const [isGenerating, setIsGenerating] = useState(false);

  const financialMetrics = [
    {
      title: 'Total Revenue',
      value: 'N$125,430',
      change: '+12.5%',
      changeType: 'positive',
      icon: DollarSign
    },
    {
      title: 'Total Payouts',
      value: 'N$89,520',
      change: '+8.3%',
      changeType: 'positive',
      icon: TrendingUp
    },
    {
      title: 'Platform Commission',
      value: 'N$35,910',
      change: '+15.2%',
      changeType: 'positive',
      icon: Users
    },
    {
      title: 'Pending Reconciliation',
      value: 'N$2,450',
      change: '-5.1%',
      changeType: 'negative',
      icon: AlertCircle
    }
  ];

  const reconciliationReports = [
    {
      id: 1,
      period: 'May 2024',
      status: 'reconciled',
      totalRevenue: 98500,
      totalPayouts: 72300,
      platformCommission: 26200,
      discrepancy: 0,
      generatedAt: '2024-06-01'
    },
    {
      id: 2,
      period: 'April 2024', 
      status: 'discrepancy',
      totalRevenue: 87200,
      totalPayouts: 63400,
      platformCommission: 21350,
      discrepancy: 2450,
      generatedAt: '2024-05-01'
    }
  ];

  const fetchReportData = async (): Promise<ReportData | null> => {
    try {
      const fromDate = dateFrom ? format(dateFrom, 'yyyy-MM-dd') : format(new Date(new Date().getFullYear(), new Date().getMonth(), 1), 'yyyy-MM-dd');
      const toDate = dateTo ? format(dateTo, 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd');

      // Fetch bookings data
      const { data: bookingsData, error: bookingsError } = await supabase
        .from('bookings')
        .select(`
          id,
          booking_date,
          total_amount,
          provider_payout,
          status,
          services!inner(name),
          client:users!client_id(full_name),
          provider:users!provider_id(full_name)
        `)
        .gte('booking_date', fromDate)
        .lte('booking_date', toDate)
        .eq('status', 'completed');

      if (bookingsError) throw bookingsError;

      // Fetch payouts data
      const { data: payoutsData, error: payoutsError } = await supabase
        .from('payouts')
        .select(`
          id,
          amount,
          status,
          created_at,
          payment_method,
          users!provider_id(full_name)
        `)
        .gte('created_at', fromDate)
        .lte('created_at', toDate);

      if (payoutsError) throw payoutsError;

      // Calculate totals
      const totalRevenue = bookingsData?.reduce((sum, booking) => sum + Number(booking.total_amount), 0) || 0;
      const totalPayouts = payoutsData?.reduce((sum, payout) => sum + Number(payout.amount), 0) || 0;
      const platformCommission = totalRevenue - totalPayouts;

      return {
        total_revenue: totalRevenue,
        total_payouts: totalPayouts,
        platform_commission: platformCommission,
        bookings: bookingsData?.map(booking => ({
          id: booking.id,
          booking_date: booking.booking_date,
          total_amount: Number(booking.total_amount),
          provider_payout: Number(booking.provider_payout || 0),
          service_name: booking.services?.name || 'Unknown Service',
          client_name: booking.client?.full_name || 'Unknown Client',
          provider_name: booking.provider?.full_name || 'Unknown Provider',
          status: booking.status
        })) || [],
        payouts: payoutsData?.map(payout => ({
          id: payout.id,
          amount: Number(payout.amount),
          status: payout.status,
          created_at: payout.created_at,
          provider_name: payout.users?.full_name || 'Unknown Provider',
          payment_method: payout.payment_method || 'Unknown Method'
        })) || []
      };
    } catch (error) {
      console.error('Error fetching report data:', error);
      return null;
    }
  };

  const generateCSV = (data: ReportData): string => {
    const headers = [
      'Report Type', 'Date From', 'Date To', 'Total Revenue (NAD)', 'Total Payouts (NAD)', 'Platform Commission (NAD)'
    ];
    
    const summaryRows = [
      [
        reportType,
        dateFrom ? format(dateFrom, 'yyyy-MM-dd') : 'N/A',
        dateTo ? format(dateTo, 'yyyy-MM-dd') : 'N/A',
        data.total_revenue.toFixed(2),
        data.total_payouts.toFixed(2),
        data.platform_commission.toFixed(2)
      ]
    ];

    const bookingHeaders = [
      '', // Empty row
      'BOOKINGS DETAILS',
      'Booking ID', 'Date', 'Service', 'Client', 'Provider', 'Amount (NAD)', 'Provider Payout (NAD)', 'Status'
    ];

    const bookingRows = data.bookings.map(booking => [
      booking.id,
      booking.booking_date,
      booking.service_name,
      booking.client_name,
      booking.provider_name,
      booking.total_amount.toFixed(2),
      booking.provider_payout.toFixed(2),
      booking.status
    ]);

    const payoutHeaders = [
      '', // Empty row
      'PAYOUTS DETAILS',
      'Payout ID', 'Provider', 'Amount (NAD)', 'Payment Method', 'Status', 'Date'
    ];

    const payoutRows = data.payouts.map(payout => [
      payout.id,
      payout.provider_name,
      payout.amount.toFixed(2),
      payout.payment_method,
      payout.status,
      format(new Date(payout.created_at), 'yyyy-MM-dd')
    ]);

    const allRows = [
      headers,
      ...summaryRows,
      bookingHeaders.slice(0, 1), // Empty row
      bookingHeaders.slice(1, 2), // "BOOKINGS DETAILS"
      bookingHeaders.slice(2), // Actual headers
      ...bookingRows,
      payoutHeaders.slice(0, 1), // Empty row
      payoutHeaders.slice(1, 2), // "PAYOUTS DETAILS"
      payoutHeaders.slice(2), // Actual headers
      ...payoutRows
    ];

    return allRows.map(row => 
      row.map(cell => `"${cell}"`).join(',')
    ).join('\n');
  };

  const downloadFile = (content: string, filename: string, type: string) => {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleGenerateReport = async () => {
    setIsGenerating(true);
    
    try {
      const reportData = await fetchReportData();
      
      if (!reportData) {
        toast({
          title: "Error",
          description: "Failed to fetch report data. Please try again.",
          variant: "destructive",
        });
        return;
      }

      if (reportData.bookings.length === 0 && reportData.payouts.length === 0) {
        toast({
          title: "No data available",
          description: "No data found for the selected date range.",
          variant: "destructive",
        });
        return;
      }

      const timestamp = format(new Date(), 'yyyyMMdd');
      const filename = `longa-report-${timestamp}.csv`;
      const csvContent = generateCSV(reportData);
      
      downloadFile(csvContent, filename, 'text/csv;charset=utf-8;');
      
      toast({
        title: "Download Successful",
        description: `Report downloaded as ${filename}`,
        className: "border-green-200 bg-green-50",
      });
    } catch (error) {
      console.error('Error generating report:', error);
      toast({
        title: "Error",
        description: "Failed to generate report. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleReconciliation = async (period: string) => {
    try {
      // Call the reconciliation function
      const { data, error } = await supabase.rpc('perform_financial_reconciliation', {
        start_date: dateFrom ? format(dateFrom, 'yyyy-MM-dd') : format(new Date(new Date().getFullYear(), new Date().getMonth(), 1), 'yyyy-MM-dd'),
        end_date: dateTo ? format(dateTo, 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd')
      });

      if (error) throw error;
      
      toast({
        title: "Reconciliation Started",
        description: `Financial reconciliation for ${period} has been completed.`,
        className: "border-green-200 bg-green-50",
      });
    } catch (error) {
      console.error('Error performing reconciliation:', error);
      toast({
        title: "Error",
        description: "Failed to perform reconciliation. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Financial Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {financialMetrics.map((metric, index) => (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{metric.title}</p>
                  <p className="text-2xl font-bold">{metric.value}</p>
                  <p className={cn(
                    "text-sm font-medium",
                    metric.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                  )}>
                    {metric.change} from last month
                  </p>
                </div>
                <metric.icon className={cn(
                  "h-8 w-8",
                  metric.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                )} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Report Generation */}
      <Card>
        <CardHeader>
          <CardTitle>Generate Financial Reports</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Report Type</label>
              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily Report</SelectItem>
                  <SelectItem value="weekly">Weekly Report</SelectItem>
                  <SelectItem value="monthly">Monthly Report</SelectItem>
                  <SelectItem value="quarterly">Quarterly Report</SelectItem>
                  <SelectItem value="custom">Custom Range</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">From Date</label>
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
                    {dateFrom ? format(dateFrom, "PPP") : "Select date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={dateFrom}
                    onSelect={setDateFrom}
                    initialFocus
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">To Date</label>
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
                    {dateTo ? format(dateTo, "PPP") : "Select date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={dateTo}
                    onSelect={setDateTo}
                    initialFocus
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="flex items-end">
              <Button 
                onClick={handleGenerateReport} 
                className="w-full"
                disabled={isGenerating}
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4 mr-2" />
                    Generate Report
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Reconciliation Reports */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Financial Reconciliation</CardTitle>
            <Button onClick={() => handleReconciliation('June 2024')}>
              Run Reconciliation
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {reconciliationReports.map((report) => (
              <div key={report.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <h4 className="font-medium">{report.period}</h4>
                    <Badge className={cn(
                      report.status === 'reconciled' 
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    )}>
                      {report.status}
                    </Badge>
                  </div>
                  <div className="text-sm text-gray-600">
                    Generated: {report.generatedAt}
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Total Revenue</p>
                    <p className="font-medium">N${report.totalRevenue.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Total Payouts</p>
                    <p className="font-medium">N${report.totalPayouts.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Platform Commission</p>
                    <p className="font-medium">N${report.platformCommission.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Discrepancy</p>
                    <p className={cn(
                      "font-medium",
                      report.discrepancy === 0 ? 'text-green-600' : 'text-red-600'
                    )}>
                      N${report.discrepancy.toLocaleString()}
                    </p>
                  </div>
                </div>

                {report.discrepancy > 0 && (
                  <div className="mt-3 p-3 bg-red-50 rounded-lg">
                    <div className="flex items-center gap-2 text-red-800">
                      <AlertCircle className="h-4 w-4" />
                      <span className="text-sm font-medium">
                        Discrepancy detected requiring investigation
                      </span>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
