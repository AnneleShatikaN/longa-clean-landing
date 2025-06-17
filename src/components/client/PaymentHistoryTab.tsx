
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Download, Receipt, Calendar, CreditCard } from 'lucide-react';
import { usePendingTransactions } from '@/hooks/usePendingTransactions';
import { useAuth } from '@/contexts/AuthContext';
import { format } from 'date-fns';
import { generateInvoicePDF } from '@/utils/invoiceGenerator';

export const PaymentHistoryTab: React.FC = () => {
  const { transactions, isLoading } = usePendingTransactions();
  const { user } = useAuth();

  const handleDownloadInvoice = (transaction: any) => {
    if (!user) return;
    
    generateInvoicePDF({
      transaction,
      user,
      invoiceNumber: `INV-${transaction.reference_number || transaction.id.slice(0, 8).toUpperCase()}`
    });
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center text-gray-500">Loading payment history...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Receipt className="h-5 w-5" />
            Payment History
          </CardTitle>
        </CardHeader>
        <CardContent>
          {transactions.length === 0 ? (
            <div className="text-center py-8">
              <Receipt className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Payment History</h3>
              <p className="text-gray-600">You haven't made any payments yet.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Mobile View */}
              <div className="md:hidden space-y-4">
                {transactions.map((transaction) => (
                  <Card key={transaction.id} className="border">
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-medium">
                              {transaction.transaction_type === 'subscription' ? 'Package Subscription' : 'Service Booking'}
                            </h4>
                            <div className="flex items-center gap-1 text-sm text-gray-600">
                              <Calendar className="h-3 w-3" />
                              {format(new Date(transaction.created_at), 'MMM dd, yyyy')}
                            </div>
                          </div>
                          <Badge 
                            variant={
                              transaction.status === 'approved' ? 'default' :
                              transaction.status === 'declined' ? 'destructive' : 'secondary'
                            }
                          >
                            {transaction.status}
                          </Badge>
                        </div>
                        
                        <div className="flex items-center gap-1 text-sm text-gray-600">
                          <CreditCard className="h-3 w-3" />
                          Bank Deposit
                        </div>
                        
                        <div className="flex justify-between items-center">
                          <div className="font-bold text-lg">N${transaction.amount.toFixed(2)}</div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDownloadInvoice(transaction)}
                          >
                            <Download className="h-3 w-3 mr-1" />
                            Invoice
                          </Button>
                        </div>
                        
                        {transaction.reference_number && (
                          <div className="text-xs text-gray-500">
                            Ref: {transaction.reference_number}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Desktop View */}
              <div className="hidden md:block">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Payment Method</TableHead>
                      <TableHead>Reference</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transactions.map((transaction) => (
                      <TableRow key={transaction.id}>
                        <TableCell>
                          {format(new Date(transaction.created_at), 'MMM dd, yyyy')}
                        </TableCell>
                        <TableCell>
                          {transaction.transaction_type === 'subscription' ? 'Package Subscription' : 'Service Booking'}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <CreditCard className="h-3 w-3" />
                            Bank Deposit
                          </div>
                        </TableCell>
                        <TableCell>
                          <code className="text-xs bg-gray-100 px-1 py-0.5 rounded">
                            {transaction.reference_number || 'N/A'}
                          </code>
                        </TableCell>
                        <TableCell className="font-medium">
                          N${transaction.amount.toFixed(2)}
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant={
                              transaction.status === 'approved' ? 'default' :
                              transaction.status === 'declined' ? 'destructive' : 'secondary'
                            }
                          >
                            {transaction.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDownloadInvoice(transaction)}
                          >
                            <Download className="h-3 w-3 mr-1" />
                            Invoice
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
