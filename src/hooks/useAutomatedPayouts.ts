
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface PayoutRule {
  id: string;
  provider_id: string;
  rule_name: string;
  minimum_payout_amount: number;
  payout_frequency: string;
  payout_day: number;
  auto_approve_under_amount: number;
  performance_bonus_enabled: boolean;
  performance_bonus_threshold: number;
  performance_bonus_percentage: number;
  is_active: boolean;
}

export interface AutomatedBatch {
  id: string;
  batch_name: string;
  batch_type: string;
  total_amount: number;
  payout_count: number;
  status: string;
  scheduled_date: string;
  created_at: string;
  approved_at: string | null;
  processed_at: string | null;
}

export const useAutomatedPayouts = () => {
  const [payoutRules, setPayoutRules] = useState<PayoutRule[]>([]);
  const [automatedBatches, setAutomatedBatches] = useState<AutomatedBatch[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchPayoutRules = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('payout_automation_rules')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPayoutRules(data || []);
    } catch (err: any) {
      setError(err.message);
      console.error('Error fetching payout rules:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchAutomatedBatches = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('automated_payout_batches')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      setAutomatedBatches(data || []);
    } catch (err: any) {
      setError(err.message);
      console.error('Error fetching automated batches:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createPayoutRule = useCallback(async (ruleData: Partial<PayoutRule>) => {
    try {
      // Ensure rule_name is provided since it's required
      const ruleToInsert = {
        ...ruleData,
        rule_name: ruleData.rule_name || 'Default Rule'
      };

      const { data, error } = await supabase
        .from('payout_automation_rules')
        .insert(ruleToInsert)
        .select()
        .single();

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Payout rule created successfully',
      });

      await fetchPayoutRules();
      return { success: true, data };
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to create payout rule';
      setError(errorMessage);
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
      return { success: false, error: errorMessage };
    }
  }, [fetchPayoutRules, toast]);

  const updatePayoutRule = useCallback(async (ruleId: string, updates: Partial<PayoutRule>) => {
    try {
      const { data, error } = await supabase
        .from('payout_automation_rules')
        .update(updates)
        .eq('id', ruleId)
        .select()
        .single();

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Payout rule updated successfully',
      });

      await fetchPayoutRules();
      return { success: true, data };
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to update payout rule';
      setError(errorMessage);
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
      return { success: false, error: errorMessage };
    }
  }, [fetchPayoutRules, toast]);

  const deletePayoutRule = useCallback(async (ruleId: string) => {
    try {
      const { error } = await supabase
        .from('payout_automation_rules')
        .delete()
        .eq('id', ruleId);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Payout rule deleted successfully',
      });

      await fetchPayoutRules();
      return { success: true };
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to delete payout rule';
      setError(errorMessage);
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
      return { success: false, error: errorMessage };
    }
  }, [fetchPayoutRules, toast]);

  const triggerAutomatedPayouts = useCallback(async () => {
    try {
      setIsLoading(true);
      
      // Create a new automated batch
      const { data: batchData, error: batchError } = await supabase
        .from('automated_payout_batches')
        .insert({
          batch_name: `AUTO_BATCH_${new Date().toISOString().split('T')[0]}`,
          batch_type: 'scheduled',
          status: 'processing'
        })
        .select()
        .single();

      if (batchError) throw batchError;

      toast({
        title: 'Success',
        description: 'Automated payout processing initiated',
      });

      await fetchAutomatedBatches();
      return { success: true, batch: batchData };
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to trigger automated payouts';
      setError(errorMessage);
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  }, [fetchAutomatedBatches, toast]);

  const approveBatch = useCallback(async (batchId: string, notes?: string) => {
    try {
      const { error } = await supabase
        .from('automated_payout_batches')
        .update({
          status: 'approved',
          approved_at: new Date().toISOString(),
          approval_notes: notes
        })
        .eq('id', batchId);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Batch approved successfully',
      });

      await fetchAutomatedBatches();
      return { success: true };
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to approve batch';
      setError(errorMessage);
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
      return { success: false, error: errorMessage };
    }
  }, [fetchAutomatedBatches, toast]);

  return {
    payoutRules,
    automatedBatches,
    isLoading,
    error,
    fetchPayoutRules,
    fetchAutomatedBatches,
    createPayoutRule,
    updatePayoutRule,
    deletePayoutRule,
    triggerAutomatedPayouts,
    approveBatch
  };
};
