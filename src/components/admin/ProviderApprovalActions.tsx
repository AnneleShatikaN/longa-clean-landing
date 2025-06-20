
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle, XCircle, Loader2, AlertCircle } from 'lucide-react';
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
  const [notesError, setNotesError] = useState('');

  const validateNotes = () => {
    if (!notes.trim()) {
      setNotesError('Verification notes are required before proceeding.');
      return false;
    }
    if (notes.trim().length < 10) {
      setNotesError('Please provide more detailed notes (at least 10 characters).');
      return false;
    }
    setNotesError('');
    return true;
  };

  const handleApproval = async (approved: boolean) => {
    if (!validateNotes()) {
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

      if (error) {
        console.error('Database error:', error);
        throw new Error(`Failed to update provider status: ${error.message}`);
      }

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
        description: `The provider has been ${approved ? 'approved' : 'rejected'} and will be notified automatically.`,
        action: (
          <div className="flex items-center gap-2">
            {approved ? (
              <CheckCircle className="h-4 w-4 text-green-500" />
            ) : (
              <XCircle className="h-4 w-4 text-red-500" />
            )}
            <span>Complete</span>
          </div>
        ),
      });

      onStatusUpdate();
      setNotes('');
    } catch (error) {
      console.error('Error updating provider status:', error);
      toast({
        title: "Update Failed",
        description: error instanceof Error ? error.message : "Failed to update provider status. Please check your connection and try again.",
        variant: "destructive",
        action: (
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-red-500" />
            <span>Error</span>
          </div>
        ),
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleNotesChange = (value: string) => {
    setNotes(value);
    if (notesError && value.trim().length >= 10) {
      setNotesError('');
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
          <Label htmlFor="notes" className="flex items-center gap-1">
            Verification Notes 
            <span className="text-red-500">*</span>
          </Label>
          <Textarea
            id="notes"
            value={notes}
            onChange={(e) => handleNotesChange(e.target.value)}
            placeholder="Add detailed notes about the verification decision, including what was reviewed and any specific findings..."
            rows={3}
            className={notesError ? 'border-red-500' : ''}
          />
          {notesError && (
            <p className="text-sm text-red-500 mt-1 flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              {notesError}
            </p>
          )}
          <p className="text-xs text-gray-500 mt-1">
            These notes will be recorded for audit purposes and may be shared with the provider.
          </p>
        </div>

        <div className="flex gap-3">
          <Button
            onClick={() => handleApproval(true)}
            disabled={isProcessing}
            className="flex-1"
          >
            {isProcessing ? (
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Approving...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                Approve Provider
              </div>
            )}
          </Button>
          
          <Button
            variant="destructive"
            onClick={() => handleApproval(false)}
            disabled={isProcessing}
            className="flex-1"
          >
            {isProcessing ? (
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Rejecting...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <XCircle className="h-4 w-4" />
                Reject Provider
              </div>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProviderApprovalActions;
