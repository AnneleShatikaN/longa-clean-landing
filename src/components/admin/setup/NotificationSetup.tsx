
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';

interface NotificationSetupProps {
  onComplete: () => void;
}

export const NotificationSetup: React.FC<NotificationSetupProps> = ({ onComplete }) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    emailProvider: '',
    smsProvider: '',
    enableEmailNotifications: true,
    enableSmsNotifications: true,
    enablePushNotifications: true,
    notificationFrequency: 'immediate',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    localStorage.setItem('notification_setup', JSON.stringify(formData));
    
    toast({
      title: "Success",
      description: "Notification settings saved successfully",
    });
    
    onComplete();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Email Configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Switch
              id="enableEmail"
              checked={formData.enableEmailNotifications}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, enableEmailNotifications: checked }))}
            />
            <Label htmlFor="enableEmail">Enable Email Notifications</Label>
          </div>

          <div>
            <Label htmlFor="emailProvider">Email Provider</Label>
            <Select value={formData.emailProvider} onValueChange={(value) => setFormData(prev => ({ ...prev, emailProvider: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Select email provider" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sendgrid">SendGrid</SelectItem>
                <SelectItem value="mailgun">Mailgun</SelectItem>
                <SelectItem value="ses">Amazon SES</SelectItem>
                <SelectItem value="smtp">Custom SMTP</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>SMS Configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Switch
              id="enableSms"
              checked={formData.enableSmsNotifications}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, enableSmsNotifications: checked }))}
            />
            <Label htmlFor="enableSms">Enable SMS Notifications</Label>
          </div>

          <div>
            <Label htmlFor="smsProvider">SMS Provider</Label>
            <Select value={formData.smsProvider} onValueChange={(value) => setFormData(prev => ({ ...prev, smsProvider: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Select SMS provider" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="twilio">Twilio</SelectItem>
                <SelectItem value="messagebird">MessageBird</SelectItem>
                <SelectItem value="clickatell">Clickatell</SelectItem>
                <SelectItem value="local">Local Provider</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Notification Preferences</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Switch
              id="enablePush"
              checked={formData.enablePushNotifications}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, enablePushNotifications: checked }))}
            />
            <Label htmlFor="enablePush">Enable Push Notifications</Label>
          </div>

          <div>
            <Label htmlFor="frequency">Notification Frequency</Label>
            <Select value={formData.notificationFrequency} onValueChange={(value) => setFormData(prev => ({ ...prev, notificationFrequency: value }))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="immediate">Immediate</SelectItem>
                <SelectItem value="hourly">Hourly Digest</SelectItem>
                <SelectItem value="daily">Daily Digest</SelectItem>
                <SelectItem value="weekly">Weekly Summary</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Button type="submit" className="w-full">
        Save Notification Settings
      </Button>
    </form>
  );
};
