
import React, { createContext, useContext, useReducer, ReactNode, useEffect, useCallback } from 'react';
import { ServiceData, serviceSchema } from '@/schemas/validation';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useDataMode } from './DataModeContext';

export interface Service {
  id: string;
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
  category?: string;
  icon?: string;
  coverageAreas?: string[];
  categoryId?: string;
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
  | { type: 'UPDATE_SERVICE'; payload: { id: string; updates: Partial<Service> } }
  | { type: 'DELETE_SERVICE'; payload: string }
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

// Helper function to convert Supabase service to our Service interface
const mapSupabaseService = (supabaseService: any): Service => {
  const durationHours = Math.floor((supabaseService.duration_minutes || 0) / 60);
  const durationMinutes = (supabaseService.duration_minutes || 0) % 60;

  return {
    id: supabaseService.id,
    name: supabaseService.name,
    type: supabaseService.service_type as 'one-off' | 'subscription',
    clientPrice: supabaseService.client_price,
    providerFee: supabaseService.provider_fee || 0,
    commissionPercentage: supabaseService.commission_percentage || 0,
    duration: {
      hours: durationHours,
      minutes: durationMinutes
    },
    status: supabaseService.is_active ? 'active' : 'inactive',
    tags: supabaseService.tags || [],
    description: supabaseService.description || '',
    requirements: [],
    popularity: 0,
    averageRating: 0,
    totalBookings: 0,
    totalRevenue: 0,
    createdAt: supabaseService.created_at,
    updatedAt: supabaseService.updated_at,
    categoryId: supabaseService.category_id
  };
};

interface ServiceContextType extends ServiceState {
  createService: (serviceData: ServiceData) => Promise<Service>;
  updateService: (id: string, updates: Partial<ServiceData>) => Promise<void>;
  deleteService: (id: string) => Promise<void>;
  toggleServiceStatus: (id: string) => Promise<void>;
  getServiceById: (id: string) => Service | undefined;
  getServicesByType: (type: 'one-off' | 'subscription') => Service[];
  getActiveServices: () => Service[];
  getServicesByCategory: (category: string) => Service[];
  searchServices: (query: string) => Service[];
  getPopularServices: () => Service[];
  loadServices: () => Promise<void>;
}

const ServiceContext = createContext<ServiceContextType | undefined>(undefined);

export const ServiceProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(serviceReducer, initialState);
  const { toast } = useToast();
  const { isLoading: dataModeLoading } = useDataMode();

  // Load services from Supabase (live mode only)
  const loadServices = useCallback(async (): Promise<void> => {
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });

    try {
      console.log('[ServiceContext] Loading services from Supabase...');
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const mappedServices = data?.map(mapSupabaseService) || [];
      console.log('[ServiceContext] Loaded services from Supabase:', mappedServices);
      dispatch({ type: 'SET_SERVICES', payload: mappedServices });
      dispatch({ type: 'SET_LOADING', payload: false });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load services';
      console.error('[ServiceContext] Error loading services:', error);
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  }, [toast]);

  const createService = async (serviceData: ServiceData): Promise<Service> => {
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });

    try {
      const validatedData = serviceSchema.parse(serviceData);
      const totalMinutes = (validatedData.duration?.hours || 0) * 60 + (validatedData.duration?.minutes || 0);

      const { data, error } = await supabase
        .from('services')
        .insert({
          name: validatedData.name,
          description: validatedData.description,
          service_type: validatedData.type,
          client_price: validatedData.clientPrice,
          provider_fee: validatedData.providerFee || (validatedData.clientPrice * (1 - (validatedData.commissionPercentage || 15) / 100)),
          commission_percentage: validatedData.commissionPercentage || 15,
          duration_minutes: totalMinutes,
          is_active: validatedData.status === 'active',
          tags: validatedData.tags,
          category_id: validatedData.categoryId
        })
        .select()
        .single();

      if (error) throw error;

      const newService = mapSupabaseService(data);
      dispatch({ type: 'ADD_SERVICE', payload: newService });
      dispatch({ type: 'SET_LOADING', payload: false });

      toast({
        title: "Success",
        description: "Service created successfully",
      });

      return newService;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Service creation failed';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      throw error;
    }
  };

  const updateService = async (id: string, updates: Partial<ServiceData>): Promise<void> => {
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });

    try {
      const updateData: any = {};

      if (updates.name) updateData.name = updates.name;
      if (updates.description) updateData.description = updates.description;
      if (updates.type) updateData.service_type = updates.type;
      if (updates.clientPrice) updateData.client_price = updates.clientPrice;
      if (updates.providerFee) updateData.provider_fee = updates.providerFee;
      if (updates.commissionPercentage) updateData.commission_percentage = updates.commissionPercentage;
      if (updates.status) updateData.is_active = updates.status === 'active';
      if (updates.tags) updateData.tags = updates.tags;
      if (updates.duration) {
        updateData.duration_minutes = (updates.duration.hours || 0) * 60 + (updates.duration.minutes || 0);
      }
      if (updates.categoryId) updateData.category_id = updates.categoryId;

      const { data, error } = await supabase
        .from('services')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      const updatedService = mapSupabaseService(data);
      dispatch({ type: 'UPDATE_SERVICE', payload: { id, updates: updatedService } });
      dispatch({ type: 'SET_LOADING', payload: false });

      toast({
        title: "Success",
        description: "Service updated successfully",
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Service update failed';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      throw error;
    }
  };

  const deleteService = async (id: string): Promise<void> => {
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });

    try {
      const { error } = await supabase
        .from('services')
        .delete()
        .eq('id', id);

      if (error) throw error;

      dispatch({ type: 'DELETE_SERVICE', payload: id });
      dispatch({ type: 'SET_LOADING', payload: false });

      toast({
        title: "Success",
        description: "Service deleted successfully",
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Service deletion failed';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      throw error;
    }
  };

  const toggleServiceStatus = async (id: string): Promise<void> => {
    const service = state.services.find(s => s.id === id);
    if (!service) throw new Error('Service not found');

    const newStatus = service.status === 'active' ? 'inactive' : 'active';
    await updateService(id, { status: newStatus });
  };

  const getServiceById = (id: string): Service | undefined => {
    return state.services.find(service => service.id === id);
  };

  const getServicesByType = (type: 'one-off' | 'subscription'): Service[] => {
    return state.services.filter(service => service.type === type);
  };

  const getActiveServices = (): Service[] => {
    return state.services.filter(service => service.status === 'active');
  };

  const getServicesByCategory = (category: string): Service[] => {
    return state.services.filter(service => service.category === category);
  };

  const searchServices = (query: string): Service[] => {
    const lowercaseQuery = query.toLowerCase();
    return state.services.filter(service => 
      service.name.toLowerCase().includes(lowercaseQuery) ||
      service.description.toLowerCase().includes(lowercaseQuery) ||
      service.tags.some(tag => tag.toLowerCase().includes(lowercaseQuery))
    );
  };

  const getPopularServices = (): Service[] => {
    return state.services
      .filter(service => service.status === 'active')
      .sort((a, b) => b.popularity - a.popularity)
      .slice(0, 6);
  };

  // Load services when component mounts
  useEffect(() => {
    if (!dataModeLoading) {
      loadServices();
    }
  }, [loadServices, dataModeLoading]);

  const value: ServiceContextType = {
    ...state,
    createService,
    updateService,
    deleteService,
    toggleServiceStatus,
    getServiceById,
    getServicesByType,
    getActiveServices,
    getServicesByCategory,
    searchServices,
    getPopularServices,
    loadServices
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
