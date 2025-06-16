
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useEnhancedToast } from '@/hooks/useEnhancedToast';

export interface PendingTransaction {
  id: string;
  user_id: string;
  transaction_type: 'subscription' | 'booking';
  service_id?: string;
  package_id?: string;
  amount: number;
  reference_number?: string;
  payment_proof_url?: string;
  whatsapp_number?: string;
  booking_details?: any;
  status: 'pending' | 'approved' | 'declined';
  admin_notes?: string;
  approved_by?: string;
  approved_at?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateTransactionData {
  transaction_type: 'subscription' | 'booking';
  service_id?: string;
  package_id?: string;
  amount: number;
  booking_details?: any;
}

interface RpcResponse {
  success: boolean;
  error?: string;
  message?: string;
  transaction_type?: string;
}

export const usePendingTransactions = () => {
  const { user } = useAuth();
  const { toast } = useEnhancedToast();
  const [transactions, setTransactions] = useState<PendingTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateReference = (type: string) => {
    const prefix = type === 'subscription' ? 'SUB' : 'BKG';
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.random().toString(36).substring(2, 5).toUpperCase();
    return `${prefix}${timestamp}${random}`;
  };

  const fetchUserTransactions = async () => {
    if (!user) return;

    setIsLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from('pending_transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Type assertion to ensure proper typing
      const typedTransactions = (data || []).map(item => ({
        ...item,
        transaction_type: item.transaction_type as 'subscription' | 'booking'
      })) as PendingTransaction[];
      
      setTransactions(typedTransactions);
    } catch (err: any) {
      setError(err.message);
      toast.error('Failed to fetch transactions', err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const createTransaction = async (data: CreateTransactionData): Promise<string | null> => {
    if (!user) {
      toast.error('User not authenticated');
      return null;
    }

    setIsLoading(true);
    setError(null);

    try {
      const reference = generateReference(data.transaction_type);
      
      const { data: transaction, error } = await supabase
        .from('pending_transactions')
        .insert({
          user_id: user.id,
          transaction_type: data.transaction_type,
          service_id: data.service_id,
          package_id: data.package_id,
          amount: data.amount,
          reference_number: reference,
          booking_details: data.booking_details || {},
          status: 'pending'
        })
        .select()
        .single();

      if (error) throw error;

      toast.success('Transaction created successfully', 'Please proceed with the bank deposit.');
      await fetchUserTransactions();
      return reference;
    } catch (err: any) {
      setError(err.message);
      toast.error('Failed to create transaction', err.message);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAllTransactions = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from('pending_transactions')
        .select(`
          *,
          user:users(full_name, email),
          service:services(name),
          package:user_active_packages(*)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Type assertion to ensure proper typing
      const typedTransactions = (data || []).map(item => ({
        ...item,
        transaction_type: item.transaction_type as 'subscription' | 'booking'
      })) as PendingTransaction[];
      
      setTransactions(typedTransactions);
    } catch (err: any) {
      setError(err.message);
      toast.error('Failed to fetch transactions', err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const approveTransaction = async (transactionId: string, adminNotes?: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .rpc('approve_pending_transaction', {
          transaction_id: transactionId,
          admin_notes_param: adminNotes
        });

      if (error) throw error;

      const response = data as unknown as RpcResponse;
      if (response.success) {
        toast.success('Transaction approved successfully');
        await fetchAllTransactions();
        return true;
      } else {
        throw new Error(response.error || 'Unknown error');
      }
    } catch (err: any) {
      setError(err.message);
      toast.error('Failed to approve transaction', err.message);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const declineTransaction = async (transactionId: string, adminNotes?: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .rpc('decline_pending_transaction', {
          transaction_id: transactionId,
          admin_notes_param: adminNotes
        });

      if (error) throw error;

      const response = data as unknown as RpcResponse;
      if (response.success) {
        toast.success('Transaction declined');
        await fetchAllTransactions();
        return true;
      } else {
        throw new Error(response.error || 'Unknown error');
      }
    } catch (err: any) {
      setError(err.message);
      toast.error('Failed to decline transaction', err.message);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchUserTransactions();
    }
  }, [user]);

  return {
    transactions,
    isLoading,
    error,
    createTransaction,
    fetchUserTransactions,
    fetchAllTransactions,
    approveTransaction,
    declineTransaction
  };
};
