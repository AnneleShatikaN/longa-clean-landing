import React, { createContext, useContext, useState, ReactNode } from 'react';
import { UserRole } from './AuthContext';

export type ServiceType = 'one-off' | 'subscription';

export interface Service {
  id: number;
  name: string;
  type: ServiceType;
  clientPrice: number;
  providerFee?: number; // For subscription services
  commissionPercentage?: number; // For one-off services (1-50%)
  duration: {
    hours: number;
    minutes: number;
  };
  status: 'active' | 'inactive';
  tags: string[];
  description: string;
  // Legacy fields for backwards compatibility
  price: number;
  active: boolean;
  providers: number;
  bookings: number;
}

export interface AppUser {
  id: number;
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  status: 'active' | 'pending' | 'inactive';
  rating: number | null;
  available?: boolean;
  joined: string;
}

export interface Booking {
  id: number;
  clientId: number;
  clientName: string;
  providerId: number;
  providerName: string;
  serviceId: number;
  serviceName: string;
  amount: number;
  status: 'pending' | 'accepted' | 'in-progress' | 'completed' | 'cancelled';
  date: string;
  time: string;
  duration: number;
  notes?: string;
  createdAt: string;
  // New fields for hybrid payout calculation
  jobType: ServiceType;
  commissionPercentage?: number; // For one-off jobs
  providerFee?: number; // For subscription jobs
  completionDate?: string;
  expectedPayout?: number;
  paidOut?: boolean; // Track if payout has been processed
}

export interface Payout {
  id: number;
  providerId: number;
  providerName: string;
  bookingIds: number[];
  totalEarnings: number;
  commission: number;
  netPayout: number;
  status: 'pending' | 'processing' | 'completed';
  date: string;
  calculationMethod: 'commission' | 'fixed-fee' | 'mixed';
}

interface DataContextType {
  // Services
  services: Service[];
  addService: (service: Omit<Service, 'id' | 'providers' | 'bookings' | 'price' | 'active'>) => Promise<void>;
  updateService: (id: number, updates: Partial<Service>) => Promise<void>;
  deleteService: (id: number) => Promise<void>;
  toggleServiceStatus: (id: number) => Promise<void>;
  
  // Users
  users: AppUser[];
  updateUser: (id: number, updates: Partial<AppUser>) => Promise<void>;
  
  // Bookings
  bookings: Booking[];
  createBooking: (booking: Omit<Booking, 'id' | 'createdAt' | 'expectedPayout'>) => Promise<void>;
  updateBookingStatus: (id: number, status: Booking['status']) => Promise<void>;
  
  // Payouts
  payouts: Payout[];
  processPayout: (id: number) => Promise<void>;
  
  // Loading states
  isLoading: boolean;
  servicesLoading: boolean;
  usersLoading: boolean;
  bookingsLoading: boolean;
  payoutsLoading: boolean;
  error: string | null;
  setError: (error: string | null) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

// Updated mock data with new service structure
const initialServices: Service[] = [
  {
    id: 1,
    name: 'Basic House Cleaning',
    type: 'one-off',
    clientPrice: 150,
    commissionPercentage: 15,
    duration: { hours: 2, minutes: 0 },
    status: 'active',
    tags: ['Requires Own Supplies', 'Residential Only'],
    description: 'Professional home cleaning service including kitchen, bathrooms, and living areas',
    // Legacy fields
    price: 150,
    active: true,
    providers: 25,
    bookings: 450
  },
  {
    id: 2,
    name: 'Premium Garden Care Package',
    type: 'subscription',
    clientPrice: 800,
    providerFee: 680,
    duration: { hours: 3, minutes: 0 },
    status: 'active',
    tags: ['Business Only', 'Requires Own Supplies'],
    description: 'Monthly garden maintenance including lawn care, hedge trimming, and seasonal planting',
    // Legacy fields
    price: 800,
    active: true,
    providers: 18,
    bookings: 320
  },
  {
    id: 3,
    name: 'Express Laundry Service',
    type: 'one-off',
    clientPrice: 80,
    commissionPercentage: 20,
    duration: { hours: 1, minutes: 0 },
    status: 'active',
    tags: ['Residential Only'],
    description: 'Quick wash, dry and fold service for everyday clothing',
    // Legacy fields
    price: 80,
    active: true,
    providers: 15,
    bookings: 280
  },
  {
    id: 4,
    name: 'Premium Car Detailing Package',
    type: 'subscription',
    clientPrice: 500,
    providerFee: 425,
    duration: { hours: 1, minutes: 30 },
    status: 'inactive',
    tags: ['Requires Own Supplies'],
    description: 'Bi-weekly complete car cleaning and detailing service',
    // Legacy fields
    price: 500,
    active: false,
    providers: 12,
    bookings: 180
  }
];

const initialUsers: AppUser[] = [
  { id: 1, name: 'John Doe', email: 'john@email.com', phone: '+264 81 234 5678', role: 'client', status: 'active', rating: 4.8, joined: '2024-01-15' },
  { id: 2, name: 'Mary Smith', email: 'mary@email.com', phone: '+264 81 345 6789', role: 'provider', status: 'active', rating: 4.9, available: true, joined: '2024-01-10' },
  { id: 3, name: 'Sarah Wilson', email: 'sarah@email.com', phone: '+264 81 456 7890', role: 'client', status: 'active', rating: 4.5, joined: '2024-01-18' },
  { id: 4, name: 'Mike Johnson', email: 'mike@email.com', phone: '+264 81 567 8901', role: 'provider', status: 'pending', rating: 0, available: true, joined: '2024-01-20' },
  { id: 5, name: 'Admin User', email: 'admin@longa.com', phone: '+264 81 678 9012', role: 'admin', status: 'active', rating: null, joined: '2024-01-01' }
];

const initialBookings: Booking[] = [
  { 
    id: 1001, 
    clientId: 1, 
    clientName: 'John Doe', 
    providerId: 2, 
    providerName: 'Mary Smith', 
    serviceId: 1, 
    serviceName: 'House Cleaning', 
    amount: 150, 
    status: 'completed', 
    date: '2024-05-25', 
    time: '10:00 AM', 
    duration: 120, 
    notes: 'Regular weekly cleaning', 
    createdAt: '2024-05-20',
    jobType: 'one-off',
    commissionPercentage: 15,
    completionDate: '2024-05-25',
    expectedPayout: 127.5,
    paidOut: false
  },
  { 
    id: 1002, 
    clientId: 3, 
    clientName: 'Sarah Wilson', 
    providerId: 2, 
    providerName: 'Mary Smith', 
    serviceId: 2, 
    serviceName: 'Garden Maintenance', 
    amount: 800, 
    status: 'accepted', 
    date: '2024-05-28', 
    time: '2:00 PM', 
    duration: 180, 
    notes: 'Hedge trimming and lawn care', 
    createdAt: '2024-05-25',
    jobType: 'subscription',
    providerFee: 680,
    expectedPayout: 680
  },
  { 
    id: 1003, 
    clientId: 1, 
    clientName: 'John Doe', 
    providerId: 4, 
    providerName: 'Mike Johnson', 
    serviceId: 3, 
    serviceName: 'Laundry Service', 
    amount: 80, 
    status: 'pending', 
    date: '2024-05-30', 
    time: '9:00 AM', 
    duration: 60, 
    notes: 'Large load of clothes', 
    createdAt: '2024-05-28',
    jobType: 'one-off',
    commissionPercentage: 20,
    expectedPayout: 64
  },
  { 
    id: 1004, 
    clientId: 3, 
    clientName: 'Sarah Wilson', 
    providerId: 2, 
    providerName: 'Mary Smith', 
    serviceId: 1, 
    serviceName: 'House Cleaning', 
    amount: 150, 
    status: 'completed', 
    date: '2024-05-20', 
    time: '11:00 AM', 
    duration: 120, 
    notes: 'Deep cleaning service', 
    createdAt: '2024-05-18',
    jobType: 'one-off',
    commissionPercentage: 15,
    completionDate: '2024-05-20',
    expectedPayout: 127.5,
    paidOut: false
  }
];

const initialPayouts: Payout[] = [
  { 
    id: 1, 
    providerId: 2, 
    providerName: 'Mary Smith', 
    bookingIds: [1001, 1004], 
    totalEarnings: 255, 
    commission: 45, 
    netPayout: 255, 
    status: 'pending', 
    date: '2024-05-25',
    calculationMethod: 'commission'
  },
  { 
    id: 2, 
    providerId: 4, 
    providerName: 'Mike Johnson', 
    bookingIds: [1003], 
    totalEarnings: 64, 
    commission: 16, 
    netPayout: 64, 
    status: 'processing', 
    date: '2024-05-24',
    calculationMethod: 'commission'
  }
];

// Simulate API delay
const simulateDelay = (ms: number = 1000) => new Promise(resolve => setTimeout(resolve, ms));

// Helper function to calculate expected payout
const calculateExpectedPayout = (booking: Partial<Booking>, service: Service): number => {
  if (service.type === 'one-off' && service.commissionPercentage) {
    return booking.amount! - (booking.amount! * (service.commissionPercentage / 100));
  } else if (service.type === 'subscription' && service.providerFee) {
    return service.providerFee;
  }
  return 0;
};

export const DataProvider = ({ children }: { children: ReactNode }) => {
  const [services, setServices] = useState<Service[]>(initialServices);
  const [users, setUsers] = useState<AppUser[]>(initialUsers);
  const [bookings, setBookings] = useState<Booking[]>(initialBookings);
  const [payouts, setPayouts] = useState<Payout[]>(initialPayouts);
  const [isLoading, setIsLoading] = useState(false);
  const [servicesLoading, setServicesLoading] = useState(false);
  const [usersLoading, setUsersLoading] = useState(false);
  const [bookingsLoading, setBookingsLoading] = useState(false);
  const [payoutsLoading, setPayoutsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addService = async (serviceData: Omit<Service, 'id' | 'providers' | 'bookings' | 'price' | 'active'>) => {
    setServicesLoading(true);
    setError(null);
    try {
      await simulateDelay(800);
      const newService: Service = {
        ...serviceData,
        id: Math.max(...services.map(s => s.id)) + 1,
        providers: 0,
        bookings: 0,
        // Legacy compatibility
        price: serviceData.clientPrice,
        active: serviceData.status === 'active'
      };
      setServices(prev => [...prev, newService]);
    } catch (err) {
      setError('Failed to add service. Please try again.');
    } finally {
      setServicesLoading(false);
    }
  };

  const updateService = async (id: number, updates: Partial<Service>) => {
    setServicesLoading(true);
    setError(null);
    try {
      await simulateDelay(500);
      setServices(prev => prev.map(service => {
        if (service.id === id) {
          const updatedService = { ...service, ...updates };
          // Maintain legacy compatibility
          if (updates.clientPrice) updatedService.price = updates.clientPrice;
          if (updates.status) updatedService.active = updates.status === 'active';
          return updatedService;
        }
        return service;
      }));
    } catch (err) {
      setError('Failed to update service. Please try again.');
    } finally {
      setServicesLoading(false);
    }
  };

  const deleteService = async (id: number) => {
    setServicesLoading(true);
    setError(null);
    try {
      await simulateDelay(500);
      setServices(prev => prev.filter(service => service.id !== id));
    } catch (err) {
      setError('Failed to delete service. Please try again.');
    } finally {
      setServicesLoading(false);
    }
  };

  const toggleServiceStatus = async (id: number) => {
    setServicesLoading(true);
    setError(null);
    try {
      await simulateDelay(500);
      setServices(prev => prev.map(service => {
        if (service.id === id) {
          const newStatus = service.status === 'active' ? 'inactive' : 'active';
          return {
            ...service,
            status: newStatus,
            active: newStatus === 'active' // Legacy compatibility
          };
        }
        return service;
      }));
    } catch (err) {
      setError('Failed to update service status. Please try again.');
    } finally {
      setServicesLoading(false);
    }
  };

  const updateUser = async (id: number, updates: Partial<AppUser>) => {
    setUsersLoading(true);
    setError(null);
    try {
      await simulateDelay(500);
      setUsers(prev => prev.map(user => 
        user.id === id ? { ...user, ...updates } : user
      ));
    } catch (err) {
      setError('Failed to update user. Please try again.');
    } finally {
      setUsersLoading(false);
    }
  };

  const createBooking = async (bookingData: Omit<Booking, 'id' | 'createdAt' | 'expectedPayout'>) => {
    setBookingsLoading(true);
    setError(null);
    try {
      await simulateDelay(1000);
      
      // Get service to calculate expected payout
      const service = services.find(s => s.id === bookingData.serviceId);
      if (!service) {
        throw new Error('Service not found');
      }

      // Calculate expected payout and add job type info
      const expectedPayout = calculateExpectedPayout(bookingData, service);
      
      const newBooking: Booking = {
        ...bookingData,
        id: Math.max(...bookings.map(b => b.id)) + 1,
        createdAt: new Date().toISOString().split('T')[0],
        jobType: service.type,
        commissionPercentage: service.type === 'one-off' ? service.commissionPercentage : undefined,
        providerFee: service.type === 'subscription' ? service.providerFee : undefined,
        expectedPayout,
        paidOut: false
      };
      
      setBookings(prev => [...prev, newBooking]);

      // Update service booking count
      setServices(prev => prev.map(service =>
        service.id === bookingData.serviceId
          ? { ...service, bookings: service.bookings + 1 }
          : service
      ));
    } catch (err) {
      setError('Failed to create booking. Please try again.');
    } finally {
      setBookingsLoading(false);
    }
  };

  const updateBookingStatus = async (id: number, status: Booking['status']) => {
    setBookingsLoading(true);
    setError(null);
    try {
      await simulateDelay(500);
      
      setBookings(prev => prev.map(booking => {
        if (booking.id === id) {
          const updatedBooking = { ...booking, status };
          
          // If completing the job, set completion date
          if (status === 'completed') {
            updatedBooking.completionDate = new Date().toISOString().split('T')[0];
          }
          
          return updatedBooking;
        }
        return booking;
      }));

      // If booking is completed, create payout if it doesn't exist
      if (status === 'completed') {
        const booking = bookings.find(b => b.id === id);
        if (booking && booking.expectedPayout) {
          const existingPayout = payouts.find(p => 
            p.providerId === booking.providerId && p.status === 'pending'
          );

          if (existingPayout) {
            // Add to existing payout
            setPayouts(prev => prev.map(payout => {
              if (payout.id === existingPayout.id) {
                const newTotalEarnings = payout.totalEarnings + booking.expectedPayout!;
                const commission = booking.jobType === 'one-off' 
                  ? (booking.amount * (booking.commissionPercentage! / 100))
                  : 0;
                
                return {
                  ...payout,
                  bookingIds: [...payout.bookingIds, id],
                  totalEarnings: newTotalEarnings,
                  commission: payout.commission + commission,
                  netPayout: newTotalEarnings,
                  calculationMethod: payout.calculationMethod === 'commission' && booking.jobType === 'subscription'
                    ? 'mixed' as const
                    : payout.calculationMethod === 'fixed-fee' && booking.jobType === 'one-off'
                    ? 'mixed' as const
                    : booking.jobType === 'one-off' ? 'commission' as const : 'fixed-fee' as const
                };
              }
              return payout;
            }));
          } else {
            // Create new payout
            const commission = booking.jobType === 'one-off' 
              ? (booking.amount * (booking.commissionPercentage! / 100))
              : 0;

            const newPayout: Payout = {
              id: Math.max(...payouts.map(p => p.id)) + 1,
              providerId: booking.providerId,
              providerName: booking.providerName,
              bookingIds: [id],
              totalEarnings: booking.expectedPayout,
              commission,
              netPayout: booking.expectedPayout,
              status: 'pending',
              date: new Date().toISOString().split('T')[0],
              calculationMethod: booking.jobType === 'one-off' ? 'commission' : 'fixed-fee'
            };
            setPayouts(prev => [...prev, newPayout]);
          }
        }
      }
    } catch (err) {
      setError('Failed to update booking status. Please try again.');
    } finally {
      setBookingsLoading(false);
    }
  };

  const processPayout = async (id: number) => {
    setPayoutsLoading(true);
    setError(null);
    try {
      await simulateDelay(1500);
      setPayouts(prev => prev.map(payout => 
        payout.id === id ? { ...payout, status: 'completed' } : payout
      ));
    } catch (err) {
      setError('Failed to process payout. Please try again.');
    } finally {
      setPayoutsLoading(false);
    }
  };

  return (
    <DataContext.Provider value={{
      services,
      addService,
      updateService,
      deleteService,
      toggleServiceStatus,
      users,
      updateUser,
      bookings,
      createBooking,
      updateBookingStatus,
      payouts,
      processPayout,
      isLoading,
      servicesLoading,
      usersLoading,
      bookingsLoading,
      payoutsLoading,
      error,
      setError
    }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
