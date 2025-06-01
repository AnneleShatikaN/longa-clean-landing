
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, XCircle, AlertTriangle, CreditCard, Smartphone } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface BankAccount {
  id: string;
  bankName: string;
  accountNumber: string;
  accountHolder: string;
  accountType: 'savings' | 'current';
  isVerified: boolean;
  isPrimary: boolean;
}

interface MobileMoneyAccount {
  id: string;
  provider: 'MTC' | 'Telecom';
  phoneNumber: string;
  accountHolder: string;
  isVerified: boolean;
  isPrimary: boolean;
}

const NAMIBIAN_BANKS = [
  'Bank of Namibia',
  'First National Bank Namibia',
  'Standard Bank Namibia',
  'Nedbank Namibia',
  'Bank Windhoek'
];

export const BankingIntegration = () => {
  const { toast } = useToast();
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [mobileAccounts, setMobileAccounts] = useState<MobileMoneyAccount[]>([]);
  const [activeTab, setActiveTab] = useState<'bank' | 'mobile'>('bank');
  const [isVerifying, setIsVerifying] = useState(false);

  // Bank account form
  const [bankForm, setBankForm] = useState({
    bankName: '',
    accountNumber: '',
    accountHolder: '',
    accountType: 'savings' as const
  });

  // Mobile money form
  const [mobileForm, setMobileForm] = useState({
    provider: 'MTC' as const,
    phoneNumber: '',
    accountHolder: ''
  });

  const validateBankAccount = async (account: Omit<BankAccount, 'id' | 'isVerified' | 'isPrimary'>) => {
    setIsVerifying(true);
    
    // Simulate bank account validation
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Mock validation logic
    const isValid = account.accountNumber.length >= 8 && account.accountHolder.length > 0;
    
    setIsVerifying(false);
    return isValid;
  };

  const validateMobileAccount = async (account: Omit<MobileMoneyAccount, 'id' | 'isVerified' | 'isPrimary'>) => {
    setIsVerifying(true);
    
    // Simulate mobile money validation
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Mock validation - check phone number format
    const isValid = /^\+264\s\d{2}\s\d{3}\s\d{4}$/.test(account.phoneNumber);
    
    setIsVerifying(false);
    return isValid;
  };

  const addBankAccount = async () => {
    if (!bankForm.bankName || !bankForm.accountNumber || !bankForm.accountHolder) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    try {
      const isValid = await validateBankAccount(bankForm);
      
      if (!isValid) {
        toast({
          title: "Validation Failed",
          description: "Could not verify bank account details. Please check and try again.",
          variant: "destructive"
        });
        return;
      }

      const newAccount: BankAccount = {
        id: Date.now().toString(),
        ...bankForm,
        isVerified: true,
        isPrimary: bankAccounts.length === 0
      };

      setBankAccounts(prev => [...prev, newAccount]);
      setBankForm({ bankName: '', accountNumber: '', accountHolder: '', accountType: 'savings' });
      
      toast({
        title: "Bank Account Added",
        description: "Your bank account has been verified and added successfully."
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add bank account. Please try again.",
        variant: "destructive"
      });
    }
  };

  const addMobileAccount = async () => {
    if (!mobileForm.phoneNumber || !mobileForm.accountHolder) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    try {
      const isValid = await validateMobileAccount(mobileForm);
      
      if (!isValid) {
        toast({
          title: "Validation Failed",
          description: "Invalid phone number format. Please use +264 XX XXX XXXX",
          variant: "destructive"
        });
        return;
      }

      const newAccount: MobileMoneyAccount = {
        id: Date.now().toString(),
        ...mobileForm,
        isVerified: true,
        isPrimary: mobileAccounts.length === 0
      };

      setMobileAccounts(prev => [...prev, newAccount]);
      setMobileForm({ provider: 'MTC', phoneNumber: '', accountHolder: '' });
      
      toast({
        title: "Mobile Money Account Added",
        description: "Your mobile money account has been verified and added successfully."
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add mobile money account. Please try again.",
        variant: "destructive"
      });
    }
  };

  const setPrimaryAccount = (type: 'bank' | 'mobile', id: string) => {
    if (type === 'bank') {
      setBankAccounts(prev => prev.map(account => ({
        ...account,
        isPrimary: account.id === id
      })));
    } else {
      setMobileAccounts(prev => prev.map(account => ({
        ...account,
        isPrimary: account.id === id
      })));
    }
    
    toast({
      title: "Primary Account Updated",
      description: "Your primary payment method has been updated."
    });
  };

  const removeAccount = (type: 'bank' | 'mobile', id: string) => {
    if (type === 'bank') {
      setBankAccounts(prev => prev.filter(account => account.id !== id));
    } else {
      setMobileAccounts(prev => prev.filter(account => account.id !== id));
    }
    
    toast({
      title: "Account Removed",
      description: "Payment method has been removed successfully."
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Banking Integration</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex space-x-1 border-b">
              <button
                onClick={() => setActiveTab('bank')}
                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'bank'
                    ? 'border-purple-500 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <CreditCard className="h-4 w-4 inline mr-2" />
                Bank Accounts
              </button>
              <button
                onClick={() => setActiveTab('mobile')}
                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'mobile'
                    ? 'border-purple-500 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <Smartphone className="h-4 w-4 inline mr-2" />
                Mobile Money
              </button>
            </div>

            {activeTab === 'bank' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="bankName">Bank Name</Label>
                    <Select value={bankForm.bankName} onValueChange={(value) => setBankForm(prev => ({ ...prev, bankName: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select bank" />
                      </SelectTrigger>
                      <SelectContent>
                        {NAMIBIAN_BANKS.map(bank => (
                          <SelectItem key={bank} value={bank}>{bank}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="accountType">Account Type</Label>
                    <Select value={bankForm.accountType} onValueChange={(value: 'savings' | 'current') => setBankForm(prev => ({ ...prev, accountType: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="savings">Savings</SelectItem>
                        <SelectItem value="current">Current</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="accountNumber">Account Number</Label>
                    <Input
                      id="accountNumber"
                      value={bankForm.accountNumber}
                      onChange={(e) => setBankForm(prev => ({ ...prev, accountNumber: e.target.value }))}
                      placeholder="Enter account number"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="accountHolder">Account Holder</Label>
                    <Input
                      id="accountHolder"
                      value={bankForm.accountHolder}
                      onChange={(e) => setBankForm(prev => ({ ...prev, accountHolder: e.target.value }))}
                      placeholder="Full name as on account"
                    />
                  </div>
                </div>
                
                <Button onClick={addBankAccount} disabled={isVerifying}>
                  {isVerifying ? 'Verifying...' : 'Add Bank Account'}
                </Button>

                {bankAccounts.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-medium">Your Bank Accounts</h4>
                    {bankAccounts.map(account => (
                      <div key={account.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          <CreditCard className="h-5 w-5 text-gray-400" />
                          <div>
                            <p className="font-medium">{account.bankName}</p>
                            <p className="text-sm text-gray-600">****{account.accountNumber.slice(-4)}</p>
                            <p className="text-sm text-gray-600">{account.accountHolder}</p>
                          </div>
                          <div className="flex space-x-2">
                            {account.isVerified && <Badge variant="outline" className="text-green-600"><CheckCircle className="h-3 w-3 mr-1" />Verified</Badge>}
                            {account.isPrimary && <Badge variant="default">Primary</Badge>}
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          {!account.isPrimary && (
                            <Button variant="outline" size="sm" onClick={() => setPrimaryAccount('bank', account.id)}>
                              Set Primary
                            </Button>
                          )}
                          <Button variant="outline" size="sm" onClick={() => removeAccount('bank', account.id)}>
                            Remove
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'mobile' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="provider">Mobile Money Provider</Label>
                    <Select value={mobileForm.provider} onValueChange={(value: 'MTC' | 'Telecom') => setMobileForm(prev => ({ ...prev, provider: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="MTC">MTC Mobile Money</SelectItem>
                        <SelectItem value="Telecom">Telecom Mobile Money</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="phoneNumber">Phone Number</Label>
                    <Input
                      id="phoneNumber"
                      value={mobileForm.phoneNumber}
                      onChange={(e) => setMobileForm(prev => ({ ...prev, phoneNumber: e.target.value }))}
                      placeholder="+264 81 234 5678"
                    />
                  </div>
                  
                  <div className="md:col-span-2">
                    <Label htmlFor="mobileAccountHolder">Account Holder</Label>
                    <Input
                      id="mobileAccountHolder"
                      value={mobileForm.accountHolder}
                      onChange={(e) => setMobileForm(prev => ({ ...prev, accountHolder: e.target.value }))}
                      placeholder="Full name as registered"
                    />
                  </div>
                </div>
                
                <Button onClick={addMobileAccount} disabled={isVerifying}>
                  {isVerifying ? 'Verifying...' : 'Add Mobile Money Account'}
                </Button>

                {mobileAccounts.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-medium">Your Mobile Money Accounts</h4>
                    {mobileAccounts.map(account => (
                      <div key={account.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          <Smartphone className="h-5 w-5 text-gray-400" />
                          <div>
                            <p className="font-medium">{account.provider} Mobile Money</p>
                            <p className="text-sm text-gray-600">{account.phoneNumber}</p>
                            <p className="text-sm text-gray-600">{account.accountHolder}</p>
                          </div>
                          <div className="flex space-x-2">
                            {account.isVerified && <Badge variant="outline" className="text-green-600"><CheckCircle className="h-3 w-3 mr-1" />Verified</Badge>}
                            {account.isPrimary && <Badge variant="default">Primary</Badge>}
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          {!account.isPrimary && (
                            <Button variant="outline" size="sm" onClick={() => setPrimaryAccount('mobile', account.id)}>
                              Set Primary
                            </Button>
                          )}
                          <Button variant="outline" size="sm" onClick={() => removeAccount('mobile', account.id)}>
                            Remove
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {(bankAccounts.length === 0 && mobileAccounts.length === 0) && (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Please add at least one payment method to receive payouts. We recommend adding both bank and mobile money accounts as backup options.
                </AlertDescription>
              </Alert>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
