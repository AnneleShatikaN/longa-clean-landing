
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { DashboardNavigation } from '@/components/common/DashboardNavigation';
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
import { AdminProfileManagement } from '@/components/admin/AdminProfileManagement';
import { AdminSettings } from '@/components/admin/AdminSettings';
import { Button } from '@/components/ui/button';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  SidebarInset,
} from '@/components/ui/sidebar';
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
  Calculator,
  UserCog,
  Bell,
  LogOut
} from 'lucide-react';

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

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

  const menuItems = [
    {
      id: 'overview',
      title: 'Overview',
      icon: Home,
      description: 'Dashboard overview'
    },
    {
      id: 'financial-overview',
      title: 'Profit',
      icon: PieChart,
      description: 'Financial overview'
    },
    {
      id: 'weekly-payouts',
      title: 'Payouts',
      icon: CreditCard,
      description: 'Weekly payouts'
    },
    {
      id: 'payout-config',
      title: 'Config',
      icon: Calculator,
      description: 'Payout configuration'
    },
    {
      id: 'weekend-settings',
      title: 'Weekend',
      icon: Calendar,
      description: 'Weekend settings'
    },
    {
      id: 'services',
      title: 'Services',
      icon: Settings,
      description: 'Service management'
    },
    {
      id: 'packages',
      title: 'Packages',
      icon: Package,
      description: 'Package management'
    },
    {
      id: 'payments',
      title: 'Payments',
      icon: Clock,
      description: 'Pending payments'
    },
    {
      id: 'finance',
      title: 'Finance',
      icon: DollarSign,
      description: 'Financial management'
    },
    {
      id: 'analytics',
      title: 'Analytics',
      icon: BarChart3,
      description: 'Analytics dashboard'
    },
    {
      id: 'launch',
      title: 'Launch',
      icon: Rocket,
      description: 'Launch dashboard'
    },
    {
      id: 'support',
      title: 'Support',
      icon: Users,
      description: 'Support system'
    },
    {
      id: 'admin-settings',
      title: 'Settings',
      icon: Settings,
      description: 'Admin settings'
    },
    {
      id: 'profile',
      title: 'Profile',
      icon: UserCog,
      description: 'Profile management'
    }
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return <AdminOverview data={{}} isLoading={false} />;
      case 'financial-overview':
        return <FinancialOverview />;
      case 'weekly-payouts':
        return <WeeklyPayouts />;
      case 'payout-config':
        return <JobPayoutConfiguration />;
      case 'weekend-settings':
        return <WeekendSettings />;
      case 'services':
        return <ServiceManagement />;
      case 'packages':
        return <PackageManager />;
      case 'payments':
        return <PendingTransactionApproval />;
      case 'finance':
        return (
          <div className="space-y-6">
            <FinancialManagement />
            <PayoutSystemTabs />
          </div>
        );
      case 'analytics':
        return <AnalyticsDashboard />;
      case 'launch':
        return <LaunchDashboard />;
      case 'support':
        return <SupportSystem />;
      case 'admin-settings':
        return <AdminSettings />;
      case 'profile':
        return <AdminProfileManagement />;
      default:
        return <AdminOverview data={{}} isLoading={false} />;
    }
  };

  const AppSidebar = () => (
    <Sidebar>
      <SidebarHeader className="border-b border-sidebar-border p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Settings className="h-4 w-4" />
          </div>
          <div>
            <p className="text-sm font-semibold">Longa Admin</p>
            <p className="text-xs text-muted-foreground">Management Panel</p>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton
                    isActive={activeTab === item.id}
                    onClick={() => setActiveTab(item.id)}
                    tooltip={item.description}
                  >
                    <item.icon className="h-4 w-4" />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={() => navigate('/notifications')}
                  tooltip="View notifications"
                >
                  <Bell className="h-4 w-4" />
                  <span>Notifications</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={handleLogout}
                  tooltip="Logout"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Logout</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );

  return (
    <div className="min-h-screen bg-background">
      <SidebarProvider>
        <div className="flex w-full min-h-screen">
          <AppSidebar />
          <SidebarInset className="flex-1">
            <header className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-2 border-b bg-background px-4">
              <SidebarTrigger className="-ml-1" />
              <div className="flex-1">
                <h1 className="text-lg font-semibold">Admin Dashboard</h1>
                <p className="text-sm text-muted-foreground">
                  Manage your platform and business operations
                </p>
              </div>
            </header>
            <main className="flex-1 overflow-auto p-6">
              {renderContent()}
            </main>
          </SidebarInset>
        </div>
      </SidebarProvider>
    </div>
  );
};

export default AdminDashboard;
