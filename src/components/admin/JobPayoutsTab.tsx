
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Filter, CreditCard, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface PayoutJob {
  id: string;
  providerId: string;
  providerName: string;
  serviceName: string;
  jobType: 'one-off' | 'subscription';
  completionDate: string;
  clientPrice: number;
  expectedPayout: number;
  commissionPercentage?: number;
  status: 'pending' | 'paid' | 'failed';
  lastPayoutDate?: string;
  transactionId?: string;
}

export const JobPayoutsTab = () => {
  const { toast } = useToast();
  const [payoutJobs, setPayoutJobs] = useState<PayoutJob[]>([]);
  const [selectedJobs, setSelectedJobs] = useState<string[]>([]);
  const [statusFilter, setStatusFilter] = useState('pending');
  const [providerFilter, setProviderFilter] = useState('all');
  const [dateFrom, setDateFrom] = useState<Date>();
  const [dateTo, setDateTo] = useState<Date>();
  const [isLoading, setIsLoading] = useState(true);
  const [processingIds, setProcessingIds] = useState<Set<string>>(new Set());

  // Fetch payouts from Supabase
  const fetchPayouts = async () => {
    setIsLoading(true);
    try {
      let query = supabase
        .from('payouts')
        .select(`
          id,
          provider_id,
          amount,
          net_amount,
          status,
          processed_at,
          external_reference,
          booking_id,
          bookings!inner(
            id,
            booking_date,
            total_amount,
            service_id,
            services!inner(
              name,
              service_type,
              commission_percentage
            ),
            users!bookings_provider_id_fkey(
              full_name
            )
          )
        `)
        .order('created_at', { ascending: false });

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      if (providerFilter !== 'all') {
        query = query.eq('provider_id', providerFilter);
      }

      if (dateFrom) {
        query = query.gte('processed_at', dateFrom.toISOString());
      }

      if (dateTo) {
        query = query.lte('processed_at', dateTo.toISOString());
      }

      const { data, error } = await query;

      if (error) throw error;

      const formattedPayouts: PayoutJob[] = data?.map(payout => ({
        id: payout.id,
        providerId: payout.provider_id,
        providerName: payout.bookings?.users?.full_name || 'Unknown Provider',
        serviceName: payout.bookings?.services?.name || 'Unknown Service',
        jobType: payout.bookings?.services?.service_type as 'one-off' | 'subscription',
        completionDate: payout.bookings?.booking_date || '',
        clientPrice: payout.bookings?.total_amount || 0,
        expectedPayout: payout.net_amount || payout.amount,
        commissionPercentage: payout.bookings?.services?.commission_percentage,
        status: payout.status as 'pending' | 'paid' | 'failed',
        lastPayoutDate: payout.processed_at,
        transactionId: payout.external_reference
      })) || [];

      setPayoutJobs(formattedPayouts);
    } catch (error) {
      console.error('Error fetching payouts:', error);
      toast({
        title: "Error",
        description: "Failed to fetch payouts. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPayouts();
  }, [statusFilter, providerFilter, dateFrom, dateTo]);

  const getPayoutStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'paid': return 'bg-green-100 text-green-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getJobTypeBadge = (type: string) => {
    return type === 'one-off' 
      ? <Badge className="bg-blue-100 text-blue-800">One-Off</Badge>
      : <Badge className="bg-green-100 text-green-800">Subscription</Badge>;
  };

  const handleSelectJob = (jobId: string, checked: boolean) => {
    if (checked) {
      setSelectedJobs(prev => [...prev, jobId]);
    } else {
      setSelectedJobs(prev => prev.filter(id => id !== jobId));
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedJobs(payoutJobs.filter(job => job.status === 'pending').map(job => job.id));
    } else {
      setSelectedJobs([]);
    }
  };

  const handleMarkAsPaid = async (jobIds: string[]) => {
    const processingSet = new Set(processingIds);
    jobIds.forEach(id => processingSet.add(id));
    setProcessingIds(processingSet);

    try {
      const { error } = await supabase
        .from('payouts')
        .update({ 
          status: 'completed',
          processed_at: new Date().toISOString(),
          external_reference: `TXN${Date.now()}`
        })
        .in('id', jobIds);

      if (error) throw error;

      // Update local state
      setPayoutJobs(prev => prev.map(job => 
        jobIds.includes(job.id) 
          ? { 
              ...job, 
              status: 'paid' as const,
              lastPayoutDate: new Date().toISOString(),
              transactionId: `TXN${Date.now()}`
            }
          : job
      ));

      setSelectedJobs([]);
      
      toast({
        title: "Payouts Processed",
        description: `${jobIds.length} payout(s) have been marked as paid.`,
        className: "border-green-200 bg-green-50",
      });
    } catch (error) {
      console.error('Error updating payouts:', error);
      toast({
        title: "Error",
        description: "Failed to process payouts. Please try again.",
        variant: "destructive",
      });
    } finally {
      const processingSet = new Set(processingIds);
      jobIds.forEach(id => processingSet.delete(id));
      setProcessingIds(processingSet);
    }
  };

  const filteredJobs = payoutJobs.filter(job => {
    if (statusFilter !== 'all' && job.status !== statusFilter) return false;
    return true;
  });

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
              <label className="text-sm font-medium mb-2 block">Status</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="completed">Paid</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
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
                  setStatusFilter('all');
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
              <Button 
                onClick={() => handleMarkAsPaid(selectedJobs)}
                disabled={processingIds.size > 0}
                className="hover:bg-green-600 transition-colors"
              >
                {processingIds.size > 0 ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <CreditCard className="h-4 w-4 mr-2" />
                )}
                Mark as Paid
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Jobs Table */}
      <Card>
        <CardHeader>
          <CardTitle>Job Payouts ({filteredJobs.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin mr-2" />
              <span>Loading payouts...</span>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox
                      checked={selectedJobs.length === filteredJobs.filter(j => j.status === 'pending').length && filteredJobs.filter(j => j.status === 'pending').length > 0}
                      onCheckedChange={handleSelectAll}
                      disabled={filteredJobs.filter(j => j.status === 'pending').length === 0}
                    />
                  </TableHead>
                  <TableHead>Provider Name</TableHead>
                  <TableHead>Service Name</TableHead>
                  <TableHead>Job Type</TableHead>
                  <TableHead>Completion Date</TableHead>
                  <TableHead>Client Price</TableHead>
                  <TableHead>Payout Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last Payment</TableHead>
                  <TableHead>Transaction ID</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredJobs.map((job) => (
                  <TableRow key={job.id} className="hover:bg-gray-50 transition-colors">
                    <TableCell>
                      <Checkbox
                        checked={selectedJobs.includes(job.id)}
                        onCheckedChange={(checked) => handleSelectJob(job.id, checked as boolean)}
                        disabled={job.status !== 'pending'}
                      />
                    </TableCell>
                    <TableCell className="font-medium">{job.providerName}</TableCell>
                    <TableCell>{job.serviceName}</TableCell>
                    <TableCell>{getJobTypeBadge(job.jobType)}</TableCell>
                    <TableCell>{job.completionDate}</TableCell>
                    <TableCell>N${job.clientPrice}</TableCell>
                    <TableCell className="font-medium text-green-600">
                      N${job.expectedPayout}
                    </TableCell>
                    <TableCell>
                      <Badge className={getPayoutStatusColor(job.status)}>
                        {job.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {job.lastPayoutDate ? format(new Date(job.lastPayoutDate), 'PPP') : '-'}
                    </TableCell>
                    <TableCell className="font-mono text-xs">
                      {job.transactionId || '-'}
                    </TableCell>
                    <TableCell>
                      <Button 
                        size="sm"
                        onClick={() => handleMarkAsPaid([job.id])}
                        disabled={job.status !== 'pending' || processingIds.has(job.id)}
                        className={cn(
                          "transition-all duration-200",
                          job.status === 'pending' 
                            ? "hover:bg-green-600 hover:scale-105 active:scale-95" 
                            : "opacity-50 cursor-not-allowed"
                        )}
                      >
                        {processingIds.has(job.id) ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          'Mark Paid'
                        )}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
          
          {!isLoading && filteredJobs.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500">No payouts found for the selected filters</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
