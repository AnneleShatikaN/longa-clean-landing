
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface PackageEntitlement {
  id: string;
  allowed_service_id: string;
  quantity_per_cycle: number;
  cycle_days: number;
  service?: {
    id: string;
    name: string;
    description?: string;
    client_price: number;
    duration_minutes: number;
  };
}

export interface SubscriptionPackage {
  id: string;
  name: string;
  description?: string;
  price: number;
  duration_days: number;
  is_active: boolean;
  entitlements?: PackageEntitlement[];
}

export interface UserActivePackage {
  id: string;
  user_id: string;
  package_id: string;
  start_date: string;
  expiry_date: string;
  status: string;
  package: SubscriptionPackage;
}

export const useSubscriptionPackages = () => {
  const [packages, setPackages] = useState<SubscriptionPackage[]>([]);
  const [userActivePackage, setUserActivePackage] = useState<UserActivePackage | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchPackages = async () => {
    try {
      const { data, error } = await supabase
        .from('subscription_packages')
        .select(`
          *,
          package_entitlements:package_entitlements(
            *,
            service:services(*)
          )
        `)
        .eq('is_active', true)
        .order('price', { ascending: true });

      if (error) throw error;

      const packagesWithEntitlements = (data || []).map(pkg => ({
        ...pkg,
        entitlements: pkg.package_entitlements || []
      }));

      setPackages(packagesWithEntitlements);
    } catch (err) {
      console.error('Error fetching packages:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch packages');
    }
  };

  const fetchUserActivePackage = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_active_packages')
        .select(`
          *,
          package:subscription_packages(
            *,
            package_entitlements:package_entitlements(
              *,
              service:services(*)
            )
          )
        `)
        .eq('user_id', user.id)
        .eq('status', 'active')
        .gte('expiry_date', new Date().toISOString().split('T')[0])
        .maybeSingle();

      if (error && error.code !== 'PGRST116') throw error;

      setUserActivePackage(data);
    } catch (err) {
      console.error('Error fetching user active package:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch active package');
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      await Promise.all([fetchPackages(), fetchUserActivePackage()]);
      setIsLoading(false);
    };

    loadData();
  }, [user]);

  const checkServiceAccess = async (serviceId: string) => {
    if (!user) return { allowed: false, reason: 'Not authenticated' };

    try {
      const { data, error } = await supabase.rpc('use_package_service', {
        p_user_id: user.id,
        p_service_id: serviceId
      });

      if (error) throw error;

      return {
        allowed: data?.success || false,
        reason: data?.error || 'Unknown error',
        usageInfo: {
          used_count: data?.used_count || 0,
          allowed_count: data?.allowed_count || 0,
          remaining: data?.remaining || 0
        }
      };
    } catch (err) {
      console.error('Error checking service access:', err);
      return { allowed: false, reason: 'Error checking access' };
    }
  };

  const createPackagePurchase = async (packageId: string) => {
    if (!user) throw new Error('User not authenticated');

    const selectedPackage = packages.find(p => p.id === packageId);
    if (!selectedPackage) throw new Error('Package not found');

    try {
      const { data, error } = await supabase
        .from('pending_transactions')
        .insert({
          user_id: user.id,
          package_id: packageId,
          amount: selectedPackage.price,
          transaction_type: 'subscription',
          booking_details: {
            package_name: selectedPackage.name,
            duration_days: selectedPackage.duration_days
          }
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (err) {
      console.error('Error creating package purchase:', err);
      throw err;
    }
  };

  return {
    packages,
    userActivePackage,
    isLoading,
    error,
    checkServiceAccess,
    createPackagePurchase,
    refreshData: () => {
      fetchPackages();
      fetchUserActivePackage();
    }
  };
};
