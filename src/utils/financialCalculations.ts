
export interface ServiceFinancials {
  serviceId: string;
  clientPrice: number;
  serviceType: 'one-off' | 'subscription';
  commissionPercentage?: number;
  providerFee?: number;
  isEmergency?: boolean;
}

export interface PayoutCalculation {
  grossAmount: number;
  platformCommission: number;
  incomeTax: number;
  withholdingTax: number;
  totalTax: number;
  netPayout: number;
}

export const calculatePayout = (serviceData: ServiceFinancials): PayoutCalculation => {
  let grossAmount: number;
  let platformCommission: number;

  if (serviceData.serviceType === 'subscription') {
    // Fixed commission for subscriptions
    platformCommission = 50; // NAD 50 fixed fee
    grossAmount = serviceData.providerFee || serviceData.clientPrice - platformCommission;
  } else {
    // Percentage-based commission for one-off services
    const commissionRate = serviceData.isEmergency ? 0.20 : (serviceData.commissionPercentage || 15) / 100;
    platformCommission = serviceData.clientPrice * commissionRate;
    grossAmount = serviceData.clientPrice - platformCommission;
  }

  // Namibian tax calculations
  const incomeTax = grossAmount * 0.18; // 18% income tax
  const withholdingTax = grossAmount * 0.10; // 10% withholding tax
  const totalTax = incomeTax + withholdingTax;
  const netPayout = grossAmount - totalTax;

  return {
    grossAmount,
    platformCommission,
    incomeTax,
    withholdingTax,
    totalTax,
    netPayout
  };
};

export const formatCurrency = (amount: number): string => {
  return `N$${amount.toFixed(2)}`;
};

export const calculateCommissionRate = (serviceType: string, isEmergency: boolean = false): number => {
  if (serviceType === 'subscription') return 0; // Fixed fee, not percentage
  return isEmergency ? 20 : 15; // 20% for emergency, 15% for regular
};
