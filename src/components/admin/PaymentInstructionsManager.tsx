
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { usePaymentInstructions } from '@/hooks/usePaymentInstructions';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Save, AlertCircle } from 'lucide-react';

export const PaymentInstructionsManager = () => {
  const { paymentInstructions, isLoading, refetch } = usePaymentInstructions();
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    account_name: '',
    bank_name: '',
    account_number: '',
    branch_code: '',
    swift_code: '',
    reference_format: 'SERVICE-{SERVICE_ID}-{USER_ID}',
    additional_instructions: '',
    is_active: true,
  });

  React.useEffect(() => {
    if (paymentInstructions) {
      setFormData({
        account_name: paymentInstructions.account_name || '',
        bank_name: paymentInstructions.bank_name || '',
        account_number: paymentInstructions.account_number || '',
        branch_code: paymentInstructions.branch_code || '',
        swift_code: paymentInstructions.swift_code || '',
        reference_format: paymentInstructions.reference_format || 'SERVICE-{SERVICE_ID}-{USER_ID}',
        additional_instructions: paymentInstructions.additional_instructions || '',
        is_active: paymentInstructions.is_active,
      });
    }
  }, [paymentInstructions]);

  const handleSave = async () => {
    try {
      setIsSaving(true);

      if (paymentInstructions) {
        // Update existing instructions
        const { error } = await supabase
          .from('payment_instructions')
          .update({
            ...formData,
            updated_at: new Date().toISOString(),
          })
          .eq('id', paymentInstructions.id);

        if (error) throw error;
      } else {
        // Create new instructions
        const { error } = await supabase
          .from('payment_instructions')
          .insert([formData]);

        if (error) throw error;
      }

      toast({
        title: "Success",
        description: "Payment instructions saved successfully",
      });

      refetch();
    } catch (error) {
      console.error('Error saving payment instructions:', error);
      toast({
        title: "Error",
        description: "Failed to save payment instructions",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertCircle className="h-5 w-5" />
          Payment Instructions Management
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="account_name">Account Name *</Label>
            <Input
              id="account_name"
              value={formData.account_name}
              onChange={(e) => setFormData(prev => ({ ...prev, account_name: e.target.value }))}
              placeholder="Business Account Name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="bank_name">Bank Name *</Label>
            <Input
              id="bank_name"
              value={formData.bank_name}
              onChange={(e) => setFormData(prev => ({ ...prev, bank_name: e.target.value }))}
              placeholder="Bank Windhoek"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="account_number">Account Number *</Label>
            <Input
              id="account_number"
              value={formData.account_number}
              onChange={(e) => setFormData(prev => ({ ...prev, account_number: e.target.value }))}
              placeholder="1234567890"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="branch_code">Branch Code</Label>
            <Input
              id="branch_code"
              value={formData.branch_code}
              onChange={(e) => setFormData(prev => ({ ...prev, branch_code: e.target.value }))}
              placeholder="481772"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="swift_code">SWIFT Code</Label>
            <Input
              id="swift_code"
              value={formData.swift_code}
              onChange={(e) => setFormData(prev => ({ ...prev, swift_code: e.target.value }))}
              placeholder="BWLINANX"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="reference_format">Reference Format</Label>
            <Input
              id="reference_format"
              value={formData.reference_format}
              onChange={(e) => setFormData(prev => ({ ...prev, reference_format: e.target.value }))}
              placeholder="SERVICE-{SERVICE_ID}-{USER_ID}"
            />
            <p className="text-xs text-gray-500">
              Use {'{SERVICE_ID}'} and {'{USER_ID}'} as placeholders
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="additional_instructions">Additional Instructions</Label>
          <Textarea
            id="additional_instructions"
            value={formData.additional_instructions}
            onChange={(e) => setFormData(prev => ({ ...prev, additional_instructions: e.target.value }))}
            placeholder="Please use the reference number provided when making your payment..."
            rows={3}
          />
        </div>

        <div className="flex items-center space-x-2">
          <Switch
            id="is_active"
            checked={formData.is_active}
            onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
          />
          <Label htmlFor="is_active">Active (visible to clients)</Label>
        </div>

        <Button
          onClick={handleSave}
          disabled={isSaving || !formData.account_name || !formData.bank_name || !formData.account_number}
          className="w-full"
        >
          <Save className="h-4 w-4 mr-2" />
          {isSaving ? 'Saving...' : 'Save Payment Instructions'}
        </Button>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800">
            <strong>Note:</strong> These payment instructions will be displayed to all clients 
            when they need to make payments. Make sure all details are accurate before saving.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
