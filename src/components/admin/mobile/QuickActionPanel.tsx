
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  UserCheck, 
  DollarSign, 
  Clock, 
  MessageSquare,
  ChevronRight,
  TrendingUp
} from 'lucide-react';

interface QuickActionPanelProps {
  onAction: (action: string, id?: string) => void;
  data: any;
}

export const QuickActionPanel: React.FC<QuickActionPanelProps> = ({ onAction, data }) => {
  const quickActions = [
    {
      id: 'approve-providers',
      title: 'Provider Approvals',
      count: data.pendingProviders || 0,
      icon: UserCheck,
      color: 'blue',
      action: 'view-pending-providers'
    },
    {
      id: 'process-payouts',
      title: 'Pending Payouts',
      count: data.pendingPayouts || 0,
      icon: DollarSign,
      color: 'green',
      action: 'view-pending-payouts'
    },
    {
      id: 'active-jobs',
      title: 'Active Jobs',
      count: data.activeJobs || 0,
      icon: Clock,
      color: 'purple',
      action: 'view-active-jobs'
    },
    {
      id: 'messages',
      title: 'Unread Messages',
      count: data.unreadMessages || 0,
      icon: MessageSquare,
      color: 'orange',
      action: 'view-messages'
    }
  ];

  const getColorClasses = (color: string) => {
    const colorMap = {
      blue: 'bg-blue-100 text-blue-600 border-blue-200',
      green: 'bg-green-100 text-green-600 border-green-200',
      purple: 'bg-purple-100 text-purple-600 border-purple-200',
      orange: 'bg-orange-100 text-orange-600 border-orange-200'
    };
    return colorMap[color as keyof typeof colorMap] || colorMap.blue;
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {quickActions.map((action) => (
            <Button
              key={action.id}
              variant="ghost"
              className="w-full h-auto p-4 justify-between touch-manipulation"
              onClick={() => onAction(action.action)}
            >
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${getColorClasses(action.color)}`}>
                  <action.icon className="h-5 w-5" />
                </div>
                <div className="text-left">
                  <p className="font-medium">{action.title}</p>
                  <p className="text-sm text-gray-600">
                    {action.count > 0 ? `${action.count} pending` : 'Up to date'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {action.count > 0 && (
                  <Badge variant="outline">{action.count}</Badge>
                )}
                <ChevronRight className="h-4 w-4 text-gray-400" />
              </div>
            </Button>
          ))}
        </CardContent>
      </Card>

      {/* Revenue Overview */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Today's Revenue</p>
              <p className="text-2xl font-bold">N${data.totalRevenue?.toLocaleString() || '0'}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-green-600">+12.5%</p>
              <p className="text-xs text-gray-500">vs yesterday</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
