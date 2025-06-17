
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Star, DollarSign } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useSubscriptionPackages } from '@/hooks/useSubscriptionPackages';
import { useToast } from '@/hooks/use-toast';
import { PaymentFlow } from '@/components/payment/PaymentFlow';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface PackageCardProps {
  id: string;
  name: string;
  price: number;
  description: string;
  features: string[];
  popular?: boolean;
  hasActivePackage?: boolean;
}

export const PackageCard: React.FC<PackageCardProps> = ({
  id,
  name,
  price,
  description,
  features,
  popular = false,
  hasActivePackage = false
}) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { createPackagePurchase } = useSubscriptionPackages();
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSelectPackage = async () => {
    if (hasActivePackage) {
      toast({
        title: "Active Package",
        description: "You already have an active package. Contact support to change packages.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsProcessing(true);
      await createPackagePurchase(id);
      setIsPaymentModalOpen(true);
    } catch (error) {
      console.error('Error creating package purchase:', error);
      toast({
        title: "Purchase Failed",
        description: "Failed to create package purchase. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePaymentSubmitted = () => {
    setIsPaymentModalOpen(false);
    toast({
      title: "Payment Submitted",
      description: "Your payment has been submitted for verification. You'll receive confirmation shortly.",
    });
    navigate('/client-dashboard');
  };

  return (
    <>
      <Card className={`relative h-full ${popular ? 'ring-2 ring-blue-500 shadow-lg' : 'shadow-sm'}`}>
        {popular && (
          <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
            <Badge className="bg-blue-500 text-white px-3 py-1 flex items-center gap-1">
              <Star className="h-3 w-3" />
              Most Popular
            </Badge>
          </div>
        )}
        
        <CardHeader className="text-center pb-4">
          <CardTitle className="text-xl font-bold">{name}</CardTitle>
          <div className="flex items-center justify-center gap-1 mt-2">
            <DollarSign className="h-5 w-5 text-gray-600" />
            <span className="text-3xl font-bold">N${price}</span>
            <span className="text-gray-600">/month</span>
          </div>
          <p className="text-sm text-gray-600 mt-2">{description}</p>
        </CardHeader>
        
        <CardContent className="pt-0">
          <div className="space-y-4 mb-6">
            {features.map((feature, index) => (
              <div key={index} className="flex items-start gap-2">
                <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-gray-700">{feature}</span>
              </div>
            ))}
          </div>
          
          <Button
            onClick={handleSelectPackage}
            disabled={isProcessing || hasActivePackage}
            className={`w-full ${
              popular 
                ? 'bg-blue-600 hover:bg-blue-700' 
                : 'bg-gray-800 hover:bg-gray-900'
            }`}
          >
            {isProcessing ? 'Processing...' : hasActivePackage ? 'Already Active' : 'Select Package'}
          </Button>
        </CardContent>
      </Card>

      <Dialog open={isPaymentModalOpen} onOpenChange={setIsPaymentModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Complete Your Package Purchase</DialogTitle>
          </DialogHeader>
          <PaymentFlow
            amount={price}
            packageId={id}
            transactionType="subscription"
            onPaymentSubmitted={handlePaymentSubmitted}
          />
        </DialogContent>
      </Dialog>
    </>
  );
};
