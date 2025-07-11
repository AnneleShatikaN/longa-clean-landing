
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bell, X, Check, Clock, Star, DollarSign, CheckCircle } from 'lucide-react';
import { useNotifications } from '@/contexts/NotificationContext';
import { formatDistanceToNow } from 'date-fns';

interface Notification {
  id: number;
  type: 'new_job' | 'job_completed' | 'rating_received' | 'payment_received';
  title: string;
  message: string;
  time: string;
  read: boolean;
  actionable?: boolean;
}

interface NotificationSystemProps {
  notifications?: Notification[];
  onMarkAsRead?: (id: number) => void;
  onMarkAllAsRead?: () => void;
  onDismiss?: (id: number) => void;
}

const NotificationSystem: React.FC<NotificationSystemProps> = ({
  notifications: legacyNotifications,
  onMarkAsRead: legacyMarkAsRead,
  onMarkAllAsRead: legacyMarkAllAsRead,
  onDismiss: legacyDismiss,
}) => {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();

  // Use the new notification system if available, fallback to legacy props
  const displayNotifications = notifications?.filter(n => n.channel === 'in_app') || [];
  const displayUnreadCount = unreadCount || 0;

  const getIcon = (type: string) => {
    switch (type) {
      case 'new_job': 
      case 'job_assigned': return <Clock className="h-4 w-4 text-blue-600" />;
      case 'job_completed': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'rating_received': return <Star className="h-4 w-4 text-yellow-600" />;
      case 'payment_received':
      case 'payout_processed': return <DollarSign className="h-4 w-4 text-green-600" />;
      default: return <Bell className="h-4 w-4 text-gray-600" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'new_job':
      case 'job_assigned': return 'bg-blue-100 text-blue-800';
      case 'job_completed': return 'bg-green-100 text-green-800';
      case 'rating_received': return 'bg-yellow-100 text-yellow-800';
      case 'payment_received':
      case 'payout_processed': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center">
            <Bell className="h-5 w-5 mr-2 text-purple-600" />
            Notifications
            {displayUnreadCount > 0 && (
              <Badge className="ml-2 bg-red-500 text-white">{displayUnreadCount}</Badge>
            )}
          </CardTitle>
          {displayUnreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={markAllAsRead}
              className="text-purple-600 hover:text-purple-700"
            >
              Mark all as read
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 max-h-80 overflow-y-auto">
          {displayNotifications.length === 0 ? (
            <div className="text-center py-6 text-gray-500">
              <Bell className="h-8 w-8 mx-auto mb-2 text-gray-300" />
              <p>No notifications yet</p>
            </div>
          ) : (
            displayNotifications.slice(0, 10).map((notification) => (
              <div
                key={notification.id}
                className={`p-3 border rounded-lg ${
                  !notification.read ? 'bg-purple-50 border-purple-200' : 'bg-white'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3 flex-1">
                    <div className="flex-shrink-0">
                      {getIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <p className="font-medium text-sm text-gray-900">
                          {notification.title}
                        </p>
                        <Badge variant="outline" className={getTypeColor(notification.type)}>
                          {notification.type.replace('_', ' ')}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600">{notification.message}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1">
                    {!notification.read && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => markAsRead(notification.id)}
                        className="p-1 h-6 w-6"
                      >
                        <Check className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default NotificationSystem;
