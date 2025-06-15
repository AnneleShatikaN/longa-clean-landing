import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { CalendarIcon, Download, FileText, TrendingUp, Users, DollarSign, Loader2 } from 'lucide-react';
import { format, subDays, startOfWeek, endOfWeek } from 'date-fns';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface ExportRecord {
  id: string;
  exportDate: string;
  filename: string;
  recordCount: number;
  totalAmount: number;
  exportedBy: string;
}

interface PayoutExportData {
  providerName: string;
  bankMobileNumber: string;
  serviceType: string;
  jobId: string;
  serviceName: string;
  jobDate: string;
  payoutAmount: number;
  paymentTypeNotes: string;
}

export const PayoutExport = () => {
  const { toast } = useToast();
  const [dateFrom, setDateFrom] = useState<Date>(startOfWeek(new Date()));
  const [dateTo, setDateTo] = useState<Date>(endOfWeek(new Date()));
  const [markAsProcessed, setMarkAsProcessed] = useState(true);
  const [exportHistory, setExportHistory] = useState<ExportRecord[]>([]);
  const [isExporting, setIsExporting] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [exportableData, setExportableData] = useState<PayoutExportData[]>([]);

  // Fetch exportable payouts from Supabase
  const fetchExportablePayouts = async (): Promise<PayoutExportData[]> => {
    setIsLoadingData(true);
    try {
      const fromDate = format(dateFrom, 'yyyy-MM-dd');
      const toDate = format(dateTo, 'yyyy-MM-dd');

      // Fetch pending payouts for completed bookings
      const { data: payoutsData, error } = await supabase
        .from('payouts')
        .select(`
          id,
          amount,
          booking_id,
          payout_type,
          status,
          provider_id,
          users!provider_id(full_name),
          bookings!booking_id(
            id,
            booking_date,
            services!service_id(name, service_type, commission_percentage)
          )
        `)
        .eq('status', 'pending')
        .gte('created_at', fromDate)
        .lte('created_at', toDate);

      if (error) throw error;

      // Fetch provider payment methods separately
      const providerIds = payoutsData?.map(p => p.provider_id).filter(Boolean) || [];
      const { data: paymentMethods } = await supabase
        .from('provider_payment_methods')
        .select('provider_id, mobile_number, account_number, is_primary')
        .in('provider_id', providerIds)
        .eq('is_primary', true);

      // Create a map for quick lookup
      const paymentMethodsMap = new Map();
      paymentMethods?.forEach(pm => {
        paymentMethodsMap.set(pm.provider_id, pm);
      });

      const formattedData: PayoutExportData[] = (payoutsData || []).map(payout => {
        const paymentMethod = paymentMethodsMap.get(payout.provider_id);
        
        return {
          providerName: payout.users?.full_name || 'Unknown Provider',
          bankMobileNumber: paymentMethod?.mobile_number || paymentMethod?.account_number || 'Not provided',
          serviceType: payout.payout_type === 'manual' ? 'Manual' : (payout.bookings?.services?.service_type === 'one-off' ? 'One-Off' : 'Package'),
          jobId: payout.booking_id || payout.id,
          serviceName: payout.bookings?.services?.name || 'Manual Payout',
          jobDate: payout.bookings?.booking_date || format(new Date(), 'yyyy-MM-dd'),
          payoutAmount: Number(payout.amount),
          paymentTypeNotes: payout.payout_type === 'manual' 
            ? 'Manual payout'
            : `Commission: ${payout.bookings?.services?.commission_percentage || 15}%`
        };
      });

      setExportableData(formattedData);
      return formattedData;
    } catch (error) {
      console.error('Error fetching exportable payouts:', error);
      toast({
        title: "Error",
        description: "Failed to fetch payout data. Please try again.",
        variant: "destructive",
      });
      return [];
    } finally {
      setIsLoadingData(false);
    }
  };

  useEffect(() => {
    fetchExportablePayouts();
  }, [dateFrom, dateTo]);

  const generateCSV = (data: PayoutExportData[]): string => {
    const headers = [
      'Provider Name',
      'Bank/Mobile Number',
      'Service Type',
      'Job ID',
      'Service Name',
      'Job Date',
      'Payout Amount',
      'Payment Type/Notes'
    ];

    const csvContent = [
      headers.join(','),
      ...data.map(row => [
        `"${row.providerName}"`,
        `"${row.bankMobileNumber}"`,
        `"${row.serviceType}"`,
        `"${row.jobId}"`,
        `"${row.serviceName}"`,
        `"${row.jobDate}"`,
        row.payoutAmount.toString(),
        `"${row.paymentTypeNotes}"`
      ].join(','))
    ].join('\n');

    return csvContent;
  };

  const downloadCSV = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const markPayoutsAsProcessed = async (payoutIds: string[]) => {
    try {
      const { error } = await supabase
        .from('payouts')
        .update({ 
          status: 'processed',
          processed_at: new Date().toISOString()
        })
        .in('id', payoutIds);

      if (error) throw error;
    } catch (error) {
      console.error('Error marking payouts as processed:', error);
      throw error;
    }
  };

  const handleExport = async () => {
    setIsExporting(true);
    
    try {
      const payoutData = await fetchExportablePayouts();
      
      if (payoutData.length === 0) {
        toast({
          title: "No data available",
          description: "No payouts found for the selected date range.",
          variant: "destructive"
        });
        return;
      }

      const timestamp = format(new Date(), 'yyyyMMdd');
      const filename = `longa-payouts-${timestamp}.csv`;
      const csvContent = generateCSV(payoutData);
      
      downloadCSV(csvContent, filename);

      // Mark as processed if checkbox is checked
      if (markAsProcessed && payoutsData) {
        const payoutIds = payoutsData.map(p => p.id);
        await markPayoutsAsProcessed(payoutIds);
      }

      // Add to export history
      const newExport: ExportRecord = {
        id: Date.now().toString(),
        exportDate: format(new Date(), 'yyyy-MM-dd'),
        filename,
        recordCount: payoutData.length,
        totalAmount: payoutData.reduce((sum, p) => sum + p.payoutAmount, 0),
        exportedBy: 'Admin User'
      };

      setExportHistory(prev => [newExport, ...prev]);

      toast({
        title: "Download Successful",
        description: `${payoutData.length} payout records exported to ${filename}`,
        className: "border-green-200 bg-green-50",
      });

      // Refresh data after export
      await fetchExportablePayouts();
    } catch (error) {
      console.error('Error during export:', error);
      toast({
        title: "Error",
        description: "Failed to export payouts. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleWeeklyExport = async () => {
    const weekStart = startOfWeek(new Date());
    const weekEnd = endOfWeek(new Date());
    setDateFrom(weekStart);
    setDateTo(weekEnd);
    
    // Wait for state update then trigger export
    setTimeout(() => handleExport(), 100);
  };

  const totalAmount = exportableData.reduce((sum, p) => sum + p.payoutAmount, 0);
  const uniqueProviders = new Set(exportableData.map(p => p.providerName)).size;
  const oneOffPayouts = exportableData.filter(p => p.serviceType === 'One-Off');
  const packagePayouts = exportableData.filter(p => p.serviceType === 'Package');
  const manualPayouts = exportableData.filter(p => p.serviceType === 'Manual');

  return (
    <div className="space-y-6">
      {/* Export Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Export Payouts
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
                    {dateFrom ? format(dateFrom, "PPP") : <span>Pick a date</span>}
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
                    {dateTo ? format(dateTo, "PPP") : <span>Pick a date</span>}
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
                onClick={handleWeeklyExport} 
                className="w-full"
                disabled={isExporting || isLoadingData}
              >
                {isLoadingData ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : null}
                Weekly Report
              </Button>
            </div>

            <div className="flex items-end">
              <Button 
                onClick={handleExport} 
                className="w-full"
                disabled={isExporting || isLoadingData || exportableData.length === 0}
              >
                {isExporting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Exporting...
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4 mr-2" />
                    Export CSV
                  </>
                )}
              </Button>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="markProcessed"
              checked={markAsProcessed}
              onCheckedChange={(checked) => setMarkAsProcessed(checked === true)}
            />
            <label htmlFor="markProcessed" className="text-sm">
              Mark exported payouts as "Processed"
            </label>
          </div>
        </CardContent>
      </Card>

      {/* Export Summary - Only show if data is available */}
      {exportableData.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Payout Amount</CardTitle>
              <DollarSign className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">N${totalAmount.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">
                {exportableData.length} records
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Providers</CardTitle>
              <Users className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{uniqueProviders}</div>
              <p className="text-xs text-muted-foreground">
                Unique providers
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Payment Types</CardTitle>
              <FileText className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                <div className="text-sm">One-Off: {oneOffPayouts.length}</div>
                <div className="text-sm">Package: {packagePayouts.length}</div>
                <div className="text-sm">Manual: {manualPayouts.length}</div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Status</CardTitle>
              <TrendingUp className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">
                {isLoadingData ? 'Loading...' : 'Ready'}
              </div>
              <p className="text-xs text-muted-foreground">
                {isLoadingData ? 'Fetching data...' : 'Data loaded'}
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* No data message */}
      {!isLoadingData && exportableData.length === 0 && (
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">No payouts available for export</p>
              <p className="text-gray-400 text-sm">Try adjusting the date range or check if there are pending payouts.</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Export History - Only show if there's history */}
      {exportHistory.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Export History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {exportHistory.map((record) => (
                <div key={record.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <FileText className="h-5 w-5 text-gray-500" />
                    <div>
                      <div className="font-medium">{record.filename}</div>
                      <div className="text-sm text-gray-500">
                        {record.recordCount} records • N${record.totalAmount.toFixed(2)} • by {record.exportedBy}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline">{record.exportDate}</Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
