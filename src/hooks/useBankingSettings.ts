
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface BankingDetails {
  businessName: string;
  bankName: string;
  accountNumber: string;
  branchCode: string;
  swiftCode: string;
  accountType: string;
}

interface PaymentInstructions {
  payoutInstructions: string;
  clientPaymentInstructions: string;
  whatsappNumber: string;
}

export const useBankingSettings = () => {
  const [bankingDetails, setBankingDetails] = useState<BankingDetails | null>(null);
  const [paymentInstructions, setPaymentInstructions] = useState<PaymentInstructions | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchSettings = async () => {
    try {
      setIsLoading(true);
      
      const { data: settings, error } = await supabase
        .from('global_settings')
        .select('key, value')
        .in('key', ['banking_details', 'payment_instructions']);

      if (error) throw error;

      settings?.forEach((setting) => {
        if (setting.key === 'banking_details') {
          setBankingDetails(setting.value as BankingDetails);
        } else if (setting.key === 'payment_instructions') {
          setPaymentInstructions(setting.value as PaymentInstructions);
        }
      });
    } catch (error) {
      console.error('Error fetching banking settings:', error);
      toast({
        title: "Error",
        description: "Failed to load banking settings",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  return {
    bankingDetails,
    paymentInstructions,
    isLoading,
    refetch: fetchSettings
  };
};
