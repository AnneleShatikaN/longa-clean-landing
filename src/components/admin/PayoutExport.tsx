
import React, { useState } from 'react';
import { useData } from '@/contexts/DataContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { CalendarIcon, Download, FileText, TrendingUp, Users, DollarSign } from 'lucide-react';
import { format, subDays, startOfWeek, endOfWeek } from 'date-fns';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

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
  const { bookings, users } = useData();
  const { toast } = useToast();
  const [dateFrom, setDateFrom] = useState<Date>(startOfWeek(new Date()));
  const [dateTo, setDateTo] = useState<Date>(endOfWeek(new Date()));
  const [markAsProcessed, setMarkAsProcessed] = useState(true);
  const [exportHistory, setExportHistory] = useState<ExportRecord[]>([
    {
      id: '1',
      exportDate: '2024-05-27',
      filename: 'Longa_Payouts_2024-05-27.csv',
      recordCount: 15,
      totalAmount: 12750,
      exportedBy: 'Admin User'
    }
  ]);

  // Get all completed jobs that haven't been paid yet or manual payouts
  const getExportablePayouts = (): PayoutExportData[] => {
    const jobPayouts = bookings
      .filter(booking => 
        booking.status === 'completed' && 
        !booking.paidOut &&
        booking.completionDate &&
        new Date(booking.completionDate) >= dateFrom &&
        new Date(booking.completionDate) <= dateTo
      )
      .map(booking => {
        const provider = users.find(u => u.id === booking.providerId);
        return {
          providerName: booking.providerName,
          bankMobileNumber: provider?.bankMobileNumber || 'Not provided',
          serviceType: booking.jobType === 'one-off' ? 'One-Off' : 'Package',
          jobId: booking.id.toString(),
          serviceName: booking.serviceName,
          jobDate: booking.completionDate!,
          payoutAmount: booking.expectedPayout || 0,
          paymentTypeNotes: booking.jobType === 'one-off' 
            ? `Commission: ${booking.commissionPercentage}%`
            : 'Fixed Package Fee'
        };
      });

    // Mock manual payouts - in real app this would come from state/database
    const manualPayouts: PayoutExportData[] = [];

    return [...jobPayouts, ...manualPayouts];
  };

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
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleExport = () => {
    const payoutData = getExportablePayouts();
    
    if (payoutData.length === 0) {
      toast({
        title: "No Data to Export",
        description: "No payouts found for the selected date range.",
        variant: "destructive"
      });
      return;
    }

    const filename = `Longa_Payouts_${format(new Date(), 'yyyy-MM-dd')}.csv`;
    const csvContent = generateCSV(payoutData);
    
    downloadCSV(csvContent, filename);

    // Add to export history
    const newExport: ExportRecord = {
      id: (exportHistory.length + 1).toString(),
      exportDate: format(new Date(), 'yyyy-MM-dd'),
      filename,
      recordCount: payoutData.length,
      totalAmount: payoutData.reduce((sum, p) => sum + p.payoutAmount, 0),
      exportedBy: 'Admin User'
    };

    setExportHistory(prev => [newExport, ...prev]);

    toast({
      title: "Export Successful",
      description: `${payoutData.length} payout records exported to ${filename}`,
    });

    // Mark as processed if checkbox is checked
    if (markAsProcessed) {
      // In real app, this would update the paidOut status
      console.log('Marking exported payouts as processed...');
    }
  };

  const handleWeeklyExport = () => {
    const weekStart = startOfWeek(new Date());
    const weekEnd = endOfWeek(new Date());
    setDateFrom(weekStart);
    setDateTo(weekEnd);
    
    // Trigger export after state update
    setTimeout(() => handleExport(), 100);
  };

  const exportablePayouts = getExportablePayouts();
  const totalAmount = exportablePayouts.reduce((sum, p) => sum + p.payoutAmount, 0);
  const uniqueProviders = new Set(exportablePayouts.map(p => p.providerName)).size;
  const oneOffPayouts = exportablePayouts.filter(p => p.serviceType === 'One-Off');
  const packagePayouts = exportablePayouts.filter(p => p.serviceType === 'Package');
  const manualPayouts = exportablePayouts.filter(p => p.serviceType === 'Manual');
  const totalCommission = oneOffPayouts.reduce((sum, p) => {
    const jobAmount = bookings.find(b => b.id.toString() === p.jobId)?.amount || 0;
    return sum + (jobAmount - p.payoutAmount);
  }, 0);

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
              <Button onClick={handleWeeklyExport} className="w-full">
                Weekly Report
              </Button>
            </div>

            <div className="flex items-end">
              <Button onClick={handleExport} className="w-full">
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="markProcessed"
              checked={markAsProcessed}
              onCheckedChange={setMarkAsProcessed}
            />
            <label htmlFor="markProcessed" className="text-sm">
              Mark exported payouts as "Processed"
            </label>
          </div>
        </CardContent>
      </Card>

      {/* Export Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Payout Amount</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">N${totalAmount}</div>
            <p className="text-xs text-muted-foreground">
              {exportablePayouts.length} records
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
            <CardTitle className="text-sm font-medium">Platform Commission</CardTitle>
            <TrendingUp className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">N${totalCommission}</div>
            <p className="text-xs text-muted-foreground">
              From one-off jobs
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Export History */}
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
                      {record.recordCount} records • N${record.totalAmount} • by {record.exportedBy}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant="outline">{record.exportDate}</Badge>
                </div>
              </div>
            ))}
          </div>

          {exportHistory.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500">No export history found</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
