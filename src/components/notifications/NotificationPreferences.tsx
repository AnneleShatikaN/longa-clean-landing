import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useNotifications } from '@/contexts/NotificationContext';
import { Bell, Mail, MessageSquare, Smartphone, Clock, UserCheck, UserX, Shield } from 'lucide-react';

const notificationTypes = [
  { 
    id: 'job_assigned', 
    label: 'Job Assignments', 
    description: 'When jobs are assigned to you',
    critical: true
  },
  { 
    id: 'booking_confirmation', 
    label: 'Booking Updates', 
    description: 'When bookings are confirmed or updated',
    critical: false
  },
  { 
    id: 'payment_received', 
    label: 'Payment Notifications', 
    description: 'Payment receipts and payout updates',
    critical: true
  },
  { 
    id: 'payout_processed', 
    label: 'Payout Updates', 
    description: 'When payouts are processed or failed',
    critical: true
  },
  { 
    id: 'system_maintenance', 
    label: 'System Updates', 
    description: 'Maintenance and system notifications',
    critical: false
  },
  { 
    id: 'marketing_promo', 
    label: 'Promotions', 
    description: 'Marketing campaigns and special offers',
    critical: false
  },
];

export const NotificationPreferences = () => {
  const { preferences, updatePreferences, isAvailable, setAvailability } = useNotifications();
  const [doNotDisturbStart, setDoNotDisturbStart] = useState('22:00');
  const [doNotDisturbEnd, setDoNotDisturbEnd] = useState('08:00');

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

  const handleDoNotDisturbUpdate = async () => {
    await updatePreferences('general', {
      quiet_hours_start: doNotDisturbStart,
      quiet_hours_end: doNotDisturbEnd
    });
  };

  const handleAvailabilityToggle = async () => {
    await setAvailability(!isAvailable);
  };

  return (
    <div className="space-y-6">
      {/* Availability Status Card */}
      <Card className={`border-2 ${isAvailable ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {isAvailable ? (
                <UserCheck className="h-5 w-5 text-green-600" />
              ) : (
                <UserX className="h-5 w-5 text-red-600" />
              )}
              Availability Status
            </div>
            <Badge 
              variant={isAvailable ? "default" : "destructive"}
              className="text-sm"
            >
              {isAvailable ? 'Available for Jobs' : 'Unavailable'}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">
                {isAvailable 
                  ? 'You will receive job assignments and notifications'
                  : 'You will not receive new job assignments'
                }
              </p>
            </div>
            <Switch
              checked={isAvailable}
              onCheckedChange={handleAvailabilityToggle}
              className="data-[state=checked]:bg-green-600"
            />
          </div>
        </CardContent>
      </Card>

      {/* Notification Preferences */}
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
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium text-gray-900">{notificationType.label}</h4>
                      {notificationType.critical && (
                        <Shield className="h-4 w-4 text-orange-500" />
                      )}
                    </div>
                    <p className="text-sm text-gray-600">{notificationType.description}</p>
                    {notificationType.critical && (
                      <p className="text-xs text-orange-600 mt-1">
                        Critical notifications cannot be fully disabled for your safety
                      </p>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="flex items-center space-x-2">
                      <Bell className="h-4 w-4 text-purple-600" />
                      <Label htmlFor={`${notificationType.id}-in-app`} className="text-sm">In-app</Label>
                      <Switch
                        id={`${notificationType.id}-in-app`}
                        checked={pref.in_app_enabled}
                        onCheckedChange={(value) => handleToggle(notificationType.id, 'in_app', value)}
                        disabled={notificationType.critical}
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

      {/* Do Not Disturb Hours */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Do Not Disturb Hours
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="quiet-start">Start Time</Label>
                <Input
                  id="quiet-start"
                  type="time"
                  value={doNotDisturbStart}
                  onChange={(e) => setDoNotDisturbStart(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="quiet-end">End Time</Label>
                <Input
                  id="quiet-end"
                  type="time"
                  value={doNotDisturbEnd}
                  onChange={(e) => setDoNotDisturbEnd(e.target.value)}
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
            
            <Button onClick={handleDoNotDisturbUpdate} className="w-full md:w-auto">
              Update Do Not Disturb Settings
            </Button>
            
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Note:</strong> During Do Not Disturb hours, only emergency notifications 
                will be delivered via SMS. All other notifications will be queued until your 
                available hours.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Emergency Override */}
      <Card className="border-orange-200 bg-orange-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-orange-800">
            <Shield className="h-5 w-5" />
            Emergency Notifications
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-orange-700">
            Emergency job assignments will always be delivered immediately via SMS and in-app 
            notifications, regardless of your Do Not Disturb settings or availability status. 
            This ensures you don't miss critical opportunities.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
