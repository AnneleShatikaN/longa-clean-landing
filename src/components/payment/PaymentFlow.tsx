
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Clock, XCircle } from 'lucide-react';
import { BankDepositInstructions } from './BankDepositInstructions';
import { usePendingTransactions, CreateTransactionData } from '@/hooks/usePendingTransactions';

interface PaymentFlowProps {
  isOpen: boolean;
  onClose: () => void;
  transactionData: CreateTransactionData;
  title: string;
  description: string;
}

export const PaymentFlow: React.FC<PaymentFlowProps> = ({
  isOpen,
  onClose,
  transactionData,
  title,
  description
}) => {
  const { createTransaction, isLoading } = usePendingTransactions();
  const [step, setStep] = useState<'confirm' | 'instructions' | 'submitted'>('confirm');
  const [reference, setReference] = useState<string>('');

  const handleConfirmPayment = async () => {
    const generatedReference = await createTransaction(transactionData);
    if (generatedReference) {
      setReference(generatedReference);
      setStep('instructions');
    }
  };

  const handlePaymentSubmitted = () => {
    setStep('submitted');
  };

  const handleClose = () => {
    setStep('confirm');
    setReference('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        {step === 'confirm' && (
          <div className="space-y-6">
            <div className="text-center">
              <p className="text-gray-600 mb-4">{description}</p>
              <div className="bg-blue-50 p-4 rounded-lg mb-6">
                <div className="text-2xl font-bold text-blue-600">
                  N${transactionData.amount.toFixed(2)}
                </div>
                <div className="text-sm text-gray-600">
                  {transactionData.transaction_type === 'subscription' ? 'Monthly Subscription' : 'One-time Service'}
                </div>
              </div>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Payment Process</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="bg-blue-100 text-blue-600 rounded-full p-2 text-sm font-medium min-w-[32px] h-8 flex items-center justify-center">
                    1
                  </div>
                  <div>
                    <h4 className="font-medium">Bank Deposit</h4>
                    <p className="text-sm text-gray-600">Make a deposit using the provided bank details</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="bg-blue-100 text-blue-600 rounded-full p-2 text-sm font-medium min-w-[32px] h-8 flex items-center justify-center">
                    2
                  </div>
                  <div>
                    <h4 className="font-medium">Send Proof</h4>
                    <p className="text-sm text-gray-600">Send your deposit slip via WhatsApp</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="bg-blue-100 text-blue-600 rounded-full p-2 text-sm font-medium min-w-[32px] h-8 flex items-center justify-center">
                    3
                  </div>
                  <div>
                    <h4 className="font-medium">Verification</h4>
                    <p className="text-sm text-gray-600">We'll verify and activate your service within 24 hours</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex gap-4">
              <Button variant="outline" onClick={handleClose} className="flex-1">
                Cancel
              </Button>
              <Button 
                onClick={handleConfirmPayment} 
                disabled={isLoading}
                className="flex-1"
              >
                {isLoading ? 'Creating...' : 'Proceed to Payment'}
              </Button>
            </div>
          </div>
        )}

        {step === 'instructions' && (
          <BankDepositInstructions
            amount={transactionData.amount}
            reference={reference}
            transactionType={transactionData.transaction_type}
            onPaymentSubmitted={handlePaymentSubmitted}
          />
        )}

        {step === 'submitted' && (
          <div className="text-center space-y-6 py-8">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-2">Payment Submitted!</h3>
              <p className="text-gray-600 mb-4">
                We've received your payment submission. You can track the status in your dashboard.
              </p>
              <Badge variant="secondary" className="mb-4">
                Reference: {reference}
              </Badge>
              <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
                <div className="flex items-center gap-2 text-yellow-800">
                  <Clock className="h-4 w-4" />
                  <span className="font-medium">Pending Verification</span>
                </div>
                <p className="text-sm text-yellow-700 mt-1">
                  We'll verify your payment within 24 hours and notify you when it's approved.
                </p>
              </div>
            </div>
            <Button onClick={handleClose} className="w-full">
              Return to Dashboard
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
