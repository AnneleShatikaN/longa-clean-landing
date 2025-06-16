
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Package } from 'lucide-react';
import { PaymentFlow } from '@/components/payment/PaymentFlow';

interface PackageCardProps {
  id: string;
  name: string;
  price: number;
  description: string;
  features: string[];
  popular?: boolean;
}

export const PackageCard: React.FC<PackageCardProps> = ({
  id,
  name,
  price,
  description,
  features,
  popular = false
}) => {
  const [showPaymentFlow, setShowPaymentFlow] = useState(false);

  const getTransactionData = () => ({
    transaction_type: 'subscription' as const,
    package_id: id,
    amount: price
  });

  return (
    <>
      <Card className={`relative ${popular ? 'border-blue-500 shadow-lg' : ''}`}>
        {popular && (
          <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
            <Badge className="bg-blue-500 hover:bg-blue-600">Most Popular</Badge>
          </div>
        )}
        
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            {name}
          </CardTitle>
          <div className="text-3xl font-bold">
            N${price}
            <span className="text-lg font-normal text-gray-600">/month</span>
          </div>
          <p className="text-gray-600">{description}</p>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="space-y-2">
            {features.map((feature, index) => (
              <div key={index} className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-600" />
                <span className="text-sm">{feature}</span>
              </div>
            ))}
          </div>
          
          <Button 
            className="w-full" 
            variant={popular ? 'default' : 'outline'}
            onClick={() => setShowPaymentFlow(true)}
          >
            Get Started
          </Button>
        </CardContent>
      </Card>

      <PaymentFlow
        isOpen={showPaymentFlow}
        onClose={() => setShowPaymentFlow(false)}
        transactionData={getTransactionData()}
        title="Subscribe to Package"
        description={`Subscribe to ${name} and start accessing premium services.`}
      />
    </>
  );
};
