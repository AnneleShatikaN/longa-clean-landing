
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { CalendarIcon, Plus, Edit, Trash2, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useForm } from 'react-hook-form';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface ManualPayout {
  id: string;
  payee_name: string;
  bank_mobile_number: string;
  reason: string;
  amount: number;
  payment_date: string;
  notes: string;
  status: 'pending' | 'processed' | 'failed';
  created_at: string;
}

const paymentReasons = [
  'Marketing Bonus',
  'Referral Credit', 
  'Performance Bonus',
  'Other'
];

export const ManualPayoutsTab = () => {
  const { toast } = useToast();
  const [manualPayouts, setManualPayouts] = useState<ManualPayout[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [processingIds, setProcessingIds] = useState<Set<string>>(new Set());

  const form = useForm({
    defaultValues: {
      payeeName: '',
      bankMobileNumber: '',
      reason: '',
      amount: '',
      paymentDate: new Date(),
      notes: ''
    }
  });

  // Fetch manual payouts from Supabase
  const fetchManualPayouts = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('payouts')
        .select('*')
        .eq('payout_type', 'manual')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedPayouts: ManualPayout[] = (data || []).map(payout => ({
        id: payout.id,
        payee_name: payout.payment_details || 'Unknown Payee',
        bank_mobile_number: payout.external_reference || 'Not provided',
        reason: payout.notes?.split(':')[0] || 'Other',
        amount: payout.amount,
        payment_date: payout.scheduled_date || format(new Date(payout.created_at), 'yyyy-MM-dd'),
        notes: payout.notes || '',
        status: payout.status as 'pending' | 'processed' | 'failed',
        created_at: format(new Date(payout.created_at), 'yyyy-MM-dd')
      }));

      setManualPayouts(formattedPayouts);
    } catch (error) {
      console.error('Error fetching manual payouts:', error);
      toast({
        title: "Error",
        description: "Failed to fetch manual payouts. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchManualPayouts();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'processed': return 'bg-green-100 text-green-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleSubmit = async (data: any) => {
    try {
      const { error } = await supabase
        .from('payouts')
        .insert({
          provider_id: '00000000-0000-0000-0000-000000000000', // Placeholder for manual payouts
          payout_type: 'manual',
          amount: parseInt(data.amount),
          payment_details: data.payeeName,
          external_reference: data.bankMobileNumber,
          notes: `${data.reason}: ${data.notes}`,
          scheduled_date: format(data.paymentDate, 'yyyy-MM-dd'),
          status: 'pending'
        });

      if (error) throw error;

      form.reset();
      setShowForm(false);
      fetchManualPayouts();
      
      toast({
        title: "Manual Payout Scheduled",
        description: `Payout for ${data.payeeName} has been scheduled.`,
        className: "border-green-200 bg-green-50",
      });
    } catch (error) {
      console.error('Error creating manual payout:', error);
      toast({
        title: "Error",
        description: "Failed to schedule payout. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (payout: ManualPayout) => {
    setEditingId(payout.id);
    form.setValue('payeeName', payout.payee_name);
    form.setValue('bankMobileNumber', payout.bank_mobile_number);
    form.setValue('reason', payout.reason);
    form.setValue('amount', payout.amount.toString());
    form.setValue('paymentDate', new Date(payout.payment_date));
    form.setValue('notes', payout.notes.split(': ')[1] || payout.notes);
    setShowForm(true);
  };

  const handleUpdate = async (data: any) => {
    if (!editingId) return;

    try {
      const { error } = await supabase
        .from('payouts')
        .update({
          amount: parseInt(data.amount),
          payment_details: data.payeeName,
          external_reference: data.bankMobileNumber,
          notes: `${data.reason}: ${data.notes}`,
          scheduled_date: format(data.paymentDate, 'yyyy-MM-dd')
        })
        .eq('id', editingId);

      if (error) throw error;

      form.reset();
      setShowForm(false);
      setEditingId(null);
      fetchManualPayouts();
      
      toast({
        title: "Payout Updated",
        description: "Manual payout has been updated successfully.",
        className: "border-green-200 bg-green-50",
      });
    } catch (error) {
      console.error('Error updating manual payout:', error);
      toast({
        title: "Error",
        description: "Failed to update payout. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string) => {
    const processingSet = new Set(processingIds);
    processingSet.add(id);
    setProcessingIds(processingSet);

    try {
      const { error } = await supabase
        .from('payouts')
        .delete()
        .eq('id', id);

      if (error) throw error;

      fetchManualPayouts();
      toast({
        title: "Payout Deleted",
        description: "Manual payout has been removed.",
        className: "border-red-200 bg-red-50",
      });
    } catch (error) {
      console.error('Error deleting manual payout:', error);
      toast({
        title: "Error",
        description: "Failed to delete payout. Please try again.",
        variant: "destructive",
      });
    } finally {
      const processingSet = new Set(processingIds);
      processingSet.delete(id);
      setProcessingIds(processingSet);
    }
  };

  const handleStatusChange = async (id: string, status: 'pending' | 'processed' | 'failed') => {
    try {
      const { error } = await supabase
        .from('payouts')
        .update({ 
          status,
          processed_at: status === 'processed' ? new Date().toISOString() : null
        })
        .eq('id', id);

      if (error) throw error;

      fetchManualPayouts();
      toast({
        title: "Status Updated",
        description: `Payout status changed to ${status}.`,
        className: "border-blue-200 bg-blue-50",
      });
    } catch (error) {
      console.error('Error updating status:', error);
      toast({
        title: "Error",
        description: "Failed to update status. Please try again.",
        variant: "destructive",
      });
    }
  };

  const onSubmit = editingId ? handleUpdate : handleSubmit;

  return (
    <div className="space-y-6">
      {/* Add New Payout Form */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Manual Payout</CardTitle>
            <Button 
              onClick={() => {
                setShowForm(!showForm);
                if (showForm) {
                  setEditingId(null);
                  form.reset();
                }
              }}
            >
              <Plus className="h-4 w-4 mr-2" />
              {showForm ? 'Cancel' : 'Add Payout'}
            </Button>
          </div>
        </CardHeader>
        
        {showForm && (
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="payeeName"
                    rules={{ required: "Payee name is required" }}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Payee Name *</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter payee name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="bankMobileNumber"
                    rules={{ required: "Bank/Mobile number is required" }}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Bank/Mobile Number *</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter bank account or mobile number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="reason"
                    rules={{ required: "Payment reason is required" }}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Payment Reason *</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select reason" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {paymentReasons.map(reason => (
                              <SelectItem key={reason} value={reason}>
                                {reason}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="amount"
                    rules={{ 
                      required: "Amount is required",
                      min: { value: 1, message: "Amount must be greater than 0" }
                    }}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Amount (NAD) *</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="Enter amount" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="paymentDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Payment Date *</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                className={cn(
                                  "w-full pl-3 text-left font-normal",
                                  !field.value && "text-muted-foreground"
                                )}
                              >
                                {field.value ? (
                                  format(field.value, "PPP")
                                ) : (
                                  <span>Pick a date</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              disabled={(date) => date < new Date()}
                              initialFocus
                              className="pointer-events-auto"
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notes</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Add any additional notes or details"
                          className="min-h-[80px]"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex space-x-2">
                  <Button type="submit">
                    {editingId ? 'Update Payout' : 'Schedule Payout'}
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => {
                      setShowForm(false);
                      setEditingId(null);
                      form.reset();
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        )}
      </Card>

      {/* Manual Payouts List */}
      <Card>
        <CardHeader>
          <CardTitle>Scheduled Manual Payouts ({manualPayouts.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin mr-2" />
              <span>Loading manual payouts...</span>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Payee Name</TableHead>
                  <TableHead>Bank/Mobile</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Payment Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {manualPayouts.map((payout) => (
                  <TableRow key={payout.id}>
                    <TableCell className="font-medium">{payout.payee_name}</TableCell>
                    <TableCell>{payout.bank_mobile_number}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{payout.reason}</Badge>
                    </TableCell>
                    <TableCell className="font-medium">N${payout.amount}</TableCell>
                    <TableCell>{payout.payment_date}</TableCell>
                    <TableCell>
                      <Select 
                        value={payout.status}
                        onValueChange={(value) => handleStatusChange(payout.id, value as any)}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue>
                            <Badge className={getStatusColor(payout.status)}>
                              {payout.status}
                            </Badge>
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="processed">Processed</SelectItem>
                          <SelectItem value="failed">Failed</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>{payout.created_at}</TableCell>
                    <TableCell>
                      <div className="flex space-x-1">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleEdit(payout)}
                          disabled={processingIds.has(payout.id)}
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleDelete(payout.id)}
                          disabled={processingIds.has(payout.id)}
                        >
                          {processingIds.has(payout.id) ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : (
                            <Trash2 className="h-3 w-3" />
                          )}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          {!isLoading && manualPayouts.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500">No manual payouts scheduled</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
