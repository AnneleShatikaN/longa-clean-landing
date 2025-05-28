
import React, { useState } from 'react';
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
import { CalendarIcon, Plus, Edit, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useForm } from 'react-hook-form';
import { useToast } from '@/hooks/use-toast';

interface ManualPayout {
  id: number;
  payeeName: string;
  bankMobileNumber: string;
  reason: string;
  amount: number;
  paymentDate: string;
  notes: string;
  status: 'pending' | 'processed' | 'failed';
  createdAt: string;
}

const paymentReasons = [
  'Marketing Bonus',
  'Referral Credit', 
  'Performance Bonus',
  'Other'
];

export const ManualPayoutsTab = () => {
  const { toast } = useToast();
  const [manualPayouts, setManualPayouts] = useState<ManualPayout[]>([
    {
      id: 1,
      payeeName: 'John Marketing',
      bankMobileNumber: '+264 81 123 4567',
      reason: 'Marketing Bonus',
      amount: 500,
      paymentDate: '2024-06-01',
      notes: 'Q2 marketing performance bonus',
      status: 'pending',
      createdAt: '2024-05-28'
    }
  ]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);

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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'processed': return 'bg-green-100 text-green-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleSubmit = (data: any) => {
    const newPayout: ManualPayout = {
      id: Math.max(...manualPayouts.map(p => p.id), 0) + 1,
      payeeName: data.payeeName,
      bankMobileNumber: data.bankMobileNumber,
      reason: data.reason,
      amount: parseInt(data.amount),
      paymentDate: format(data.paymentDate, 'yyyy-MM-dd'),
      notes: data.notes,
      status: 'pending',
      createdAt: new Date().toISOString().split('T')[0]
    };

    setManualPayouts(prev => [...prev, newPayout]);
    form.reset();
    setShowForm(false);
    
    toast({
      title: "Manual Payout Scheduled",
      description: `Payout for ${data.payeeName} has been scheduled.`,
    });
  };

  const handleDelete = (id: number) => {
    setManualPayouts(prev => prev.filter(p => p.id !== id));
    toast({
      title: "Payout Deleted",
      description: "Manual payout has been removed.",
    });
  };

  const handleStatusChange = (id: number, status: 'pending' | 'processed' | 'failed') => {
    setManualPayouts(prev => prev.map(p => 
      p.id === id ? { ...p, status } : p
    ));
    toast({
      title: "Status Updated",
      description: `Payout status changed to ${status}.`,
    });
  };

  return (
    <div className="space-y-6">
      {/* Add New Payout Form */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Manual Payout</CardTitle>
            <Button onClick={() => setShowForm(!showForm)}>
              <Plus className="h-4 w-4 mr-2" />
              {showForm ? 'Cancel' : 'Add Payout'}
            </Button>
          </div>
        </CardHeader>
        
        {showForm && (
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
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
                  <Button type="submit">Schedule Payout</Button>
                  <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
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
                  <TableCell className="font-medium">{payout.payeeName}</TableCell>
                  <TableCell>{payout.bankMobileNumber}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{payout.reason}</Badge>
                  </TableCell>
                  <TableCell className="font-medium">N${payout.amount}</TableCell>
                  <TableCell>{payout.paymentDate}</TableCell>
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
                  <TableCell>{payout.createdAt}</TableCell>
                  <TableCell>
                    <div className="flex space-x-1">
                      <Button size="sm" variant="outline">
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleDelete(payout.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {manualPayouts.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500">No manual payouts scheduled</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
