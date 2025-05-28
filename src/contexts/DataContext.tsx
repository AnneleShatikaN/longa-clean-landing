
import React, { createContext, useState, useContext, useEffect } from 'react';

export interface Booking {
  id: number;
  clientName: string;
  clientId?: number;
  providerName: string;
  providerId: number;
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
}

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
}

export interface PayoutExport {
  id: number;
  exportDate: string;
  period: string;
  totalAmount: number;
  payoutCount: number;
  status: 'generated' | 'downloaded' | 'sent';
  fileFormat: 'excel' | 'csv' | 'pdf';
}

export type ServiceType = 'one-off' | 'subscription';

export interface Service {
  id: number;
  name: string;
  type: ServiceType;
  clientPrice: number;
  providerFee?: number;
  commissionPercentage?: number;
  duration: {
    hours: number;
    minutes: number;
  };
  status: 'active' | 'inactive';
  tags: string[];
  description: string;
  requirements?: string[];
  popularity: number;
  averageRating: number;
  totalBookings: number;
  totalRevenue: number;
}

export interface User {
  id: number;
  name: string;
  email: string;
  role: 'client' | 'provider' | 'admin';
  rating: number | null;
  status: 'active' | 'inactive' | 'pending';
  available?: boolean;
  bankMobileNumber?: string;
  paymentMethod?: 'bank_transfer' | 'mobile_money';
  totalEarnings?: number;
  jobsCompleted?: number;
  responseRate?: number;
  joinDate?: string;
  lastActive?: string;
}

interface DataContextProps {
  services: Service[];
  users: User[];
  bookings: Booking[];
  payouts: Payout[];
  payoutExports: PayoutExport[];
  addService: (service: Omit<Service, 'id'>) => Promise<void>;
  updateService: (id: number, updates: Partial<Service>) => Promise<void>;
  deleteService: (id: number) => Promise<void>;
  toggleServiceStatus: (id: number) => Promise<void>;
  updateUser: (id: number, updates: Partial<User>) => Promise<void>;
  updateBookingStatus: (id: number, status: Booking['status']) => Promise<void>;
  processPayout: (id: number) => Promise<void>;
  addManualPayout: (payout: Omit<Payout, 'id' | 'processedDate'>) => Promise<void>;
  exportPayouts: (period: string, format: string) => Promise<void>;
  isLoading: boolean;
  servicesLoading: boolean;
  error: string | null;
}

const DataContext = createContext<DataContextProps>({
  services: [],
  users: [],
  bookings: [],
  payouts: [],
  payoutExports: [],
  addService: async () => {},
  updateService: async () => {},
  deleteService: async () => {},
  toggleServiceStatus: async () => {},
  updateUser: async () => {},
  updateBookingStatus: async () => {},
  processPayout: async () => {},
  addManualPayout: async () => {},
  exportPayouts: async () => {},
  isLoading: true,
  servicesLoading: true,
  error: null,
});

// Enhanced mock services with realistic NAD pricing
const mockServices: Service[] = [
  {
    id: 1,
    name: 'Basic House Cleaning',
    type: 'one-off',
    clientPrice: 280,
    commissionPercentage: 15,
    duration: { hours: 2, minutes: 30 },
    status: 'active',
    tags: ['Residential', 'Basic'],
    description: 'Standard house cleaning including living areas, bedrooms, kitchen, and bathrooms.',
    requirements: ['Bring own cleaning supplies', 'ID verification required'],
    popularity: 95,
    averageRating: 4.7,
    totalBookings: 347,
    totalRevenue: 97160
  },
  {
    id: 2,
    name: 'Deep Cleaning Package',
    type: 'subscription',
    clientPrice: 650,
    providerFee: 520,
    duration: { hours: 4, minutes: 0 },
    status: 'active',
    tags: ['Residential', 'Premium', 'Monthly'],
    description: 'Comprehensive deep cleaning service including windows, appliances, and detailed sanitization.',
    requirements: ['Professional equipment provided', 'Background check completed'],
    popularity: 78,
    averageRating: 4.9,
    totalBookings: 89,
    totalRevenue: 57850
  },
  {
    id: 3,
    name: 'Office Cleaning Service',
    type: 'one-off',
    clientPrice: 450,
    commissionPercentage: 18,
    duration: { hours: 3, minutes: 0 },
    status: 'active',
    tags: ['Commercial', 'Business'],
    description: 'Professional office cleaning for small to medium businesses.',
    requirements: ['Business hours flexibility', 'Security clearance'],
    popularity: 65,
    averageRating: 4.6,
    totalBookings: 156,
    totalRevenue: 70200
  },
  {
    id: 4,
    name: 'Move-In/Out Cleaning',
    type: 'one-off',
    clientPrice: 380,
    commissionPercentage: 12,
    duration: { hours: 3, minutes: 30 },
    status: 'active',
    tags: ['Residential', 'Specialized'],
    description: 'Thorough cleaning for properties during relocation.',
    requirements: ['Flexible scheduling', 'Key access coordination'],
    popularity: 82,
    averageRating: 4.8,
    totalBookings: 203,
    totalRevenue: 77140
  },
  {
    id: 5,
    name: 'Premium Weekly Package',
    type: 'subscription',
    clientPrice: 950,
    providerFee: 760,
    duration: { hours: 5, minutes: 0 },
    status: 'active',
    tags: ['Residential', 'Premium', 'Weekly'],
    description: 'Luxury cleaning service with premium products and detailed attention.',
    requirements: ['Premium supplies included', 'Dedicated provider'],
    popularity: 45,
    averageRating: 4.95,
    totalBookings: 34,
    totalRevenue: 32300
  },
  {
    id: 6,
    name: 'Post-Construction Cleanup',
    type: 'one-off',
    clientPrice: 850,
    commissionPercentage: 20,
    duration: { hours: 6, minutes: 0 },
    status: 'active',
    tags: ['Specialized', 'Construction'],
    description: 'Specialized cleaning for newly constructed or renovated properties.',
    requirements: ['Safety equipment required', 'Construction experience preferred'],
    popularity: 35,
    averageRating: 4.4,
    totalBookings: 28,
    totalRevenue: 23800
  },
  {
    id: 7,
    name: 'Event Cleanup Service',
    type: 'one-off',
    clientPrice: 320,
    commissionPercentage: 16,
    duration: { hours: 2, minutes: 0 },
    status: 'inactive',
    tags: ['Events', 'Temporary'],
    description: 'Quick cleanup service for small events and gatherings.',
    requirements: ['Weekend availability', 'Team coordination'],
    popularity: 58,
    averageRating: 4.3,
    totalBookings: 67,
    totalRevenue: 21440
  }
];

// Enhanced user data with payment details
const mockUsers: User[] = [
  { 
    id: 1, 
    name: 'Maria Santos', 
    email: 'maria@example.com', 
    role: 'client', 
    rating: null, 
    status: 'active',
    joinDate: '2024-01-15',
    lastActive: '2024-05-27'
  },
  { 
    id: 2, 
    name: 'Johannes Nakale', 
    email: 'johannes@example.com', 
    role: 'provider', 
    rating: 4.8, 
    status: 'active', 
    available: true,
    bankMobileNumber: '+264 81 234 5678',
    paymentMethod: 'mobile_money',
    totalEarnings: 15680,
    jobsCompleted: 89,
    responseRate: 96,
    joinDate: '2024-02-01',
    lastActive: '2024-05-28'
  },
  { 
    id: 3, 
    name: 'Petrina Nghitoolwa', 
    email: 'petrina@example.com', 
    role: 'provider', 
    rating: 4.9, 
    status: 'active', 
    available: false,
    bankMobileNumber: '+264 85 987 6543',
    paymentMethod: 'bank_transfer',
    totalEarnings: 23450,
    jobsCompleted: 134,
    responseRate: 98,
    joinDate: '2024-01-20',
    lastActive: '2024-05-28'
  },
  { 
    id: 4, 
    name: 'Sarah Wilson', 
    email: 'sarah@longa.com', 
    role: 'admin', 
    rating: null, 
    status: 'active',
    joinDate: '2023-12-01',
    lastActive: '2024-05-28'
  },
  { 
    id: 5, 
    name: 'Andreas Shikongo', 
    email: 'andreas@example.com', 
    role: 'provider', 
    rating: 4.6, 
    status: 'active', 
    available: true,
    bankMobileNumber: '+264 61 456 7890',
    paymentMethod: 'mobile_money',
    totalEarnings: 8920,
    jobsCompleted: 45,
    responseRate: 89,
    joinDate: '2024-03-10',
    lastActive: '2024-05-27'
  },
  {
    id: 6,
    name: 'Helena Amupolo',
    email: 'helena@example.com',
    role: 'provider',
    rating: 4.7,
    status: 'pending',
    available: false,
    bankMobileNumber: '+264 81 123 9876',
    paymentMethod: 'bank_transfer',
    totalEarnings: 0,
    jobsCompleted: 0,
    responseRate: 0,
    joinDate: '2024-05-25',
    lastActive: '2024-05-26'
  }
];

// Enhanced bookings with proper payout calculations
const mockBookings: Booking[] = [
  {
    id: 1,
    clientName: 'Emma Katjivikua',
    clientId: 7,
    providerName: 'Johannes Nakale',
    providerId: 2,
    serviceName: 'Basic House Cleaning',
    date: '2024-05-25',
    time: '09:00',
    amount: 280,
    status: 'completed',
    jobType: 'one-off',
    completionDate: '2024-05-25',
    expectedPayout: 238, // 280 - 15% = 238
    commissionPercentage: 15,
    paidOut: true,
    duration: 150
  },
  {
    id: 2,
    clientName: 'David Nghidinwa',
    clientId: 8,
    providerName: 'Petrina Nghitoolwa',
    providerId: 3,
    serviceName: 'Office Cleaning Service',
    date: '2024-05-26',
    time: '14:00',
    amount: 450,
    status: 'completed',
    jobType: 'one-off',
    completionDate: '2024-05-26',
    expectedPayout: 369, // 450 - 18% = 369
    commissionPercentage: 18,
    paidOut: false,
    duration: 180
  },
  {
    id: 3,
    clientName: 'Frieda Ndapewa',
    clientId: 9,
    providerName: 'Johannes Nakale',
    providerId: 2,
    serviceName: 'Deep Cleaning Package',
    date: '2024-05-27',
    time: '11:00',
    amount: 650,
    status: 'completed',
    jobType: 'subscription',
    completionDate: '2024-05-27',
    expectedPayout: 520,
    paidOut: false,
    duration: 240,
    providerFee: 520
  },
  {
    id: 4,
    clientName: 'Simon Haindongo',
    clientId: 10,
    providerName: 'Andreas Shikongo',
    providerId: 5,
    serviceName: 'Move-In/Out Cleaning',
    date: '2024-05-28',
    time: '10:00',
    amount: 380,
    status: 'in-progress',
    jobType: 'one-off',
    expectedPayout: 334, // 380 - 12% = 334
    commissionPercentage: 12,
    duration: 210
  },
  {
    id: 5,
    clientName: 'Loide Shaanika',
    clientId: 11,
    providerName: 'Petrina Nghitoolwa',
    providerId: 3,
    serviceName: 'Premium Weekly Package',
    date: '2024-05-28',
    time: '13:00',
    amount: 950,
    status: 'accepted',
    jobType: 'subscription',
    expectedPayout: 760,
    duration: 300,
    providerFee: 760
  },
  {
    id: 6,
    clientName: 'Tangeni Amutenya',
    clientId: 12,
    providerName: 'Johannes Nakale',
    providerId: 2,
    serviceName: 'Basic House Cleaning',
    date: '2024-05-29',
    time: '15:00',
    amount: 280,
    status: 'pending',
    jobType: 'one-off',
    expectedPayout: 238,
    commissionPercentage: 15,
    duration: 150
  },
  {
    id: 7,
    clientName: 'Selma Paulus',
    clientId: 13,
    providerName: 'Andreas Shikongo',
    providerId: 5,
    serviceName: 'Post-Construction Cleanup',
    date: '2024-05-24',
    time: '08:00',
    amount: 850,
    status: 'completed',
    jobType: 'one-off',
    completionDate: '2024-05-24',
    expectedPayout: 680, // 850 - 20% = 680
    commissionPercentage: 20,
    paidOut: false,
    duration: 360
  },
  {
    id: 8,
    clientName: 'Hilma Nangolo',
    clientId: 14,
    providerName: 'Petrina Nghitoolwa',
    providerId: 3,
    serviceName: 'Office Cleaning Service',
    date: '2024-05-23',
    time: '16:00',
    amount: 450,
    status: 'completed',
    jobType: 'one-off',
    completionDate: '2024-05-23',
    expectedPayout: 369,
    commissionPercentage: 18,
    paidOut: true,
    duration: 180
  }
];

// Enhanced payout records
const mockPayouts: Payout[] = [
  {
    id: 1,
    providerId: 2,
    providerName: 'Johannes Nakale',
    bookingIds: [1],
    totalEarnings: 238,
    commission: 42,
    netPayout: 238,
    status: 'completed',
    payoutDate: '2024-05-26',
    processedDate: '2024-05-26',
    paymentMethod: 'mobile_money',
    paymentReference: 'MM240526001',
    type: 'weekly_auto'
  },
  {
    id: 2,
    providerId: 3,
    providerName: 'Petrina Nghitoolwa',
    bookingIds: [2, 3],
    totalEarnings: 889,
    commission: 81,
    netPayout: 889,
    status: 'pending',
    payoutDate: '2024-05-28',
    paymentMethod: 'bank_transfer',
    type: 'weekly_auto'
  },
  {
    id: 3,
    providerId: 5,
    providerName: 'Andreas Shikongo',
    bookingIds: [7],
    totalEarnings: 680,
    commission: 170,
    netPayout: 680,
    status: 'processing',
    payoutDate: '2024-05-28',
    paymentMethod: 'mobile_money',
    type: 'manual'
  },
  {
    id: 4,
    providerId: 3,
    providerName: 'Petrina Nghitoolwa',
    bookingIds: [8],
    totalEarnings: 369,
    commission: 81,
    netPayout: 369,
    status: 'completed',
    payoutDate: '2024-05-24',
    processedDate: '2024-05-24',
    paymentMethod: 'bank_transfer',
    paymentReference: 'BT240524001',
    type: 'weekly_auto'
  }
];

// Payout export history
const mockPayoutExports: PayoutExport[] = [
  {
    id: 1,
    exportDate: '2024-05-27',
    period: 'Week 21, 2024',
    totalAmount: 1845,
    payoutCount: 4,
    status: 'downloaded',
    fileFormat: 'excel'
  },
  {
    id: 2,
    exportDate: '2024-05-20',
    period: 'Week 20, 2024',
    totalAmount: 2340,
    payoutCount: 6,
    status: 'sent',
    fileFormat: 'pdf'
  }
];

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [services, setServices] = useState<Service[]>(mockServices);
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [bookings, setBookings] = useState<Booking[]>(mockBookings);
  const [payouts, setPayouts] = useState<Payout[]>(mockPayouts);
  const [payoutExports, setPayoutExports] = useState<PayoutExport[]>(mockPayoutExports);
  const [isLoading, setIsLoading] = useState(false);
  const [servicesLoading, setServicesLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Simulate loading data from an API
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  }, []);

  const addService = async (service: Omit<Service, 'id'>) => {
    setServicesLoading(true);
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        const newService: Service = {
          id: services.length > 0 ? Math.max(...services.map(s => s.id)) + 1 : 1,
          popularity: 0,
          averageRating: 0,
          totalBookings: 0,
          totalRevenue: 0,
          ...service
        };
        setServices([...services, newService]);
        setServicesLoading(false);
        resolve();
      }, 500);
    });
  };

  const updateService = async (id: number, updates: Partial<Service>) => {
    setServicesLoading(true);
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        setServices(services.map(service =>
          service.id === id ? { ...service, ...updates } : service
        ));
        setServicesLoading(false);
        resolve();
      }, 500);
    });
  };

  const deleteService = async (id: number) => {
    setServicesLoading(true);
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        setServices(services.filter(service => service.id !== id));
        setServicesLoading(false);
        resolve();
      }, 500);
    });
  };

  const toggleServiceStatus = async (id: number) => {
    setServicesLoading(true);
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        setServices(services.map(service =>
          service.id === id ? { ...service, status: service.status === 'active' ? 'inactive' : 'active' } : service
        ));
        setServicesLoading(false);
        resolve();
      }, 500);
    });
  };

  const updateUser = async (id: number, updates: Partial<User>) => {
    setIsLoading(true);
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        setUsers(users.map(user =>
          user.id === id ? { ...user, ...updates } : user
        ));
        setIsLoading(false);
        resolve();
      }, 500);
    });
  };

  const updateBookingStatus = async (id: number, status: Booking['status']) => {
    setIsLoading(true);
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        const updatedBookings = bookings.map(booking => {
          if (booking.id === id) {
            const updatedBooking = { ...booking, status };
            if (status === 'completed' && !booking.completionDate) {
              updatedBooking.completionDate = new Date().toISOString().split('T')[0];
            }
            return updatedBooking;
          }
          return booking;
        });
        setBookings(updatedBookings);
        setIsLoading(false);
        resolve();
      }, 500);
    });
  };

  const processPayout = async (id: number) => {
    setIsLoading(true);
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        setPayouts(payouts.map(payout =>
          payout.id === id ? { 
            ...payout, 
            status: 'completed',
            processedDate: new Date().toISOString().split('T')[0],
            paymentReference: `AUTO${Date.now()}`
          } : payout
        ));
        setIsLoading(false);
        resolve();
      }, 500);
    });
  };

  const addManualPayout = async (payout: Omit<Payout, 'id' | 'processedDate'>) => {
    setIsLoading(true);
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        const newPayout: Payout = {
          ...payout,
          id: payouts.length > 0 ? Math.max(...payouts.map(p => p.id)) + 1 : 1,
          processedDate: new Date().toISOString().split('T')[0]
        };
        setPayouts([...payouts, newPayout]);
        setIsLoading(false);
        resolve();
      }, 500);
    });
  };

  const exportPayouts = async (period: string, format: string) => {
    setIsLoading(true);
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        const newExport: PayoutExport = {
          id: payoutExports.length > 0 ? Math.max(...payoutExports.map(e => e.id)) + 1 : 1,
          exportDate: new Date().toISOString().split('T')[0],
          period,
          totalAmount: payouts.reduce((sum, p) => sum + p.netPayout, 0),
          payoutCount: payouts.length,
          status: 'generated',
          fileFormat: format as 'excel' | 'csv' | 'pdf'
        };
        setPayoutExports([newExport, ...payoutExports]);
        setIsLoading(false);
        resolve();
      }, 500);
    });
  };

  const value = {
    services,
    users,
    bookings,
    payouts,
    payoutExports,
    addService,
    updateService,
    deleteService,
    toggleServiceStatus,
    updateUser,
    updateBookingStatus,
    processPayout,
    addManualPayout,
    exportPayouts,
    isLoading,
    servicesLoading,
    error
  };

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => useContext(DataContext);
