import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { CheckCircle, XCircle, Eye, MessageCircle, Package, Wrench } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

interface PendingTransaction {
  id: string;
  user_id: string;
  transaction_type: string;
  service_id?: string;
  package_id?: string;
  amount: number;
  reference_number?: string;
  booking_details?: any;
  created_at: string;
  users?: {
    full_name: string;
    phone: string;
    email: string;
  };
  services?: {
    name: string;
  };
  subscription_packages?: {
    name: string;
  };
}

export const PendingPaymentApprovals = () => {
  const [pendingTransactions, setPendingTransactions] = useState<PendingTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTransaction, setSelectedTransaction] = useState<PendingTransaction | null>(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchPendingTransactions();
  }, []);

  const fetchPendingTransactions = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('pending_transactions')
        .select(`
          *,
          users!pending_transactions_user_id_fkey(full_name, phone, email),
          services(name),
          subscription_packages(name)
        `)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Type-safe assignment with proper filtering
      const transactions = (data || []).map(item => ({
        id: item.id,
        user_id: item.user_id,
        transaction_type: item.transaction_type || '',
        service_id: item.service_id,
        package_id: item.package_id,
        amount: item.amount,
        reference_number: item.reference_number,
        booking_details: item.booking_details,
        created_at: item.created_at,
        users: Array.isArray(item.users) ? item.users[0] : item.users,
        services: Array.isArray(item.services) ? item.services[0] : item.services,
        subscription_packages: Array.isArray(item.subscription_packages) ? item.subscription_packages[0] : item.subscription_packages
      })) as PendingTransaction[];
      
      setPendingTransactions(transactions);
    } catch (error) {
      console.error('Error fetching pending transactions:', error);
      toast({
        title: "Error",
        description: "Failed to fetch pending transactions",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async (transaction: PendingTransaction) => {
    setIsProcessing(true);
    try {
      const { data, error } = await supabase.rpc('approve_pending_transaction', {
        transaction_id: transaction.id,
        admin_notes_param: adminNotes
      });

      if (error) throw error;

      const result = data as any;
      if (result.success) {
        toast({
          title: "Transaction Approved",
          description: `${transaction.transaction_type === 'subscription' ? 'Package' : 'Booking'} approved successfully`,
        });
        fetchPendingTransactions();
        setSelectedTransaction(null);
        setAdminNotes('');
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('Error approving transaction:', error);
      toast({
        title: "Approval Failed",
        description: error.message || "Failed to approve transaction",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDecline = async (transaction: PendingTransaction) => {
    setIsProcessing(true);
    try {
      const { data, error } = await supabase.rpc('decline_pending_transaction', {
        transaction_id: transaction.id,
        admin_notes_param: adminNotes
      });

      if (error) throw error;

      const result = data as any;
      if (result.success) {
        toast({
          title: "Transaction Declined",
          description: "Payment request has been declined",
        });
        fetchPendingTransactions();
        setSelectedTransaction(null);
        setAdminNotes('');
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('Error declining transaction:', error);
      toast({
        title: "Decline Failed",
        description: error.message || "Failed to decline transaction",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <p className="text-gray-600">Loading pending payments...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Pending Payment Approvals</CardTitle>
          <p className="text-sm text-gray-600">
            Review and approve customer payment submissions
          </p>
        </CardHeader>
        <CardContent>
          {pendingTransactions.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              No pending payment approvals
            </div>
          ) : (
            <div className="space-y-4">
              {pendingTransactions.map((transaction) => (
                <Card key={transaction.id} className="border">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          {transaction.transaction_type === 'subscription' ? (
                            <Package className="h-4 w-4 text-blue-500" />
                          ) : (
                            <Wrench className="h-4 w-4 text-green-500" />
                          )}
                          <h4 className="font-medium">
                            {transaction.transaction_type === 'subscription' 
                              ? transaction.subscription_packages?.name || 'Package Purchase'
                              : transaction.services?.name || 'Service Booking'
                            }
                          </h4>
                          <Badge variant="outline" className="text-xs">
                            {transaction.transaction_type}
                          </Badge>
                        </div>
                        <div className="text-sm text-gray-600 space-y-1">
                          <div>Customer: {transaction.users?.full_name}</div>
                          <div>Phone: {transaction.users?.phone}</div>
                          <div>Amount: N${transaction.amount}</div>
                          <div>Date: {format(new Date(transaction.created_at), 'MMM dd, yyyy HH:mm')}</div>
                          {transaction.reference_number && (
                            <div>Reference: {transaction.reference_number}</div>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setSelectedTransaction(transaction)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Review Payment Request</DialogTitle>
                            </DialogHeader>
                            
                            {selectedTransaction && (
                              <div className="space-y-4">
                                <div className="p-4 bg-gray-50 rounded">
                                  <h3 className="font-medium mb-2">Transaction Details</h3>
                                  <div className="text-sm space-y-1">
                                    <div>Type: {selectedTransaction.transaction_type}</div>
                                    <div>Customer: {selectedTransaction.users?.full_name}</div>
                                    <div>Email: {selectedTransaction.users?.email}</div>
                                    <div>Phone: {selectedTransaction.users?.phone}</div>
                                    <div>Amount: N${selectedTransaction.amount}</div>
                                    {selectedTransaction.reference_number && (
                                      <div>Reference: {selectedTransaction.reference_number}</div>
                                    )}
                                  </div>
                                </div>

                                {selectedTransaction.booking_details && (
                                  <div className="p-4 bg-blue-50 rounded">
                                    <h3 className="font-medium mb-2">Booking Details</h3>
                                    <div className="text-sm space-y-1">
                                      <div>Date: {selectedTransaction.booking_details.booking_date}</div>
                                      <div>Time: {selectedTransaction.booking_details.booking_time}</div>
                                      <div>Location: {selectedTransaction.booking_details.location_town}</div>
                                      {selectedTransaction.booking_details.special_instructions && (
                                        <div>Instructions: {selectedTransaction.booking_details.special_instructions}</div>
                                      )}
                                    </div>
                                  </div>
                                )}

                                <div>
                                  <label className="block text-sm font-medium mb-2">Admin Notes (Optional)</label>
                                  <Textarea
                                    value={adminNotes}
                                    onChange={(e) => setAdminNotes(e.target.value)}
                                    placeholder="Add notes about this approval/decline..."
                                  />
                                </div>

                                <div className="flex gap-2">
                                  <Button
                                    onClick={() => handleApprove(selectedTransaction)}
                                    disabled={isProcessing}
                                    className="flex-1"
                                  >
                                    <CheckCircle className="h-4 w-4 mr-2" />
                                    Approve Payment
                                  </Button>
                                  <Button
                                    variant="destructive"
                                    onClick={() => handleDecline(selectedTransaction)}
                                    disabled={isProcessing}
                                    className="flex-1"
                                  >
                                    <XCircle className="h-4 w-4 mr-2" />
                                    Decline Payment
                                  </Button>
                                </div>
                              </div>
                            )}
                          </DialogContent>
                        </Dialog>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
