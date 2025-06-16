
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { AdminOverview } from '@/components/admin/AdminOverview';
import ServiceManagement from '@/components/admin/ServiceManagement';
import { PackageManager } from '@/components/admin/PackageManager';
import { FinancialManagement } from '@/components/admin/FinancialManagement';
import { FinancialOverview } from '@/components/admin/FinancialOverview';
import { PayoutSystemTabs } from '@/components/admin/PayoutSystemTabs';
import { WeeklyPayouts } from '@/components/admin/WeeklyPayouts';
import { WeekendSettings } from '@/components/admin/WeekendSettings';
import { JobPayoutConfiguration } from '@/components/admin/JobPayoutConfiguration';
import { AnalyticsDashboard } from '@/components/admin/analytics/AnalyticsDashboard';
import { LaunchDashboard } from '@/components/admin/launch/LaunchDashboard';
import { SupportSystem } from '@/components/admin/support/SupportSystem';
import { PendingTransactionApproval } from '@/components/admin/PendingTransactionApproval';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useNavigate } from 'react-router-dom';
import { 
  Home, 
  Package, 
  DollarSign, 
  BarChart3, 
  Rocket, 
  Users, 
  Settings,
  Clock,
  PieChart,
  CreditCard,
  Calendar,
  Calculator
} from 'lucide-react';

const AdminDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600 mb-6">You need admin privileges to access this dashboard</p>
          <Button onClick={() => navigate('/')}>
            Return Home
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-2">Manage your platform and business operations</p>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-12">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <Home className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="financial-overview" className="flex items-center gap-2">
              <PieChart className="h-4 w-4" />
              Profit
            </TabsTrigger>
            <TabsTrigger value="weekly-payouts" className="flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              Payouts
            </TabsTrigger>
            <TabsTrigger value="payout-config" className="flex items-center gap-2">
              <Calculator className="h-4 w-4" />
              Config
            </TabsTrigger>
            <TabsTrigger value="weekend-settings" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Weekend
            </TabsTrigger>
            <TabsTrigger value="services" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Services
            </TabsTrigger>
            <TabsTrigger value="packages" className="flex items-center gap-2">
              <Package className="h-4 w-4" />
              Packages
            </TabsTrigger>
            <TabsTrigger value="payments" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Payments
            </TabsTrigger>
            <TabsTrigger value="finance" className="flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Finance
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="launch" className="flex items-center gap-2">
              <Rocket className="h-4 w-4" />
              Launch
            </TabsTrigger>
            <TabsTrigger value="support" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Support
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <AdminOverview data={{}} isLoading={false} />
          </TabsContent>

          <TabsContent value="financial-overview">
            <FinancialOverview />
          </TabsContent>

          <TabsContent value="weekly-payouts">
            <WeeklyPayouts />
          </TabsContent>

          <TabsContent value="payout-config">
            <JobPayoutConfiguration />
          </TabsContent>

          <TabsContent value="weekend-settings">
            <WeekendSettings />
          </TabsContent>

          <TabsContent value="services">
            <ServiceManagement />
          </TabsContent>

          <TabsContent value="packages">
            <PackageManager />
          </TabsContent>

          <TabsContent value="payments">
            <PendingTransactionApproval />
          </TabsContent>

          <TabsContent value="finance">
            <div className="space-y-6">
              <FinancialManagement />
              <PayoutSystemTabs />
            </div>
          </TabsContent>

          <TabsContent value="analytics">
            <AnalyticsDashboard />
          </TabsContent>

          <TabsContent value="launch">
            <LaunchDashboard />
          </TabsContent>

          <TabsContent value="support">
            <SupportSystem />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;
