import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { CreditCard, Save, Plus, Edit, Trash2, CheckCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface BankingDetail {
  id: string;
  bank_name: string;
  account_number: string;
  account_holder_name: string;
  routing_number?: string;
  account_type: string;
  swift_code?: string;
  verification_status: string;
  is_primary: boolean;
  created_at: string;
  updated_at: string;
}

export const ProviderBankingDetails = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [bankingDetails, setBankingDetails] = useState<BankingDetail[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    bank_name: '',
    account_number: '',
    account_holder_name: '',
    routing_number: '',
    account_type: 'checking',
    swift_code: '',
    is_primary: false
  });

  useEffect(() => {
    if (user?.id) {
      fetchBankingDetails();
    }
  }, [user?.id]);

  const fetchBankingDetails = async () => {
    if (!user?.id) return;

    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('provider_banking_details')
        .select('*')
        .eq('provider_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setBankingDetails(data || []);
    } catch (error) {
      console.error('Error fetching banking details:', error);
      toast({
        title: "Error",
        description: "Failed to fetch banking details",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const saveBankingDetail = async () => {
    if (!user?.id) return;

    try {
      if (!formData.bank_name || !formData.account_number || !formData.account_holder_name) {
        toast({
          title: "Error",
          description: "Please fill in all required fields",
          variant: "destructive",
        });
        return;
      }

      const bankingData = {
        ...formData,
        provider_id: user.id,
        verification_status: 'pending',
        updated_at: new Date().toISOString()
      };

      let error;
      if (editingId) {
        ({ error } = await supabase
          .from('provider_banking_details')
          .update(bankingData)
          .eq('id', editingId));
      } else {
        ({ error } = await supabase
          .from('provider_banking_details')
          .insert([{
            ...bankingData,
            created_at: new Date().toISOString()
          }]));
      }

      if (error) throw error;

      toast({
        title: "Success",
        description: `Banking details ${editingId ? 'updated' : 'added'} successfully`,
      });

      resetForm();
      fetchBankingDetails();
    } catch (error) {
      console.error('Error saving banking details:', error);
      toast({
        title: "Error",
        description: "Failed to save banking details",
        variant: "destructive",
      });
    }
  };

  const editBankingDetail = (detail: BankingDetail) => {
    setFormData({
      bank_name: detail.bank_name,
      account_number: detail.account_number,
      account_holder_name: detail.account_holder_name,
      routing_number: detail.routing_number || '',
      account_type: detail.account_type,
      swift_code: detail.swift_code || '',
      is_primary: detail.is_primary
    });
    setEditingId(detail.id);
    setIsEditing(true);
  };

  const deleteBankingDetail = async (id: string) => {
    if (!confirm('Are you sure you want to delete this banking detail?')) return;

    try {
      const { error } = await supabase
        .from('provider_banking_details')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Banking details deleted successfully",
      });

      fetchBankingDetails();
    } catch (error) {
      console.error('Error deleting banking details:', error);
      toast({
        title: "Error",
        description: "Failed to delete banking details",
        variant: "destructive",
      });
    }
  };

  const setPrimaryAccount = async (id: string) => {
    if (!user?.id) return;

    try {
      // First, unset all primary accounts
      await supabase
        .from('provider_banking_details')
        .update({ is_primary: false })
        .eq('provider_id', user.id);

      // Then set the selected one as primary
      const { error } = await supabase
        .from('provider_banking_details')
        .update({ is_primary: true })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Primary account updated successfully",
      });

      fetchBankingDetails();
    } catch (error) {
      console.error('Error setting primary account:', error);
      toast({
        title: "Error",
        description: "Failed to update primary account",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setFormData({
      bank_name: '',
      account_number: '',
      account_holder_name: '',
      routing_number: '',
      account_type: 'checking',
      swift_code: '',
      is_primary: false
    });
    setEditingId(null);
    setIsEditing(false);
  };

  const getVerificationBadge = (status: string) => {
    switch (status) {
      case 'verified':
        return <Badge variant="default" className="bg-green-600">Verified</Badge>;
      case 'pending':
        return <Badge variant="secondary">Pending Verification</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Banking Details</h3>
          <p className="text-sm text-gray-600">Manage your payment information for receiving payouts</p>
        </div>
        {!isEditing && (
          <Button onClick={() => setIsEditing(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Banking Details
          </Button>
        )}
      </div>

      {/* Form */}
      {isEditing && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              {editingId ? 'Edit Banking Details' : 'Add Banking Details'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="bank_name">Bank Name *</Label>
                <Input
                  id="bank_name"
                  value={formData.bank_name}
                  onChange={(e) => setFormData({ ...formData, bank_name: e.target.value })}
                  placeholder="e.g., Bank Windhoek"
                />
              </div>

              <div>
                <Label htmlFor="account_holder_name">Account Holder Name *</Label>
                <Input
                  id="account_holder_name"
                  value={formData.account_holder_name}
                  onChange={(e) => setFormData({ ...formData, account_holder_name: e.target.value })}
                  placeholder="Full name as on bank account"
                />
              </div>

              <div>
                <Label htmlFor="account_number">Account Number *</Label>
                <Input
                  id="account_number"
                  value={formData.account_number}
                  onChange={(e) => setFormData({ ...formData, account_number: e.target.value })}
                  placeholder="Account number"
                />
              </div>

              <div>
                <Label htmlFor="account_type">Account Type</Label>
                <Select 
                  value={formData.account_type} 
                  onValueChange={(value) => setFormData({ ...formData, account_type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="checking">Checking</SelectItem>
                    <SelectItem value="savings">Savings</SelectItem>
                    <SelectItem value="business">Business</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="routing_number">Branch Code</Label>
                <Input
                  id="routing_number"
                  value={formData.routing_number}
                  onChange={(e) => setFormData({ ...formData, routing_number: e.target.value })}
                  placeholder="Branch code (optional)"
                />
              </div>

              <div>
                <Label htmlFor="swift_code">SWIFT Code</Label>
                <Input
                  id="swift_code"
                  value={formData.swift_code}
                  onChange={(e) => setFormData({ ...formData, swift_code: e.target.value })}
                  placeholder="SWIFT code (optional)"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <Button onClick={saveBankingDetail}>
                <Save className="h-4 w-4 mr-2" />
                {editingId ? 'Update' : 'Save'} Banking Details
              </Button>
              <Button variant="outline" onClick={resetForm}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Existing Banking Details */}
      <Card>
        <CardHeader>
          <CardTitle>Your Banking Details</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p>Loading banking details...</p>
          ) : bankingDetails.length === 0 ? (
            <div className="text-center py-8">
              <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Banking Details</h3>
              <p className="text-gray-600 mb-4">Add your banking details to receive payouts</p>
              <Button onClick={() => setIsEditing(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Banking Details
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {bankingDetails.map((detail) => (
                <div key={detail.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium">{detail.bank_name}</h3>
                      {detail.is_primary && (
                        <Badge variant="outline">Primary</Badge>
                      )}
                      {getVerificationBadge(detail.verification_status)}
                    </div>
                    <div className="flex gap-2">
                      {!detail.is_primary && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setPrimaryAccount(detail.id)}
                        >
                          <CheckCircle className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => editBankingDetail(detail)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteBankingDetail(detail.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Account Holder:</span> {detail.account_holder_name}
                    </div>
                    <div>
                      <span className="font-medium">Account Number:</span> ****{detail.account_number.slice(-4)}
                    </div>
                    <div>
                      <span className="font-medium">Account Type:</span> {detail.account_type}
                    </div>
                    {detail.routing_number && (
                      <div>
                        <span className="font-medium">Branch Code:</span> {detail.routing_number}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
