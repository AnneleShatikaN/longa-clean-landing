
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';

interface PaymentSetupProps {
  onComplete: () => void;
}

export const PaymentSetup: React.FC<PaymentSetupProps> = ({ onComplete }) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    provider: '',
    testMode: true,
    currency: 'NAD',
    processingFee: '2.5',
    minimumAmount: '10',
    maximumAmount: '10000',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.provider) {
      toast({
        title: "Error",
        description: "Please select a payment provider",
        variant: "destructive",
      });
      return;
    }

    localStorage.setItem('payment_setup', JSON.stringify(formData));
    
    toast({
      title: "Success",
      description: "Payment configuration saved successfully",
    });
    
    onComplete();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Payment Gateway Configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="provider">Payment Provider *</Label>
            <Select value={formData.provider} onValueChange={(value) => setFormData(prev => ({ ...prev, provider: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Select payment provider" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="stripe">Stripe</SelectItem>
                <SelectItem value="paypal">PayPal</SelectItem>
                <SelectItem value="flutterwave">Flutterwave</SelectItem>
                <SelectItem value="paystack">Paystack</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="testMode"
              checked={formData.testMode}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, testMode: checked }))}
            />
            <Label htmlFor="testMode">Test Mode (Sandbox)</Label>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Payment Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="currency">Default Currency</Label>
            <Select value={formData.currency} onValueChange={(value) => setFormData(prev => ({ ...prev, currency: value }))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="NAD">NAD - Namibian Dollar</SelectItem>
                <SelectItem value="USD">USD - US Dollar</SelectItem>
                <SelectItem value="EUR">EUR - Euro</SelectItem>
                <SelectItem value="ZAR">ZAR - South African Rand</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="processingFee">Processing Fee (%)</Label>
              <Input
                id="processingFee"
                type="number"
                step="0.1"
                value={formData.processingFee}
                onChange={(e) => setFormData(prev => ({ ...prev, processingFee: e.target.value }))}
                placeholder="2.5"
              />
            </div>
            
            <div>
              <Label htmlFor="minimumAmount">Minimum Amount</Label>
              <Input
                id="minimumAmount"
                type="number"
                value={formData.minimumAmount}
                onChange={(e) => setFormData(prev => ({ ...prev, minimumAmount: e.target.value }))}
                placeholder="10"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="maximumAmount">Maximum Amount</Label>
            <Input
              id="maximumAmount"
              type="number"
              value={formData.maximumAmount}
              onChange={(e) => setFormData(prev => ({ ...prev, maximumAmount: e.target.value }))}
              placeholder="10000"
            />
          </div>
        </CardContent>
      </Card>

      <Button type="submit" className="w-full">
        Save Payment Configuration
      </Button>
    </form>
  );
};
