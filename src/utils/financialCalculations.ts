
export interface ServiceFinancials {
  serviceId: string;
  clientPrice: number;
  serviceType: 'one-off' | 'subscription';
  commissionPercentage?: number;
  providerFee?: number;
  isEmergency?: boolean;
  isWeekend?: boolean;
  weekendMarkup?: number;
  weekendBonus?: number;
}

export interface PayoutCalculation {
  grossAmount: number;
  platformCommission: number;
  incomeTax: number;
  withholdingTax: number;
  totalTax: number;
  weekendBonus: number;
  netPayout: number;
}

export const calculatePayout = (serviceData: ServiceFinancials): PayoutCalculation => {
  let grossAmount: number;
  let platformCommission: number;
  let weekendBonus: number = 0;

  // Apply weekend bonus if applicable
  if (serviceData.isWeekend) {
    weekendBonus = serviceData.weekendBonus || 50; // Default N$50 weekend bonus
  }

  if (serviceData.serviceType === 'subscription') {
    // Fixed payout for package services
    grossAmount = (serviceData.providerFee || 0) + weekendBonus;
    platformCommission = serviceData.clientPrice - (serviceData.providerFee || 0);
  } else {
    // Percentage-based commission for one-off services
    const commissionRate = serviceData.isEmergency ? 0.20 : (serviceData.commissionPercentage || 15) / 100;
    platformCommission = serviceData.clientPrice * commissionRate;
    grossAmount = serviceData.clientPrice - platformCommission + weekendBonus;
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
    weekendBonus,
    netPayout
  };
};

export const calculateWeekendClientPrice = (basePrice: number, weekendMarkup: number = 20): number => {
  return basePrice * (1 + weekendMarkup / 100);
};

export const isWeekendDate = (date: Date): boolean => {
  const day = date.getDay();
  return day === 0 || day === 6; // Sunday (0) or Saturday (6)
};

export const formatCurrency = (amount: number): string => {
  return `N$${amount.toFixed(2)}`;
};

export const calculateCommissionRate = (serviceType: string, isEmergency: boolean = false): number => {
  if (serviceType === 'subscription') return 0; // Fixed fee, not percentage
  return isEmergency ? 20 : 15; // 20% for emergency, 15% for regular
};

// New utility functions for the configuration system
export const validatePayoutConfig = (
  serviceType: 'one-off' | 'subscription', 
  providerFee?: number, 
  commissionPercentage?: number
): string | null => {
  if (serviceType === 'subscription') {
    if (!providerFee || providerFee <= 0) {
      return 'Provider fee must be greater than 0 for package services';
    }
  } else {
    if (!commissionPercentage || commissionPercentage < 0 || commissionPercentage > 100) {
      return 'Commission percentage must be between 0 and 100 for individual services';
    }
  }
  return null;
};

export const calculateProviderEarnings = (
  clientPrice: number,
  serviceType: 'one-off' | 'subscription',
  providerFee?: number,
  commissionPercentage?: number,
  isWeekend: boolean = false,
  weekendBonus: number = 50
): number => {
  let baseEarnings: number;
  
  if (serviceType === 'subscription') {
    baseEarnings = providerFee || 0;
  } else {
    const commission = commissionPercentage || 15;
    baseEarnings = clientPrice * (1 - commission / 100);
  }
  
  return baseEarnings + (isWeekend ? weekendBonus : 0);
};

export const calculatePlatformShare = (
  clientPrice: number,
  serviceType: 'one-off' | 'subscription',
  providerFee?: number,
  commissionPercentage?: number
): number => {
  if (serviceType === 'subscription') {
    return clientPrice - (providerFee || 0);
  } else {
    const commission = commissionPercentage || 15;
    return clientPrice * (commission / 100);
  }
};
