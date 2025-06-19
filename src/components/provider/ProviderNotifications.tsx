
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Bell, 
  CheckCircle, 
  Calendar, 
  DollarSign, 
  User, 
  AlertCircle,
  Clock
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { format } from 'date-fns';

interface Notification {
  id: string;
  type: 'job_assigned' | 'payment' | 'reminder' | 'system';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  icon: React.ReactNode;
}

export const ProviderNotifications: React.FC = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    // Mock notifications - in real app, fetch from API
    const mockNotifications: Notification[] = [
      {
        id: '1',
        type: 'job_assigned',
        title: 'New Job Assignment',
        message: 'You have been assigned a cleaning job for tomorrow at 10:00 AM',
        timestamp: new Date().toISOString(),
        read: false,
        icon: <Calendar className="h-4 w-4" />
      },
      {
        id: '2',
        type: 'payment',
        title: 'Payment Received',
        message: 'Weekly payout of N$450 has been transferred to your bank account',
        timestamp: new Date(Date.now() - 86400000).toISOString(),
        read: false,
        icon: <DollarSign className="h-4 w-4" />
      },
      {
        id: '3',
        type: 'reminder',
        title: 'Job Reminder',
        message: 'Don\'t forget about your job today at 2:00 PM with Sarah Johnson',
        timestamp: new Date(Date.now() - 172800000).toISOString(),
        read: true,
        icon: <Clock className="h-4 w-4" />
      },
      {
        id: '4',
        type: 'system',
        title: 'Profile Update Required',
        message: 'Please update your availability to continue receiving job assignments',
        timestamp: new Date(Date.now() - 259200000).toISOString(),
        read: true,
        icon: <User className="h-4 w-4" />
      }
    ];

    setNotifications(mockNotifications);
  }, []);

  const markAsRead = (notificationId: string) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === notificationId
          ? { ...notification, read: true }
          : notification
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev =>
      prev.map(notification => ({ ...notification, read: true }))
    );
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'job_assigned': return 'bg-blue-100 text-blue-800';
      case 'payment': return 'bg-green-100 text-green-800';
      case 'reminder': return 'bg-orange-100 text-orange-800';
      case 'system': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
          {unreadCount > 0 && (
            <Badge className="bg-red-500 text-white">
              {unreadCount} new
            </Badge>
          )}
        </div>
        {unreadCount > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={markAllAsRead}
          >
            Mark all as read
          </Button>
        )}
      </div>

      {notifications.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No notifications yet</p>
            <p className="text-sm text-gray-500">You'll receive updates about jobs, payments, and more here</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {notifications.map((notification) => (
            <Card
              key={notification.id}
              className={`cursor-pointer transition-colors ${
                !notification.read ? 'bg-blue-50 border-blue-200' : 'hover:bg-gray-50'
              }`}
              onClick={() => markAsRead(notification.id)}
            >
              <CardContent className="p-4">
                <div className="flex items-start space-x-3">
                  <div className={`rounded-full p-2 ${getNotificationColor(notification.type)}`}>
                    {notification.icon}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className={`font-medium ${!notification.read ? 'text-gray-900' : 'text-gray-700'}`}>
                        {notification.title}
                      </h3>
                      {!notification.read && (
                        <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                      )}
                    </div>
                    
                    <p className={`text-sm mt-1 ${!notification.read ? 'text-gray-800' : 'text-gray-600'}`}>
                      {notification.message}
                    </p>
                    
                    <p className="text-xs text-gray-500 mt-2">
                      {format(new Date(notification.timestamp), 'MMM dd, yyyy at h:mm a')}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
