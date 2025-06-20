
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface PackageInclusion {
  service_id: string;
  quantity_per_package: number;
  provider_fee_per_job: number;
  services?: {
    id: string;
    name: string;
    client_price: number;
  };
}

interface EnhancedPackage {
  id: string;
  name: string;
  description: string;
  price: number;
  total_price: number;
  total_provider_payout: number;
  gross_profit: number;
  is_active: boolean;
  created_at: string;
  package_service_inclusions: PackageInclusion[];
}

export const useEnhancedPackages = () => {
  const [packages, setPackages] = useState<EnhancedPackage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const fetchPackages = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('subscription_packages')
        .select(`
          *,
          package_service_inclusions(
            service_id,
            quantity_per_package,
            provider_fee_per_job,
            services(id, name, client_price)
          )
        `)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPackages(data || []);
    } catch (error) {
      console.error('Error fetching packages:', error);
      toast({
        title: "Error",
        description: "Failed to load packages",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const createPackage = async (packageData: {
    name: string;
    description: string;
    total_price: number;
    service_inclusions: Array<{
      service_id: string;
      quantity: number;
      provider_payout: number;
    }>;
  }) => {
    try {
      // Calculate totals
      const total_provider_payout = packageData.service_inclusions.reduce(
        (sum, inc) => sum + (inc.provider_payout * inc.quantity), 0
      );
      const gross_profit = packageData.total_price - total_provider_payout;

      // Create package
      const { data: newPackage, error: packageError } = await supabase
        .from('subscription_packages')
        .insert({
          name: packageData.name,
          description: packageData.description,
          price: packageData.total_price,
          total_price: packageData.total_price,
          total_provider_payout,
          gross_profit,
          is_active: true
        })
        .select()
        .single();

      if (packageError) throw packageError;

      // Create inclusions
      const inclusions = packageData.service_inclusions.map(inc => ({
        package_id: newPackage.id,
        service_id: inc.service_id,
        quantity_per_package: inc.quantity,
        provider_fee_per_job: inc.provider_payout
      }));

      const { error: inclusionsError } = await supabase
        .from('package_service_inclusions')
        .insert(inclusions);

      if (inclusionsError) throw inclusions;

      await fetchPackages();
      return newPackage;
    } catch (error) {
      console.error('Error creating package:', error);
      throw error;
    }
  };

  const updatePackage = async (packageId: string, packageData: {
    name: string;
    description: string;
    total_price: number;
    service_inclusions: Array<{
      service_id: string;
      quantity: number;
      provider_payout: number;
    }>;
  }) => {
    try {
      // Calculate totals
      const total_provider_payout = packageData.service_inclusions.reduce(
        (sum, inc) => sum + (inc.provider_payout * inc.quantity), 0
      );
      const gross_profit = packageData.total_price - total_provider_payout;

      // Update package
      const { error: packageError } = await supabase
        .from('subscription_packages')
        .update({
          name: packageData.name,
          description: packageData.description,
          price: packageData.total_price,
          total_price: packageData.total_price,
          total_provider_payout,
          gross_profit
        })
        .eq('id', packageId);

      if (packageError) throw packageError;

      // Delete existing inclusions
      await supabase
        .from('package_service_inclusions')
        .delete()
        .eq('package_id', packageId);

      // Create new inclusions
      const inclusions = packageData.service_inclusions.map(inc => ({
        package_id: packageId,
        service_id: inc.service_id,
        quantity_per_package: inc.quantity,
        provider_fee_per_job: inc.provider_payout
      }));

      const { error: inclusionsError } = await supabase
        .from('package_service_inclusions')
        .insert(inclusions);

      if (inclusionsError) throw inclusionsError;

      await fetchPackages();
    } catch (error) {
      console.error('Error updating package:', error);
      throw error;
    }
  };

  const deletePackage = async (packageId: string) => {
    try {
      const { error } = await supabase
        .from('subscription_packages')
        .update({ is_active: false })
        .eq('id', packageId);

      if (error) throw error;
      await fetchPackages();
    } catch (error) {
      console.error('Error deleting package:', error);
      throw error;
    }
  };

  useEffect(() => {
    fetchPackages();
  }, []);

  return {
    packages,
    isLoading,
    fetchPackages,
    createPackage,
    updatePackage,
    deletePackage,
  };
};
