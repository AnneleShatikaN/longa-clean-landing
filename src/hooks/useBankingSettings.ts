
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface BankingSettings {
  businessName?: string;
  bankName?: string;
  accountNumber?: string;
  branchCode?: string;
  swiftCode?: string;
}

interface PaymentInstructions {
  clientPaymentInstructions?: string;
  whatsappNumber?: string;
}

export const useBankingSettings = () => {
  const [bankingDetails, setBankingDetails] = useState<BankingSettings | null>(null);
  const [paymentInstructions, setPaymentInstructions] = useState<PaymentInstructions | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchBankingSettings();
  }, []);

  const fetchBankingSettings = async () => {
    try {
      setIsLoading(true);
      
      // Fetch active banking instructions
      const { data: instructions, error } = await supabase
        .from('banking_instructions')
        .select('*')
        .eq('is_active', true)
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching banking settings:', error);
        return;
      }

      if (instructions) {
        setBankingDetails({
          businessName: instructions.account_name,
          bankName: instructions.bank_name,
          accountNumber: instructions.account_number,
          branchCode: instructions.branch_code,
          swiftCode: instructions.swift_code,
        });

        setPaymentInstructions({
          clientPaymentInstructions: instructions.instructions,
          whatsappNumber: '+264 XX XXX XXXX', // Default placeholder
        });
      }
    } catch (error) {
      console.error('Error fetching banking settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    bankingDetails,
    paymentInstructions,
    isLoading,
    refetch: fetchBankingSettings,
  };
};
