
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Copy, Check, MessageCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface DynamicBankDepositInstructionsProps {
  amount: number;
  serviceId?: string;
  packageId?: string;
  onMarkAsPaid: () => void;
}

export const DynamicBankDepositInstructions: React.FC<DynamicBankDepositInstructionsProps> = ({
  amount,
  onMarkAsPaid
}) => {
  const { toast } = useToast();
  const [copiedField, setCopiedField] = React.useState<string | null>(null);

  const copyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      toast({
        title: "Copied!",
        description: `${field} copied to clipboard`,
      });
      setTimeout(() => setCopiedField(null), 2000);
    } catch (error) {
      toast({
        title: "Copy failed",
        description: "Please copy the information manually",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Amount */}
      <Card>
        <CardContent className="p-6 text-center">
          <div className="text-3xl font-bold text-purple-600">N${amount.toFixed(2)}</div>
          <p className="text-gray-600 mt-2">Total Amount</p>
        </CardContent>
      </Card>

      {/* Bank Details */}
      <Card>
        <CardHeader>
          <CardTitle>Bank Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="text-sm text-gray-600">Account Name</p>
                <p className="font-medium">Bank Wise</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => copyToClipboard('Bank Wise', 'Account Name')}
              >
                {copiedField === 'Account Name' ? (
                  <Check className="h-4 w-4 text-green-600" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="text-sm text-gray-600">FNB Account</p>
                <p className="font-medium">64283646396</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => copyToClipboard('64283646396', 'Account Number')}
              >
                {copiedField === 'Account Number' ? (
                  <Check className="h-4 w-4 text-green-600" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="text-sm text-gray-600">Branch Code</p>
                <p className="font-medium">282672</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => copyToClipboard('282672', 'Branch Code')}
              >
                {copiedField === 'Branch Code' ? (
                  <Check className="h-4 w-4 text-green-600" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* WhatsApp Instructions */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-start gap-3">
            <MessageCircle className="h-5 w-5 text-green-600 mt-0.5" />
            <div>
              <p className="font-medium mb-2">After payment:</p>
              <p className="text-gray-600">
                Send your proof of payment via WhatsApp to{' '}
                <a 
                  href="https://wa.me/264814124606" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-green-600 font-medium hover:underline"
                >
                  +264814124606
                </a>
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Confirm Payment Button */}
      <Button 
        onClick={onMarkAsPaid}
        className="w-full bg-purple-600 hover:bg-purple-700"
        size="lg"
      >
        I have made the payment
      </Button>
    </div>
  );
};
