
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  BarChart3, 
  Users, 
  Settings, 
  TrendingUp, 
  DollarSign,
  Package,
  CreditCard,
  FileText,
  Shield,
  Wrench,
  MessageSquare,
  Calendar,
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { EnhancedLoading } from '@/components/ui/enhanced-loading';
import { FinancialOverview } from '@/components/admin/FinancialOverview';
import ServiceManagement from '@/components/admin/ServiceManagement';
import { PaymentSystemManager } from '@/components/admin/PaymentSystemManager';
import { ProviderVerificationManagement } from '@/components/admin/ProviderVerificationManagement';
import { UserManagement } from '@/components/admin/UserManagement';
import { BankingInstructionsManager } from '@/components/admin/BankingInstructionsManager';
import PackageManagement from '@/components/admin/PackageManagement';
import { PackageBookingManager } from '@/components/admin/PackageBookingManager';
import { ServiceCategoryManager } from '@/components/admin/ServiceCategoryManager';
import { AdminOverview } from '@/components/admin/AdminOverview';
import { useAuth } from '@/contexts/AuthContext';

const AdminDashboard = () => {
  const { user, signOut, loading, refreshUser } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState('overview');
  const [dashboardError, setDashboardError] = useState<string | null>(null);

  console.log('AdminDashboard - Render:', { 
    user: user ? { id: user.id, email: user.email, role: user.role } : null,
    loading,
    activeTab 
  });

  // Handle tab navigation from URL params
  useEffect(() => {
    try {
      const tab = searchParams.get('tab');
      if (tab) {
        setActiveTab(tab);
      }
    } catch (error) {
      console.error('AdminDashboard - Error handling URL params:', error);
      setDashboardError('Error loading dashboard parameters');
    }
  }, [searchParams]);

  // Update URL when tab changes
  const handleTabChange = (newTab: string) => {
    try {
      setActiveTab(newTab);
      setSearchParams({ tab: newTab });
    } catch (error) {
      console.error('AdminDashboard - Error updating URL:', error);
    }
  };

  // Show loading while user data is being fetched
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <EnhancedLoading message="Loading admin dashboard..." size="lg" />
      </div>
    );
  }

  // Show error if user is not found or not admin
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Alert variant="destructive" className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-3">
              <p>Unable to load user data.</p>
              <Button onClick={() => refreshUser()} className="flex items-center gap-2">
                <RefreshCw className="h-4 w-4" />
                Retry
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (user.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Alert variant="destructive" className="max-w-md">
          <Shield className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-3">
              <p>Admin access required. Your role: {user.role}</p>
              <Button onClick={() => window.location.href = '/'}>
                Go Home
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-gray-600">Welcome back, {user?.full_name || user?.name}</p>
          </div>
          <div className="flex items-center gap-4">
            <Button onClick={() => refreshUser()} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button onClick={signOut} variant="outline">
              Sign Out
            </Button>
          </div>
        </div>

        {/* Error Alert */}
        {dashboardError && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{dashboardError}</AlertDescription>
          </Alert>
        )}

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
          <TabsList className="grid w-full grid-cols-10">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Users
            </TabsTrigger>
            <TabsTrigger value="services" className="flex items-center gap-2">
              <Wrench className="h-4 w-4" />
              Services
            </TabsTrigger>
            <TabsTrigger value="packages" className="flex items-center gap-2">
              <Package className="h-4 w-4" />
              Packages
            </TabsTrigger>
            <TabsTrigger value="bookings" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Book Packages
            </TabsTrigger>
            <TabsTrigger value="payments" className="flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Payments
            </TabsTrigger>
            <TabsTrigger value="banking" className="flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              Banking
            </TabsTrigger>
            <TabsTrigger value="verification" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Verification
            </TabsTrigger>
            <TabsTrigger value="financial" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Financial
            </TabsTrigger>
            <TabsTrigger value="categories" className="flex items-center gap-2">
              <Package className="h-4 w-4" />
              Categories
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <AdminOverview />
          </TabsContent>

          <TabsContent value="users">
            <UserManagement />
          </TabsContent>

          <TabsContent value="services">
            <ServiceManagement />
          </TabsContent>

          <TabsContent value="packages">
            <PackageManagement />
          </TabsContent>

          <TabsContent value="bookings">
            <PackageBookingManager />
          </TabsContent>

          <TabsContent value="payments">
            <PaymentSystemManager />
          </TabsContent>

          <TabsContent value="banking">
            <BankingInstructionsManager />
          </TabsContent>

          <TabsContent value="verification">
            <ProviderVerificationManagement />
          </TabsContent>

          <TabsContent value="financial">
            <FinancialOverview />
          </TabsContent>

          <TabsContent value="categories">
            <ServiceCategoryManager />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;
