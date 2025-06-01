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

// Update the formatCurrency function to use NAD
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-NA', {
    style: 'currency',
    currency: 'NAD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

// Add new Namibian-specific functions
export const formatNAD = (amount: number): string => {
  return formatCurrency(amount);
};

// Namibian tax calculation (18% income tax + 10% withholding for contractors)
export const calculateNamibianTax = (grossAmount: number): {
  incomeTax: number;
  withholdingTax: number;
  totalTax: number;
  netAmount: number;
} => {
  const incomeTax = grossAmount * 0.18; // 18% income tax
  const withholdingTax = grossAmount * 0.10; // 10% withholding tax for contractors
  const totalTax = incomeTax + withholdingTax;
  const netAmount = grossAmount - totalTax;

  return {
    incomeTax,
    withholdingTax,
    totalTax,
    netAmount
  };
};

// Calculate location-based price adjustment
export const calculateLocationPricing = (
  basePrice: number,
  travelDistance: number,
  travelRate: number = 5
): {
  basePrice: number;
  travelCost: number;
  totalPrice: number;
} => {
  const travelCost = travelDistance * travelRate;
  const totalPrice = basePrice + travelCost;

  return {
    basePrice,
    travelCost,
    totalPrice
  };
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
