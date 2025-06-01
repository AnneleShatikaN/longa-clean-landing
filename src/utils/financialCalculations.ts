
// Namibian tax rates and financial calculations
export const NAMIBIAN_TAX_RATES = {
  INCOME_TAX: 0.18, // 18% income tax
  VAT: 0.15, // 15% VAT
  WITHHOLDING_TAX: 0.10 // 10% withholding tax for contractors
};

export const COMMISSION_RATES = {
  ONE_OFF: 0.15, // 15% platform commission for one-off services
  SUBSCRIPTION: 50, // Fixed fee for subscription services (NAD)
  EMERGENCY: 0.20 // 20% commission for emergency bookings
};

export interface PayoutCalculation {
  grossAmount: number;
  platformCommission: number;
  incomeTax: number;
  withholdingTax: number;
  netPayout: number;
  taxableAmount: number;
}

export interface ServiceFinancials {
  servicePrice: number;
  serviceType: 'one-off' | 'subscription';
  isEmergency?: boolean;
  commissionRate?: number;
}

export const calculatePayout = (service: ServiceFinancials): PayoutCalculation => {
  const { servicePrice, serviceType, isEmergency, commissionRate } = service;
  
  let platformCommission = 0;
  
  if (serviceType === 'subscription') {
    platformCommission = COMMISSION_RATES.SUBSCRIPTION;
  } else {
    const rate = isEmergency 
      ? COMMISSION_RATES.EMERGENCY 
      : (commissionRate || COMMISSION_RATES.ONE_OFF);
    platformCommission = servicePrice * rate;
  }
  
  const grossAmount = servicePrice - platformCommission;
  const taxableAmount = grossAmount;
  
  // Calculate taxes
  const incomeTax = taxableAmount * NAMIBIAN_TAX_RATES.INCOME_TAX;
  const withholdingTax = taxableAmount * NAMIBIAN_TAX_RATES.WITHHOLDING_TAX;
  
  const netPayout = grossAmount - incomeTax - withholdingTax;
  
  return {
    grossAmount,
    platformCommission,
    incomeTax,
    withholdingTax,
    netPayout: Math.max(0, netPayout), // Ensure non-negative
    taxableAmount
  };
};

export const calculateBatchPayout = (services: ServiceFinancials[]): PayoutCalculation => {
  const calculations = services.map(calculatePayout);
  
  return calculations.reduce((total, calc) => ({
    grossAmount: total.grossAmount + calc.grossAmount,
    platformCommission: total.platformCommission + calc.platformCommission,
    incomeTax: total.incomeTax + calc.incomeTax,
    withholdingTax: total.withholdingTax + calc.withholdingTax,
    netPayout: total.netPayout + calc.netPayout,
    taxableAmount: total.taxableAmount + calc.taxableAmount
  }), {
    grossAmount: 0,
    platformCommission: 0,
    incomeTax: 0,
    withholdingTax: 0,
    netPayout: 0,
    taxableAmount: 0
  });
};

export const formatCurrency = (amount: number): string => {
  return `N$${amount.toFixed(2)}`;
};

export const getPayoutSchedule = (frequency: 'weekly' | 'bi-weekly' | 'monthly'): Date => {
  const now = new Date();
  const scheduleDate = new Date(now);
  
  switch (frequency) {
    case 'weekly':
      scheduleDate.setDate(now.getDate() + 7);
      break;
    case 'bi-weekly':
      scheduleDate.setDate(now.getDate() + 14);
      break;
    case 'monthly':
      scheduleDate.setMonth(now.getMonth() + 1);
      break;
  }
  
  return scheduleDate;
};
