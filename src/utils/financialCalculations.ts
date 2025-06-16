
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
    // Fixed commission for subscriptions
    platformCommission = 50; // NAD 50 fixed fee
    grossAmount = (serviceData.providerFee || serviceData.clientPrice - platformCommission) + weekendBonus;
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
