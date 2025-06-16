
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Clock, CheckCircle, XCircle, User, Calendar, DollarSign, MessageCircle, Package, Wrench } from 'lucide-react';
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

  const generateWhatsAppMessage = (transaction: any) => {
    const userName = (transaction as any).user?.full_name || 'Customer';
    
    if (transaction.transaction_type === 'subscription') {
      const packageName = (transaction as any).package?.name || 'Package';
      return `Hi ${userName}, your payment for the ${packageName} has been approved. You can now start booking your services on Longa. Thank you!`;
    } else {
      const serviceName = (transaction as any).service?.name || 'Service';
      return `Hi ${userName}, your payment for ${serviceName} has been confirmed. Your booking is now active. Thank you for using Longa!`;
    }
  };

  const openWhatsApp = (transaction: any) => {
    const userPhone = (transaction as any).user?.phone;
    if (!userPhone) return;

    // Remove any non-numeric characters and ensure proper format
    const cleanPhone = userPhone.replace(/\D/g, '');
    const phoneNumber = cleanPhone.startsWith('264') ? cleanPhone : `264${cleanPhone.substring(1)}`;
    
    const message = generateWhatsAppMessage(transaction);
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
    
    window.open(whatsappUrl, '_blank');
  };

  const handleApproveAndNotify = async (transaction: any) => {
    setIsProcessing(true);
    
    const success = await approveTransaction(transaction.id, adminNotes);
    
    if (success) {
      // Open WhatsApp with message
      openWhatsApp(transaction);
      setSelectedTransaction(null);
      setActionType(null);
      setAdminNotes('');
    }
    setIsProcessing(false);
  };

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
  const packageTransactions = pendingTransactions.filter(t => t.transaction_type === 'subscription');
  const serviceTransactions = pendingTransactions.filter(t => t.transaction_type === 'booking');

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center text-gray-500">Loading transactions...</div>
        </CardContent>
      </Card>
    );
  }

  const TransactionCard = ({ transaction }: { transaction: any }) => (
    <div className="border rounded-lg p-4 bg-white">
      <div className="flex items-start justify-between mb-4">
        <div className="space-y-2 flex-1">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-gray-500" />
            <span className="font-medium">
              {(transaction as any).user?.full_name || 'Unknown User'}
            </span>
            <Badge variant="outline" className="text-xs">
              {(transaction as any).user?.phone || 'No phone'}
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

          <div className="flex items-center gap-2">
            {transaction.transaction_type === 'subscription' ? (
              <Package className="h-4 w-4 text-blue-500" />
            ) : (
              <Wrench className="h-4 w-4 text-green-500" />
            )}
            <span className="text-sm">
              {transaction.transaction_type === 'subscription' 
                ? (transaction as any).package?.name || 'Subscription Package'
                : (transaction as any).service?.name || 'Service Booking'
              }
            </span>
            {transaction.reference_number && (
              <code className="bg-gray-100 px-2 py-1 rounded text-xs ml-2">
                {transaction.reference_number}
              </code>
            )}
          </div>

          {transaction.booking_details && Object.keys(transaction.booking_details).length > 0 && (
            <div className="text-sm text-gray-600">
              {transaction.booking_details.booking_date && (
                <div>Booking Date: {transaction.booking_details.booking_date}</div>
              )}
              {transaction.booking_details.special_instructions && (
                <div>Instructions: {transaction.booking_details.special_instructions}</div>
              )}
            </div>
          )}
        </div>

        <div className="flex flex-col gap-2 ml-4">
          <Button
            size="sm"
            onClick={() => handleApproveAndNotify(transaction)}
            disabled={isProcessing}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            <MessageCircle className="h-4 w-4 mr-1" />
            Approve & WhatsApp
          </Button>
          <div className="flex gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => openActionDialog(transaction, 'approve')}
              disabled={isProcessing}
            >
              <CheckCircle className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => openActionDialog(transaction, 'decline')}
              disabled={isProcessing}
            >
              <XCircle className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <div className="space-y-6">
        {/* Package Requests Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5 text-blue-500" />
              Pending Package Requests ({packageTransactions.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {packageTransactions.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                No pending package requests
              </div>
            ) : (
              <div className="space-y-4">
                {packageTransactions.map((transaction) => (
                  <TransactionCard key={transaction.id} transaction={transaction} />
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Individual Service Payments Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wrench className="h-5 w-5 text-green-500" />
              Pending Individual Payments ({serviceTransactions.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {serviceTransactions.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                No pending individual service payments
              </div>
            ) : (
              <div className="space-y-4">
                {serviceTransactions.map((transaction) => (
                  <TransactionCard key={transaction.id} transaction={transaction} />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

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
