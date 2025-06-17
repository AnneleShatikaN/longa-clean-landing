
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
import { useSupabaseBookings } from '@/contexts/SupabaseBookingContext';
import { 
  Home, 
  Calendar, 
  Package, 
  CreditCard, 
  User, 
  LogOut,
  Menu,
  X,
  ChevronDown
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

const ClientDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { bookings } = useSupabaseBookings();

  const pendingBookings = bookings.filter(b => b.status === 'pending').length;
  const completedBookings = bookings.filter(b => b.status === 'completed').length;

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
    <TooltipProvider>
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

        {/* Sidebar - Reduced width to 180px */}
        <div className={`
          fixed md:relative
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
          transition-transform duration-300 ease-in-out
          w-45 h-screen bg-blue-50 z-40
          flex flex-col
        `} style={{ width: '180px', backgroundColor: '#e6f0fa' }}>
          {/* Logo/Brand */}
          <div className="p-4 border-b border-blue-100">
            <h1 className="text-lg font-semibold text-gray-900">Longa</h1>
            <p className="text-xs text-gray-600">Client Dashboard</p>
          </div>

          {/* Navigation Menu */}
          <nav className="flex-1 p-4">
            <div className="space-y-2">
              {menuItems.map((item) => (
                <Tooltip key={item.id}>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() => {
                        setActiveTab(item.id);
                        setSidebarOpen(false);
                      }}
                      className={`
                        w-full flex items-center px-3 py-2 rounded-lg text-left
                        transition-colors duration-200
                        ${activeTab === item.id 
                          ? 'bg-blue-100 text-blue-700' 
                          : 'text-gray-700 hover:bg-blue-50'
                        }
                      `}
                      style={{ gap: '5px' }}
                    >
                      <item.icon className="h-4 w-4" />
                      <span className="text-sm">{item.label}</span>
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="right">
                    <p>{item.label}</p>
                  </TooltipContent>
                </Tooltip>
              ))}
            </div>
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 md:ml-0">
          {/* Streamlined Header */}
          <div className="bg-white border-b border-gray-200 px-5 py-4">
            <div className="flex justify-between items-center">
              {/* Left side - Title and Welcome */}
              <div className="pt-12 md:pt-0">
                <h1 className="text-lg font-semibold text-gray-900 mb-2">Longa Client Dashboard</h1>
                <p className="text-base text-gray-600">
                  Welcome back, {user?.full_name || 'User'}. Book services quickly and easily
                </p>
                
                {/* Status Bar - Bookings and Completed counters */}
                <div className="flex items-center mt-3" style={{ gap: '10px' }}>
                  <div className="text-sm">
                    <span className="font-medium text-blue-600">{pendingBookings}</span>
                    <span className="text-gray-600 ml-1">Bookings</span>
                  </div>
                  <div className="text-sm">
                    <span className="font-medium text-green-600">{completedBookings}</span>
                    <span className="text-gray-600 ml-1">Completed</span>
                  </div>
                </div>
              </div>

              {/* Right side - User Profile Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Content Area */}
          <div className="px-5 pb-5" style={{ margin: '20px', padding: '15px' }}>
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
    </TooltipProvider>
  );
};

export default ClientDashboard;
