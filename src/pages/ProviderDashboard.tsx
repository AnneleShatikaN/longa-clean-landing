
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { DashboardNavigation } from '@/components/common/DashboardNavigation';
import ProviderOverviewTab from '@/components/provider/ProviderOverviewTab';
import ProviderJobsTab from '@/components/provider/ProviderJobsTab';
import ProviderPayoutsTab from '@/components/provider/ProviderPayoutsTab';
import ProviderProfileTab from '@/components/provider/ProviderProfileTab';
import { useProviderData } from '@/hooks/useProviderData';
import { useToast } from '@/hooks/use-toast';

const ProviderDashboard = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('overview');
  
  const {
    profile,
    stats,
    availableJobs,
    myJobs,
    monthlyEarnings,
    completedJobs,
    pendingPayouts,
    totalEarnings,
    isLoading,
    acceptJob,
    declineJob,
    completeJob,
    updateProfile,
    isAvailable
  } = useProviderData();

  const handleAcceptJob = async (jobId: string) => {
    try {
      await acceptJob(jobId);
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
      await declineJob(jobId);
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
      await completeJob(jobId);
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
      await updateProfile(data);
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
            isAvailable={isAvailable}
          />
        );
      case 'payouts':
        return (
          <ProviderPayoutsTab
            monthlyEarnings={monthlyEarnings}
            completedJobs={completedJobs}
            pendingPayouts={pendingPayouts}
            totalEarnings={totalEarnings}
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
