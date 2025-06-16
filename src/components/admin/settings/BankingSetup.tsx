
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Save, Building, CreditCard } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export const BankingSetup = () => {
  const { toast } = useToast();
  
  const [bankingDetails, setBankingDetails] = useState({
    businessName: 'Longa Services',
    bankName: '',
    accountNumber: '',
    branchCode: '',
    swiftCode: '',
    accountType: 'Business Current',
    payoutInstructions: 'Please transfer funds to the account below within 2 business days of service completion.',
    clientPaymentInstructions: 'Please deposit payment to our business account and send proof of payment via WhatsApp.'
  });

  const handleInputChange = (field: string, value: string) => {
    setBankingDetails(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const saveBankingDetails = async () => {
    try {
      // Here you would save to Supabase or your database
      console.log('Saving banking details:', bankingDetails);
      
      toast({
        title: "Banking Details Saved",
        description: "Your banking information has been updated successfully.",
      });
    } catch (error) {
      toast({
        title: "Save Failed",
        description: "Failed to save banking details. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-sm text-gray-600">
        Configure your business banking details for payouts and customer payment instructions.
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="h-5 w-5" />
            Business Banking Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="businessName">Business Name</Label>
              <Input
                id="businessName"
                value={bankingDetails.businessName}
                onChange={(e) => handleInputChange('businessName', e.target.value)}
                placeholder="Your business name"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="bankName">Bank Name</Label>
              <Input
                id="bankName"
                value={bankingDetails.bankName}
                onChange={(e) => handleInputChange('bankName', e.target.value)}
                placeholder="e.g., Bank Windhoek"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="accountNumber">Account Number</Label>
              <Input
                id="accountNumber"
                value={bankingDetails.accountNumber}
                onChange={(e) => handleInputChange('accountNumber', e.target.value)}
                placeholder="Your account number"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="branchCode">Branch Code</Label>
              <Input
                id="branchCode"
                value={bankingDetails.branchCode}
                onChange={(e) => handleInputChange('branchCode', e.target.value)}
                placeholder="Branch code"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="swiftCode">SWIFT Code (Optional)</Label>
              <Input
                id="swiftCode"
                value={bankingDetails.swiftCode}
                onChange={(e) => handleInputChange('swiftCode', e.target.value)}
                placeholder="For international transfers"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="accountType">Account Type</Label>
              <Input
                id="accountType"
                value={bankingDetails.accountType}
                onChange={(e) => handleInputChange('accountType', e.target.value)}
                placeholder="e.g., Business Current"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Payment Instructions
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="payoutInstructions">Provider Payout Instructions</Label>
            <Textarea
              id="payoutInstructions"
              value={bankingDetails.payoutInstructions}
              onChange={(e) => handleInputChange('payoutInstructions', e.target.value)}
              placeholder="Instructions shown to providers about how they'll receive payments"
              rows={3}
            />
            <p className="text-xs text-gray-500">
              This message will be shown to service providers explaining how they'll receive their payouts.
            </p>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="clientPaymentInstructions">Client Payment Instructions</Label>
            <Textarea
              id="clientPaymentInstructions"
              value={bankingDetails.clientPaymentInstructions}
              onChange={(e) => handleInputChange('clientPaymentInstructions', e.target.value)}
              placeholder="Instructions shown to clients about how to make payments"
              rows={3}
            />
            <p className="text-xs text-gray-500">
              This message will be shown to clients explaining how to make payments for services.
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={saveBankingDetails} className="flex items-center gap-2">
          <Save className="h-4 w-4" />
          Save Banking Details
        </Button>
      </div>
    </div>
  );
};
