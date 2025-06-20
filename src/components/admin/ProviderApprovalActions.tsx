
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle, XCircle, MessageSquare } from 'lucide-react';
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
  const [isProcessing, setIsProcessing] = useState(false);
  const [notes, setNotes] = useState('');

  const handleApproval = async (approved: boolean) => {
    if (!notes.trim()) {
      toast({
        title: "Notes Required",
        description: "Please provide verification notes before proceeding.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsProcessing(true);
      console.log(`${approved ? 'Approving' : 'Rejecting'} provider:`, providerId);

      const newStatus = approved ? 'verified' : 'rejected';
      
      const { error } = await supabase
        .from('users')
        .update({
          verification_status: newStatus,
          verified_at: approved ? new Date().toISOString() : null,
          verification_notes: notes,
          is_active: approved
        })
        .eq('id', providerId);

      if (error) throw error;

      // Update banking details verification if approved
      if (approved) {
        const { error: bankingError } = await supabase
          .from('provider_banking_details')
          .update({
            verification_status: 'verified',
            verified_at: new Date().toISOString()
          })
          .eq('provider_id', providerId);

        if (bankingError) {
          console.error('Error updating banking details:', bankingError);
        }

        // Update documents verification
        const { error: docsError } = await supabase
          .from('provider_documents')
          .update({
            verification_status: 'verified',
            verified_at: new Date().toISOString()
          })
          .eq('provider_id', providerId);

        if (docsError) {
          console.error('Error updating documents:', docsError);
        }
      }

      console.log(`Provider ${approved ? 'approved' : 'rejected'} successfully`);

      toast({
        title: approved ? "Provider Approved!" : "Provider Rejected",
        description: `The provider has been ${approved ? 'approved' : 'rejected'} and notified.`,
      });

      onStatusUpdate();
      setNotes('');
    } catch (error) {
      console.error('Error updating provider status:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update provider status.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  if (currentStatus === 'verified') {
    return (
      <Card className="bg-green-50 border-green-200">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 text-green-700">
            <CheckCircle className="h-5 w-5" />
            <span className="font-medium">Provider Verified</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (currentStatus === 'rejected') {
    return (
      <Card className="bg-red-50 border-red-200">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 text-red-700">
            <XCircle className="h-5 w-5" />
            <span className="font-medium">Provider Rejected</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-4 space-y-4">
        <div>
          <Label htmlFor="notes">Verification Notes *</Label>
          <Textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add notes about the verification decision..."
            rows={3}
          />
        </div>

        <div className="flex gap-3">
          <Button
            onClick={() => handleApproval(true)}
            disabled={isProcessing || !notes.trim()}
            className="flex-1"
          >
            <CheckCircle className="h-4 w-4 mr-2" />
            {isProcessing ? 'Approving...' : 'Approve Provider'}
          </Button>
          
          <Button
            variant="destructive"
            onClick={() => handleApproval(false)}
            disabled={isProcessing || !notes.trim()}
            className="flex-1"
          >
            <XCircle className="h-4 w-4 mr-2" />
            {isProcessing ? 'Rejecting...' : 'Reject Provider'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProviderApprovalActions;
