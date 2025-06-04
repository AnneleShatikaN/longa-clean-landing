
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useNotifications } from '@/contexts/NotificationContext';
import { Bell, Mail, MessageSquare, Smartphone, Clock } from 'lucide-react';

const notificationTypes = [
  { id: 'booking_confirmation', label: 'Booking Confirmations', description: 'When bookings are confirmed or updated' },
  { id: 'job_accepted', label: 'Job Acceptance', description: 'When providers accept or start jobs' },
  { id: 'payment_received', label: 'Payment Notifications', description: 'Payment receipts and payout updates' },
  { id: 'payout_processed', label: 'Payout Updates', description: 'When payouts are processed or failed' },
  { id: 'system_maintenance', label: 'System Updates', description: 'Maintenance and system notifications' },
  { id: 'marketing_promo', label: 'Promotions', description: 'Marketing campaigns and special offers' },
];

export const NotificationPreferences = () => {
  const { preferences, updatePreferences } = useNotifications();

  const getPreference = (type: string) => {
    return preferences.find(p => p.type === type) || {
      email_enabled: true,
      sms_enabled: false,
      push_enabled: true,
      in_app_enabled: true,
      quiet_hours_start: null,
      quiet_hours_end: null,
      timezone: 'Africa/Windhoek'
    };
  };

  const handleToggle = (type: string, channel: string, value: boolean) => {
    const key = `${channel}_enabled` as keyof typeof preferences[0];
    updatePreferences(type, { [key]: value });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notification Preferences
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {notificationTypes.map((notificationType) => {
              const pref = getPreference(notificationType.id);
              
              return (
                <div key={notificationType.id} className="border-b pb-6 last:border-b-0">
                  <div className="mb-4">
                    <h4 className="font-medium text-gray-900">{notificationType.label}</h4>
                    <p className="text-sm text-gray-600">{notificationType.description}</p>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="flex items-center space-x-2">
                      <Bell className="h-4 w-4 text-purple-600" />
                      <Label htmlFor={`${notificationType.id}-in-app`} className="text-sm">In-app</Label>
                      <Switch
                        id={`${notificationType.id}-in-app`}
                        checked={pref.in_app_enabled}
                        onCheckedChange={(value) => handleToggle(notificationType.id, 'in_app', value)}
                      />
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Mail className="h-4 w-4 text-blue-600" />
                      <Label htmlFor={`${notificationType.id}-email`} className="text-sm">Email</Label>
                      <Switch
                        id={`${notificationType.id}-email`}
                        checked={pref.email_enabled}
                        onCheckedChange={(value) => handleToggle(notificationType.id, 'email', value)}
                      />
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <MessageSquare className="h-4 w-4 text-green-600" />
                      <Label htmlFor={`${notificationType.id}-sms`} className="text-sm">SMS</Label>
                      <Switch
                        id={`${notificationType.id}-sms`}
                        checked={pref.sms_enabled}
                        onCheckedChange={(value) => handleToggle(notificationType.id, 'sms', value)}
                      />
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Smartphone className="h-4 w-4 text-orange-600" />
                      <Label htmlFor={`${notificationType.id}-push`} className="text-sm">Push</Label>
                      <Switch
                        id={`${notificationType.id}-push`}
                        checked={pref.push_enabled}
                        onCheckedChange={(value) => handleToggle(notificationType.id, 'push', value)}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Quiet Hours
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="quiet-start">Start Time</Label>
              <Input
                id="quiet-start"
                type="time"
                placeholder="22:00"
                onChange={(e) => updatePreferences('general', { quiet_hours_start: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="quiet-end">End Time</Label>
              <Input
                id="quiet-end"
                type="time"
                placeholder="08:00"
                onChange={(e) => updatePreferences('general', { quiet_hours_end: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="timezone">Timezone</Label>
              <Select defaultValue="Africa/Windhoek">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Africa/Windhoek">Africa/Windhoek</SelectItem>
                  <SelectItem value="Africa/Johannesburg">Africa/Johannesburg</SelectItem>
                  <SelectItem value="UTC">UTC</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <p className="text-sm text-gray-600 mt-3">
            During quiet hours, only urgent notifications will be delivered via SMS or push notifications.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
