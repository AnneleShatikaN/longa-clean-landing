import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { CreditCard, Save, Plus, Edit, Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface BankingInstruction {
  id: string;
  bank_name: string;
  account_name: string;
  account_number: string;
  branch_code?: string;
  swift_code?: string;
  reference_format: string;
  instructions: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export const BankingInstructionsManager = () => {
  const { toast } = useToast();
  const [instructions, setInstructions] = useState<BankingInstruction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    bank_name: '',
    account_name: '',
    account_number: '',
    branch_code: '',
    swift_code: '',
    reference_format: 'SERVICE-{SERVICE_ID}-{USER_ID}',
    instructions: 'Please use the reference number provided when making your payment.',
    is_active: true
  });

  useEffect(() => {
    fetchInstructions();
  }, []);

  const fetchInstructions = async () => {
    try {
      setIsLoading(true);
      
      // First check if the table exists, if not create it
      const { data, error } = await supabase
        .from('banking_instructions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        // Table might not exist, we'll handle this gracefully
        console.log('Banking instructions table may not exist yet');
        setInstructions([]);
      } else {
        setInstructions(data || []);
      }
    } catch (error) {
      console.error('Error fetching banking instructions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveInstruction = async () => {
    try {
      if (!formData.bank_name || !formData.account_name || !formData.account_number) {
        toast({
          title: "Error",
          description: "Please fill in all required fields",
          variant: "destructive",
        });
        return;
      }

      const instructionData = {
        ...formData,
        updated_at: new Date().toISOString()
      };

      let error;
      if (editingId) {
        ({ error } = await supabase
          .from('banking_instructions')
          .update(instructionData)
          .eq('id', editingId));
      } else {
        ({ error } = await supabase
          .from('banking_instructions')
          .insert([{
            ...instructionData,
            created_at: new Date().toISOString()
          }]));
      }

      if (error) throw error;

      toast({
        title: "Success",
        description: `Banking instruction ${editingId ? 'updated' : 'created'} successfully`,
      });

      resetForm();
      fetchInstructions();
    } catch (error) {
      console.error('Error saving banking instruction:', error);
      toast({
        title: "Error",
        description: "Failed to save banking instruction",
        variant: "destructive",
      });
    }
  };

  const editInstruction = (instruction: BankingInstruction) => {
    setFormData({
      bank_name: instruction.bank_name,
      account_name: instruction.account_name,
      account_number: instruction.account_number,
      branch_code: instruction.branch_code || '',
      swift_code: instruction.swift_code || '',
      reference_format: instruction.reference_format,
      instructions: instruction.instructions,
      is_active: instruction.is_active
    });
    setEditingId(instruction.id);
  };

  const deleteInstruction = async (id: string) => {
    if (!confirm('Are you sure you want to delete this banking instruction?')) return;

    try {
      const { error } = await supabase
        .from('banking_instructions')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Banking instruction deleted successfully",
      });

      fetchInstructions();
    } catch (error) {
      console.error('Error deleting banking instruction:', error);
      toast({
        title: "Error",
        description: "Failed to delete banking instruction",
        variant: "destructive",
      });
    }
  };

  const toggleStatus = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('banking_instructions')
        .update({ 
          is_active: !currentStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Banking instruction ${!currentStatus ? 'activated' : 'deactivated'}`,
      });

      fetchInstructions();
    } catch (error) {
      console.error('Error updating status:', error);
      toast({
        title: "Error",
        description: "Failed to update status",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setFormData({
      bank_name: '',
      account_name: '',
      account_number: '',
      branch_code: '',
      swift_code: '',
      reference_format: 'SERVICE-{SERVICE_ID}-{USER_ID}',
      instructions: 'Please use the reference number provided when making your payment.',
      is_active: true
    });
    setEditingId(null);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Banking Instructions</h2>
        <p className="text-gray-600">Manage payment instructions shown to clients</p>
      </div>

      {/* Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            {editingId ? 'Edit Banking Instruction' : 'Add Banking Instruction'}
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
              <Label htmlFor="account_name">Account Name *</Label>
              <Input
                id="account_name"
                value={formData.account_name}
                onChange={(e) => setFormData({ ...formData, account_name: e.target.value })}
                placeholder="Account holder name"
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
              <Label htmlFor="branch_code">Branch Code</Label>
              <Input
                id="branch_code"
                value={formData.branch_code}
                onChange={(e) => setFormData({ ...formData, branch_code: e.target.value })}
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

            <div>
              <Label htmlFor="is_active">Status</Label>
              <Select 
                value={formData.is_active.toString()} 
                onValueChange={(value) => setFormData({ ...formData, is_active: value === 'true' })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="true">Active</SelectItem>
                  <SelectItem value="false">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="reference_format">Reference Format</Label>
            <Input
              id="reference_format"
              value={formData.reference_format}
              onChange={(e) => setFormData({ ...formData, reference_format: e.target.value })}
              placeholder="e.g., SERVICE-{SERVICE_ID}-{USER_ID}"
            />
            <p className="text-xs text-gray-500 mt-1">
              Use {'{SERVICE_ID}'}, {'{USER_ID}'}, {'{BOOKING_ID}'} as placeholders
            </p>
          </div>

          <div>
            <Label htmlFor="instructions">Additional Instructions</Label>
            <Textarea
              id="instructions"
              value={formData.instructions}
              onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
              placeholder="Additional payment instructions for clients..."
              rows={3}
            />
          </div>

          <div className="flex gap-2">
            <Button onClick={saveInstruction}>
              <Save className="h-4 w-4 mr-2" />
              {editingId ? 'Update' : 'Save'} Instruction
            </Button>
            {editingId && (
              <Button variant="outline" onClick={resetForm}>
                Cancel
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Existing Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>Current Banking Instructions</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p>Loading...</p>
          ) : instructions.length === 0 ? (
            <p className="text-gray-500">No banking instructions configured yet.</p>
          ) : (
            <div className="space-y-4">
              {instructions.map((instruction) => (
                <div key={instruction.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium">{instruction.bank_name}</h3>
                      <Badge variant={instruction.is_active ? 'default' : 'secondary'}>
                        {instruction.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => editInstruction(instruction)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleStatus(instruction.id, instruction.is_active)}
                      >
                        {instruction.is_active ? 'Deactivate' : 'Activate'}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteInstruction(instruction.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Account Name:</span> {instruction.account_name}
                    </div>
                    <div>
                      <span className="font-medium">Account Number:</span> {instruction.account_number}
                    </div>
                    {instruction.branch_code && (
                      <div>
                        <span className="font-medium">Branch Code:</span> {instruction.branch_code}
                      </div>
                    )}
                    {instruction.swift_code && (
                      <div>
                        <span className="font-medium">SWIFT Code:</span> {instruction.swift_code}
                      </div>
                    )}
                  </div>
                  <div className="mt-2 text-sm">
                    <span className="font-medium">Reference Format:</span> {instruction.reference_format}
                  </div>
                  <div className="mt-2 text-sm">
                    <span className="font-medium">Instructions:</span> {instruction.instructions}
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
