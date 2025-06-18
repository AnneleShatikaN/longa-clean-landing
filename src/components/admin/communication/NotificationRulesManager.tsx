
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Plus, Settings, Clock, AlertTriangle } from 'lucide-react';

export const NotificationRulesManager: React.FC = () => {
  const [rules, setRules] = useState([
    {
      id: '1',
      name: 'Urgent Booking Alerts',
      description: 'Send immediate notifications for urgent bookings',
      triggers: ['booking_created', 'booking_cancelled'],
      priority: 'urgent',
      channels: ['sms', 'email', 'push'],
      escalation: true,
      is_active: true
    },
    {
      id: '2',
      name: 'Payment Reminders',
      description: 'Automated payment reminder sequence',
      triggers: ['payment_due'],
      priority: 'normal',
      channels: ['email'],
      escalation: false,
      is_active: true
    }
  ]);

  const toggleRule = (ruleId: string) => {
    setRules(prev => prev.map(rule => 
      rule.id === ruleId 
        ? { ...rule, is_active: !rule.is_active }
        : rule
    ));
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'normal': return 'bg-blue-100 text-blue-800';
      case 'low': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Notification Rules</h3>
          <p className="text-gray-600">Configure automated notification triggers and escalation</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          New Rule
        </Button>
      </div>

      <div className="space-y-4">
        {rules.map((rule) => (
          <Card key={rule.id}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base">{rule.name}</CardTitle>
                  <p className="text-sm text-gray-600">{rule.description}</p>
                </div>
                <Switch
                  checked={rule.is_active}
                  onCheckedChange={() => toggleRule(rule.id)}
                />
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm font-medium mb-2">Triggers</p>
                  <div className="flex gap-1 flex-wrap">
                    {rule.triggers.map((trigger) => (
                      <Badge key={trigger} variant="outline" className="text-xs">
                        {trigger.replace('_', ' ')}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-sm font-medium mb-2">Priority</p>
                  <Badge className={getPriorityColor(rule.priority)}>
                    {rule.priority}
                  </Badge>
                </div>

                <div>
                  <p className="text-sm font-medium mb-2">Channels</p>
                  <div className="flex gap-1 flex-wrap">
                    {rule.channels.map((channel) => (
                      <Badge key={channel} variant="outline" className="text-xs">
                        {channel}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t">
                <div className="flex items-center gap-4">
                  {rule.escalation && (
                    <div className="flex items-center gap-1 text-sm text-orange-600">
                      <AlertTriangle className="h-3 w-3" />
                      Escalation enabled
                    </div>
                  )}
                  <div className="flex items-center gap-1 text-sm text-gray-500">
                    <Clock className="h-3 w-3" />
                    Quiet hours respected
                  </div>
                </div>
                <Button variant="outline" size="sm">
                  <Settings className="h-3 w-3 mr-1" />
                  Configure
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
