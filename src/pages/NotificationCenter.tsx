
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { NotificationCenter as NotificationCenterComponent } from '@/components/notifications/NotificationCenter';

const NotificationCenterPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleBack = () => {
    // Navigate back to the appropriate dashboard based on user role
    if (user?.role === 'client') {
      navigate('/client-dashboard');
    } else if (user?.role === 'provider') {
      navigate('/provider-dashboard');
    } else if (user?.role === 'admin') {
      navigate('/admin-dashboard');
    } else {
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with back button */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBack}
              className="mr-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
            <div className="flex items-center space-x-4">
              <h1 className="text-xl font-semibold text-gray-900">Longa</h1>
              <span className="text-sm text-gray-500">Notifications</span>
            </div>
          </div>
        </div>
      </div>

      {/* Notification Center Content */}
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <NotificationCenterComponent />
      </div>
    </div>
  );
};

export default NotificationCenterPage;
