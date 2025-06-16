
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
  // Related data
  user?: {
    full_name: string;
    email: string;
    phone: string;
  };
  service?: {
    name: string;
  };
  package?: {
    name?: string;
  };
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
      console.error('Error fetching user transactions:', err);
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
      // First fetch the basic transaction data
      const { data: transactionData, error: transactionError } = await supabase
        .from('pending_transactions')
        .select('*')
        .order('created_at', { ascending: false });

      if (transactionError) {
        console.error('Error fetching transactions:', transactionError);
        throw transactionError;
      }

      if (!transactionData || transactionData.length === 0) {
        setTransactions([]);
        return;
      }

      // Get unique user IDs, service IDs, and package IDs
      const userIds = [...new Set(transactionData.map(t => t.user_id).filter(Boolean))];
      const serviceIds = [...new Set(transactionData.map(t => t.service_id).filter(Boolean))];
      const packageIds = [...new Set(transactionData.map(t => t.package_id).filter(Boolean))];

      // Fetch related data in separate queries
      const [usersData, servicesData, packagesData] = await Promise.all([
        userIds.length > 0 ? supabase
          .from('users')
          .select('id, full_name, email, phone')
          .in('id', userIds) : Promise.resolve({ data: [] }),
        serviceIds.length > 0 ? supabase
          .from('services')
          .select('id, name')
          .in('id', serviceIds) : Promise.resolve({ data: [] }),
        packageIds.length > 0 ? supabase
          .from('user_active_packages')
          .select('id')
          .in('id', packageIds) : Promise.resolve({ data: [] })
      ]);

      // Create lookup maps
      const usersMap = new Map((usersData.data || []).map(u => [u.id, u]));
      const servicesMap = new Map((servicesData.data || []).map(s => [s.id, s]));
      const packagesMap = new Map((packagesData.data || []).map(p => [p.id, p]));

      // Combine the data
      const enrichedTransactions = transactionData.map(transaction => ({
        ...transaction,
        transaction_type: transaction.transaction_type as 'subscription' | 'booking',
        user: transaction.user_id ? usersMap.get(transaction.user_id) : undefined,
        service: transaction.service_id ? servicesMap.get(transaction.service_id) : undefined,
        package: transaction.package_id ? packagesMap.get(transaction.package_id) : undefined,
      })) as PendingTransaction[];

      setTransactions(enrichedTransactions);
    } catch (err: any) {
      console.error('Error fetching all transactions:', err);
      setError(err.message);
      toast.error('Failed to fetch transactions', err.message);
      setTransactions([]);
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
