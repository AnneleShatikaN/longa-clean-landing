
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { Home, Calendar, Package, CreditCard, User, Bell } from 'lucide-react';
import { SimplifiedDashboardOverview } from '@/components/client/SimplifiedDashboardOverview';
import { BookingsTab } from '@/components/client/BookingsTab';
import { MyPackageTab } from '@/components/client/MyPackageTab';
import { PaymentHistoryTab } from '@/components/client/PaymentHistoryTab';
import { ProfileTab } from '@/components/client/ProfileTab';
import { useNavigate } from 'react-router-dom';

const ClientDashboard = () => {
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <h1 className="text-xl font-semibold text-gray-900">Longa</h1>
              <span className="text-sm text-gray-500">Client Dashboard</span>
            </div>
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/notifications')}
              >
                <Bell className="h-4 w-4 mr-2" />
                Notifications
              </Button>
              <Button variant="outline" onClick={handleLogout}>
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          {/* Mobile-friendly tab navigation */}
          <div className="px-4">
            <TabsList className="grid w-full grid-cols-5 lg:w-auto lg:inline-flex">
              <TabsTrigger value="overview" className="flex items-center gap-1 text-xs sm:text-sm">
                <Home className="h-4 w-4" />
                <span className="hidden sm:inline">Home</span>
              </TabsTrigger>
              <TabsTrigger value="bookings" className="flex items-center gap-1 text-xs sm:text-sm">
                <Calendar className="h-4 w-4" />
                <span className="hidden sm:inline">Bookings</span>
              </TabsTrigger>
              <TabsTrigger value="package" className="flex items-center gap-1 text-xs sm:text-sm">
                <Package className="h-4 w-4" />
                <span className="hidden sm:inline">Package</span>
              </TabsTrigger>
              <TabsTrigger value="payments" className="flex items-center gap-1 text-xs sm:text-sm">
                <CreditCard className="h-4 w-4" />
                <span className="hidden sm:inline">Payments</span>
              </TabsTrigger>
              <TabsTrigger value="profile" className="flex items-center gap-1 text-xs sm:text-sm">
                <User className="h-4 w-4" />
                <span className="hidden sm:inline">Profile</span>
              </TabsTrigger>
            </TabsList>
          </div>

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
