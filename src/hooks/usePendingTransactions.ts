
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export const usePendingTransactions = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [transactions, setTransactions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchTransactions = async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('pending_transactions')
        .select(`
          *,
          service:services(*),
          package:subscription_packages(*),
          user:users(*)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTransactions(data || []);
    } catch (error) {
      console.error('Error fetching pending transactions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAllTransactions = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('pending_transactions')
        .select(`
          *,
          service:services(*),
          package:subscription_packages(*),
          user:users(*)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTransactions(data || []);
    } catch (error) {
      console.error('Error fetching all pending transactions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const approveTransaction = async (transactionId: string, adminNotes?: string) => {
    try {
      const { data, error } = await supabase.rpc('approve_pending_transaction', {
        transaction_id: transactionId,
        admin_notes_param: adminNotes
      });

      if (error) throw error;

      toast({
        title: "Transaction Approved",
        description: "The transaction has been approved successfully.",
      });

      await fetchAllTransactions();
      return true;
    } catch (error) {
      console.error('Error approving transaction:', error);
      toast({
        title: "Approval Failed",
        description: "Failed to approve the transaction. Please try again.",
        variant: "destructive",
      });
      return false;
    }
  };

  const declineTransaction = async (transactionId: string, adminNotes?: string) => {
    try {
      const { error } = await supabase
        .from('pending_transactions')
        .update({
          status: 'declined',
          admin_notes: adminNotes,
          approved_by: user?.id,
          approved_at: new Date().toISOString()
        })
        .eq('id', transactionId);

      if (error) throw error;

      toast({
        title: "Transaction Declined",
        description: "The transaction has been declined.",
      });

      await fetchAllTransactions();
      return true;
    } catch (error) {
      console.error('Error declining transaction:', error);
      toast({
        title: "Decline Failed",
        description: "Failed to decline the transaction. Please try again.",
        variant: "destructive",
      });
      return false;
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [user]);

  return {
    transactions,
    isLoading,
    refetch: fetchTransactions,
    fetchAllTransactions,
    approveTransaction,
    declineTransaction,
  };
};
