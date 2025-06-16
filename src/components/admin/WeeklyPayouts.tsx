
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar, Filter, CreditCard, Phone, Star } from 'lucide-react';
import { format, subDays, startOfWeek, addDays } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface ProviderPayout {
  providerId: string;
  providerName: string;
  phoneNumber: string;
  jobCount: number;
  weekendJobCount: number;
  totalOwed: number;
  weekendBonus: number;
  jobs: PayoutJob[];
}

interface PayoutJob {
  id: string;
  bookingDate: string;
  serviceName: string;
  amount: number;
  weekendBonus: number;
  isWeekendJob: boolean;
  clientName: string;
  isPaid: boolean;
}

export const WeeklyPayouts: React.FC = () => {
  const { toast } = useToast();
  const [providerPayouts, setProviderPayouts] = useState<ProviderPayout[]>([]);
  const [selectedProviders, setSelectedProviders] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // Default to Thursday last week to Wednesday this week
  const getDefaultDateRange = () => {
    const today = new Date();
    const lastThursday = addDays(startOfWeek(today, { weekStartsOn: 1 }), 3); // Thursday of current week
    const thisWednesday = addDays(lastThursday, 6); // Following Wednesday
    
    // If today is before Thursday, use previous week
    if (today < lastThursday) {
      return {
        from: format(subDays(lastThursday, 7), 'yyyy-MM-dd'),
        to: format(subDays(thisWednesday, 7), 'yyyy-MM-dd')
      };
    }
    
    return {
      from: format(lastThursday, 'yyyy-MM-dd'),
      to: format(thisWednesday, 'yyyy-MM-dd')
    };
  };

  const [dateRange, setDateRange] = useState(getDefaultDateRange());

  const fetchPayoutData = async () => {
    setIsLoading(true);
    try {
      // Fetch completed bookings with provider payouts for the date range
      const { data: bookings, error } = await supabase
        .from('bookings')
        .select(`
          id,
          booking_date,
          total_amount,
          provider_payout,
          is_weekend_job,
          service:services(name),
          provider:users!bookings_provider_id_fkey(id, full_name, phone),
          client:users!bookings_client_id_fkey(full_name),
          payouts(id, status, weekend_bonus)
        `)
        .eq('status', 'completed')
        .gte('booking_date', dateRange.from)
        .lte('booking_date', dateRange.to)
        .not('provider_id', 'is', null);

      if (error) throw error;

      // Group by provider and calculate totals
      const providerMap = new Map<string, ProviderPayout>();

      bookings?.forEach((booking) => {
        if (!booking.provider) return;

        const providerId = booking.provider.id;
        const isPaid = booking.payouts?.some(payout => payout.status === 'completed') || false;
        const weekendBonus = booking.payouts?.[0]?.weekend_bonus || 0;
        
        if (!providerMap.has(providerId)) {
          providerMap.set(providerId, {
            providerId,
            providerName: booking.provider.full_name || 'Unknown Provider',
            phoneNumber: booking.provider.phone || 'No phone',
            jobCount: 0,
            weekendJobCount: 0,
            totalOwed: 0,
            weekendBonus: 0,
            jobs: []
          });
        }

        const provider = providerMap.get(providerId)!;
        provider.jobCount++;
        
        if (booking.is_weekend_job) {
          provider.weekendJobCount++;
        }
        
        if (!isPaid) {
          provider.totalOwed += booking.provider_payout || 0;
          provider.weekendBonus += weekendBonus;
        }

        provider.jobs.push({
          id: booking.id,
          bookingDate: booking.booking_date,
          serviceName: booking.service?.name || 'Unknown Service',
          amount: booking.provider_payout || 0,
          weekendBonus,
          isWeekendJob: booking.is_weekend_job || false,
          clientName: booking.client?.full_name || 'Unknown Client',
          isPaid
        });
      });

      setProviderPayouts(Array.from(providerMap.values()));
    } catch (error) {
      console.error('Error fetching payout data:', error);
      toast({
        title: "Error",
        description: "Failed to load payout data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPayoutData();
  }, [dateRange]);

  const handleSelectProvider = (providerId: string, checked: boolean) => {
    if (checked) {
      setSelectedProviders(prev => [...prev, providerId]);
    } else {
      setSelectedProviders(prev => prev.filter(id => id !== providerId));
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const unpaidProviders = providerPayouts
        .filter(provider => provider.totalOwed > 0)
        .map(provider => provider.providerId);
      setSelectedProviders(unpaidProviders);
    } else {
      setSelectedProviders([]);
    }
  };

  const markJobsAsPaid = async (providerIds: string[]) => {
    try {
      // Get all unpaid jobs for selected providers
      const unpaidJobs = providerPayouts
        .filter(provider => providerIds.includes(provider.providerId))
        .flatMap(provider => provider.jobs.filter(job => !job.isPaid))
        .map(job => job.id);

      if (unpaidJobs.length === 0) {
        toast({
          title: "No jobs to update",
          description: "All selected jobs are already marked as paid",
        });
        return;
      }

      // Create payout records for unpaid jobs
      const payoutInserts = unpaidJobs.map(jobId => {
        const booking = providerPayouts
          .flatMap(p => p.jobs)
          .find(j => j.id === jobId);
        
        return {
          booking_id: jobId,
          provider_id: providerPayouts.find(p => 
            p.jobs.some(j => j.id === jobId)
          )?.providerId,
          amount: booking?.amount || 0,
          weekend_bonus: booking?.weekendBonus || 0,
          payout_type: 'manual',
          status: 'completed',
          processed_at: new Date().toISOString()
        };
      });

      const { error } = await supabase
        .from('payouts')
        .upsert(payoutInserts, { 
          onConflict: 'booking_id',
          ignoreDuplicates: false 
        });

      if (error) throw error;

      toast({
        title: "Jobs marked as paid",
        description: `${unpaidJobs.length} job(s) have been marked as paid`,
        className: "border-green-200 bg-green-50",
      });

      // Refresh data
      await fetchPayoutData();
      setSelectedProviders([]);
    } catch (error) {
      console.error('Error marking jobs as paid:', error);
      toast({
        title: "Error",
        description: "Failed to mark jobs as paid",
        variant: "destructive",
      });
    }
  };

  const openWhatsApp = (phoneNumber: string, providerName: string, amount: number, weekendBonus: number) => {
    const bonusText = weekendBonus > 0 ? ` (including N$${weekendBonus.toFixed(2)} weekend bonus)` : '';
    const message = `Hi ${providerName}, your payout of N$${amount.toFixed(2)}${bonusText} for services completed this week is ready. Please confirm your payment details.`;
    const url = `https://wa.me/${phoneNumber.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  const totalSelected = selectedProviders.reduce((sum, providerId) => {
    const provider = providerPayouts.find(p => p.providerId === providerId);
    return sum + (provider?.totalOwed || 0);
  }, 0);

  const totalWeekendBonus = selectedProviders.reduce((sum, providerId) => {
    const provider = providerPayouts.find(p => p.providerId === providerId);
    return sum + (provider?.weekendBonus || 0);
  }, 0);

  return (
    <div className="space-y-6">
      {/* Date Range Filter */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Payout Period Filter
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <div>
              <Label htmlFor="date-from">From Date</Label>
              <Input
                id="date-from"
                type="date"
                value={dateRange.from}
                onChange={(e) => setDateRange(prev => ({ ...prev, from: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="date-to">To Date</Label>
              <Input
                id="date-to"
                type="date"
                value={dateRange.to}
                onChange={(e) => setDateRange(prev => ({ ...prev, to: e.target.value }))}
              />
            </div>
            <Button 
              variant="outline" 
              onClick={() => setDateRange(getDefaultDateRange())}
            >
              Reset to Weekly Default
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Batch Actions */}
      {selectedProviders.length > 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-4">
                  <span className="text-sm text-gray-600">
                    {selectedProviders.length} provider(s) selected
                  </span>
                  <span className="font-medium">
                    Total: N${totalSelected.toFixed(2)}
                  </span>
                  {totalWeekendBonus > 0 && (
                    <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                      Weekend Bonus: N${totalWeekendBonus.toFixed(2)}
                    </Badge>
                  )}
                </div>
              </div>
              <Button 
                onClick={() => markJobsAsPaid(selectedProviders)}
                className="hover:bg-green-600 transition-colors"
              >
                <CreditCard className="h-4 w-4 mr-2" />
                Mark as Paid
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Provider Payouts Table */}
      <Card>
        <CardHeader>
          <CardTitle>Weekly Provider Payouts ({providerPayouts.length})</CardTitle>
          <p className="text-sm text-gray-600">
            Period: {format(new Date(dateRange.from), 'MMM dd')} - {format(new Date(dateRange.to), 'MMM dd, yyyy')}
          </p>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900"></div>
              <span className="ml-2">Loading payouts...</span>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox
                      checked={
                        selectedProviders.length === 
                        providerPayouts.filter(p => p.totalOwed > 0).length && 
                        providerPayouts.filter(p => p.totalOwed > 0).length > 0
                      }
                      onCheckedChange={handleSelectAll}
                    />
                  </TableHead>
                  <TableHead>Provider Name</TableHead>
                  <TableHead>Phone Number</TableHead>
                  <TableHead>Jobs Completed</TableHead>
                  <TableHead>Amount Owed</TableHead>
                  <TableHead>Weekend Bonus</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {providerPayouts.map((provider) => (
                  <TableRow key={provider.providerId}>
                    <TableCell>
                      <Checkbox
                        checked={selectedProviders.includes(provider.providerId)}
                        onCheckedChange={(checked) => 
                          handleSelectProvider(provider.providerId, checked as boolean)
                        }
                        disabled={provider.totalOwed === 0}
                      />
                    </TableCell>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        {provider.providerName}
                        {provider.weekendJobCount > 0 && (
                          <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
                            <Star className="h-3 w-3 mr-1" />
                            {provider.weekendJobCount} weekend
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm">{provider.phoneNumber}</span>
                        {provider.phoneNumber !== 'No phone' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openWhatsApp(
                              provider.phoneNumber, 
                              provider.providerName, 
                              provider.totalOwed,
                              provider.weekendBonus
                            )}
                            className="h-6 w-6 p-0"
                          >
                            <Phone className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-center">
                        <div className="font-medium">{provider.jobCount}</div>
                        {provider.weekendJobCount > 0 && (
                          <div className="text-xs text-orange-600">
                            ({provider.weekendJobCount} weekend)
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">
                      <span className={provider.totalOwed > 0 ? 'text-red-600' : 'text-green-600'}>
                        N${provider.totalOwed.toFixed(2)}
                      </span>
                    </TableCell>
                    <TableCell>
                      {provider.weekendBonus > 0 ? (
                        <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                          +N${provider.weekendBonus.toFixed(2)}
                        </Badge>
                      ) : (
                        <span className="text-gray-400 text-sm">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {provider.totalOwed > 0 ? (
                        <Badge variant="destructive">Pending</Badge>
                      ) : (
                        <Badge variant="default" className="bg-green-100 text-green-800">
                          Paid
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => markJobsAsPaid([provider.providerId])}
                        disabled={provider.totalOwed === 0}
                      >
                        {provider.totalOwed > 0 ? 'Mark Paid' : 'Paid'}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
          
          {!isLoading && providerPayouts.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500">No completed jobs found for the selected period</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
