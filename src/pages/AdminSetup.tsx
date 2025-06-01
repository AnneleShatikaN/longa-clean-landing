
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SetupWizard } from '@/components/admin/setup/SetupWizard';
import { LaunchDashboard } from '@/components/admin/launch/LaunchDashboard';
import { GoLiveChecklist } from '@/components/admin/launch/GoLiveChecklist';
import { SupportSystem } from '@/components/admin/support/SupportSystem';
import { SystemStatus } from '@/components/SystemStatus';

const AdminSetup: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900">Longa Admin Setup</h1>
          <p className="text-xl text-gray-600 mt-2">
            Complete setup and launch your service marketplace
          </p>
        </div>

        <Tabs defaultValue="setup" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="setup">Initial Setup</TabsTrigger>
            <TabsTrigger value="checklist">Go-Live Checklist</TabsTrigger>
            <TabsTrigger value="dashboard">Launch Dashboard</TabsTrigger>
            <TabsTrigger value="status">System Status</TabsTrigger>
            <TabsTrigger value="support">Support System</TabsTrigger>
          </TabsList>

          <TabsContent value="setup">
            <SetupWizard />
          </TabsContent>

          <TabsContent value="checklist">
            <GoLiveChecklist />
          </TabsContent>

          <TabsContent value="dashboard">
            <LaunchDashboard />
          </TabsContent>

          <TabsContent value="status">
            <SystemStatus />
          </TabsContent>

          <TabsContent value="support">
            <SupportSystem />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminSetup;
