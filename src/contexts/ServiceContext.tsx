
import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { ServiceData, serviceSchema } from '@/schemas/validation';

export interface Service {
  id: number;
  name: string;
  type: 'one-off' | 'subscription';
  clientPrice: number;
  providerFee: number;
  commissionPercentage: number;
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
  createdAt: string;
  updatedAt: string;
}

interface ServiceState {
  services: Service[];
  isLoading: boolean;
  error: string | null;
}

type ServiceAction = 
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'ADD_SERVICE'; payload: Service }
  | { type: 'UPDATE_SERVICE'; payload: { id: number; updates: Partial<Service> } }
  | { type: 'DELETE_SERVICE'; payload: number }
  | { type: 'SET_SERVICES'; payload: Service[] };

const initialState: ServiceState = {
  services: [],
  isLoading: false,
  error: null
};

function serviceReducer(state: ServiceState, action: ServiceAction): ServiceState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload, isLoading: false };
    case 'ADD_SERVICE':
      return { ...state, services: [...state.services, action.payload] };
    case 'UPDATE_SERVICE':
      return {
        ...state,
        services: state.services.map(service =>
          service.id === action.payload.id 
            ? { ...service, ...action.payload.updates, updatedAt: new Date().toISOString() } 
            : service
        )
      };
    case 'DELETE_SERVICE':
      return {
        ...state,
        services: state.services.filter(service => service.id !== action.payload)
      };
    case 'SET_SERVICES':
      return { ...state, services: action.payload };
    default:
      return state;
  }
}

interface ServiceContextType extends ServiceState {
  createService: (serviceData: ServiceData) => Promise<Service>;
  updateService: (id: number, updates: Partial<ServiceData>) => Promise<void>;
  deleteService: (id: number) => Promise<void>;
  toggleServiceStatus: (id: number) => Promise<void>;
  getServiceById: (id: number) => Service | undefined;
  getServicesByType: (type: 'one-off' | 'subscription') => Service[];
  getActiveServices: () => Service[];
}

const ServiceContext = createContext<ServiceContextType | undefined>(undefined);

export const ServiceProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(serviceReducer, initialState);

  const createService = async (serviceData: ServiceData): Promise<Service> => {
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });

    try {
      const validatedData = serviceSchema.parse(serviceData);
      
      await new Promise(resolve => setTimeout(resolve, 500));

      const newService: Service = {
        id: Date.now(),
        name: validatedData.name,
        type: validatedData.type,
        clientPrice: validatedData.clientPrice,
        providerFee: validatedData.providerFee || (validatedData.clientPrice * (1 - (validatedData.commissionPercentage || 15) / 100)),
        commissionPercentage: validatedData.commissionPercentage || 15,
        duration: validatedData.duration,
        status: validatedData.status,
        tags: validatedData.tags,
        description: validatedData.description,
        requirements: validatedData.requirements || [],
        popularity: 0,
        averageRating: 0,
        totalBookings: 0,
        totalRevenue: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      dispatch({ type: 'ADD_SERVICE', payload: newService });
      dispatch({ type: 'SET_LOADING', payload: false });
      
      return newService;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Service creation failed';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      throw error;
    }
  };

  const updateService = async (id: number, updates: Partial<ServiceData>): Promise<void> => {
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });

    try {
      await new Promise(resolve => setTimeout(resolve, 500));

      dispatch({ type: 'UPDATE_SERVICE', payload: { id, updates } });
      dispatch({ type: 'SET_LOADING', payload: false });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Service update failed';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      throw error;
    }
  };

  const deleteService = async (id: number): Promise<void> => {
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });

    try {
      await new Promise(resolve => setTimeout(resolve, 500));

      dispatch({ type: 'DELETE_SERVICE', payload: id });
      dispatch({ type: 'SET_LOADING', payload: false });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Service deletion failed';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      throw error;
    }
  };

  const toggleServiceStatus = async (id: number): Promise<void> => {
    const service = state.services.find(s => s.id === id);
    if (!service) throw new Error('Service not found');

    const newStatus = service.status === 'active' ? 'inactive' : 'active';
    await updateService(id, { status: newStatus });
  };

  const getServiceById = (id: number): Service | undefined => {
    return state.services.find(service => service.id === id);
  };

  const getServicesByType = (type: 'one-off' | 'subscription'): Service[] => {
    return state.services.filter(service => service.type === type);
  };

  const getActiveServices = (): Service[] => {
    return state.services.filter(service => service.status === 'active');
  };

  const value: ServiceContextType = {
    ...state,
    createService,
    updateService,
    deleteService,
    toggleServiceStatus,
    getServiceById,
    getServicesByType,
    getActiveServices
  };

  return (
    <ServiceContext.Provider value={value}>
      {children}
    </ServiceContext.Provider>
  );
};

export const useServices = () => {
  const context = useContext(ServiceContext);
  if (context === undefined) {
    throw new Error('useServices must be used within a ServiceProvider');
  }
  return context;
};
