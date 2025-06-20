
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Copy, Check, CreditCard, Phone, Building, AlertCircle } from 'lucide-react';
import { usePaymentInstructions } from '@/hooks/usePaymentInstructions';
import { useToast } from '@/hooks/use-toast';

interface DynamicBankDepositInstructionsProps {
  amount: number;
  serviceId?: string;
  packageId?: string;
  onMarkAsPaid?: () => void;
}

export const DynamicBankDepositInstructions: React.FC<DynamicBankDepositInstructionsProps> = ({
  amount,
  serviceId,
  packageId,
  onMarkAsPaid
}) => {
  const { paymentInstructions, isLoading, error, generateReference } = usePaymentInstructions();
  const { toast } = useToast();
  const [copiedFields, setCopiedFields] = useState<Record<string, boolean>>({});

  const copyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedFields(prev => ({ ...prev, [field]: true }));
      setTimeout(() => {
        setCopiedFields(prev => ({ ...prev, [field]: false }));
      }, 2000);
      toast({
        title: "Copied!",
        description: `${field} copied to clipboard`,
      });
    } catch (error) {
      toast({
        title: "Copy failed",
        description: "Unable to copy to clipboard",
        variant: "destructive"
      });
    }
  };

  const handleMarkAsPaid = () => {
    toast({
      title: "Payment Submitted",
      description: "Your payment has been submitted for verification. You'll be notified once approved.",
    });
    onMarkAsPaid?.();
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !paymentInstructions) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-2 text-amber-600 mb-4">
            <AlertCircle className="h-5 w-5" />
            <h3 className="font-semibold">Payment Instructions Unavailable</h3>
          </div>
          <p className="text-gray-600 mb-4">
            No payment instructions available. Please contact support for payment details.
          </p>
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <p className="text-sm text-amber-800">
              <strong>What to do:</strong> Contact our support team to get the current payment details 
              or wait for the administrator to set up payment instructions.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const reference = generateReference(serviceId || packageId);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Bank Transfer Instructions
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {paymentInstructions.additional_instructions && (
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-blue-700 mb-2 font-medium">Payment Instructions:</p>
              <p className="text-sm text-blue-600">
                {paymentInstructions.additional_instructions}
              </p>
            </div>
          )}

          <Separator />

          <div className="grid gap-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium text-gray-700">Account Name</p>
                <p className="text-lg">{paymentInstructions.account_name}</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => copyToClipboard(paymentInstructions.account_name, 'Account Name')}
              >
                {copiedFields['Account Name'] ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>

            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium text-gray-700">Bank Name</p>
                <p className="text-lg">{paymentInstructions.bank_name}</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => copyToClipboard(paymentInstructions.bank_name, 'Bank Name')}
              >
                {copiedFields['Bank Name'] ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>

            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium text-gray-700">Account Number</p>
                <p className="text-lg font-mono">{paymentInstructions.account_number}</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => copyToClipboard(paymentInstructions.account_number, 'Account Number')}
              >
                {copiedFields['Account Number'] ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>

            {paymentInstructions.branch_code && (
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium text-gray-700">Branch Code</p>
                  <p className="text-lg">{paymentInstructions.branch_code}</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(paymentInstructions.branch_code!, 'Branch Code')}
                >
                  {copiedFields['Branch Code'] ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            )}

            {paymentInstructions.swift_code && (
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium text-gray-700">SWIFT Code</p>
                  <p className="text-lg">{paymentInstructions.swift_code}</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(paymentInstructions.swift_code!, 'SWIFT Code')}
                >
                  {copiedFields['SWIFT Code'] ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            )}

            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium text-gray-700">Amount</p>
                <p className="text-xl font-bold text-green-600">N${amount.toFixed(2)}</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => copyToClipboard(`N$${amount.toFixed(2)}`, 'Amount')}
              >
                {copiedFields['Amount'] ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>

            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium text-gray-700">Reference</p>
                <p className="text-lg font-mono">{reference}</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => copyToClipboard(reference, 'Reference')}
              >
                {copiedFields['Reference'] ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          <Separator />

          <div className="bg-yellow-50 p-4 rounded-lg">
            <div className="flex items-start gap-2">
              <Phone className="h-5 w-5 text-yellow-600 mt-0.5" />
              <div>
                <p className="font-medium text-yellow-800">Send Proof of Payment</p>
                <p className="text-sm text-yellow-700 mt-1">
                  After making the payment, send proof to our support team along with your reference number.
                </p>
              </div>
            </div>
          </div>

          <Button 
            onClick={handleMarkAsPaid}
            className="w-full"
            size="lg"
          >
            <Check className="h-4 w-4 mr-2" />
            Mark as Paid
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
