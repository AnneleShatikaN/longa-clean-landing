
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
    accountNumber: "62123456789",
    accountHolder: "Longa Services (Pty) Ltd",
    branchCode: "280172",
    swiftCode: "FIRNNAWI"
  };

  const whatsappNumber = "+264814567890";
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
            Bank Deposit Instructions
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

          {/* Bank Details */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Bank Details</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Bank Name:</span>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{bankDetails.bankName}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(bankDetails.bankName, 'bank')}
                    >
                      {copiedField === 'bank' ? (
                        <Check className="h-4 w-4 text-green-600" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Account Number:</span>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{bankDetails.accountNumber}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(bankDetails.accountNumber, 'account')}
                    >
                      {copiedField === 'account' ? (
                        <Check className="h-4 w-4 text-green-600" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Account Holder:</span>
                  <span className="font-medium">{bankDetails.accountHolder}</span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Branch Code:</span>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{bankDetails.branchCode}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(bankDetails.branchCode, 'branch')}
                    >
                      {copiedField === 'branch' ? (
                        <Check className="h-4 w-4 text-green-600" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">SWIFT Code:</span>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{bankDetails.swiftCode}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(bankDetails.swiftCode, 'swift')}
                    >
                      {copiedField === 'swift' ? (
                        <Check className="h-4 w-4 text-green-600" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Important Instructions */}
          <Alert>
            <AlertDescription>
              <strong>Important:</strong> Please use the reference number <code>{reference}</code> when making your deposit. This helps us identify your payment quickly.
            </AlertDescription>
          </Alert>

          {/* WhatsApp Action */}
          <div className="bg-green-50 p-4 rounded-lg">
            <h4 className="font-medium mb-2">Step 2: Send Proof of Payment</h4>
            <p className="text-sm text-gray-600 mb-4">
              After making your deposit, please send your proof of payment to our WhatsApp number for quick verification.
            </p>
            <Button 
              onClick={openWhatsApp}
              className="w-full bg-green-600 hover:bg-green-700"
            >
              <MessageCircle className="h-4 w-4 mr-2" />
              Send Proof via WhatsApp
              <ExternalLink className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
