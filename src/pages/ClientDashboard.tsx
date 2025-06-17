
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import { SimplifiedDashboardOverview } from '@/components/client/SimplifiedDashboardOverview';
import { BookingsTab } from '@/components/client/BookingsTab';
import { MyPackageTab } from '@/components/client/MyPackageTab';
import { PaymentHistoryTab } from '@/components/client/PaymentHistoryTab';
import { ProfileTab } from '@/components/client/ProfileTab';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { 
  Home, 
  Calendar, 
  Package, 
  CreditCard, 
  User, 
  LogOut,
  Bell,
  Menu,
  X
} from 'lucide-react';

const ClientDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const menuItems = [
    { id: 'overview', label: 'Home', icon: Home },
    { id: 'bookings', label: 'Bookings', icon: Calendar },
    { id: 'package', label: 'Package', icon: Package },
    { id: 'payments', label: 'Payments', icon: CreditCard },
    { id: 'profile', label: 'Profile', icon: User },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-50 to-white flex">
      {/* Mobile Hamburger Menu */}
      <div className="md:hidden fixed top-4 left-4 z-50">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed md:relative
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        transition-transform duration-300 ease-in-out
        w-48 h-screen bg-blue-50 z-40
        flex flex-col
      `}>
        {/* Logo/Brand */}
        <div className="p-4 border-b border-blue-100">
          <h1 className="text-lg font-semibold text-gray-900">Longa</h1>
          <p className="text-xs text-gray-600">Client Dashboard</p>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 p-4">
          <div className="space-y-2">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setSidebarOpen(false);
                }}
                className={`
                  w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left
                  transition-colors duration-200
                  ${activeTab === item.id 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'text-gray-700 hover:bg-blue-50'
                  }
                `}
              >
                <item.icon className="h-4 w-4" />
                <span className="text-sm">{item.label}</span>
              </button>
            ))}
          </div>
        </nav>

        {/* Bottom Section */}
        <div className="p-4 border-t border-blue-100 space-y-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/notifications')}
            className="w-full justify-start"
          >
            <Bell className="h-4 w-4 mr-3" />
            <span className="text-sm">Notifications</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleLogout}
            className="w-full justify-start"
          >
            <LogOut className="h-4 w-4 mr-3" />
            <span className="text-sm">Logout</span>
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 md:ml-0">
        {/* Welcome Header */}
        <div className="p-5 pt-16 md:pt-5">
          <h2 className="text-lg font-normal text-gray-800">
            Welcome back, {user?.full_name || 'User'}! Book services quickly and easily
          </h2>
        </div>

        {/* Content Area */}
        <div className="px-5 pb-5">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsContent value="overview" className="mt-0">
              <SimplifiedDashboardOverview />
            </TabsContent>

            <TabsContent value="bookings" className="mt-0">
              <BookingsTab />
            </TabsContent>

            <TabsContent value="package" className="mt-0">
              <MyPackageTab />
            </TabsContent>

            <TabsContent value="payments" className="mt-0">
              <PaymentHistoryTab />
            </TabsContent>

            <TabsContent value="profile" className="mt-0">
              <ProfileTab />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default ClientDashboard;
