
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Copy, Check, CreditCard, Phone, Building } from 'lucide-react';
import { useBankingSettings } from '@/hooks/useBankingSettings';
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
  const { bankingDetails, paymentInstructions, isLoading } = useBankingSettings();
  const { toast } = useToast();
  const [copiedFields, setCopiedFields] = useState<Record<string, boolean>>({});

  const generateReference = () => {
    const type = packageId ? 'PKG' : 'SVC';
    const id = (packageId || serviceId || '').slice(0, 8).toUpperCase();
    const timestamp = Date.now().toString().slice(-6);
    return `${type}-${id}-${timestamp}`;
  };

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

  const reference = generateReference();

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
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-sm text-blue-700 mb-2 font-medium">Payment Instructions:</p>
            <p className="text-sm text-blue-600">
              {paymentInstructions?.clientPaymentInstructions || 'Please deposit payment to our business account and send proof of payment.'}
            </p>
          </div>

          <Separator />

          <div className="grid gap-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium text-gray-700">Business Name</p>
                <p className="text-lg">{bankingDetails?.businessName || 'Longa Services'}</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => copyToClipboard(bankingDetails?.businessName || 'Longa Services', 'Business Name')}
              >
                {copiedFields['Business Name'] ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>

            {bankingDetails?.bankName && (
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium text-gray-700">Bank Name</p>
                  <p className="text-lg">{bankingDetails.bankName}</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(bankingDetails.bankName, 'Bank Name')}
                >
                  {copiedFields['Bank Name'] ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            )}

            {bankingDetails?.accountNumber && (
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium text-gray-700">Account Number</p>
                  <p className="text-lg font-mono">{bankingDetails.accountNumber}</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(bankingDetails.accountNumber, 'Account Number')}
                >
                  {copiedFields['Account Number'] ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            )}

            {bankingDetails?.branchCode && (
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium text-gray-700">Branch Code</p>
                  <p className="text-lg">{bankingDetails.branchCode}</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(bankingDetails.branchCode, 'Branch Code')}
                >
                  {copiedFields['Branch Code'] ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
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
                  After making the payment, send proof to WhatsApp: 
                  <span className="font-mono ml-1">{paymentInstructions?.whatsappNumber || '+264 XX XXX XXXX'}</span>
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
