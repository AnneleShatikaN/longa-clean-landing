
import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DynamicBankDepositInstructions } from '@/components/payment/DynamicBankDepositInstructions';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const PaymentInstructions = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const [transaction, setTransaction] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const transactionId = searchParams.get('transaction_id');

  useEffect(() => {
    if (transactionId) {
      fetchTransaction();
    }
  }, [transactionId]);

  const fetchTransaction = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('pending_transactions')
        .select(`
          *,
          services(name, description),
          subscription_packages(name, description)
        `)
        .eq('id', transactionId)
        .single();

      if (error) throw error;
      setTransaction(data);
    } catch (error) {
      console.error('Error fetching transaction:', error);
      toast({
        title: "Error",
        description: "Failed to load payment details",
        variant: "destructive",
      });
      navigate('/client-dashboard');
    } finally {
      setIsLoading(false);
    }
  };

  const handleMarkAsPaid = () => {
    toast({
      title: "Payment Submitted",
      description: "Your payment has been submitted for verification. You'll be notified once approved and a provider is assigned.",
    });
    navigate('/client-dashboard');
  };

  if (!transactionId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Invalid Request</h1>
          <p className="text-gray-600 mb-6">Payment details not found.</p>
          <Button onClick={() => navigate('/client-dashboard')}>
            Return to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Loading...</h1>
          <p className="text-gray-600 mb-6">Please wait while we load your payment details.</p>
        </div>
      </div>
    );
  }

  if (!transaction) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Transaction Not Found</h1>
          <p className="text-gray-600 mb-6">The requested payment details could not be found.</p>
          <Button onClick={() => navigate('/client-dashboard')}>
            Return to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/client-dashboard')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Button>
        </div>

        {/* Payment Instructions */}
        <Card className="mb-6">
          <CardHeader className="text-center">
            <CardTitle className="text-xl font-bold">Complete Your Payment</CardTitle>
            <p className="text-gray-600">
              {transaction.transaction_type === 'subscription' 
                ? `Package: ${transaction.subscription_packages?.name}`
                : `Service: ${transaction.services?.name}`
              }
            </p>
          </CardHeader>
          <CardContent>
            <DynamicBankDepositInstructions
              amount={transaction.amount}
              serviceId={transaction.service_id}
              packageId={transaction.package_id}
              onMarkAsPaid={handleMarkAsPaid}
            />
          </CardContent>
        </Card>

        {/* Next Steps */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">What happens next?</CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="text-sm space-y-2">
              <li>1. Make the payment using the banking details above</li>
              <li>2. Send proof of payment via WhatsApp</li>
              <li>3. Admin will verify your payment within 24 hours</li>
              <li>4. Once approved, {transaction.transaction_type === 'subscription' ? 'your package will be activated' : 'a provider will be assigned to your booking'}</li>
              <li>5. You'll receive confirmation and next steps via notification</li>
            </ol>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PaymentInstructions;
