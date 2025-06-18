
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AdminOverview } from '@/components/admin/AdminOverview';
import { ServiceManagement } from '@/components/admin/ServiceManagement';
import { EnhancedBookingManager } from '@/components/admin/EnhancedBookingManager';
import { PayoutSystemTabs } from '@/components/admin/PayoutSystemTabs';
import { ProviderVerificationManagement } from '@/components/admin/ProviderVerificationManagement';
import { PackageManager } from '@/components/admin/PackageManager';
import { AnalyticsDashboard } from '@/components/admin/analytics/AnalyticsDashboard';
import { EnhancedFinancialDashboard } from '@/components/financial/EnhancedFinancialDashboard';
import { AdminSettings } from '@/components/admin/AdminSettings';
import { SupportSystem } from '@/components/admin/support/SupportSystem';
import { LaunchDashboard } from '@/components/admin/launch/LaunchDashboard';
import { 
  LayoutDashboard, 
  Settings, 
  Package, 
  Calendar, 
  DollarSign, 
  UserCheck, 
  BarChart3, 
  HeadphonesIcon,
  Rocket,
  Brain
} from 'lucide-react';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600">Manage your business operations and analytics</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-10 lg:grid-cols-10">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <LayoutDashboard className="h-4 w-4" />
              <span className="hidden md:inline">Overview</span>
            </TabsTrigger>
            <TabsTrigger value="services" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              <span className="hidden md:inline">Services</span>
            </TabsTrigger>
            <TabsTrigger value="bookings" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span className="hidden md:inline">Bookings</span>
            </TabsTrigger>
            <TabsTrigger value="financial" className="flex items-center gap-2">
              <Brain className="h-4 w-4" />
              <span className="hidden md:inline">Financial AI</span>
            </TabsTrigger>
            <TabsTrigger value="payouts" className="flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              <span className="hidden md:inline">Payouts</span>
            </TabsTrigger>
            <TabsTrigger value="verification" className="flex items-center gap-2">
              <UserCheck className="h-4 w-4" />
              <span className="hidden md:inline">Verification</span>
            </TabsTrigger>
            <TabsTrigger value="packages" className="flex items-center gap-2">
              <Package className="h-4 w-4" />
              <span className="hidden md:inline">Packages</span>
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              <span className="hidden md:inline">Analytics</span>
            </TabsTrigger>
            <TabsTrigger value="support" className="flex items-center gap-2">
              <HeadphonesIcon className="h-4 w-4" />
              <span className="hidden md:inline">Support</span>
            </TabsTrigger>
            <TabsTrigger value="launch" className="flex items-center gap-2">
              <Rocket className="h-4 w-4" />
              <span className="hidden md:inline">Launch</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <AdminOverview />
          </TabsContent>

          <TabsContent value="services" className="space-y-6">
            <ServiceManagement />
          </TabsContent>

          <TabsContent value="bookings" className="space-y-6">
            <EnhancedBookingManager />
          </TabsContent>

          <TabsContent value="financial" className="space-y-6">
            <EnhancedFinancialDashboard />
          </TabsContent>

          <TabsContent value="payouts" className="space-y-6">
            <PayoutSystemTabs />
          </TabsContent>

          <TabsContent value="verification" className="space-y-6">
            <ProviderVerificationManagement />
          </TabsContent>

          <TabsContent value="packages" className="space-y-6">
            <PackageManager />
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <AnalyticsDashboard />
          </TabsContent>

          <TabsContent value="support" className="space-y-6">
            <SupportSystem />
          </TabsContent>

          <TabsContent value="launch" className="space-y-6">
            <LaunchDashboard />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;
