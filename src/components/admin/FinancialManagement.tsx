
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BankingIntegration } from '@/components/financial/BankingIntegration';
import { FinancialReporting } from '@/components/financial/FinancialReporting';
import { PayoutProcessor } from '@/components/financial/PayoutProcessor';
import { PayoutExport } from '@/components/admin/PayoutExport';
import { CreditCard, BarChart3, Settings, Download } from 'lucide-react';

export const FinancialManagement = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Financial Management</h2>
        <p className="text-gray-600">Manage payouts, banking, and financial reporting</p>
      </div>

      <Tabs defaultValue="processor" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="processor" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Payout Processor
          </TabsTrigger>
          <TabsTrigger value="banking" className="flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            Banking Integration
          </TabsTrigger>
          <TabsTrigger value="reporting" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Financial Reports
          </TabsTrigger>
          <TabsTrigger value="export" className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Export Center
          </TabsTrigger>
        </TabsList>

        <TabsContent value="processor">
          <PayoutProcessor />
        </TabsContent>

        <TabsContent value="banking">
          <BankingIntegration />
        </TabsContent>

        <TabsContent value="reporting">
          <FinancialReporting />
        </TabsContent>

        <TabsContent value="export">
          <PayoutExport />
        </TabsContent>
      </Tabs>
    </div>
  );
};
