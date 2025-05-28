
import React, { useState } from 'react';
import { useData } from '@/contexts/DataContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Filter, CreditCard } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

export const JobPayoutsTab = () => {
  const { bookings, users, updateBookingStatus } = useData();
  const { toast } = useToast();
  const [selectedJobs, setSelectedJobs] = useState<number[]>([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [providerFilter, setProviderFilter] = useState('all');
  const [dateFrom, setDateFrom] = useState<Date>();
  const [dateTo, setDateTo] = useState<Date>();

  // Get completed jobs that haven't been paid yet
  const completedJobs = bookings.filter(booking => 
    booking.status === 'completed' && 
    !booking.paidOut &&
    booking.completionDate
  );

  // Apply filters
  const filteredJobs = completedJobs.filter(job => {
    if (providerFilter !== 'all' && job.providerId.toString() !== providerFilter) return false;
    if (dateFrom && new Date(job.completionDate!) < dateFrom) return false;
    if (dateTo && new Date(job.completionDate!) > dateTo) return false;
    return true;
  });

  const providers = users.filter(u => u.role === 'provider');

  const getPayoutStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'processed': return 'bg-green-100 text-green-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getJobTypeBadge = (type: string) => {
    return type === 'one-off' 
      ? <Badge className="bg-blue-100 text-blue-800">One-Off</Badge>
      : <Badge className="bg-green-100 text-green-800">Subscription</Badge>;
  };

  const handleSelectJob = (jobId: number, checked: boolean) => {
    if (checked) {
      setSelectedJobs(prev => [...prev, jobId]);
    } else {
      setSelectedJobs(prev => prev.filter(id => id !== jobId));
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedJobs(filteredJobs.map(job => job.id));
    } else {
      setSelectedJobs([]);
    }
  };

  const handleMarkAsPaid = async (jobIds: number[]) => {
    try {
      for (const jobId of jobIds) {
        // In a real app, this would update the paidOut status
        await updateBookingStatus(jobId, 'completed');
      }
      setSelectedJobs([]);
      toast({
        title: "Payouts Processed",
        description: `${jobIds.length} payout(s) have been marked as paid.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to process payouts. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Provider</label>
              <Select value={providerFilter} onValueChange={setProviderFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Providers" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Providers</SelectItem>
                  {providers.map(provider => (
                    <SelectItem key={provider.id} value={provider.id.toString()}>
                      {provider.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

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
                variant="outline" 
                onClick={() => {
                  setProviderFilter('all');
                  setDateFrom(undefined);
                  setDateTo(undefined);
                }}
                className="w-full"
              >
                Clear Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Batch Actions */}
      {selectedJobs.length > 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">
                {selectedJobs.length} job(s) selected
              </span>
              <Button onClick={() => handleMarkAsPaid(selectedJobs)}>
                <CreditCard className="h-4 w-4 mr-2" />
                Mark as Paid
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Jobs Table */}
      <Card>
        <CardHeader>
          <CardTitle>Pending Job Payouts ({filteredJobs.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <Checkbox
                    checked={selectedJobs.length === filteredJobs.length && filteredJobs.length > 0}
                    onCheckedChange={handleSelectAll}
                  />
                </TableHead>
                <TableHead>Provider Name</TableHead>
                <TableHead>Service Name</TableHead>
                <TableHead>Job Type</TableHead>
                <TableHead>Completion Date</TableHead>
                <TableHead>Client Price</TableHead>
                <TableHead>Payout Amount</TableHead>
                <TableHead>Calculation</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredJobs.map((job) => (
                <TableRow key={job.id}>
                  <TableCell>
                    <Checkbox
                      checked={selectedJobs.includes(job.id)}
                      onCheckedChange={(checked) => handleSelectJob(job.id, checked as boolean)}
                    />
                  </TableCell>
                  <TableCell className="font-medium">{job.providerName}</TableCell>
                  <TableCell>{job.serviceName}</TableCell>
                  <TableCell>{getJobTypeBadge(job.jobType)}</TableCell>
                  <TableCell>{job.completionDate}</TableCell>
                  <TableCell>N${job.amount}</TableCell>
                  <TableCell className="font-medium text-green-600">
                    N${job.expectedPayout}
                  </TableCell>
                  <TableCell>
                    <div className="text-xs text-gray-500">
                      {job.jobType === 'one-off' 
                        ? `Commission: ${job.commissionPercentage}%`
                        : 'Fixed Fee'
                      }
                    </div>
                  </TableCell>
                  <TableCell>
                    <Button 
                      size="sm"
                      onClick={() => handleMarkAsPaid([job.id])}
                    >
                      Mark Paid
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
          {filteredJobs.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500">No pending payouts found</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
