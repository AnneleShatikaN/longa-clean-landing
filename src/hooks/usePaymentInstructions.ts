
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface PaymentInstructions {
  id: string;
  account_name: string;
  bank_name: string;
  account_number: string;
  branch_code?: string;
  swift_code?: string;
  reference_format: string;
  additional_instructions?: string;
  is_active: boolean;
}

export const usePaymentInstructions = () => {
  const [paymentInstructions, setPaymentInstructions] = useState<PaymentInstructions | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPaymentInstructions();
  }, []);

  const fetchPaymentInstructions = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const { data, error } = await supabase
        .from('payment_instructions')
        .select('*')
        .eq('is_active', true)
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching payment instructions:', error);
        setError('Failed to fetch payment instructions');
        return;
      }

      setPaymentInstructions(data);
    } catch (error) {
      console.error('Error fetching payment instructions:', error);
      setError('Failed to fetch payment instructions');
    } finally {
      setIsLoading(false);
    }
  };

  const generateReference = (serviceId?: string, userId?: string) => {
    if (!paymentInstructions?.reference_format) {
      return `REF-${Date.now()}`;
    }

    let reference = paymentInstructions.reference_format;
    
    if (serviceId) {
      reference = reference.replace('{SERVICE_ID}', serviceId.slice(0, 8).toUpperCase());
    }
    
    if (userId) {
      reference = reference.replace('{USER_ID}', userId.slice(0, 8).toUpperCase());
    }
    
    // Add timestamp if no dynamic replacements
    if (!serviceId && !userId) {
      reference = reference.replace('{SERVICE_ID}', 'SVC').replace('{USER_ID}', Date.now().toString().slice(-6));
    }
    
    return reference;
  };

  return {
    paymentInstructions,
    isLoading,
    error,
    refetch: fetchPaymentInstructions,
    generateReference,
  };
};
