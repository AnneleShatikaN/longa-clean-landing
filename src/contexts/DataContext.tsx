import React, { createContext, useState, useContext, useEffect } from 'react';

export interface Booking {
  id: number;
  clientName: string;
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
}

export interface Payout {
  id: number;
  providerName: string;
  bookingIds: number[];
  totalEarnings: number;
  commission: number;
  status: 'pending' | 'completed' | 'failed';
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
}

interface DataContextProps {
  services: Service[];
  users: User[];
  bookings: Booking[];
  payouts: Payout[];
  addService: (service: Omit<Service, 'id'>) => Promise<void>;
  updateService: (id: number, updates: Partial<Service>) => Promise<void>;
  deleteService: (id: number) => Promise<void>;
  toggleServiceStatus: (id: number) => Promise<void>;
  updateUser: (id: number, updates: Partial<User>) => Promise<void>;
  updateBookingStatus: (id: number, status: Booking['status']) => Promise<void>;
  processPayout: (id: number) => Promise<void>;
  isLoading: boolean;
  servicesLoading: boolean;
  error: string | null;
}

const DataContext = createContext<DataContextProps>({
  services: [],
  users: [],
  bookings: [],
  payouts: [],
  addService: async () => {},
  updateService: async () => {},
  deleteService: async () => {},
  toggleServiceStatus: async () => {},
  updateUser: async () => {},
  updateBookingStatus: async () => {},
  processPayout: async () => {},
  isLoading: true,
  servicesLoading: true,
  error: null,
});

const mockServices: Service[] = [
  {
    id: 1,
    name: 'Basic Cleaning',
    type: 'one-off',
    clientPrice: 150,
    commissionPercentage: 10,
    duration: { hours: 2, minutes: 0 },
    status: 'active',
    tags: ['Residential Only'],
    description: 'A basic cleaning service for residential properties.'
  },
  {
    id: 2,
    name: 'Deep Cleaning Package',
    type: 'subscription',
    clientPrice: 400,
    providerFee: 320,
    duration: { hours: 4, minutes: 0 },
    status: 'active',
    tags: ['Residential Only', 'Requires Own Supplies'],
    description: 'A deep cleaning service package for recurring clients.'
  },
  {
    id: 3,
    name: 'Office Cleaning',
    type: 'one-off',
    clientPrice: 200,
    commissionPercentage: 15,
    duration: { hours: 3, minutes: 0 },
    status: 'active',
    tags: ['Business Only'],
    description: 'Professional cleaning services for office spaces.'
  },
  {
    id: 4,
    name: 'Move-In/Move-Out Cleaning',
    type: 'one-off',
    clientPrice: 180,
    commissionPercentage: 12,
    duration: { hours: 2, minutes: 30 },
    status: 'inactive',
    tags: ['Residential Only'],
    description: 'Cleaning service for properties during move-in or move-out.'
  },
  {
    id: 5,
    name: 'Custom Cleaning Package',
    type: 'subscription',
    clientPrice: 500,
    providerFee: 400,
    duration: { hours: 5, minutes: 0 },
    status: 'active',
    tags: ['Business Only', 'Residential Only'],
    description: 'A custom cleaning service package tailored to client needs.'
  }
];

const mockUsers: User[] = [
  { 
    id: 1, 
    name: 'John Doe', 
    email: 'john@example.com', 
    role: 'client', 
    rating: null, 
    status: 'active' 
  },
  { 
    id: 2, 
    name: 'Jane Smith', 
    email: 'jane@example.com', 
    role: 'provider', 
    rating: 4.8, 
    status: 'active', 
    available: true,
    bankMobileNumber: '+264 81 234 5678'
  },
  { 
    id: 3, 
    name: 'Mike Johnson', 
    email: 'mike@example.com', 
    role: 'provider', 
    rating: 4.5, 
    status: 'active', 
    available: false,
    bankMobileNumber: '+264 85 987 6543'
  },
  { 
    id: 4, 
    name: 'Sarah Wilson', 
    email: 'sarah@example.com', 
    role: 'admin', 
    rating: null, 
    status: 'active' 
  },
  { 
    id: 5, 
    name: 'Tom Brown', 
    email: 'tom@example.com', 
    role: 'provider', 
    rating: 4.2, 
    status: 'pending', 
    available: true,
    bankMobileNumber: 'Bank: 12345678901'
  }
];

const mockBookings: Booking[] = [
  {
    id: 1,
    clientName: 'Alice Johnson',
    providerName: 'Jane Smith',
    providerId: 2,
    serviceName: 'Basic Cleaning',
    date: '2024-07-15',
    time: '09:00',
    amount: 150,
    status: 'completed',
    jobType: 'one-off',
    completionDate: '2024-07-15',
    expectedPayout: 135,
    commissionPercentage: 10,
    paidOut: true
  },
  {
    id: 2,
    clientName: 'Bob Williams',
    providerName: 'Mike Johnson',
    providerId: 3,
    serviceName: 'Office Cleaning',
    date: '2024-07-16',
    time: '14:00',
    amount: 200,
    status: 'completed',
    jobType: 'one-off',
    completionDate: '2024-07-16',
    expectedPayout: 180,
    commissionPercentage: 15,
    paidOut: false
  },
  {
    id: 3,
    clientName: 'Charlie Brown',
    providerName: 'Jane Smith',
    providerId: 2,
    serviceName: 'Deep Cleaning Package',
    date: '2024-07-17',
    time: '11:00',
    amount: 400,
    status: 'in-progress',
    jobType: 'subscription'
  },
  {
    id: 4,
    clientName: 'Diana Miller',
    providerName: 'Mike Johnson',
    providerId: 3,
    serviceName: 'Basic Cleaning',
    date: '2024-07-18',
    time: '10:00',
    amount: 150,
    status: 'pending',
    jobType: 'one-off'
  },
  {
    id: 5,
    clientName: 'Eve Davis',
    providerName: 'Jane Smith',
    providerId: 2,
    serviceName: 'Custom Cleaning Package',
    date: '2024-07-19',
    time: '13:00',
    amount: 500,
    status: 'completed',
    jobType: 'subscription',
    completionDate: '2024-07-19',
    expectedPayout: 400,
    paidOut: false
  },
  {
    id: 6,
    clientName: 'Frank White',
    providerName: 'Mike Johnson',
    providerId: 3,
    serviceName: 'Office Cleaning',
    date: '2024-07-20',
    time: '15:00',
    amount: 200,
    status: 'cancelled',
    jobType: 'one-off'
  },
  {
    id: 7,
    clientName: 'Grace Taylor',
    providerName: 'Jane Smith',
    providerId: 2,
    serviceName: 'Basic Cleaning',
    date: '2024-07-21',
    time: '16:00',
    amount: 150,
    status: 'accepted',
    jobType: 'one-off'
  },
  {
    id: 8,
    clientName: 'Henry Moore',
    providerName: 'Mike Johnson',
    providerId: 3,
    serviceName: 'Move-In/Move-Out Cleaning',
    date: '2024-07-22',
    time: '12:00',
    amount: 180,
    status: 'completed',
    jobType: 'one-off',
    completionDate: '2024-07-22',
    expectedPayout: 162,
    commissionPercentage: 12,
    paidOut: false
  },
  {
    id: 9,
    clientName: 'Ivy Hall',
    providerName: 'Jane Smith',
    providerId: 2,
    serviceName: 'Deep Cleaning Package',
    date: '2024-07-23',
    time: '14:00',
    amount: 400,
    status: 'completed',
    jobType: 'subscription',
    completionDate: '2024-07-23',
    expectedPayout: 320,
    paidOut: false
  },
  {
    id: 10,
    clientName: 'Jack Green',
    providerName: 'Mike Johnson',
    providerId: 3,
    serviceName: 'Office Cleaning',
    date: '2024-07-24',
    time: '09:00',
    amount: 200,
    status: 'completed',
    jobType: 'one-off',
    completionDate: '2024-07-24',
    expectedPayout: 180,
    commissionPercentage: 15,
    paidOut: false
  }
];

const mockPayouts: Payout[] = [
  {
    id: 1,
    providerName: 'Jane Smith',
    bookingIds: [1, 5],
    totalEarnings: 535,
    commission: 55,
    status: 'completed'
  },
  {
    id: 2,
    providerName: 'Mike Johnson',
    bookingIds: [2, 8, 10],
    totalEarnings: 522,
    commission: 78,
    status: 'pending'
  }
];

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [services, setServices] = useState<Service[]>(mockServices);
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [bookings, setBookings] = useState<Booking[]>(mockBookings);
  const [payouts, setPayouts] = useState<Payout[]>(mockPayouts);
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
        setBookings(bookings.map(booking =>
          booking.id === id ? { ...booking, status } : booking
        ));
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
          payout.id === id ? { ...payout, status: 'completed' } : payout
        ));
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
    addService,
    updateService,
    deleteService,
    toggleServiceStatus,
    updateUser,
    updateBookingStatus,
    processPayout,
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
