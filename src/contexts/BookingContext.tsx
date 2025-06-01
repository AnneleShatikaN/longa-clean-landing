
import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { BookingData, BookingUpdate, bookingSchema, bookingUpdateSchema } from '@/schemas/validation';

export interface Booking {
  id: number;
  clientId: number;
  clientName: string;
  providerId: number;
  providerName: string;
  serviceId: number;
  serviceName: string;
  date: string;
  time: string;
  amount: number;
  status: 'pending' | 'accepted' | 'in-progress' | 'completed' | 'cancelled';
  jobType: 'one-off' | 'subscription';
  completionDate?: string;
  expectedPayout?: number;
  commissionPercentage?: number;
  paidOut?: boolean;
  duration?: number;
  providerFee?: number;
  rating?: number;
  reviewComment?: string;
  createdAt: string;
  updatedAt: string;
}

interface BookingState {
  bookings: Booking[];
  isLoading: boolean;
  error: string | null;
}

type BookingAction = 
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'ADD_BOOKING'; payload: Booking }
  | { type: 'UPDATE_BOOKING'; payload: { id: number; updates: Partial<Booking> } }
  | { type: 'DELETE_BOOKING'; payload: number }
  | { type: 'SET_BOOKINGS'; payload: Booking[] };

const initialState: BookingState = {
  bookings: [],
  isLoading: false,
  error: null
};

function bookingReducer(state: BookingState, action: BookingAction): BookingState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload, isLoading: false };
    case 'ADD_BOOKING':
      return { ...state, bookings: [...state.bookings, action.payload] };
    case 'UPDATE_BOOKING':
      return {
        ...state,
        bookings: state.bookings.map(booking =>
          booking.id === action.payload.id 
            ? { ...booking, ...action.payload.updates, updatedAt: new Date().toISOString() }
            : booking
        )
      };
    case 'DELETE_BOOKING':
      return {
        ...state,
        bookings: state.bookings.filter(booking => booking.id !== action.payload)
      };
    case 'SET_BOOKINGS':
      return { ...state, bookings: action.payload };
    default:
      return state;
  }
}

interface BookingContextType extends BookingState {
  createBooking: (bookingData: BookingData & { clientName: string; providerName: string; serviceName: string }) => Promise<Booking>;
  updateBooking: (id: number, updates: BookingUpdate) => Promise<void>;
  updateBookingStatus: (id: number, status: Booking['status']) => Promise<void>;
  cancelBooking: (id: number, reason?: string) => Promise<void>;
  getBookingById: (id: number) => Booking | undefined;
  getBookingsByClient: (clientId: number) => Booking[];
  getBookingsByProvider: (providerId: number) => Booking[];
  getBookingsByStatus: (status: Booking['status']) => Booking[];
}

const BookingContext = createContext<BookingContextType | undefined>(undefined);

export const BookingProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(bookingReducer, initialState);

  const createBooking = async (
    bookingData: BookingData & { clientName: string; providerName: string; serviceName: string }
  ): Promise<Booking> => {
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });

    try {
      // Validate input data
      const validatedData = bookingSchema.parse(bookingData);
      
      // Check for conflicts (same provider, same time slot)
      const conflictingBooking = state.bookings.find(booking => 
        booking.providerId === validatedData.providerId &&
        booking.date === validatedData.date &&
        booking.time === validatedData.time &&
        ['pending', 'accepted', 'in-progress'].includes(booking.status)
      );
      
      if (conflictingBooking) {
        throw new Error('Provider is not available at this time slot');
      }

      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      const newBooking: Booking = {
        id: Date.now(),
        clientId: validatedData.clientId,
        clientName: bookingData.clientName,
        providerId: validatedData.providerId,
        providerName: bookingData.providerName,
        serviceId: validatedData.serviceId,
        serviceName: bookingData.serviceName,
        date: validatedData.date,
        time: validatedData.time,
        amount: validatedData.amount,
        duration: validatedData.duration,
        jobType: validatedData.jobType,
        status: 'pending',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      dispatch({ type: 'ADD_BOOKING', payload: newBooking });
      dispatch({ type: 'SET_LOADING', payload: false });
      
      return newBooking;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Booking creation failed';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      throw error;
    }
  };

  const updateBooking = async (id: number, updates: BookingUpdate): Promise<void> => {
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });

    try {
      // Validate update data
      const validatedUpdates = bookingUpdateSchema.parse(updates);
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 500));

      const additionalUpdates: Partial<Booking> = { ...validatedUpdates };
      
      // Auto-set completion date when status changes to completed
      if (validatedUpdates.status === 'completed' && !validatedUpdates.completionDate) {
        additionalUpdates.completionDate = new Date().toISOString().split('T')[0];
      }

      dispatch({ type: 'UPDATE_BOOKING', payload: { id, updates: additionalUpdates } });
      dispatch({ type: 'SET_LOADING', payload: false });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Booking update failed';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      throw error;
    }
  };

  const updateBookingStatus = async (id: number, status: Booking['status']): Promise<void> => {
    await updateBooking(id, { status });
  };

  const cancelBooking = async (id: number, reason?: string): Promise<void> => {
    await updateBooking(id, { status: 'cancelled' });
  };

  const getBookingById = (id: number): Booking | undefined => {
    return state.bookings.find(booking => booking.id === id);
  };

  const getBookingsByClient = (clientId: number): Booking[] => {
    return state.bookings.filter(booking => booking.clientId === clientId);
  };

  const getBookingsByProvider = (providerId: number): Booking[] => {
    return state.bookings.filter(booking => booking.providerId === providerId);
  };

  const getBookingsByStatus = (status: Booking['status']): Booking[] => {
    return state.bookings.filter(booking => booking.status === status);
  };

  const value: BookingContextType = {
    ...state,
    createBooking,
    updateBooking,
    updateBookingStatus,
    cancelBooking,
    getBookingById,
    getBookingsByClient,
    getBookingsByProvider,
    getBookingsByStatus
  };

  return (
    <BookingContext.Provider value={value}>
      {children}
    </BookingContext.Provider>
  );
};

export const useBookings = () => {
  const context = useContext(BookingContext);
  if (context === undefined) {
    throw new Error('useBookings must be used within a BookingProvider');
  }
  return context;
};
