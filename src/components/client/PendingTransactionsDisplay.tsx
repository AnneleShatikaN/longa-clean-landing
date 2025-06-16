
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, CheckCircle, XCircle, ExternalLink, Copy } from 'lucide-react';
import { usePendingTransactions } from '@/hooks/usePendingTransactions';
import { useEnhancedToast } from '@/hooks/useEnhancedToast';
import { format } from 'date-fns';

export const PendingTransactionsDisplay: React.FC = () => {
  const { transactions, isLoading } = usePendingTransactions();
  const { toast } = useEnhancedToast();

  const copyReference = (reference: string) => {
    navigator.clipboard.writeText(reference);
    toast.success('Reference copied to clipboard');
  };

  const openWhatsApp = (reference: string, amount: number, type: string) => {
    const whatsappNumber = "+264814567890";
    const message = `Hi Longa! I've made a payment for ${type} with reference: ${reference}. Amount: N$${amount.toFixed(2)}. Please find attached proof of payment.`;
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${whatsappNumber.replace('+', '')}?text=${encodedMessage}`;
    window.open(whatsappUrl, '_blank');
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center text-gray-500">Loading transactions...</div>
        </CardContent>
      </Card>
    );
  }

  if (transactions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Pending Payments</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-gray-500">
            No pending transactions
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Pending Payments ({transactions.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {transactions.map((transaction) => (
          <div key={transaction.id} className="border rounded-lg p-4">
            <div className="flex items-start justify-between mb-3">
              <div>
                <div className="font-medium">
                  {transaction.transaction_type === 'subscription' ? 'Subscription Package' : 'Service Booking'}
                </div>
                <div className="text-sm text-gray-600">
                  {format(new Date(transaction.created_at), 'MMM dd, yyyy HH:mm')}
                </div>
              </div>
              <div className="text-right">
                <div className="font-bold">N${transaction.amount.toFixed(2)}</div>
                <Badge 
                  variant={
                    transaction.status === 'approved' ? 'default' :
                    transaction.status === 'declined' ? 'destructive' : 'secondary'
                  }
                  className="mt-1"
                >
                  {transaction.status === 'pending' && <Clock className="h-3 w-3 mr-1" />}
                  {transaction.status === 'approved' && <CheckCircle className="h-3 w-3 mr-1" />}
                  {transaction.status === 'declined' && <XCircle className="h-3 w-3 mr-1" />}
                  {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                </Badge>
              </div>
            </div>

            {transaction.reference_number && (
              <div className="flex items-center gap-2 mb-3">
                <span className="text-sm text-gray-600">Reference:</span>
                <code className="bg-gray-100 px-2 py-1 rounded text-sm">
                  {transaction.reference_number}
                </code>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyReference(transaction.reference_number!)}
                >
                  <Copy className="h-3 w-3" />
                </Button>
              </div>
            )}

            {transaction.admin_notes && (
              <div className="mb-3">
                <div className="text-sm font-medium text-gray-700 mb-1">Admin Notes:</div>
                <div className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                  {transaction.admin_notes}
                </div>
              </div>
            )}

            {transaction.status === 'pending' && transaction.reference_number && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => openWhatsApp(
                  transaction.reference_number!,
                  transaction.amount,
                  transaction.transaction_type
                )}
                className="w-full"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Send Proof via WhatsApp
              </Button>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
};
