
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { MessageCircle, CheckCircle, XCircle, Package, Wrench, Phone } from 'lucide-react';
import { format } from 'date-fns';

interface PendingPayment {
  id: string;
  user: {
    full_name: string;
    phone: string;
    email: string;
  };
  transaction_type: 'subscription' | 'booking';
  amount: number;
  reference_number?: string;
  created_at: string;
  service?: { name: string };
  package?: { name: string };
  booking_details?: any;
}

interface PendingPaymentsTableProps {
  payments: PendingPayment[];
  onApproveAndNotify: (payment: PendingPayment) => void;
  onApprove: (payment: PendingPayment) => void;
  onDecline: (payment: PendingPayment) => void;
  isProcessing: boolean;
}

export const PendingPaymentsTable: React.FC<PendingPaymentsTableProps> = ({
  payments,
  onApproveAndNotify,
  onApprove,
  onDecline,
  isProcessing
}) => {
  const generateWhatsAppPreview = (payment: PendingPayment) => {
    const userName = payment.user?.full_name || 'Customer';
    
    if (payment.transaction_type === 'subscription') {
      const packageName = payment.package?.name || 'Package';
      return `Hi ${userName}, your payment for the ${packageName} has been approved...`;
    } else {
      const serviceName = payment.service?.name || 'Service';
      return `Hi ${userName}, your payment for ${serviceName} has been confirmed...`;
    }
  };

  if (payments.length === 0) {
    return (
      <div className="text-center text-gray-500 py-8">
        No pending payments
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Customer</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Amount</TableHead>
          <TableHead>Date</TableHead>
          <TableHead>Reference</TableHead>
          <TableHead>WhatsApp Preview</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {payments.map((payment) => (
          <TableRow key={payment.id}>
            <TableCell>
              <div className="space-y-1">
                <div className="font-medium">{payment.user?.full_name}</div>
                <div className="text-sm text-gray-500 flex items-center gap-1">
                  <Phone className="h-3 w-3" />
                  {payment.user?.phone}
                </div>
              </div>
            </TableCell>
            
            <TableCell>
              <div className="flex items-center gap-2">
                {payment.transaction_type === 'subscription' ? (
                  <>
                    <Package className="h-4 w-4 text-blue-500" />
                    <div>
                      <Badge variant="outline" className="text-blue-600">Package</Badge>
                      <div className="text-xs text-gray-500 mt-1">
                        {payment.package?.name || 'Unknown Package'}
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <Wrench className="h-4 w-4 text-green-500" />
                    <div>
                      <Badge variant="outline" className="text-green-600">Service</Badge>
                      <div className="text-xs text-gray-500 mt-1">
                        {payment.service?.name || 'Unknown Service'}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </TableCell>
            
            <TableCell>
              <div className="font-medium">N${payment.amount.toFixed(2)}</div>
            </TableCell>
            
            <TableCell>
              <div className="text-sm">
                {format(new Date(payment.created_at), 'MMM dd, HH:mm')}
              </div>
            </TableCell>
            
            <TableCell>
              {payment.reference_number ? (
                <code className="bg-gray-100 px-2 py-1 rounded text-xs">
                  {payment.reference_number}
                </code>
              ) : (
                <span className="text-gray-400 text-xs">N/A</span>
              )}
            </TableCell>
            
            <TableCell>
              <div className="text-xs text-gray-600 max-w-48 truncate">
                {generateWhatsAppPreview(payment)}
              </div>
            </TableCell>
            
            <TableCell>
              <div className="flex gap-1">
                <Button
                  size="sm"
                  onClick={() => onApproveAndNotify(payment)}
                  disabled={isProcessing}
                  className="bg-green-600 hover:bg-green-700 text-white text-xs"
                >
                  <MessageCircle className="h-3 w-3 mr-1" />
                  Approve & WhatsApp
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onApprove(payment)}
                  disabled={isProcessing}
                >
                  <CheckCircle className="h-3 w-3" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onDecline(payment)}
                  disabled={isProcessing}
                >
                  <XCircle className="h-3 w-3" />
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
