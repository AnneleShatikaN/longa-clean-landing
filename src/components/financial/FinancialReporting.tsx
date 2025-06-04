
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Download, TrendingUp, DollarSign, Users, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

export const FinancialReporting = () => {
  const { toast } = useToast();
  const [dateFrom, setDateFrom] = useState<Date>();
  const [dateTo, setDateTo] = useState<Date>();
  const [reportType, setReportType] = useState('monthly');

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

  const handleGenerateReport = async () => {
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    toast({
      title: "Report Generated",
      description: "Financial report has been generated and is ready for download.",
    });
  };

  const handleReconciliation = async (period: string) => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    toast({
      title: "Reconciliation Started",
      description: `Financial reconciliation for ${period} has been initiated.`,
    });
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
              <Button onClick={handleGenerateReport} className="w-full">
                <Download className="h-4 w-4 mr-2" />
                Generate Report
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
