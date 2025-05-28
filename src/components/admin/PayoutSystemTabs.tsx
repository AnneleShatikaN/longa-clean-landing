
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { JobPayoutsTab } from './JobPayoutsTab';
import { ManualPayoutsTab } from './ManualPayoutsTab';

export const PayoutSystemTabs = () => {
  return (
    <Tabs defaultValue="job-payouts" className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="job-payouts">Job Payouts</TabsTrigger>
        <TabsTrigger value="manual-payouts">Manual Payouts</TabsTrigger>
      </TabsList>
      
      <TabsContent value="job-payouts" className="space-y-6">
        <JobPayoutsTab />
      </TabsContent>
      
      <TabsContent value="manual-payouts" className="space-y-6">
        <ManualPayoutsTab />
      </TabsContent>
    </Tabs>
  );
};
