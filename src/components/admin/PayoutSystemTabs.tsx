
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { JobPayoutsTab } from './JobPayoutsTab';
import { ManualPayoutsTab } from './ManualPayoutsTab';
import { PayoutExport } from './PayoutExport';

export const PayoutSystemTabs = () => {
  return (
    <Tabs defaultValue="job-payouts" className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="job-payouts">Job Payouts</TabsTrigger>
        <TabsTrigger value="manual-payouts">Manual Payouts</TabsTrigger>
        <TabsTrigger value="export">Export & Reports</TabsTrigger>
      </TabsList>
      
      <TabsContent value="job-payouts" className="space-y-6">
        <JobPayoutsTab />
      </TabsContent>
      
      <TabsContent value="manual-payouts" className="space-y-6">
        <ManualPayoutsTab />
      </TabsContent>
      
      <TabsContent value="export" className="space-y-6">
        <PayoutExport />
      </TabsContent>
    </Tabs>
  );
};
