
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Shield, Save, AlertCircle } from 'lucide-react';

interface BankingDetails {
  bankName: string;
  accountNumber: string;
  accountHolder: string;
  branchCode?: string;
}

interface BankingDetailsFormProps {
  initialData?: BankingDetails;
  onSave: (data: BankingDetails) => Promise<void>;
  isLoading?: boolean;
}

const NAMIBIAN_BANKS = [
  'Bank of Namibia',
  'First National Bank (FNB)',
  'Nedbank Namibia',
  'Standard Bank Namibia',
  'Bank Windhoek',
  'Letshego Bank'
];

const BankingDetailsForm: React.FC<BankingDetailsFormProps> = ({
  initialData,
  onSave,
  isLoading = false
}) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState<BankingDetails>({
    bankName: initialData?.bankName || '',
    accountNumber: initialData?.accountNumber || '',
    accountHolder: initialData?.accountHolder || '',
    branchCode: initialData?.branchCode || ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.bankName) {
      newErrors.bankName = 'Bank name is required';
    }

    if (!formData.accountNumber) {
      newErrors.accountNumber = 'Account number is required';
    } else if (!/^\d{10,12}$/.test(formData.accountNumber.replace(/\s/g, ''))) {
      newErrors.accountNumber = 'Account number must be 10-12 digits';
    }

    if (!formData.accountHolder) {
      newErrors.accountHolder = 'Account holder name is required';
    } else if (formData.accountHolder.length < 2) {
      newErrors.accountHolder = 'Account holder name must be at least 2 characters';
    }

    if (formData.branchCode && !/^\d{6}$/.test(formData.branchCode)) {
      newErrors.branchCode = 'Branch code must be 6 digits';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      await onSave(formData);
      toast({
        title: "Banking details saved",
        description: "Your banking details have been securely updated.",
      });
    } catch (error) {
      toast({
        title: "Error saving banking details",
        description: "Please try again or contact support if the issue persists.",
        variant: "destructive"
      });
    }
  };

  const handleInputChange = (field: keyof BankingDetails, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2 text-sm text-gray-600">
        <AlertCircle className="h-4 w-4" />
        <span>Required for receiving payouts</span>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="bankName">Bank Name *</Label>
          <Select 
            value={formData.bankName} 
            onValueChange={(value) => handleInputChange('bankName', value)}
          >
            <SelectTrigger className={errors.bankName ? 'border-red-500' : ''}>
              <SelectValue placeholder="Select your bank" />
            </SelectTrigger>
            <SelectContent>
              {NAMIBIAN_BANKS.map((bank) => (
                <SelectItem key={bank} value={bank}>
                  {bank}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.bankName && <p className="text-sm text-red-500">{errors.bankName}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="accountNumber">Account Number *</Label>
          <Input
            id="accountNumber"
            type="text"
            value={formData.accountNumber}
            onChange={(e) => handleInputChange('accountNumber', e.target.value)}
            placeholder="1234567890"
            className={errors.accountNumber ? 'border-red-500' : ''}
            maxLength={12}
          />
          {errors.accountNumber && <p className="text-sm text-red-500">{errors.accountNumber}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="accountHolder">Account Holder Name *</Label>
          <Input
            id="accountHolder"
            type="text"
            value={formData.accountHolder}
            onChange={(e) => handleInputChange('accountHolder', e.target.value)}
            placeholder="John Doe"
            className={errors.accountHolder ? 'border-red-500' : ''}
          />
          {errors.accountHolder && <p className="text-sm text-red-500">{errors.accountHolder}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="branchCode">Branch Code (Optional)</Label>
          <Input
            id="branchCode"
            type="text"
            value={formData.branchCode}
            onChange={(e) => handleInputChange('branchCode', e.target.value)}
            placeholder="123456"
            className={errors.branchCode ? 'border-red-500' : ''}
            maxLength={6}
          />
          {errors.branchCode && <p className="text-sm text-red-500">{errors.branchCode}</p>}
        </div>

        <Button 
          type="submit" 
          disabled={isLoading}
          className="w-full bg-green-600 hover:bg-green-700"
        >
          <Save className="h-4 w-4 mr-2" />
          {isLoading ? 'Saving...' : 'Save Banking Details'}
        </Button>
      </form>
    </div>
  );
};

export default BankingDetailsForm;
