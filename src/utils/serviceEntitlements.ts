
import { supabase } from '@/integrations/supabase/client';

export interface ServiceUsage {
  service_id: string;
  service_name: string;
  used_count: number;
  allowed_count: number;
  remaining_count: number;
  cycle_start: string;
  cycle_end: string;
  cycle_days: number; // Add missing property
}

export const getUserServiceUsage = async (userId: string): Promise<ServiceUsage[]> => {
  try {
    // Get user's active package with entitlements
    const { data: activePackage, error: packageError } = await supabase
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
      .eq('user_id', userId)
      .eq('status', 'active')
      .gte('expiry_date', new Date().toISOString().split('T')[0])
      .maybeSingle();

    if (packageError || !activePackage) {
      return [];
    }

    const entitlements = activePackage.package?.package_entitlements || [];
    const usagePromises = entitlements.map(async (entitlement) => {
      // Calculate cycle dates
      const cycleStart = new Date();
      cycleStart.setDate(cycleStart.getDate() - entitlement.cycle_days);
      
      // Get usage count for this service in current cycle
      const { count, error: usageError } = await supabase
        .from('service_usage_logs')
        .select('*', { count: 'exact' })
        .eq('user_id', userId)
        .eq('package_id', activePackage.package_id)
        .eq('allowed_service_id', entitlement.allowed_service_id)
        .gte('used_at', cycleStart.toISOString());

      if (usageError) {
        console.error('Error fetching usage:', usageError);
        return null;
      }

      const usedCount = count || 0;
      
      return {
        service_id: entitlement.allowed_service_id,
        service_name: entitlement.service?.name || 'Unknown Service',
        used_count: usedCount,
        allowed_count: entitlement.quantity_per_cycle,
        remaining_count: Math.max(0, entitlement.quantity_per_cycle - usedCount),
        cycle_start: cycleStart.toISOString(),
        cycle_end: new Date().toISOString(),
        cycle_days: entitlement.cycle_days
      };
    });

    const results = await Promise.all(usagePromises);
    return results.filter(result => result !== null) as ServiceUsage[];
  } catch (error) {
    console.error('Error getting user service usage:', error);
    return [];
  }
};

export const checkServiceAccess = async (userId: string, serviceId: string) => {
  try {
    const { data, error } = await supabase.rpc('use_package_service', {
      p_user_id: userId,
      p_service_id: serviceId
    });

    if (error) throw error;

    // Type cast the Json response to the expected structure
    const result = data as any;

    return {
      allowed: result?.success || false,
      reason: result?.error || result?.message || 'Unknown status',
      usageInfo: {
        used_count: result?.used_count || 0,
        allowed_count: result?.allowed_count || 0,
        remaining: result?.remaining || 0
      }
    };
  } catch (error) {
    console.error('Error checking service access:', error);
    return {
      allowed: false,
      reason: 'Error checking access'
    };
  }
};

export const logServiceUsage = async (
  userId: string,
  packageId: string,
  serviceId: string,
  bookingId?: string
) => {
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
