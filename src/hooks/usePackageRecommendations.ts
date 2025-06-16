
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface PackageRecommendation {
  package_id: string;
  recommendation_score: number;
  reason: string;
}

export const usePackageRecommendations = () => {
  const [recommendations, setRecommendations] = useState<PackageRecommendation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchRecommendations = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      // Get user's booking history to understand preferences
      const { data: bookingHistory, error: bookingError } = await supabase
        .from('bookings')
        .select(`
          service_id,
          services!inner (
            service_type,
            name
          )
        `)
        .eq('client_id', user.id);

      if (bookingError) throw bookingError;

      // Get all package entitlements
      const { data: entitlements, error: entitlementsError } = await supabase
        .from('package_entitlements')
        .select('package_id, allowed_service_id, quantity_per_cycle');

      if (entitlementsError) throw entitlementsError;

      // Create simple recommendations based on service coverage
      const packageScores = new Map<string, { score: number; serviceCount: number }>();

      entitlements?.forEach(entitlement => {
        const existing = packageScores.get(entitlement.package_id) || { score: 0, serviceCount: 0 };
        
        // Base score for each service
        let serviceScore = 5;
        
        // Boost score if user has booked this service before
        const hasBookedService = bookingHistory?.some(booking => 
          booking.service_id === entitlement.allowed_service_id
        );
        
        if (hasBookedService) {
          serviceScore += 15;
        }

        packageScores.set(entitlement.package_id, {
          score: existing.score + serviceScore,
          serviceCount: existing.serviceCount + 1
        });
      });

      // Convert to recommendations
      const recommendations: PackageRecommendation[] = Array.from(packageScores.entries())
        .map(([packageId, data]) => ({
          package_id: packageId,
          recommendation_score: data.score,
          reason: data.serviceCount > 5 
            ? 'Comprehensive package with many services'
            : data.score > 50 
            ? 'Based on your booking history'
            : 'Good starter package'
        }))
        .sort((a, b) => b.recommendation_score - a.recommendation_score)
        .slice(0, 3);

      setRecommendations(recommendations);
    } catch (error) {
      console.error('Error fetching recommendations:', error);
      toast({
        title: "Error",
        description: "Failed to load package recommendations",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRecommendations();
  }, [user]);

  return {
    recommendations,
    isLoading,
    refreshRecommendations: fetchRecommendations
  };
};
