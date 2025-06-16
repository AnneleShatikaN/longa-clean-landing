
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Copy, ExternalLink, Check, CreditCard, MessageCircle } from 'lucide-react';
import { useEnhancedToast } from '@/hooks/useEnhancedToast';

interface BankDepositInstructionsProps {
  amount: number;
  reference: string;
  transactionType: 'subscription' | 'booking';
  onPaymentSubmitted?: () => void;
}

export const BankDepositInstructions: React.FC<BankDepositInstructionsProps> = ({
  amount,
  reference,
  transactionType,
  onPaymentSubmitted
}) => {
  const { toast } = useEnhancedToast();
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const bankDetails = {
    bankName: "First National Bank (FNB)",
    accountNumber: "64283646396",
    accountHolder: "Longa Services",
    branchCode: "282672"
  };

  const whatsappNumber = "+264814124606";
  const whatsappMessage = `Hi Longa! I've made a payment for ${transactionType} with reference: ${reference}. Amount: N$${amount.toFixed(2)}. Please find attached proof of payment.`;

  const copyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      toast.success('Copied to clipboard!');
      setTimeout(() => setCopiedField(null), 2000);
    } catch (error) {
      toast.error('Failed to copy to clipboard');
    }
  };

  const openWhatsApp = () => {
    const encodedMessage = encodeURIComponent(whatsappMessage);
    const whatsappUrl = `https://wa.me/${whatsappNumber.replace('+', '')}?text=${encodedMessage}`;
    window.open(whatsappUrl, '_blank');
    
    // Call the callback after opening WhatsApp
    if (onPaymentSubmitted) {
      setTimeout(() => {
        onPaymentSubmitted();
      }, 1000);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Payment Instructions
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Payment Summary */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="font-medium">Total Amount:</span>
              <Badge variant="default" className="text-lg px-3 py-1">
                N${amount.toFixed(2)}
              </Badge>
            </div>
            <div className="flex justify-between items-center mt-2">
              <span className="font-medium">Reference:</span>
              <div className="flex items-center gap-2">
                <code className="bg-white px-2 py-1 rounded text-sm">{reference}</code>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(reference, 'reference')}
                >
                  {copiedField === 'reference' ? (
                    <Check className="h-4 w-4 text-green-600" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          </div>

          {/* Main Payment Instructions */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg border border-blue-200">
            <h3 className="font-semibold text-lg mb-4 text-blue-900">To confirm your booking, please pay via EFT or direct bank deposit to:</h3>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center bg-white p-3 rounded-md">
                <span className="font-medium">FNB Account:</span>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-lg">{bankDetails.accountNumber}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(bankDetails.accountNumber, 'account')}
                    title="Copy Account Number"
                  >
                    {copiedField === 'account' ? (
                      <Check className="h-4 w-4 text-green-600" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              <div className="flex justify-between items-center bg-white p-3 rounded-md">
                <span className="font-medium">Branch Code:</span>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-lg">{bankDetails.branchCode}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(bankDetails.branchCode, 'branch')}
                    title="Copy Branch Code"
                  >
                    {copiedField === 'branch' ? (
                      <Check className="h-4 w-4 text-green-600" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              <div className="bg-white p-3 rounded-md">
                <span className="font-medium">Account Holder: </span>
                <span className="text-gray-700">{bankDetails.accountHolder}</span>
              </div>
            </div>
          </div>

          {/* WhatsApp Section */}
          <div className="bg-green-50 p-6 rounded-lg border border-green-200">
            <h4 className="font-medium mb-3 text-green-900">Then send your proof of payment via WhatsApp to:</h4>
            <div className="flex items-center justify-between bg-white p-3 rounded-md mb-4">
              <span className="font-mono text-lg text-green-700">{whatsappNumber}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => copyToClipboard(whatsappNumber, 'whatsapp')}
                title="Copy WhatsApp Number"
              >
                {copiedField === 'whatsapp' ? (
                  <Check className="h-4 w-4 text-green-600" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
            
            <Button 
              onClick={openWhatsApp}
              className="w-full bg-green-600 hover:bg-green-700 text-white"
            >
              <MessageCircle className="h-4 w-4 mr-2" />
              Send Proof via WhatsApp
              <ExternalLink className="h-4 w-4 ml-2" />
            </Button>
            <p className="text-sm text-green-700 mt-2 text-center">for faster approval</p>
          </div>

          {/* Important Reminder */}
          <Alert className="border-orange-200 bg-orange-50">
            <AlertDescription className="text-orange-800">
              <strong>Important:</strong> Your booking will only be confirmed once payment is verified. Please use the reference number <code className="bg-orange-100 px-1 rounded">{reference}</code> when making your payment.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
};
