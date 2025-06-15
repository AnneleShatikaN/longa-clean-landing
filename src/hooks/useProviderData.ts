import { useState, useEffect, useCallback } from 'react';
import { useDataMode } from '@/contexts/DataModeContext';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

// Enhanced interfaces to match the comprehensive mock data
interface Job {
  id: string;
  service: string;
  clientName: string;
  clientPhone: string;
  clientEmail: string;
  location: string;
  amount: number;
  date: string;
  status: 'requested' | 'accepted' | 'completed';
  duration: string;
  completedDate?: string;
  rating?: number;
  reviewComment?: string;
  jobType: 'one-off' | 'subscription';
  expectedPayout: number;
  actualPayout?: number;
  commissionPercentage?: number;
  providerFee?: number;
  payoutStatus?: 'pending' | 'processing' | 'paid';
  payoutDate?: string;
}

interface Notification {
  id: number;
  type: 'new_job' | 'job_completed' | 'rating_received' | 'payment_received';
  title: string;
  message: string;
  time: string;
  read: boolean;
  actionable?: boolean;
}

interface Rating {
  id: number;
  jobId: string;
  rating: number;
  comment: string;
  clientName: string;
  date: string;
  service: string;
}

interface MonthlyEarnings {
  month: string;
  earnings: number;
  jobs: number;
  jobsCompleted: number;
  averageRating: number;
}

interface ProviderData {
  jobs: Job[];
  notifications: Notification[];
  ratings: Rating[];
  monthlyEarnings: MonthlyEarnings[];
  profile?: {
    id: string;
    name: string;
    email: string;
    phone: string;
    rating: number;
    totalJobs: number;
    specialties: string[];
    available: boolean;
    location: string;
    joinDate: string;
    lastActive: string;
    profilePicture?: string;
  };
}

// User ID to mock provider mapping function
const mapUserIdToMockProvider = (userId: string): string => {
  if (!userId) return 'provider-1';
  
  // Create a simple hash of the user ID
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    const char = userId.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  
  // Map to one of the three available mock providers
  const mockProviders = ['provider-1', 'provider-2', 'provider-3'];
  const index = Math.abs(hash) % mockProviders.length;
  const mappedId = mockProviders[index];
  
  console.log(`[useProviderData] Mapped user ID ${userId} to mock provider ${mappedId}`);
  return mappedId;
};

export const useProviderData = () => {
  const { dataMode, mockData } = useDataMode();
  const { user } = useAuth();
  const [data, setData] = useState<ProviderData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Validate user role
  const isValidProvider = user?.role === 'provider';

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Check if user is authenticated and has provider role
      if (!user) {
        throw new Error('User not authenticated');
      }

      if (!isValidProvider) {
        throw new Error('User is not a provider. Please contact your administrator.');
      }

      console.log(`[useProviderData] Loading data for user ${user.id} in ${dataMode} mode`);

      if (dataMode === 'mock') {
        await loadMockData();
      } else if (dataMode === 'live') {
        await loadLiveData();
      } else {
        // No data mode - return empty but valid structure
        console.log('[useProviderData] No data mode - returning empty data structure');
        setData({
          jobs: [],
          notifications: [],
          ratings: [],
          monthlyEarnings: [],
          profile: {
            id: user.id,
            name: user.name || user.full_name || 'Provider',
            email: user.email || '',
            phone: user.phone || '',
            rating: 0,
            totalJobs: 0,
            specialties: [],
            available: true,
            location: user.current_work_location || 'windhoek',
            joinDate: user.created_at || new Date().toISOString(),
            lastActive: new Date().toISOString()
          }
        });
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load provider data';
      setError(errorMessage);
      console.error('[useProviderData] Error loading provider data:', err);
    } finally {
      setIsLoading(false);
    }
  }, [dataMode, mockData, user, isValidProvider]);

  const loadMockData = async () => {
    if (!user) return;

    // Map the real user ID to a mock provider ID
    const mockProviderId = mapUserIdToMockProvider(user.id);

    console.log(`[useProviderData] Looking for mock provider data for ${mockProviderId}`);

    // Use mockData from context if available, otherwise fetch
    if (mockData?.provider) {
      const providerData = mockData.provider[mockProviderId];
      
      console.log(`[useProviderData] Mock data from context:`, providerData);
      
      if (!providerData) {
        console.warn(`[useProviderData] No mock data found for mapped provider ${mockProviderId}, using fallback`);
        // Create fallback data instead of throwing error
        setData({
          jobs: [],
          notifications: [],
          ratings: [],
          monthlyEarnings: [],
          profile: {
            id: user.id,
            name: user.name || user.full_name || 'Provider',
            email: user.email || '',
            phone: user.phone || '',
            rating: 0,
            totalJobs: 0,
            specialties: [],
            available: true,
            location: user.current_work_location || 'windhoek',
            joinDate: user.created_at || new Date().toISOString(),
            lastActive: new Date().toISOString()
          }
        });
        return;
      }

      // Filter jobs based on current work location
      const userLocation = user.current_work_location;
      let filteredJobs = providerData.jobs || [];
      
      if (userLocation) {
        // In mock mode, we'll filter based on a mock location property
        // For now, we'll just use all jobs since mock data doesn't have location
        console.log(`[useProviderData] User location: ${userLocation}, showing all mock jobs`);
      }

      setData({
        jobs: filteredJobs,
        notifications: providerData.notifications || [],
        ratings: providerData.ratings || [],
        monthlyEarnings: providerData.monthlyEarnings || [],
        profile: {
          ...providerData.profile,
          location: user.current_work_location || providerData.profile?.location || 'windhoek'
        } || {
          id: user.id,
          name: user.name || user.full_name || 'Provider',
          email: user.email || '',
          phone: user.phone || '',
          rating: 0,
          totalJobs: 0,
          specialties: [],
          available: true,
          location: user.current_work_location || 'windhoek',
          joinDate: user.created_at || new Date().toISOString(),
          lastActive: new Date().toISOString()
        }
      });
      
      console.log(`[useProviderData] Loaded mock data for user ${user.id} mapped to ${mockProviderId} from context`);
    } else {
      // Fallback to direct fetch
      try {
        const response = await fetch('/data/provider_mock_data.json');
        if (!response.ok) {
          throw new Error('Failed to load provider mock data');
        }
        
        const providerMockData = await response.json();
        const providerData = providerMockData[mockProviderId];
        
        console.log(`[useProviderData] Mock data from fetch:`, providerData);
        
        if (!providerData) {
          console.warn(`[useProviderData] No mock data found for mapped provider ${mockProviderId}, using fallback`);
          // Create fallback data instead of throwing error
          setData({
            jobs: [],
            notifications: [],
            ratings: [],
            monthlyEarnings: [],
            profile: {
              id: user.id,
              name: user.name || user.full_name || 'Provider',
              email: user.email || '',
              phone: user.phone || '',
              rating: 0,
              totalJobs: 0,
              specialties: [],
              available: true,
              location: 'windhoek',
              joinDate: user.created_at || new Date().toISOString(),
              lastActive: new Date().toISOString()
            }
          });
          return;
        }

        setData({
          jobs: providerData.jobs || [],
          notifications: providerData.notifications || [],
          ratings: providerData.ratings || [],
          monthlyEarnings: providerData.monthlyEarnings || [],
          profile: providerData.profile || {
            id: user.id,
            name: user.name || user.full_name || 'Provider',
            email: user.email || '',
            phone: user.phone || '',
            rating: 0,
            totalJobs: 0,
            specialties: [],
            available: true,
            location: 'windhoek',
            joinDate: user.created_at || new Date().toISOString(),
            lastActive: new Date().toISOString()
          }
        });
        
        console.log(`[useProviderData] Loaded mock data for user ${user.id} mapped to ${mockProviderId} via fetch`);
      } catch (fetchError) {
        console.error('[useProviderData] Failed to fetch mock data:', fetchError);
        // Set fallback data
        setData({
          jobs: [],
          notifications: [],
          ratings: [],
          monthlyEarnings: [],
          profile: {
            id: user.id,
            name: user.name || user.full_name || 'Provider',
            email: user.email || '',
            phone: user.phone || '',
            rating: 0,
            totalJobs: 0,
            specialties: [],
            available: true,
            location: 'windhoek',
            joinDate: user.created_at || new Date().toISOString(),
            lastActive: new Date().toISOString()
          }
        });
      }
    }
  };

  const loadLiveData = async () => {
    if (!user) return;

    console.log(`[useProviderData] Fetching live data for provider ${user.id}`);

    // Get user's current work location for filtering
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('current_work_location')
      .eq('id', user.id)
      .single();

    if (userError) {
      console.error('[useProviderData] Error fetching user location:', userError);
    }

    const userLocation = userData?.current_work_location;

    // Fetch jobs from bookings table with location filtering
    let bookingsQuery = supabase
      .from('bookings')
      .select(`
        id,
        booking_date,
        booking_time,
        status,
        total_amount,
        provider_payout,
        rating,
        review,
        emergency_booking,
        duration_minutes,
        special_instructions,
        location_town,
        services!inner(name, service_type, commission_percentage, provider_fee),
        users!bookings_client_id_fkey(full_name, phone, email)
      `)
      .order('created_at', { ascending: false });

    // Filter by provider's accepted jobs OR available jobs in their location
    if (userLocation && userLocation.trim() !== '') {
      bookingsQuery = bookingsQuery.or(`provider_id.eq.${user.id},and(provider_id.is.null,location_town.eq.${userLocation})`);
    } else {
      bookingsQuery = bookingsQuery.eq('provider_id', user.id);
    }

    const { data: bookingsData, error: bookingsError } = await bookingsQuery;

    if (bookingsError) {
      console.error('[useProviderData] Error fetching bookings:', bookingsError);
    }

    // Transform bookings data to match Job interface
    const jobs: Job[] = (bookingsData || []).map(booking => ({
      id: booking.id,
      service: booking.services?.name || 'Unknown Service',
      clientName: booking.users?.full_name || 'Unknown Client',
      clientPhone: booking.users?.phone || '',
      clientEmail: booking.users?.email || '',
      location: booking.location_town || 'Windhoek',
      amount: booking.total_amount || 0,
      date: booking.booking_date,
      status: booking.status as 'requested' | 'accepted' | 'completed',
      duration: `${booking.duration_minutes || 60} minutes`,
      completedDate: booking.status === 'completed' ? booking.booking_date : undefined,
      rating: booking.rating || undefined,
      reviewComment: booking.review || undefined,
      jobType: booking.services?.service_type === 'subscription' ? 'subscription' : 'one-off',
      expectedPayout: booking.provider_payout || 0,
      actualPayout: booking.provider_payout || undefined,
      commissionPercentage: booking.services?.commission_percentage || 15,
      providerFee: booking.services?.provider_fee || undefined,
      payoutStatus: booking.status === 'completed' ? 'pending' : undefined
    }));

    // Fetch notifications
    const { data: notificationsData, error: notificationsError } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(20);

    if (notificationsError) {
      console.error('[useProviderData] Error fetching notifications:', notificationsError);
    }

    // Transform notifications data
    const notifications: Notification[] = (notificationsData || []).map((notif, index) => ({
      id: index,
      type: notif.type as any || 'new_job',
      title: notif.title,
      message: notif.message,
      time: new Date(notif.created_at).toLocaleString(),
      read: notif.read || false,
      actionable: notif.type === 'new_job'
    }));

    // Calculate ratings from completed jobs
    const completedJobs = jobs.filter(job => job.status === 'completed' && job.rating);
    const ratings: Rating[] = completedJobs.map((job, index) => ({
      id: index,
      jobId: job.id,
      rating: job.rating || 0,
      comment: job.reviewComment || '',
      clientName: job.clientName,
      date: job.completedDate || job.date,
      service: job.service
    }));

    // Calculate monthly earnings from completed jobs
    const monthlyEarningsMap = new Map<string, { earnings: number; jobs: number; ratings: number[] }>();
    
    completedJobs.forEach(job => {
      const month = new Date(job.completedDate || job.date).toLocaleString('default', { month: 'long', year: 'numeric' });
      const current = monthlyEarningsMap.get(month) || { earnings: 0, jobs: 0, ratings: [] };
      current.earnings += job.expectedPayout;
      current.jobs += 1;
      if (job.rating) current.ratings.push(job.rating);
      monthlyEarningsMap.set(month, current);
    });

    const monthlyEarnings: MonthlyEarnings[] = Array.from(monthlyEarningsMap.entries()).map(([month, data]) => ({
      month,
      earnings: data.earnings,
      jobs: data.jobs,
      jobsCompleted: data.jobs,
      averageRating: data.ratings.length > 0 ? data.ratings.reduce((a, b) => a + b, 0) / data.ratings.length : 0
    }));

    // Create profile from user data
    const profile = {
      id: user.id,
      name: user.name || user.full_name || 'Provider',
      email: user.email,
      phone: user.phone || '',
      rating: user.rating || 0,
      totalJobs: user.total_jobs || jobs.filter(j => j.status === 'completed').length,
      specialties: [], // This would come from a separate table in a real app
      available: true,
      location: 'Windhoek',
      joinDate: user.created_at || new Date().toISOString(),
      lastActive: new Date().toISOString(),
      profilePicture: user.avatar_url || undefined
    };

    setData({
      jobs,
      notifications,
      ratings,
      monthlyEarnings,
      profile: {
        ...profile,
        location: userLocation || 'windhoek'
      }
    });

    console.log(`[useProviderData] Loaded live data for provider ${user.id}:`, {
      jobsCount: jobs.length,
      notificationsCount: notifications.length,
      ratingsCount: ratings.length,
      monthlyEarningsCount: monthlyEarnings.length,
      userLocation
    });
  };

  // Load data when component mounts or data mode changes
  useEffect(() => {
    loadData();
  }, [loadData]);

  // Listen for global data mode changes
  useEffect(() => {
    const handleDataModeChange = () => {
      console.log('[useProviderData] Global data mode changed, reloading data...');
      loadData();
    };

    window.addEventListener('datamode-changed', handleDataModeChange);
    
    return () => {
      window.removeEventListener('datamode-changed', handleDataModeChange);
    };
  }, [loadData]);

  // Job status update function
  const updateJobStatus = async (jobId: string, newStatus: 'accepted' | 'completed'): Promise<void> => {
    if (!data || !user) return;

    if (dataMode === 'mock') {
      // Update job status in memory for mock data
      const updatedJobs = data.jobs.map(job => {
        if (job.id === jobId) {
          const updatedJob = { ...job, status: newStatus };
          if (newStatus === 'completed') {
            updatedJob.completedDate = new Date().toISOString().split('T')[0];
            updatedJob.payoutStatus = 'pending';
          }
          return updatedJob;
        }
        return job;
      });

      setData(prev => prev ? { ...prev, jobs: updatedJobs } : null);
      console.log(`[useProviderData] Updated job ${jobId} status to ${newStatus} in mock mode`);
    } else if (dataMode === 'live') {
      // Update job status in Supabase
      const { error } = await supabase
        .from('bookings')
        .update({ 
          status: newStatus,
          ...(newStatus === 'completed' && { check_in_time: new Date().toISOString() })
        })
        .eq('id', jobId)
        .eq('provider_id', user.id);

      if (error) {
        console.error(`[useProviderData] Error updating job ${jobId}:`, error);
        throw new Error('Failed to update job status');
      }

      console.log(`[useProviderData] Updated job ${jobId} to status ${newStatus} in live mode`);
      
      // Reload data to reflect changes
      await loadData();
    }
  };

  return {
    data,
    isLoading,
    error,
    updateJobStatus,
    refetch: loadData,
    isValidProvider
  };
};
