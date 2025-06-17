
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
  acceptanceDeadline?: string;
  checkInTime?: string;
  progressPhotos?: string[];
  qualityScore?: number;
  emergencyBooking?: boolean;
  visitNotes?: string;
  beforePhotos?: string[];
  afterPhotos?: string[];
  issuesFound?: string[];
  modificationHistory?: {
    date: string;
    field: string;
    oldValue: string;
    newValue: string;
    reason?: string;
  }[];
  createdAt: string;
  updatedAt: string;
}

interface BookingState {
  bookings: Booking[];
  isLoading: boolean;
  error: string | null;
  notifications: {
    id: string;
    type: 'booking_confirmed' | 'booking_accepted' | 'booking_cancelled' | 'provider_arrived' | 'job_completed';
    message: string;
    bookingId: number;
    read: boolean;
    createdAt: string;
  }[];
}

type BookingAction = 
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'ADD_BOOKING'; payload: Booking }
  | { type: 'UPDATE_BOOKING'; payload: { id: number; updates: Partial<Booking> } }
  | { type: 'DELETE_BOOKING'; payload: number }
  | { type: 'SET_BOOKINGS'; payload: Booking[] }
  | { type: 'ADD_NOTIFICATION'; payload: BookingState['notifications'][0] };

const initialState: BookingState = {
  bookings: [],
  isLoading: false,
  error: null,
  notifications: []
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
    case 'ADD_NOTIFICATION':
      return {
        ...state,
        notifications: [...state.notifications, action.payload]
      };
    default:
      return state;
  }
}

interface BookingContextType extends BookingState {
  createBooking: (bookingData: BookingData & { clientName: string; providerName: string; serviceName: string }) => Promise<Booking>;
  updateBooking: (id: number, updates: BookingUpdate) => Promise<void>;
  updateBookingStatus: (id: number, status: Booking['status']) => Promise<void>;
  cancelBooking: (id: number, reason?: string) => Promise<void>;
  checkProviderAvailability: (providerId: number, date: string, time: string, duration: number) => Promise<boolean>;
  getConflictingBookings: (providerId: number, date: string, time: string, duration: number) => Booking[];
  scheduleAutomaticCancellation: (bookingId: number) => void;
  addProgressPhoto: (bookingId: number, photoUrl: string) => Promise<void>;
  submitQualityAssessment: (bookingId: number, score: number, notes: string) => Promise<void>;
  getBookingById: (id: number) => Booking | undefined;
  getBookingsByClient: (clientId: number) => Booking[];
  getBookingsByProvider: (providerId: number) => Booking[];
  getBookingsByStatus: (status: Booking['status']) => Booking[];
  getEmergencyBookings: () => Booking[];
  getUpcomingBookings: (userId: number, userType: 'client' | 'provider') => Booking[];
}

const BookingContext = createContext<BookingContextType | undefined>(undefined);

export const BookingProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(bookingReducer, initialState);

  const addNotification = (type: BookingState['notifications'][0]['type'], message: string, bookingId: number) => {
    const notification = {
      id: Date.now().toString(),
      type,
      message,
      bookingId,
      read: false,
      createdAt: new Date().toISOString()
    };
    dispatch({ type: 'ADD_NOTIFICATION', payload: notification });
  };

  const checkProviderAvailability = async (
    providerId: number, 
    date: string, 
    time: string, 
    duration: number
  ): Promise<boolean> => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 300));

    const conflictingBookings = getConflictingBookings(providerId, date, time, duration);
    return conflictingBookings.length === 0;
  };

  const getConflictingBookings = (
    providerId: number, 
    date: string, 
    time: string, 
    duration: number
  ): Booking[] => {
    const bookingTime = new Date(`${date}T${time}`);
    const bookingEndTime = new Date(bookingTime.getTime() + duration * 60000);

    return state.bookings.filter(booking => {
      if (booking.providerId !== providerId || booking.date !== date) return false;
      if (['cancelled'].includes(booking.status)) return false;

      const existingTime = new Date(`${booking.date}T${booking.time}`);
      const existingEndTime = new Date(existingTime.getTime() + (booking.duration || 60) * 60000);

      // Check for time overlap
      return (bookingTime < existingEndTime && bookingEndTime > existingTime);
    });
  };

  const createBooking = async (
    bookingData: BookingData & { clientName: string; providerName: string; serviceName: string }
  ): Promise<Booking> => {
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });

    try {
      // Validate input data
      const validatedData = bookingSchema.parse(bookingData);
      
      // Check provider availability
      const isAvailable = await checkProviderAvailability(
        validatedData.providerId,
        validatedData.date,
        validatedData.time,
        validatedData.duration || 60
      );
      
      if (!isAvailable) {
        throw new Error('Provider is not available at this time slot');
      }

      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Calculate acceptance deadline (24 hours from now)
      const acceptanceDeadline = new Date();
      acceptanceDeadline.setHours(acceptanceDeadline.getHours() + 24);

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
        acceptanceDeadline: acceptanceDeadline.toISOString(),
        emergencyBooking: validatedData.emergencyBooking || false,
        progressPhotos: [],
        modificationHistory: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      dispatch({ type: 'ADD_BOOKING', payload: newBooking });
      dispatch({ type: 'SET_LOADING', payload: false });
      
      // Add notification
      addNotification('booking_confirmed', 
        `New booking request for ${bookingData.serviceName} on ${validatedData.date}`, 
        newBooking.id
      );

      // Schedule automatic cancellation if not accepted within 24 hours
      scheduleAutomaticCancellation(newBooking.id);
      
      return newBooking;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Booking creation failed';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      throw error;
    }
  };

  const scheduleAutomaticCancellation = (bookingId: number) => {
    // In a real app, this would be handled by the backend
    setTimeout(() => {
      const booking = state.bookings.find(b => b.id === bookingId);
      if (booking && booking.status === 'pending') {
        updateBookingStatus(bookingId, 'cancelled');
        addNotification('booking_cancelled', 
          'Booking automatically cancelled due to no provider response', 
          bookingId
        );
      }
    }, 24 * 60 * 60 * 1000); // 24 hours
  };

  const updateBooking = async (id: number, updates: BookingUpdate): Promise<void> => {
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });

    try {
      // Validate update data
      const validatedUpdates = bookingUpdateSchema.parse(updates);
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 500));

      const booking = state.bookings.find(b => b.id === id);
      if (!booking) throw new Error('Booking not found');

      // Track modifications
      const modificationHistory = booking.modificationHistory || [];
      Object.keys(validatedUpdates).forEach(key => {
        const oldValue = booking[key as keyof Booking];
        const newValue = validatedUpdates[key as keyof BookingUpdate];
        if (oldValue !== newValue) {
          modificationHistory.push({
            date: new Date().toISOString(),
            field: key,
            oldValue: String(oldValue),
            newValue: String(newValue)
          });
        }
      });

      const additionalUpdates: Partial<Booking> = { 
        ...validatedUpdates,
        modificationHistory
      };
      
      // Auto-set completion date when status changes to completed
      if (validatedUpdates.status === 'completed' && !validatedUpdates.completionDate) {
        additionalUpdates.completionDate = new Date().toISOString().split('T')[0];
      }

      // Set check-in time when status changes to in-progress
      if (validatedUpdates.status === 'in-progress' && !booking.checkInTime) {
        additionalUpdates.checkInTime = new Date().toISOString();
      }

      dispatch({ type: 'UPDATE_BOOKING', payload: { id, updates: additionalUpdates } });
      dispatch({ type: 'SET_LOADING', payload: false });

      // Add appropriate notifications
      if (validatedUpdates.status) {
        const messages = {
          'accepted': 'Your booking has been accepted by the provider',
          'in-progress': 'Your service provider has arrived and started working',
          'completed': 'Your booking has been completed',
          'cancelled': 'Your booking has been cancelled'
        };
        
        if (messages[validatedUpdates.status]) {
          addNotification(validatedUpdates.status as any, messages[validatedUpdates.status], id);
        }
      }
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

  const addProgressPhoto = async (bookingId: number, photoUrl: string): Promise<void> => {
    const booking = state.bookings.find(b => b.id === bookingId);
    if (!booking) throw new Error('Booking not found');

    const updatedPhotos = [...(booking.progressPhotos || []), photoUrl];
    await updateBooking(bookingId, { progressPhotos: updatedPhotos } as any);
  };

  const submitQualityAssessment = async (bookingId: number, score: number, notes: string): Promise<void> => {
    await updateBooking(bookingId, { qualityScore: score } as any);
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

  const getEmergencyBookings = (): Booking[] => {
    return state.bookings.filter(booking => booking.emergencyBooking);
  };

  const getUpcomingBookings = (userId: number, userType: 'client' | 'provider'): Booking[] => {
    const now = new Date();
    return state.bookings.filter(booking => {
      const bookingDate = new Date(`${booking.date}T${booking.time}`);
      const isUpcoming = bookingDate > now;
      const isUserBooking = userType === 'client' 
        ? booking.clientId === userId 
        : booking.providerId === userId;
      return isUpcoming && isUserBooking && ['pending', 'accepted'].includes(booking.status);
    });
  };

  const value: BookingContextType = {
    ...state,
    createBooking,
    updateBooking,
    updateBookingStatus,
    cancelBooking,
    checkProviderAvailability,
    getConflictingBookings,
    scheduleAutomaticCancellation,
    addProgressPhoto,
    submitQualityAssessment,
    getBookingById,
    getBookingsByClient,
    getBookingsByProvider,
    getBookingsByStatus,
    getEmergencyBookings,
    getUpcomingBookings
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
