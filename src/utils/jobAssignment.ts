
import { supabase } from '@/integrations/supabase/client';

interface JobAssignmentOptions {
  clientTown: string;
  clientSuburb: string;
  serviceId: string;
  bookingId: string;
}

interface ProviderMatch {
  id: string;
  town: string;
  suburb: string;
  max_distance: number;
  rating: number;
  total_jobs: number;
  is_available: boolean;
  distance: number;
}

export const assignJobToNearbyProvider = async ({
  clientTown,
  clientSuburb,
  serviceId,
  bookingId
}: JobAssignmentOptions): Promise<string | null> => {
  try {
    console.log('Starting job assignment for:', { clientTown, clientSuburb, serviceId, bookingId });

    // Get available providers in the same town
    const { data: providers, error: providersError } = await supabase
      .from('users')
      .select('id, town, suburb, max_distance, rating, total_jobs, is_available, verification_status')
      .eq('role', 'provider')
      .eq('is_active', true)
      .eq('is_available', true)
      .eq('verification_status', 'verified')
      .eq('town', clientTown);

    if (providersError) {
      console.error('Error fetching providers:', providersError);
      return null;
    }

    if (!providers || providers.length === 0) {
      console.log('No available providers found in town:', clientTown);
      return null;
    }

    console.log('Found providers:', providers.length);

    // Get distance data for all provider-client suburb combinations
    const providerMatches: ProviderMatch[] = [];

    for (const provider of providers) {
      if (!provider.suburb) continue;

      // Get distance between provider suburb and client suburb
      const { data: distanceData, error: distanceError } = await supabase
        .from('location_map')
        .select('distance')
        .eq('town', clientTown)
        .eq('suburb_a', provider.suburb)
        .eq('suburb_b', clientSuburb)
        .single();

      if (distanceError) {
        console.log('No distance data found for:', provider.suburb, 'to', clientSuburb);
        continue;
      }

      const distance = distanceData?.distance ?? 999;

      // Check if provider is willing to travel this distance
      if (distance <= provider.max_distance) {
        providerMatches.push({
          id: provider.id,
          town: provider.town,
          suburb: provider.suburb,
          max_distance: provider.max_distance,
          rating: provider.rating || 0,
          total_jobs: provider.total_jobs || 0,
          is_available: provider.is_available,
          distance
        });
      }
    }

    if (providerMatches.length === 0) {
      console.log('No providers willing to travel to client location');
      return null;
    }

    // Sort by distance first, then by rating, then by experience
    providerMatches.sort((a, b) => {
      if (a.distance !== b.distance) return a.distance - b.distance;
      if (a.rating !== b.rating) return b.rating - a.rating;
      return b.total_jobs - a.total_jobs;
    });

    const selectedProvider = providerMatches[0];
    console.log('Selected provider:', selectedProvider);

    // Update the booking with the assigned provider
    const { error: updateError } = await supabase
      .from('bookings')
      .update({
        provider_id: selectedProvider.id,
        assigned_provider_id: selectedProvider.id,
        assignment_status: 'auto_assigned',
        status: 'assigned',
        assigned_at: new Date().toISOString()
      })
      .eq('id', bookingId);

    if (updateError) {
      console.error('Error updating booking with provider:', updateError);
      return null;
    }

    console.log('Successfully assigned job to provider:', selectedProvider.id);
    return selectedProvider.id;

  } catch (error) {
    console.error('Error in job assignment:', error);
    return null;
  }
};

export const getAvailableProvidersForLocation = async (
  town: string,
  suburb: string,
  serviceId?: string
): Promise<ProviderMatch[]> => {
  try {
    // Get all available providers in the same town
    const { data: providers, error } = await supabase
      .from('users')
      .select('id, town, suburb, max_distance, rating, total_jobs, is_available')
      .eq('role', 'provider')
      .eq('is_active', true)
      .eq('is_available', true)
      .eq('verification_status', 'verified')
      .eq('town', town);

    if (error) throw error;

    if (!providers) return [];

    const matches: ProviderMatch[] = [];

    for (const provider of providers) {
      if (!provider.suburb) continue;

      // Get distance
      const { data: distanceData } = await supabase
        .from('location_map')
        .select('distance')
        .eq('town', town)
        .eq('suburb_a', provider.suburb)
        .eq('suburb_b', suburb)
        .single();

      const distance = distanceData?.distance ?? 999;

      if (distance <= provider.max_distance) {
        matches.push({
          ...provider,
          distance
        });
      }
    }

    // Sort by distance, rating, and experience
    return matches.sort((a, b) => {
      if (a.distance !== b.distance) return a.distance - b.distance;
      if (a.rating !== b.rating) return b.rating - a.rating;
      return b.total_jobs - a.total_jobs;
    });

  } catch (error) {
    console.error('Error getting available providers:', error);
    return [];
  }
};
