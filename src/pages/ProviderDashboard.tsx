
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { DashboardNavigation } from '@/components/common/DashboardNavigation';
import { SimplifiedProviderDashboard } from '@/components/provider/SimplifiedProviderDashboard';
import ProviderOverviewTab from '@/components/provider/ProviderOverviewTab';
import ProviderJobsTab from '@/components/provider/ProviderJobsTab';
import ProviderPayoutsTab from '@/components/provider/ProviderPayoutsTab';
import ProviderProfileTab from '@/components/provider/ProviderProfileTab';
import { Button } from '@/components/ui/button';
import { useProviderData } from '@/hooks/useProviderData';
import { useToast } from '@/hooks/use-toast';

const ProviderDashboard = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('overview');
  
  const {
    data,
    isLoading,
    error,
    updateJobStatus,
    isValidProvider
  } = useProviderData();

  // Extract data from the nested structure
  const profile = data?.profile;
  const jobs = data?.jobs || [];
  const monthlyEarnings = data?.monthlyEarnings || [];
  
  // Filter jobs by status
  const availableJobs = jobs.filter(job => job.status === 'requested');
  const myJobs = jobs.filter(job => job.status !== 'requested');
  const completedJobs = jobs.filter(job => job.status === 'completed');
  
  // Calculate stats
  const stats = {
    totalEarnings: completedJobs.reduce((sum, job) => sum + job.expectedPayout, 0),
    pendingPayouts: myJobs.filter(job => job.payoutStatus === 'pending').reduce((sum, job) => sum + job.expectedPayout, 0),
    thisWeekEarnings: completedJobs
      .filter(job => {
        const jobDate = new Date(job.completedDate || job.date);
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return jobDate >= weekAgo;
      })
      .reduce((sum, job) => sum + job.expectedPayout, 0),
    availableJobs: availableJobs.length,
    completedJobs: completedJobs.length,
    averageRating: profile?.rating || 0
  };

  const handleAcceptJob = async (jobId: string) => {
    try {
      await updateJobStatus(jobId, 'accepted');
      toast({
        title: "Job Accepted",
        description: "You have successfully accepted the job.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to accept job. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleDeclineJob = async (jobId: string) => {
    try {
      await updateJobStatus(jobId, 'cancelled');
      toast({
        title: "Job Declined",
        description: "You have declined the job.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to decline job. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleCompleteJob = async (jobId: string) => {
    try {
      await updateJobStatus(jobId, 'completed');
      toast({
        title: "Job Completed",
        description: "Job marked as completed successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to complete job. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleUpdateProfile = async (data: any) => {
    try {
      // For now, just show success - actual implementation would need backend integration
      toast({
        title: "Profile Updated",
        description: "Your profile has been updated successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive"
      });
    }
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading...</div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="text-lg text-red-600">{error}</div>
        </div>
      );
    }

    if (!isValidProvider) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">You need to be an active provider to access this dashboard.</div>
        </div>
      );
    }

    switch (activeTab) {
      case 'overview':
        return <ProviderOverviewTab profile={profile} stats={stats} />;
      case 'jobs':
        return (
          <ProviderJobsTab
            availableJobs={availableJobs}
            myJobs={myJobs}
            onAcceptJob={handleAcceptJob}
            onDeclineJob={handleDeclineJob}
            onCompleteJob={handleCompleteJob}
            isAvailable={true}
          />
        );
      case 'payouts':
        return (
          <ProviderPayoutsTab
            monthlyEarnings={monthlyEarnings}
            completedJobs={completedJobs}
            pendingPayouts={stats.pendingPayouts}
            totalEarnings={stats.totalEarnings}
          />
        );
      case 'profile':
        return (
          <ProviderProfileTab
            profile={profile}
            onUpdateProfile={handleUpdateProfile}
          />
        );
      default:
        return <ProviderOverviewTab profile={profile} stats={stats} />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100">
      <DashboardNavigation
        userRole="provider"
        activeTab={activeTab}
        onTabChange={setActiveTab}
        dashboardTitle="Provider Dashboard"
      />
      
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default ProviderDashboard;
