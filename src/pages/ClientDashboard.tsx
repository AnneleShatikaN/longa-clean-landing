
import React, { useState } from 'react';
import { DashboardNavigation } from '@/components/common/DashboardNavigation';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import { SimplifiedDashboardOverview } from '@/components/client/SimplifiedDashboardOverview';
import { BookingsTab } from '@/components/client/BookingsTab';
import { MyPackageTab } from '@/components/client/MyPackageTab';
import { PaymentHistoryTab } from '@/components/client/PaymentHistoryTab';
import { ProfileTab } from '@/components/client/ProfileTab';

const ClientDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <DashboardNavigation
        userRole="client"
        activeTab={activeTab}
        onTabChange={setActiveTab}
        dashboardTitle="Client Dashboard"
      />

      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsContent value="overview" className="mt-0">
            <SimplifiedDashboardOverview />
          </TabsContent>

          <TabsContent value="bookings" className="mt-0 px-4">
            <BookingsTab />
          </TabsContent>

          <TabsContent value="package" className="mt-0 px-4">
            <MyPackageTab />
          </TabsContent>

          <TabsContent value="payments" className="mt-0 px-4">
            <PaymentHistoryTab />
          </TabsContent>

          <TabsContent value="profile" className="mt-0 px-4">
            <ProfileTab />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ClientDashboard;
