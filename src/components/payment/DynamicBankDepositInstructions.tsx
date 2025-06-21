
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Copy, Check, CreditCard, MessageCircle } from 'lucide-react';
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

  // Generate reference number
  const reference = `LONGA-${(serviceId || packageId || 'SERVICE').substring(0, 8).toUpperCase()}-${Date.now().toString().slice(-6)}`;

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
              Make a bank transfer using the details below, then WhatsApp proof of payment to complete your booking.
            </p>
          </div>

          <Separator />

          <div className="grid gap-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium text-gray-700">Account Name</p>
                <p className="text-lg">Bank Wise</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => copyToClipboard('Bank Wise', 'Account Name')}
              >
                {copiedFields['Account Name'] ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>

            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium text-gray-700">FNB Account</p>
                <p className="text-lg font-mono">64283646396</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => copyToClipboard('64283646396', 'Account Number')}
              >
                {copiedFields['Account Number'] ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>

            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium text-gray-700">Branch Code</p>
                <p className="text-lg font-mono">282672</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => copyToClipboard('282672', 'Branch Code')}
              >
                {copiedFields['Branch Code'] ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>

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

          <div className="bg-green-50 p-4 rounded-lg">
            <div className="flex items-start gap-2">
              <MessageCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-green-800">Send Proof of Payment</p>
                <p className="text-sm text-green-700 mt-1">
                  After making the payment, please WhatsApp proof of payment to <strong>+264814124606</strong> along with your reference number.
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
