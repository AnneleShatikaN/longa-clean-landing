
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Job {
  id: string;
  title: string;
  description: string;
  location: string;
  price: number;
  expectedPayout: number;
  duration: string;
  client: string;
  clientRating: number;
  status: 'requested' | 'accepted' | 'completed' | 'cancelled';
  requestedDate: string;
  acceptedDate?: string;
  completedDate?: string;
  payoutStatus: 'pending' | 'paid';
  urgency: 'low' | 'medium' | 'high';
  emergencyFee?: number;
  requirements: string[];
  category: string;
  subcategory: string;
  rating?: number;
  clientPhone?: string;
  // Add missing properties for compatibility
  service: string;
  clientName: string;
  amount: number;
  date: string;
}

export interface ProviderProfile {
  name: string;
  email: string;
  phone: string;
  rating: number;
  totalJobs: number;
  location: string;
  joinDate: string;
  lastActive: string;
}

export interface MonthlyEarning {
  month: string;
  amount: number;
  jobs: number;
}

export interface Rating {
  id: string;
  rating: number;
  comment: string;
  client: string;
  date: string;
  jobTitle: string;
}

export interface Notification {
  id: string;
  type: 'job_request' | 'payment' | 'rating' | 'system';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  time: string; // Add missing time property
  action?: {
    type: 'view_job' | 'accept_job' | 'view_payment';
    id: string;
  };
}

export interface ProviderData {
  profile: ProviderProfile;
  jobs: Job[];
  monthlyEarnings: MonthlyEarning[];
  ratings: Rating[];
  notifications: Notification[];
}

export const useProviderData = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [data, setData] = useState<ProviderData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check if user is a valid provider (has provider role and is active)
  const isValidProvider = user?.role === 'provider' && user?.is_active === true;

  const loadData = async () => {
    if (!user || !isValidProvider) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // In a real app, this would fetch from your API
      // For now, we'll use mock data but filter by location if set
      const mockData = await import('/public/data/provider_mock_data.json');
      
      let jobs = mockData.jobs || [];
      
      // Filter jobs by user's work location if set
      if (user.current_work_location) {
        jobs = jobs.filter((job: any) => 
          job.location?.toLowerCase().includes(user.current_work_location?.toLowerCase() || '')
        );
      }

      // Transform jobs to match our interface
      const transformedJobs = jobs.map((job: any) => ({
        id: job.id,
        title: job.service || job.title || 'Service',
        description: job.description || job.service || '',
        location: job.location,
        price: job.amount || job.price || 0,
        expectedPayout: job.expectedPayout || job.providerFee || 0,
        duration: job.duration || '1 hour',
        client: job.clientName || job.client || 'Client',
        clientRating: 5,
        status: job.status,
        requestedDate: job.date || new Date().toISOString(),
        acceptedDate: job.acceptedDate,
        completedDate: job.completedDate,
        payoutStatus: job.payoutStatus || 'pending',
        urgency: 'medium' as const,
        emergencyFee: job.emergencyFee,
        requirements: [],
        category: 'general',
        subcategory: 'general',
        rating: job.rating,
        clientPhone: job.clientPhone,
        // Add missing properties
        service: job.service || 'Service',
        clientName: job.clientName || 'Client',
        amount: job.amount || job.price || 0,
        date: job.date || new Date().toISOString().split('T')[0]
      }));

      // Transform notifications to include time property
      const transformedNotifications = (mockData.notifications || []).map((notification: any) => ({
        ...notification,
        time: notification.time || notification.timestamp || 'Just now'
      }));

      const processedData: ProviderData = {
        profile: {
          name: user.full_name || user.name || 'Provider',
          email: user.email || '',
          phone: user.phone || '',
          rating: user.rating || 0,
          totalJobs: user.total_jobs || 0,
          location: user.current_work_location || 'windhoek',
          joinDate: user.created_at || '',
          lastActive: new Date().toISOString()
        },
        jobs: transformedJobs,
        monthlyEarnings: mockData.monthlyEarnings || [],
        ratings: mockData.ratings || [],
        notifications: transformedNotifications
      };

      setData(processedData);
    } catch (err) {
      console.error('Error loading provider data:', err);
      setError('Failed to load provider data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user, isValidProvider]);

  const updateJobStatus = async (jobId: string, status: 'accepted' | 'completed' | 'cancelled') => {
    if (!data) return;

    try {
      // In a real app, this would call your API
      const updatedJobs = data.jobs.map(job => {
        if (job.id === jobId) {
          const updatedJob = { ...job, status };
          if (status === 'accepted') {
            updatedJob.acceptedDate = new Date().toISOString();
          } else if (status === 'completed') {
            updatedJob.completedDate = new Date().toISOString();
          }
          return updatedJob;
        }
        return job;
      });

      setData({ ...data, jobs: updatedJobs });

      toast({
        title: "Job Updated",
        description: `Job has been ${status}`,
      });
    } catch (err) {
      console.error('Error updating job status:', err);
      toast({
        title: "Error",
        description: "Failed to update job status",
        variant: "destructive"
      });
    }
  };

  const refetch = () => {
    loadData();
  };

  return {
    data,
    isLoading,
    error,
    updateJobStatus,
    isValidProvider,
    refetch
  };
};
