
import { useState, useEffect } from 'react';
import { usePaymentInstructions } from './usePaymentInstructions';

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

/**
 * @deprecated Use usePaymentInstructions hook instead
 * This hook is maintained for backward compatibility
 */
export const useBankingSettings = () => {
  const { paymentInstructions, isLoading } = usePaymentInstructions();
  const [bankingDetails, setBankingDetails] = useState<BankingSettings | null>(null);
  const [paymentInstructionsState, setPaymentInstructionsState] = useState<PaymentInstructions | null>(null);

  useEffect(() => {
    if (paymentInstructions) {
      setBankingDetails({
        businessName: paymentInstructions.account_name,
        bankName: paymentInstructions.bank_name,
        accountNumber: paymentInstructions.account_number,
        branchCode: paymentInstructions.branch_code,
        swiftCode: paymentInstructions.swift_code,
      });

      setPaymentInstructionsState({
        clientPaymentInstructions: paymentInstructions.additional_instructions,
        whatsappNumber: '+264 XX XXX XXXX', // Default placeholder
      });
    }
  }, [paymentInstructions]);

  return {
    bankingDetails,
    paymentInstructions: paymentInstructionsState,
    isLoading,
    refetch: () => {}, // Deprecated
  };
};
