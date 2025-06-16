
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Clock, CheckCircle, XCircle, User, Calendar, DollarSign } from 'lucide-react';
import { usePendingTransactions } from '@/hooks/usePendingTransactions';
import { format } from 'date-fns';

export const PendingTransactionApproval: React.FC = () => {
  const { 
    transactions, 
    isLoading, 
    fetchAllTransactions, 
    approveTransaction, 
    declineTransaction 
  } = usePendingTransactions();
  const [selectedTransaction, setSelectedTransaction] = useState<any>(null);
  const [actionType, setActionType] = useState<'approve' | 'decline' | null>(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    fetchAllTransactions();
  }, []);

  const handleAction = async () => {
    if (!selectedTransaction || !actionType) return;

    setIsProcessing(true);
    let success = false;

    if (actionType === 'approve') {
      success = await approveTransaction(selectedTransaction.id, adminNotes);
    } else {
      success = await declineTransaction(selectedTransaction.id, adminNotes);
    }

    if (success) {
      setSelectedTransaction(null);
      setActionType(null);
      setAdminNotes('');
    }
    setIsProcessing(false);
  };

  const openActionDialog = (transaction: any, action: 'approve' | 'decline') => {
    setSelectedTransaction(transaction);
    setActionType(action);
    setAdminNotes('');
  };

  const closeDialog = () => {
    setSelectedTransaction(null);
    setActionType(null);
    setAdminNotes('');
  };

  const pendingTransactions = transactions.filter(t => t.status === 'pending');

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center text-gray-500">Loading transactions...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Pending Payment Approvals ({pendingTransactions.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {pendingTransactions.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              No pending transactions to review
            </div>
          ) : (
            <div className="space-y-4">
              {pendingTransactions.map((transaction) => (
                <div key={transaction.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between mb-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-gray-500" />
                        <span className="font-medium">
                          {(transaction as any).user?.full_name || 'Unknown User'}
                        </span>
                        <Badge variant="outline">
                          {(transaction as any).user?.email}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {format(new Date(transaction.created_at), 'MMM dd, yyyy HH:mm')}
                        </div>
                        <div className="flex items-center gap-1">
                          <DollarSign className="h-4 w-4" />
                          N${transaction.amount.toFixed(2)}
                        </div>
                      </div>

                      <div>
                        <Badge variant={transaction.transaction_type === 'subscription' ? 'default' : 'secondary'}>
                          {transaction.transaction_type === 'subscription' ? 'Subscription Package' : 'Service Booking'}
                        </Badge>
                        {transaction.reference_number && (
                          <code className="ml-2 bg-gray-100 px-2 py-1 rounded text-xs">
                            {transaction.reference_number}
                          </code>
                        )}
                      </div>

                      {transaction.booking_details && Object.keys(transaction.booking_details).length > 0 && (
                        <div className="text-sm text-gray-600">
                          <div>Service: {(transaction as any).service?.name || 'Unknown Service'}</div>
                          {transaction.booking_details.booking_date && (
                            <div>Date: {transaction.booking_details.booking_date}</div>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openActionDialog(transaction, 'decline')}
                      >
                        <XCircle className="h-4 w-4 mr-1" />
                        Decline
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => openActionDialog(transaction, 'approve')}
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Approve
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Action Dialog */}
      <Dialog open={!!selectedTransaction} onOpenChange={closeDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {actionType === 'approve' ? 'Approve' : 'Decline'} Payment
            </DialogTitle>
          </DialogHeader>
          
          {selectedTransaction && (
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="font-medium mb-2">Transaction Details</div>
                <div className="space-y-1 text-sm">
                  <div>User: {(selectedTransaction as any).user?.full_name}</div>
                  <div>Type: {selectedTransaction.transaction_type}</div>
                  <div>Amount: N${selectedTransaction.amount.toFixed(2)}</div>
                  <div>Reference: {selectedTransaction.reference_number}</div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="admin-notes">Admin Notes (Optional)</Label>
                <Textarea
                  id="admin-notes"
                  placeholder={`Add notes about this ${actionType === 'approve' ? 'approval' : 'decline'}...`}
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  rows={3}
                />
              </div>

              <div className="flex gap-2">
                <Button variant="outline" onClick={closeDialog} className="flex-1">
                  Cancel
                </Button>
                <Button
                  onClick={handleAction}
                  disabled={isProcessing}
                  variant={actionType === 'approve' ? 'default' : 'destructive'}
                  className="flex-1"
                >
                  {isProcessing ? 'Processing...' : (actionType === 'approve' ? 'Approve' : 'Decline')}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};
