
import { supabase } from '@/integrations/supabase/client';

export interface ServiceEntitlement {
  id: string;
  package_id: string;
  allowed_service_id: string;
  quantity_per_cycle: number;
  cycle_days: number;
}

export interface UserPackage {
  id: string;
  user_id: string;
  package_id: string;
  start_date: string;
  expiry_date: string;
  status: string;
}

export interface ServiceUsage {
  service_id: string;
  used_count: number;
  allowed_count: number;
  package_id: string;
}

export const checkServiceAccess = async (userId: string, serviceId: string): Promise<{
  allowed: boolean;
  reason?: string;
  usage?: ServiceUsage;
}> => {
  try {
    // Get user's active package
    const { data: activePackages, error: packageError } = await supabase
      .from('user_active_packages')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'active')
      .gte('expiry_date', new Date().toISOString().split('T')[0]);

    if (packageError) throw packageError;
    
    if (!activePackages || activePackages.length === 0) {
      return { allowed: false, reason: 'No active package found. Please purchase a package to book services.' };
    }

    const activePackage = activePackages[0];

    // Check if service is included in the package entitlements
    const { data: entitlements, error: entitlementError } = await supabase
      .from('package_entitlements')
      .select('*')
      .eq('package_id', activePackage.package_id)
      .eq('allowed_service_id', serviceId);

    if (entitlementError) throw entitlementError;

    if (!entitlements || entitlements.length === 0) {
      return { allowed: false, reason: 'Service not included in your active package' };
    }

    const entitlement = entitlements[0];

    // Check usage within current cycle
    const cycleStartDate = new Date();
    cycleStartDate.setDate(cycleStartDate.getDate() - entitlement.cycle_days);

    const { data: usageLogs, error: usageError } = await supabase
      .from('service_usage_logs')
      .select('*')
      .eq('user_id', userId)
      .eq('package_id', activePackage.package_id)
      .eq('allowed_service_id', serviceId)
      .gte('used_at', cycleStartDate.toISOString());

    if (usageError) throw usageError;

    const usedCount = usageLogs?.length || 0;
    const allowedCount = entitlement.quantity_per_cycle;

    const usage: ServiceUsage = {
      service_id: serviceId,
      used_count: usedCount,
      allowed_count: allowedCount,
      package_id: activePackage.package_id
    };

    if (usedCount >= allowedCount) {
      return { 
        allowed: false, 
        reason: `You've used all your available services for this cycle (${usedCount}/${allowedCount})`,
        usage 
      };
    }

    return { allowed: true, usage };
  } catch (error) {
    console.error('Error checking service access:', error);
    return { allowed: false, reason: 'Error checking service access' };
  }
};

export const logServiceUsage = async (
  userId: string, 
  packageId: string, 
  serviceId: string, 
  bookingId?: string
): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('service_usage_logs')
      .insert({
        user_id: userId,
        package_id: packageId,
        allowed_service_id: serviceId,
        booking_id: bookingId
      });

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error logging service usage:', error);
    return false;
  }
};

export const getUserServiceUsage = async (userId: string): Promise<ServiceUsage[]> => {
  try {
    // Get user's active package
    const { data: activePackages, error: packageError } = await supabase
      .from('user_active_packages')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'active')
      .gte('expiry_date', new Date().toISOString().split('T')[0]);

    if (packageError || !activePackages || activePackages.length === 0) {
      return [];
    }

    const activePackage = activePackages[0];

    // Get all entitlements for the package
    const { data: entitlements, error: entitlementError } = await supabase
      .from('package_entitlements')
      .select('*')
      .eq('package_id', activePackage.package_id);

    if (entitlementError || !entitlements) return [];

    const usageData: ServiceUsage[] = [];

    for (const entitlement of entitlements) {
      // Calculate current cycle usage
      const cycleStartDate = new Date();
      cycleStartDate.setDate(cycleStartDate.getDate() - entitlement.cycle_days);

      const { data: usageLogs, error: usageError } = await supabase
        .from('service_usage_logs')
        .select('*')
        .eq('user_id', userId)
        .eq('package_id', activePackage.package_id)
        .eq('allowed_service_id', entitlement.allowed_service_id)
        .gte('used_at', cycleStartDate.toISOString());

      if (!usageError) {
        usageData.push({
          service_id: entitlement.allowed_service_id,
          used_count: usageLogs?.length || 0,
          allowed_count: entitlement.quantity_per_cycle,
          package_id: activePackage.package_id
        });
      }
    }

    return usageData;
  } catch (error) {
    console.error('Error getting user service usage:', error);
    return [];
  }
};
