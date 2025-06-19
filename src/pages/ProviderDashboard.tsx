
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { ProviderDashboardHome } from '@/components/provider/ProviderDashboardHome';
import { ProviderMyJobs } from '@/components/provider/ProviderMyJobs';
import { ProviderAvailabilityPage } from '@/components/provider/ProviderAvailabilityPage';
import { ProviderEarningsPage } from '@/components/provider/ProviderEarningsPage';
import { ProviderProfilePage } from '@/components/provider/ProviderProfilePage';
import { ProviderNotifications } from '@/components/provider/ProviderNotifications';
import { Button } from '@/components/ui/button';
import { Bell, User, Menu } from 'lucide-react';
import { ProtectedRoute } from '@/components/ProtectedRoute';

const ProviderDashboard = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const handleLogout = async () => {
    await logout();
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <ProviderDashboardHome />;
      case 'jobs':
        return <ProviderMyJobs />;
      case 'availability':
        return <ProviderAvailabilityPage />;
      case 'earnings':
        return <ProviderEarningsPage />;
      case 'profile':
        return <ProviderProfilePage />;
      case 'notifications':
        return <ProviderNotifications />;
      default:
        return <ProviderDashboardHome />;
    }
  };

  return (
    <ProtectedRoute requiredRole="provider">
      <div className="min-h-screen bg-white">
        {/* Top Navigation */}
        <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between sticky top-0 z-50">
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-bold text-purple-600">Longa</h1>
          </div>
          
          <div className="flex items-center space-x-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setActiveTab('notifications')}
              className="relative"
            >
              <Bell className="h-5 w-5" />
            </Button>
            
            <div className="relative">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center space-x-2"
              >
                <User className="h-5 w-5" />
                <span className="hidden sm:inline text-sm">{user?.full_name || user?.name}</span>
              </Button>
              
              {showProfileMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-50">
                  <div className="py-1">
                    <button
                      onClick={() => {
                        setActiveTab('profile');
                        setShowProfileMenu(false);
                      }}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Profile Settings
                    </button>
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="pb-20">
          {renderContent()}
        </main>

        {/* Bottom Navigation */}
        <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2">
          <div className="flex justify-around">
            <Button
              variant={activeTab === 'dashboard' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveTab('dashboard')}
              className="flex flex-col items-center space-y-1 min-w-0 flex-1"
            >
              <span className="text-xs">Dashboard</span>
            </Button>
            <Button
              variant={activeTab === 'jobs' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveTab('jobs')}
              className="flex flex-col items-center space-y-1 min-w-0 flex-1"
            >
              <span className="text-xs">My Jobs</span>
            </Button>
            <Button
              variant={activeTab === 'availability' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveTab('availability')}
              className="flex flex-col items-center space-y-1 min-w-0 flex-1"
            >
              <span className="text-xs">Availability</span>
            </Button>
            <Button
              variant={activeTab === 'earnings' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveTab('earnings')}
              className="flex flex-col items-center space-y-1 min-w-0 flex-1"
            >
              <span className="text-xs">Earnings</span>
            </Button>
            <Button
              variant={activeTab === 'profile' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveTab('profile')}
              className="flex flex-col items-center space-y-1 min-w-0 flex-1"
            >
              <span className="text-xs">Profile</span>
            </Button>
          </div>
        </nav>
      </div>
    </ProtectedRoute>
  );
};

export default ProviderDashboard;
