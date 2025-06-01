
import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { PayoutData, payoutSchema } from '@/schemas/validation';

export interface Payout {
  id: number;
  providerId: number;
  providerName: string;
  bookingIds: number[];
  totalEarnings: number;
  commission: number;
  netPayout: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  payoutDate?: string;
  processedDate?: string;
  paymentMethod: 'bank_transfer' | 'mobile_money' | 'cash';
  paymentReference?: string;
  type: 'weekly_auto' | 'manual' | 'instant';
  createdAt: string;
  updatedAt: string;
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
  createPayout: (payoutData: PayoutData & { providerName: string }) => Promise<Payout>;
  processPayout: (id: number) => Promise<void>;
  updatePayoutStatus: (id: number, status: Payout['status']) => Promise<void>;
  exportPayouts: (period: string, format: 'excel' | 'csv' | 'pdf') => Promise<PayoutExport>;
  getPayoutById: (id: number) => Payout | undefined;
  getPayoutsByProvider: (providerId: number) => Payout[];
  getPayoutsByStatus: (status: Payout['status']) => Payout[];
  calculatePayout: (bookingIds: number[], providerId: number) => { totalEarnings: number; commission: number; netPayout: number };
}

const PayoutContext = createContext<PayoutContextType | undefined>(undefined);

export const PayoutProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(payoutReducer, initialState);

  const createPayout = async (payoutData: PayoutData & { providerName: string }): Promise<Payout> => {
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });

    try {
      // Validate input data
      const validatedData = payoutSchema.parse(payoutData);
      
      // Check for duplicate payouts for same bookings
      const existingPayout = state.payouts.find(payout => 
        payout.bookingIds.some(id => validatedData.bookingIds.includes(id)) &&
        payout.status !== 'failed'
      );
      
      if (existingPayout) {
        throw new Error('Payout already exists for one or more of these bookings');
      }

      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 500));

      const newPayout: Payout = {
        id: Date.now(),
        providerId: validatedData.providerId,
        providerName: payoutData.providerName,
        bookingIds: validatedData.bookingIds,
        totalEarnings: validatedData.totalEarnings,
        commission: validatedData.commission,
        netPayout: validatedData.netPayout,
        paymentMethod: validatedData.paymentMethod,
        type: validatedData.type,
        status: 'pending',
        payoutDate: new Date().toISOString().split('T')[0],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
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

      const updates: Partial<Payout> = {
        status: 'completed',
        processedDate: new Date().toISOString().split('T')[0],
        paymentReference: `AUTO${Date.now()}`
      };

      dispatch({ type: 'UPDATE_PAYOUT', payload: { id, updates } });
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

  const calculatePayout = (bookingIds: number[], providerId: number): { totalEarnings: number; commission: number; netPayout: number } => {
    // This would typically calculate based on actual booking data
    // For now, return a basic calculation
    const totalEarnings = bookingIds.length * 100; // Mock calculation
    const commission = totalEarnings * 0.15; // 15% commission
    const netPayout = totalEarnings - commission;
    
    return { totalEarnings, commission, netPayout };
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
    calculatePayout
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
