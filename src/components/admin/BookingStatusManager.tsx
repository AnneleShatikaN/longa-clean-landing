
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  RefreshCw, 
  XCircle, 
  Clock, 
  AlertTriangle, 
  DollarSign,
  Calendar,
  UserX
} from 'lucide-react';

interface BookingStatusManagerProps {
  booking: any;
  onStatusUpdated: () => void;
}

export const BookingStatusManager: React.FC<BookingStatusManagerProps> = ({
  booking,
  onStatusUpdated
}) => {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [actionType, setActionType] = useState<string>('');
  const [reason, setReason] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const openDialog = (type: string) => {
    setActionType(type);
    setReason('');
    setIsDialogOpen(true);
  };

  const handleStatusAction = async () => {
    if (!reason.trim() && actionType !== 'reschedule') {
      toast({
        title: "Reason Required",
        description: "Please provide a reason for this action",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      let updateData: any = {
        updated_at: new Date().toISOString()
      };

      switch (actionType) {
        case 'rollback':
          updateData.status = 'in_progress';
          break;
        case 'cancel_with_refund':
          updateData.status = 'cancelled';
          break;
        case 'mark_no_show_client':
          updateData.status = 'cancelled';
          break;
        case 'mark_no_show_provider':
          updateData.status = 'cancelled';
          updateData.provider_id = null;
          updateData.assigned_at = null;
          break;
        default:
          throw new Error('Invalid action type');
      }

      const { error } = await supabase
        .from('bookings')
        .update(updateData)
        .eq('id', booking.id);

      if (error) throw error;

      toast({
        title: "Status Updated",
        description: `Booking status has been updated successfully`,
      });

      onStatusUpdated();
      setIsDialogOpen(false);
    } catch (error: any) {
      console.error('Error updating booking status:', error);
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update booking status",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusActions = () => {
    const actions = [];

    // Rollback from completed to in_progress
    if (booking.status === 'completed') {
      actions.push({
        key: 'rollback',
        label: 'Rollback to In Progress',
        icon: RefreshCw,
        variant: 'outline' as const,
        description: 'Move back to in progress if issues arise'
      });
    }

    // Cancel with refund
    if (['pending', 'accepted', 'in_progress'].includes(booking.status)) {
      actions.push({
        key: 'cancel_with_refund',
        label: 'Cancel with Refund',
        icon: XCircle,
        variant: 'destructive' as const,
        description: 'Cancel booking and process refund'
      });
    }

    // No-show tracking
    if (['accepted', 'in_progress'].includes(booking.status)) {
      actions.push({
        key: 'mark_no_show_client',
        label: 'Mark Client No-Show',
        icon: UserX,
        variant: 'outline' as const,
        description: 'Client did not show up for appointment'
      });

      actions.push({
        key: 'mark_no_show_provider',
        label: 'Mark Provider No-Show',
        icon: AlertTriangle,
        variant: 'outline' as const,
        description: 'Provider did not show up for appointment'
      });
    }

    return actions;
  };

  const getActionDescription = () => {
    switch (actionType) {
      case 'rollback':
        return 'This will move the booking back to "In Progress" status. Use this if there are issues with a completed job that need to be addressed.';
      case 'cancel_with_refund':
        return 'This will cancel the booking and initiate a refund process. The client will be notified and the provider will be released from the assignment.';
      case 'mark_no_show_client':
        return 'This will mark the client as a no-show. The provider may still be eligible for a partial payment depending on your policies.';
      case 'mark_no_show_provider':
        return 'This will mark the provider as a no-show. The booking will be made available for reassignment and the client will be notified.';
      default:
        return '';
    }
  };

  const actions = getStatusActions();

  if (actions.length === 0) {
    return null;
  }

  return (
    <>
      <div className="space-y-2">
        <Label className="text-sm font-medium">Booking Status Actions</Label>
        <div className="flex flex-wrap gap-2">
          {actions.map((action) => {
            const IconComponent = action.icon;
            return (
              <Button
                key={action.key}
                variant={action.variant}
                size="sm"
                onClick={() => openDialog(action.key)}
                className="flex items-center gap-2"
              >
                <IconComponent className="h-4 w-4" />
                {action.label}
              </Button>
            );
          })}
        </div>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {actions.find(a => a.key === actionType)?.label}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                {getActionDescription()}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="reason">Reason for Action *</Label>
              <Textarea
                id="reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Provide a detailed reason for this action..."
                rows={3}
                required
              />
            </div>

            <div className="p-3 bg-gray-50 rounded-lg">
              <div className="text-sm space-y-1">
                <p><strong>Booking:</strong> {booking.service?.name}</p>
                <p><strong>Current Status:</strong> 
                  <Badge className="ml-2">{booking.status}</Badge>
                </p>
                <p><strong>Client:</strong> {booking.client?.full_name}</p>
                {booking.provider && (
                  <p><strong>Provider:</strong> {booking.provider.full_name}</p>
                )}
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <Button 
                variant="outline" 
                onClick={() => setIsDialogOpen(false)}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleStatusAction}
                disabled={isLoading || !reason.trim()}
                variant={actionType === 'cancel_with_refund' ? 'destructive' : 'default'}
              >
                {isLoading ? 'Processing...' : 'Confirm Action'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
