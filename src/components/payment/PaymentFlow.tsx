
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { DynamicBankDepositInstructions } from './DynamicBankDepositInstructions';
import { Upload, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface PaymentFlowProps {
  amount: number;
  serviceId?: string;
  packageId?: string;
  transactionType: 'booking' | 'subscription';
  bookingDetails?: any;
  onPaymentSubmitted?: () => void;
}

export const PaymentFlow: React.FC<PaymentFlowProps> = ({
  amount,
  serviceId,
  packageId,
  transactionType,
  bookingDetails,
  onPaymentSubmitted
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [step, setStep] = useState<'instructions' | 'proof' | 'submitted'>('instructions');
  const [paymentProof, setPaymentProof] = useState<File | null>(null);
  const [referenceNumber, setReferenceNumber] = useState('');
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [additionalNotes, setAdditionalNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type and size
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Invalid file type",
          description: "Please upload an image file",
          variant: "destructive"
        });
        return;
      }
      
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast({
          title: "File too large",
          description: "Please upload an image smaller than 5MB",
          variant: "destructive"
        });
        return;
      }
      
      setPaymentProof(file);
    }
  };

  const submitPaymentProof = async () => {
    if (!user || !paymentProof || !referenceNumber) {
      toast({
        title: "Missing information",
        description: "Please provide all required information",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsSubmitting(true);
      
      // Upload payment proof to Supabase storage
      const fileExt = paymentProof.name.split('.').pop();
      const fileName = `payment-proofs/${user.id}/${Date.now()}.${fileExt}`;
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('payment-proofs')
        .upload(fileName, paymentProof);

      if (uploadError) throw uploadError;

      // Create pending transaction
      const { error: transactionError } = await supabase
        .from('pending_transactions')
        .insert({
          user_id: user.id,
          service_id: serviceId,
          package_id: packageId,
          amount,
          transaction_type: transactionType,
          booking_details: bookingDetails || {},
          reference_number: referenceNumber,
          whatsapp_number: whatsappNumber,
          payment_proof_url: uploadData.path,
          status: 'pending'
        });

      if (transactionError) throw transactionError;

      setStep('submitted');
      toast({
        title: "Payment Submitted",
        description: "Your payment proof has been submitted for verification",
      });

      onPaymentSubmitted?.();
    } catch (error) {
      console.error('Error submitting payment:', error);
      toast({
        title: "Submission Failed",
        description: "Failed to submit payment proof. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (step === 'submitted') {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Payment Submitted Successfully</h3>
          <p className="text-gray-600 mb-4">
            Your payment proof has been submitted for verification. You'll receive a notification once it's approved.
          </p>
          <Badge variant="outline" className="flex items-center gap-2 w-fit mx-auto">
            <Clock className="h-4 w-4" />
            Pending Verification
          </Badge>
        </CardContent>
      </Card>
    );
  }

  if (step === 'proof') {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Upload Payment Proof</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <p className="font-medium text-blue-800">Important</p>
                <p className="text-sm text-blue-700">
                  Please ensure your payment proof shows the exact amount (N${amount.toFixed(2)}) and reference number.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="reference">Reference Number *</Label>
            <Input
              id="reference"
              value={referenceNumber}
              onChange={(e) => setReferenceNumber(e.target.value)}
              placeholder="Enter the reference number used for payment"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="whatsapp">WhatsApp Number (Optional)</Label>
            <Input
              id="whatsapp"
              value={whatsappNumber}
              onChange={(e) => setWhatsappNumber(e.target.value)}
              placeholder="+264 XX XXX XXXX"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="proof">Payment Proof Image *</Label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              {paymentProof ? (
                <div className="space-y-2">
                  <CheckCircle className="h-8 w-8 text-green-500 mx-auto" />
                  <p className="text-sm font-medium">{paymentProof.name}</p>
                  <p className="text-xs text-gray-500">
                    {(paymentProof.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPaymentProof(null)}
                  >
                    Remove
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  <Upload className="h-8 w-8 text-gray-400 mx-auto" />
                  <p className="text-sm text-gray-600">
                    Click to upload or drag and drop
                  </p>
                  <p className="text-xs text-gray-500">
                    PNG, JPG up to 5MB
                  </p>
                </div>
              )}
              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Additional Notes (Optional)</Label>
            <Textarea
              id="notes"
              value={additionalNotes}
              onChange={(e) => setAdditionalNotes(e.target.value)}
              placeholder="Any additional information about the payment..."
              rows={3}
            />
          </div>

          <div className="flex justify-between pt-4">
            <Button
              variant="outline"
              onClick={() => setStep('instructions')}
            >
              Back to Instructions
            </Button>
            <Button
              onClick={submitPaymentProof}
              disabled={!paymentProof || !referenceNumber || isSubmitting}
            >
              {isSubmitting ? 'Submitting...' : 'Submit Payment Proof'}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <DynamicBankDepositInstructions
        amount={amount}
        serviceId={serviceId}
        packageId={packageId}
        onMarkAsPaid={() => setStep('proof')}
      />
      
      <Card>
        <CardContent className="text-center py-6">
          <p className="text-sm text-gray-600 mb-4">
            After making the payment, click the button above to upload your payment proof.
          </p>
          <Button 
            onClick={() => setStep('proof')}
            variant="outline"
            className="w-full"
          >
            I've Made the Payment - Upload Proof
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
