
import { useState, useEffect, useCallback } from 'react';
import { useDataMode } from '@/contexts/DataModeContext';

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
  jobId: string; // Changed from number to string to match Supabase UUID
  rating: number;
  comment: string;
  clientName: string; // Changed from 'client' to 'clientName'
  date: string;
  service: string;
}

interface MonthlyEarnings { // Changed from MonthlyEarning to MonthlyEarnings
  month: string;
  earnings: number;
  jobs: number; // This will be mapped to jobsCompleted
  jobsCompleted: number; // Added for EarningsTracker compatibility
  averageRating: number; // Added for EarningsTracker compatibility
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

export const useProviderData = () => {
  const { dataMode } = useDataMode();
  const [data, setData] = useState<ProviderData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Mock current provider ID - in real app this would come from auth context
  const currentProviderId = 'provider-1';

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      if (dataMode === 'mock') {
        // Load provider-specific mock data
        const response = await fetch('/data/provider_mock_data.json');
        if (!response.ok) {
          throw new Error('Failed to load provider mock data');
        }
        
        const providerMockData = await response.json();
        const providerData = providerMockData[currentProviderId];
        
        if (!providerData) {
          throw new Error(`No mock data found for provider ${currentProviderId}`);
        }

        setData({
          jobs: providerData.jobs || [],
          notifications: providerData.notifications || [],
          ratings: providerData.ratings || [],
          monthlyEarnings: providerData.monthlyEarnings || [],
          profile: providerData.profile
        });
        
        console.log(`[useProviderData] Loaded mock data for provider ${currentProviderId}`);
      } else if (dataMode === 'live') {
        // TODO: Implement live data fetching from Supabase
        setData({
          jobs: [],
          notifications: [],
          ratings: [],
          monthlyEarnings: []
        });
        console.log('[useProviderData] Live data mode - empty data returned');
      } else {
        // No data mode
        setData(null);
        console.log('[useProviderData] No data mode - null data returned');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load provider data';
      setError(errorMessage);
      console.error('[useProviderData] Error loading provider data:', err);
    } finally {
      setIsLoading(false);
    }
  }, [dataMode, currentProviderId]);

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
    if (!data) return;

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
      console.log(`[useProviderData] Updated job ${jobId} status to ${newStatus}`);
    } else if (dataMode === 'live') {
      // TODO: Implement live data update to Supabase
      console.log(`[useProviderData] Updating job ${jobId} to status ${newStatus} in live mode`);
    }
  };

  return {
    data,
    isLoading,
    error,
    updateJobStatus,
    refetch: loadData
  };
};
