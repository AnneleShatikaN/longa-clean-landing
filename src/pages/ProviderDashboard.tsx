
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { DashboardNavigation } from '@/components/common/DashboardNavigation';
import ProviderOverviewTab from '@/components/provider/ProviderOverviewTab';
import ProviderJobsTab from '@/components/provider/ProviderJobsTab';
import ProviderPayoutsTab from '@/components/provider/ProviderPayoutsTab';
import ProviderProfileTab from '@/components/provider/ProviderProfileTab';

const ProviderDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return <ProviderOverviewTab />;
      case 'jobs':
        return <ProviderJobsTab />;
      case 'payouts':
        return <ProviderPayoutsTab />;
      case 'profile':
        return <ProviderProfileTab />;
      default:
        return <ProviderOverviewTab />;
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
