
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Save, Building, CreditCard } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useGlobalSettings } from '@/hooks/useGlobalSettings';

export const BankingSetup = () => {
  const { toast } = useToast();
  const { settings, updateSetting, isLoading } = useGlobalSettings();
  
  const [bankingDetails, setBankingDetails] = useState({
    businessName: 'Longa Services',
    bankName: '',
    accountNumber: '',
    branchCode: '',
    swiftCode: '',
    accountType: 'Business Current'
  });

  const [paymentInstructions, setPaymentInstructions] = useState({
    payoutInstructions: 'Please transfer funds to the account below within 2 business days of service completion.',
    clientPaymentInstructions: 'Please deposit payment to our business account and send proof of payment via WhatsApp.',
    whatsappNumber: ''
  });

  const [isSaving, setIsSaving] = useState(false);

  // Load existing settings
  useEffect(() => {
    if (settings.banking_details) {
      setBankingDetails(prev => ({
        ...prev,
        ...settings.banking_details
      }));
    }
    
    if (settings.payment_instructions) {
      setPaymentInstructions(prev => ({
        ...prev,
        ...settings.payment_instructions
      }));
    }
  }, [settings]);

  const handleBankingChange = (field: string, value: string) => {
    setBankingDetails(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleInstructionsChange = (field: string, value: string) => {
    setPaymentInstructions(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const saveBankingDetails = async () => {
    try {
      setIsSaving(true);
      
      // Save banking details
      const bankingSuccess = await updateSetting('banking_details', bankingDetails);
      
      // Save payment instructions
      const instructionsSuccess = await updateSetting('payment_instructions', paymentInstructions);
      
      if (bankingSuccess && instructionsSuccess) {
        toast({
          title: "Banking Details Saved",
          description: "Your banking information and payment instructions have been updated successfully.",
        });
      } else {
        throw new Error('Failed to save settings');
      }
    } catch (error) {
      console.error('Error saving banking details:', error);
      toast({
        title: "Save Failed",
        description: "Failed to save banking details. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-gray-600">Loading banking settings...</p>
        </div>
      </div>
    );
  }

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
                onChange={(e) => handleBankingChange('businessName', e.target.value)}
                placeholder="Your business name"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="bankName">Bank Name</Label>
              <Input
                id="bankName"
                value={bankingDetails.bankName}
                onChange={(e) => handleBankingChange('bankName', e.target.value)}
                placeholder="e.g., Bank Windhoek"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="accountNumber">Account Number</Label>
              <Input
                id="accountNumber"
                value={bankingDetails.accountNumber}
                onChange={(e) => handleBankingChange('accountNumber', e.target.value)}
                placeholder="Your account number"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="branchCode">Branch Code</Label>
              <Input
                id="branchCode"
                value={bankingDetails.branchCode}
                onChange={(e) => handleBankingChange('branchCode', e.target.value)}
                placeholder="Branch code"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="swiftCode">SWIFT Code (Optional)</Label>
              <Input
                id="swiftCode"
                value={bankingDetails.swiftCode}
                onChange={(e) => handleBankingChange('swiftCode', e.target.value)}
                placeholder="For international transfers"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="accountType">Account Type</Label>
              <Input
                id="accountType"
                value={bankingDetails.accountType}
                onChange={(e) => handleBankingChange('accountType', e.target.value)}
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
              value={paymentInstructions.payoutInstructions}
              onChange={(e) => handleInstructionsChange('payoutInstructions', e.target.value)}
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
              value={paymentInstructions.clientPaymentInstructions}
              onChange={(e) => handleInstructionsChange('clientPaymentInstructions', e.target.value)}
              placeholder="Instructions shown to clients about how to make payments"
              rows={3}
            />
            <p className="text-xs text-gray-500">
              This message will be shown to clients explaining how to make payments for services.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="whatsappNumber">WhatsApp Number for Payment Proof</Label>
            <Input
              id="whatsappNumber"
              value={paymentInstructions.whatsappNumber}
              onChange={(e) => handleInstructionsChange('whatsappNumber', e.target.value)}
              placeholder="e.g., +264 81 123 4567"
            />
            <p className="text-xs text-gray-500">
              WhatsApp number where clients should send proof of payment.
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button 
          onClick={saveBankingDetails} 
          className="flex items-center gap-2"
          disabled={isSaving}
        >
          <Save className="h-4 w-4" />
          {isSaving ? 'Saving...' : 'Save Banking Details'}
        </Button>
      </div>
    </div>
  );
};
