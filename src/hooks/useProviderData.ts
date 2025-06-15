
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
  id: number;
  type: 'new_job' | 'job_completed' | 'rating_received' | 'payment_received';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  time: string;
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

      // Fetch bookings from Supabase
      const { data: bookingsData, error: bookingsError } = await supabase
        .from('bookings')
        .select(`
          *,
          service:services(*),
          client:users!bookings_client_id_fkey(*)
        `)
        .or(`provider_id.eq.${user.id},provider_id.is.null`)
        .order('created_at', { ascending: false });

      if (bookingsError) throw bookingsError;

      // Fetch notifications
      const { data: notificationsData, error: notificationsError } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .eq('channel', 'in_app')
        .order('created_at', { ascending: false })
        .limit(50);

      if (notificationsError) throw notificationsError;

      // Transform bookings to match Job interface
      const transformedJobs: Job[] = (bookingsData || []).map((booking: any, index: number) => ({
        id: booking.id,
        title: booking.service?.name || 'Service',
        description: booking.service?.description || booking.special_instructions || '',
        location: booking.location_town || 'Windhoek',
        price: booking.total_amount || 0,
        expectedPayout: booking.provider_payout || 0,
        duration: `${booking.duration_minutes || 60} minutes`,
        client: booking.client?.full_name || 'Client',
        clientRating: 5,
        status: booking.status === 'pending' ? 'requested' : booking.status,
        requestedDate: booking.created_at || new Date().toISOString(),
        acceptedDate: booking.status === 'accepted' ? booking.created_at : undefined,
        completedDate: booking.status === 'completed' ? booking.created_at : undefined,
        payoutStatus: booking.status === 'completed' ? 'pending' : 'pending',
        urgency: booking.emergency_booking ? 'high' : 'medium',
        emergencyFee: booking.emergency_booking ? 50 : undefined,
        requirements: [],
        category: 'general',
        subcategory: 'general',
        rating: booking.rating,
        clientPhone: booking.client?.phone,
        // Add missing properties
        service: booking.service?.name || 'Service',
        clientName: booking.client?.full_name || 'Client',
        amount: booking.total_amount || 0,
        date: booking.booking_date || new Date().toISOString().split('T')[0]
      }));

      // Transform notifications to match interface
      const transformedNotifications: Notification[] = (notificationsData || []).map((notification: any, index: number) => {
        // Map notification types to expected values
        let mappedType: 'new_job' | 'job_completed' | 'rating_received' | 'payment_received';
        switch (notification.type) {
          case 'job_request':
          case 'new_booking':
            mappedType = 'new_job';
            break;
          case 'job_completed':
          case 'booking_completed':
            mappedType = 'job_completed';
            break;
          case 'rating':
          case 'rating_received':
            mappedType = 'rating_received';
            break;
          case 'payment':
          case 'payout_processed':
            mappedType = 'payment_received';
            break;
          default:
            mappedType = 'new_job';
        }

        return {
          id: index + 1, // Use index as number ID
          type: mappedType,
          title: notification.title,
          message: notification.message,
          timestamp: notification.created_at,
          read: notification.read,
          time: new Date(notification.created_at).toLocaleTimeString(),
          action: notification.booking_id ? {
            type: 'view_job' as const,
            id: notification.booking_id
          } : undefined
        };
      });

      // Calculate monthly earnings from completed jobs
      const completedJobs = transformedJobs.filter(job => job.status === 'completed');
      const monthlyEarnings: MonthlyEarning[] = [];
      
      // Get last 6 months
      for (let i = 5; i >= 0; i--) {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        const monthKey = date.toISOString().slice(0, 7);
        const monthName = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
        
        const monthJobs = completedJobs.filter(job => 
          job.completedDate?.startsWith(monthKey)
        );
        
        monthlyEarnings.push({
          month: monthName,
          amount: monthJobs.reduce((sum, job) => sum + job.expectedPayout, 0),
          jobs: monthJobs.length
        });
      }

      // Generate ratings from completed jobs with ratings
      const ratings: Rating[] = completedJobs
        .filter(job => job.rating)
        .map(job => ({
          id: job.id,
          rating: job.rating!,
          comment: 'Great service!',
          client: job.clientName,
          date: job.completedDate || job.date,
          jobTitle: job.title
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
        monthlyEarnings,
        ratings,
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
      // Update booking status in Supabase
      const { error } = await supabase
        .from('bookings')
        .update({ 
          status,
          provider_id: status === 'accepted' ? user?.id : undefined,
          ...(status === 'accepted' && { 
            provider_id: user?.id 
          }),
          ...(status === 'completed' && { 
            check_in_time: new Date().toISOString() 
          })
        })
        .eq('id', jobId);

      if (error) throw error;

      // Update local state
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
