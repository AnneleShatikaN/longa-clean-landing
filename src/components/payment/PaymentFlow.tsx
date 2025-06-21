
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { DynamicBankDepositInstructions } from './DynamicBankDepositInstructions';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { ArrowLeft, Upload, CreditCard } from 'lucide-react';

interface PaymentFlowProps {
  amount: number;
  serviceId?: string;
  packageId?: string;
  bookingDetails?: any;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export const PaymentFlow: React.FC<PaymentFlowProps> = ({
  amount,
  serviceId,
  packageId,
  bookingDetails,
  onSuccess,
  onCancel
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [step, setStep] = useState<'instructions' | 'upload'>('instructions');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentData, setPaymentData] = useState({
    referenceNumber: '',
    whatsappNumber: '',
    proofUrl: ''
  });

  const handleMarkAsPaid = () => {
    setStep('upload');
  };

  const handleSubmitPayment = async () => {
    if (!user) return;

    if (!paymentData.referenceNumber || !paymentData.whatsappNumber) {
      toast({
        title: "Missing Information",
        description: "Please provide reference number and WhatsApp number",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('pending_transactions')
        .insert({
          user_id: user.id,
          service_id: serviceId,
          package_id: packageId,
          amount,
          transaction_type: packageId ? 'subscription' : 'booking',
          reference_number: paymentData.referenceNumber,
          whatsapp_number: paymentData.whatsappNumber,
          payment_proof_url: paymentData.proofUrl,
          booking_details: bookingDetails || {},
          status: 'pending'
        });

      if (error) throw error;

      toast({
        title: "Payment Submitted",
        description: "Your payment has been submitted for verification. You'll be notified once approved.",
      });

      onSuccess?.();
    } catch (error) {
      console.error('Payment submission error:', error);
      toast({
        title: "Submission Failed",
        description: "Failed to submit payment. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {step === 'instructions' && (
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            {onCancel && (
              <Button variant="outline" size="sm" onClick={onCancel}>
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
            )}
            <h1 className="text-2xl sm:text-3xl font-bold">Complete Payment</h1>
          </div>

          <DynamicBankDepositInstructions
            amount={amount}
            serviceId={serviceId}
            packageId={packageId}
            onMarkAsPaid={handleMarkAsPaid}
          />
        </div>
      )}

      {step === 'upload' && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-4">
              <Button variant="outline" size="sm" onClick={() => setStep('instructions')}>
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Submit Payment Proof
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-semibold text-blue-800 mb-2">Payment Amount</h3>
              <p className="text-2xl font-bold text-blue-600">N${amount.toFixed(2)}</p>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="referenceNumber">Payment Reference Number *</Label>
                <Input
                  id="referenceNumber"
                  value={paymentData.referenceNumber}
                  onChange={(e) => setPaymentData(prev => ({ ...prev, referenceNumber: e.target.value }))}
                  placeholder="Enter the reference number from your payment"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="whatsappNumber">Your WhatsApp Number *</Label>
                <Input
                  id="whatsappNumber"
                  value={paymentData.whatsappNumber}
                  onChange={(e) => setPaymentData(prev => ({ ...prev, whatsappNumber: e.target.value }))}
                  placeholder="+264 XX XXX XXXX"
                  required
                />
                <p className="text-xs text-gray-600">
                  We'll contact you on WhatsApp if we need to verify your payment
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="proofUrl">Proof of Payment (Optional)</Label>
                <Input
                  id="proofUrl"
                  type="url"
                  value={paymentData.proofUrl}
                  onChange={(e) => setPaymentData(prev => ({ ...prev, proofUrl: e.target.value }))}
                  placeholder="Upload image to cloud service and paste link here"
                />
                <p className="text-xs text-gray-600">
                  You can also send the proof via WhatsApp after submitting
                </p>
              </div>
            </div>

            <div className="bg-yellow-50 p-4 rounded-lg">
              <h4 className="font-semibold text-yellow-800 mb-2">Next Steps:</h4>
              <ol className="list-decimal list-inside text-sm text-yellow-700 space-y-1">
                <li>Click "Submit Payment" below</li>
                <li>Send your payment proof to our WhatsApp</li>
                <li>We'll verify and approve your payment within 24 hours</li>
                <li>You'll receive a confirmation once approved</li>
              </ol>
            </div>

            <Button 
              onClick={handleSubmitPayment}
              disabled={isSubmitting}
              className="w-full"
              size="lg"
            >
              <CreditCard className="h-4 w-4 mr-2" />
              {isSubmitting ? 'Submitting...' : 'Submit Payment'}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
