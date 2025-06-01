
import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { PayoutData, payoutSchema } from '@/schemas/validation';
import { calculatePayout, ServiceFinancials } from '@/utils/financialCalculations';

export interface Payout {
  id: number;
  providerId: number;
  providerName: string;
  bookingIds: number[];
  grossAmount: number;
  platformCommission: number;
  incomeTax: number;
  withholdingTax: number;
  netPayout: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  payoutDate?: string;
  processedDate?: string;
  paymentMethod: 'bank_transfer' | 'mobile_money' | 'cash';
  paymentReference?: string;
  type: 'weekly_auto' | 'manual' | 'instant';
  createdAt: string;
  updatedAt: string;
  urgencyLevel?: 'normal' | 'urgent' | 'emergency';
  approved: boolean;
  approvedBy?: string;
  failureReason?: string;
  retryCount: number;
  scheduledDate?: string;
}

export interface PayoutExport {
  id: number;
  exportDate: string;
  period: string;
  totalAmount: number;
  payoutCount: number;
  status: 'generated' | 'downloaded' | 'sent';
  fileFormat: 'excel' | 'csv' | 'pdf';
  createdAt: string;
}

interface PayoutState {
  payouts: Payout[];
  payoutExports: PayoutExport[];
  isLoading: boolean;
  error: string | null;
}

type PayoutAction = 
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'ADD_PAYOUT'; payload: Payout }
  | { type: 'UPDATE_PAYOUT'; payload: { id: number; updates: Partial<Payout> } }
  | { type: 'DELETE_PAYOUT'; payload: number }
  | { type: 'SET_PAYOUTS'; payload: Payout[] }
  | { type: 'ADD_EXPORT'; payload: PayoutExport }
  | { type: 'SET_EXPORTS'; payload: PayoutExport[] };

const initialState: PayoutState = {
  payouts: [],
  payoutExports: [],
  isLoading: false,
  error: null
};

function payoutReducer(state: PayoutState, action: PayoutAction): PayoutState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload, isLoading: false };
    case 'ADD_PAYOUT':
      return { ...state, payouts: [...state.payouts, action.payload] };
    case 'UPDATE_PAYOUT':
      return {
        ...state,
        payouts: state.payouts.map(payout =>
          payout.id === action.payload.id 
            ? { ...payout, ...action.payload.updates, updatedAt: new Date().toISOString() }
            : payout
        )
      };
    case 'DELETE_PAYOUT':
      return {
        ...state,
        payouts: state.payouts.filter(payout => payout.id !== action.payload)
      };
    case 'SET_PAYOUTS':
      return { ...state, payouts: action.payload };
    case 'ADD_EXPORT':
      return { ...state, payoutExports: [action.payload, ...state.payoutExports] };
    case 'SET_EXPORTS':
      return { ...state, payoutExports: action.payload };
    default:
      return state;
  }
}

interface PayoutContextType extends PayoutState {
  createPayout: (serviceData: ServiceFinancials & { providerId: number; providerName: string; bookingIds: number[] }) => Promise<Payout>;
  processPayout: (id: number) => Promise<void>;
  updatePayoutStatus: (id: number, status: Payout['status']) => Promise<void>;
  exportPayouts: (period: string, format: 'excel' | 'csv' | 'pdf') => Promise<PayoutExport>;
  getPayoutById: (id: number) => Payout | undefined;
  getPayoutsByProvider: (providerId: number) => Payout[];
  getPayoutsByStatus: (status: Payout['status']) => Payout[];
  calculateJobPayout: (serviceData: ServiceFinancials) => ReturnType<typeof calculatePayout>;
  approvePayout: (id: number, approvedBy: string) => Promise<void>;
  schedulePayout: (id: number, scheduleDate: string) => Promise<void>;
  retryFailedPayout: (id: number) => Promise<void>;
}

const PayoutContext = createContext<PayoutContextType | undefined>(undefined);

export const PayoutProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(payoutReducer, initialState);

  const createPayout = async (payoutData: ServiceFinancials & { providerId: number; providerName: string; bookingIds: number[] }): Promise<Payout> => {
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });

    try {
      // Check for duplicate payouts for same bookings
      const existingPayout = state.payouts.find(payout => 
        payout.bookingIds.some(id => payoutData.bookingIds.includes(id)) &&
        payout.status !== 'failed'
      );
      
      if (existingPayout) {
        throw new Error('Payout already exists for one or more of these bookings');
      }

      // Calculate real payout amounts using financial calculations
      const calculation = calculatePayout(payoutData);

      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 500));

      const newPayout: Payout = {
        id: Date.now(),
        providerId: payoutData.providerId,
        providerName: payoutData.providerName,
        bookingIds: payoutData.bookingIds,
        grossAmount: calculation.grossAmount,
        platformCommission: calculation.platformCommission,
        incomeTax: calculation.incomeTax,
        withholdingTax: calculation.withholdingTax,
        netPayout: calculation.netPayout,
        paymentMethod: 'bank_transfer', // Default, can be updated
        type: 'weekly_auto', // Default type
        status: 'pending',
        payoutDate: new Date().toISOString().split('T')[0],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        approved: false,
        retryCount: 0,
        urgencyLevel: payoutData.isEmergency ? 'emergency' : 'normal'
      };

      dispatch({ type: 'ADD_PAYOUT', payload: newPayout });
      dispatch({ type: 'SET_LOADING', payload: false });
      
      return newPayout;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Payout creation failed';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      throw error;
    }
  };

  const processPayout = async (id: number): Promise<void> => {
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });

    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Simulate 95% success rate
      const isSuccess = Math.random() > 0.05;

      if (isSuccess) {
        const updates: Partial<Payout> = {
          status: 'completed',
          processedDate: new Date().toISOString().split('T')[0],
          paymentReference: `AUTO${Date.now()}`
        };
        dispatch({ type: 'UPDATE_PAYOUT', payload: { id, updates } });
      } else {
        const updates: Partial<Payout> = {
          status: 'failed',
          failureReason: 'Network timeout during payment processing',
          retryCount: (state.payouts.find(p => p.id === id)?.retryCount || 0) + 1
        };
        dispatch({ type: 'UPDATE_PAYOUT', payload: { id, updates } });
      }

      dispatch({ type: 'SET_LOADING', payload: false });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Payout processing failed';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      throw error;
    }
  };

  const updatePayoutStatus = async (id: number, status: Payout['status']): Promise<void> => {
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });

    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 500));

      const updates: Partial<Payout> = { status };
      
      if (status === 'completed') {
        updates.processedDate = new Date().toISOString().split('T')[0];
        updates.paymentReference = `MANUAL${Date.now()}`;
      }

      dispatch({ type: 'UPDATE_PAYOUT', payload: { id, updates } });
      dispatch({ type: 'SET_LOADING', payload: false });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Status update failed';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      throw error;
    }
  };

  const approvePayout = async (id: number, approvedBy: string): Promise<void> => {
    dispatch({ type: 'SET_LOADING', payload: true });

    try {
      await new Promise(resolve => setTimeout(resolve, 300));

      const updates: Partial<Payout> = {
        approved: true,
        approvedBy,
        status: 'pending'
      };

      dispatch({ type: 'UPDATE_PAYOUT', payload: { id, updates } });
      dispatch({ type: 'SET_LOADING', payload: false });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Approval failed';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      throw error;
    }
  };

  const schedulePayout = async (id: number, scheduleDate: string): Promise<void> => {
    dispatch({ type: 'SET_LOADING', payload: true });

    try {
      await new Promise(resolve => setTimeout(resolve, 300));

      const updates: Partial<Payout> = {
        scheduledDate: scheduleDate,
        type: 'manual'
      };

      dispatch({ type: 'UPDATE_PAYOUT', payload: { id, updates } });
      dispatch({ type: 'SET_LOADING', payload: false });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Scheduling failed';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      throw error;
    }
  };

  const retryFailedPayout = async (id: number): Promise<void> => {
    const payout = state.payouts.find(p => p.id === id);
    if (!payout || payout.status !== 'failed') return;

    if (payout.retryCount >= 3) {
      throw new Error('Maximum retry attempts reached');
    }

    await processPayout(id);
  };

  const exportPayouts = async (period: string, format: 'excel' | 'csv' | 'pdf'): Promise<PayoutExport> => {
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });

    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      const newExport: PayoutExport = {
        id: Date.now(),
        exportDate: new Date().toISOString().split('T')[0],
        period,
        totalAmount: state.payouts.reduce((sum, p) => sum + p.netPayout, 0),
        payoutCount: state.payouts.length,
        status: 'generated',
        fileFormat: format,
        createdAt: new Date().toISOString()
      };

      dispatch({ type: 'ADD_EXPORT', payload: newExport });
      dispatch({ type: 'SET_LOADING', payload: false });
      
      return newExport;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Export failed';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      throw error;
    }
  };

  const getPayoutById = (id: number): Payout | undefined => {
    return state.payouts.find(payout => payout.id === id);
  };

  const getPayoutsByProvider = (providerId: number): Payout[] => {
    return state.payouts.filter(payout => payout.providerId === providerId);
  };

  const getPayoutsByStatus = (status: Payout['status']): Payout[] => {
    return state.payouts.filter(payout => payout.status === status);
  };

  const calculateJobPayout = (serviceData: ServiceFinancials) => {
    return calculatePayout(serviceData);
  };

  const value: PayoutContextType = {
    ...state,
    createPayout,
    processPayout,
    updatePayoutStatus,
    exportPayouts,
    getPayoutById,
    getPayoutsByProvider,
    getPayoutsByStatus,
    calculateJobPayout,
    approvePayout,
    schedulePayout,
    retryFailedPayout
  };

  return (
    <PayoutContext.Provider value={value}>
      {children}
    </PayoutContext.Provider>
  );
};

export const usePayouts = () => {
  const context = useContext(PayoutContext);
  if (context === undefined) {
    throw new Error('usePayouts must be used within a PayoutProvider');
  }
  return context;
};
