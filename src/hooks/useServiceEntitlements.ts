
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getUserServiceUsage, checkServiceAccess, type ServiceUsage } from '@/utils/serviceEntitlements';

export const useServiceEntitlements = () => {
  const { user } = useAuth();
  const [serviceUsage, setServiceUsage] = useState<ServiceUsage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      loadServiceUsage();
    } else {
      setServiceUsage([]);
      setIsLoading(false);
    }
  }, [user]);

  const loadServiceUsage = async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      setError(null);
      const usage = await getUserServiceUsage(user.id);
      setServiceUsage(usage);
    } catch (err) {
      console.error('Error loading service usage:', err);
      setError('Failed to load service usage');
    } finally {
      setIsLoading(false);
    }
  };

  const checkAccess = async (serviceId: string) => {
    if (!user) return { allowed: false, reason: 'Not authenticated' };
    
    try {
      return await checkServiceAccess(user.id, serviceId);
    } catch (error) {
      console.error('Error checking service access:', error);
      return { allowed: false, reason: 'Error checking access' };
    }
  };

  const refreshUsage = () => {
    if (user) {
      loadServiceUsage();
    }
  };

  return {
    serviceUsage,
    isLoading,
    error,
    checkAccess,
    refreshUsage
  };
};
