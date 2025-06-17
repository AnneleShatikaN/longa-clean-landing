
import React from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { NotificationBell } from '@/components/notifications/NotificationBell';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Home, Calendar, Package, CreditCard, User, Briefcase, BarChart3, Settings } from 'lucide-react';

interface DashboardNavigationProps {
  userRole: 'client' | 'provider' | 'admin';
  activeTab: string;
  onTabChange: (tab: string) => void;
  dashboardTitle: string;
}

export const DashboardNavigation: React.FC<DashboardNavigationProps> = ({
  userRole,
  activeTab,
  onTabChange,
  dashboardTitle
}) => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const getTabsForRole = () => {
    switch (userRole) {
      case 'client':
        return [
          { value: 'overview', label: 'Home', icon: Home },
          { value: 'bookings', label: 'Bookings', icon: Calendar },
          { value: 'package', label: 'Package', icon: Package },
          { value: 'payments', label: 'Payments', icon: CreditCard },
          { value: 'profile', label: 'Profile', icon: User }
        ];
      case 'provider':
        return [
          { value: 'overview', label: 'Overview', icon: Home },
          { value: 'jobs', label: 'Jobs', icon: Briefcase },
          { value: 'payouts', label: 'Payouts', icon: CreditCard },
          { value: 'profile', label: 'Profile', icon: User }
        ];
      case 'admin':
        return [
          { value: 'overview', label: 'Overview', icon: Home },
          { value: 'analytics', label: 'Analytics', icon: BarChart3 },
          { value: 'services', label: 'Services', icon: Settings },
          { value: 'finance', label: 'Finance', icon: CreditCard }
        ];
      default:
        return [];
    }
  };

  const tabs = getTabsForRole();

  return (
    <>
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <h1 className="text-xl font-semibold text-gray-900">Longa</h1>
              <span className="text-sm text-gray-500">{dashboardTitle}</span>
            </div>
            <div className="flex items-center space-x-4">
              <NotificationBell />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/notifications')}
              >
                Notifications
              </Button>
              <Button variant="outline" onClick={handleLogout}>
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Tabs value={activeTab} onValueChange={onTabChange}>
            <TabsList className="grid w-full grid-cols-4 lg:grid-cols-5 lg:w-auto lg:inline-flex">
              {tabs.map((tab) => (
                <TabsTrigger 
                  key={tab.value} 
                  value={tab.value} 
                  className="flex items-center gap-1 text-xs sm:text-sm"
                >
                  <tab.icon className="h-4 w-4" />
                  <span className="hidden sm:inline">{tab.label}</span>
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>
      </div>
    </>
  );
};
