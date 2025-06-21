
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface ProviderApprovalActionsProps {
  providerId: string;
  currentStatus: string;
  onStatusUpdate: () => void;
}

const ProviderApprovalActions: React.FC<ProviderApprovalActionsProps> = ({
  providerId,
  currentStatus,
  onStatusUpdate
}) => {
  const { toast } = useToast();
  const [isUpdating, setIsUpdating] = useState(false);
  const [notes, setNotes] = useState('');

  const updateVerificationStatus = async (newStatus: 'verified' | 'rejected') => {
    try {
      setIsUpdating(true);

      const { error } = await supabase
        .from('users')
        .update({
          verification_status: newStatus,
          verified_at: newStatus === 'verified' ? new Date().toISOString() : null,
          verification_notes: notes || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', providerId);

      if (error) throw error;

      toast({
        title: `Provider ${newStatus}`,
        description: `The provider's verification status has been updated to ${newStatus}.`,
      });

      onStatusUpdate();
      setNotes('');
    } catch (error) {
      console.error('Error updating verification status:', error);
      toast({
        title: "Update failed",
        description: "Failed to update provider verification status. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  if (currentStatus !== 'under_review') {
    return null;
  }

  return (
    <div className="border-t pt-4 space-y-4">
      <div>
        <Label htmlFor="notes">Admin Notes (Optional)</Label>
        <Textarea
          id="notes"
          placeholder="Add any notes about this verification..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          disabled={isUpdating}
        />
      </div>
      
      <div className="flex gap-3">
        <Button
          onClick={() => updateVerificationStatus('verified')}
          disabled={isUpdating}
          className="bg-green-600 hover:bg-green-700"
        >
          {isUpdating ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <CheckCircle className="h-4 w-4 mr-2" />
          )}
          Approve
        </Button>
        
        <Button
          onClick={() => updateVerificationStatus('rejected')}
          disabled={isUpdating}
          variant="destructive"
        >
          {isUpdating ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <XCircle className="h-4 w-4 mr-2" />
          )}
          Reject
        </Button>
      </div>
    </div>
  );
};

export default ProviderApprovalActions;
