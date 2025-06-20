import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Save, Database, Shield, Zap } from 'lucide-react';
import { useDataMode } from '@/contexts/DataModeContext';
import { useToast } from '@/hooks/use-toast';

export const SystemConfiguration = () => {
  const { dataMode, setDataMode, isDevelopmentMode } = useDataMode();
  const { toast } = useToast();
  
  const [systemSettings, setSystemSettings] = useState({
    enableManualPayoutMode: false,
    enableRatingsSystem: true,
    enableWeekendBonuses: true,
    enableEmergencyBookings: true,
    enableAutoPayouts: true,
    enableSMSNotifications: false,
    enableEmailNotifications: true,
    enableWhatsAppNotifications: false,
    requirePaymentProof: true,
    enableMaintenanceMode: false
  });

  const handleSettingChange = (setting: string, value: boolean) => {
    setSystemSettings(prev => ({
      ...prev,
      [setting]: value
    }));
  };

  const handleDataModeChange = async (newMode: 'live' | 'mock') => {
    try {
      await setDataMode(newMode);
      toast({
        title: "Data Mode Updated",
        description: `Switched to ${newMode} data mode.`,
      });
    } catch (error) {
      toast({
        title: "Update Failed",
        description: "Failed to update data mode. Please try again.",
        variant: "destructive",
      });
    }
  };

  const saveSystemSettings = async () => {
    try {
      // Here you would save to Supabase global_settings table
      console.log('Saving system settings:', systemSettings);
      
      toast({
        title: "Settings Saved",
        description: "System configuration has been updated successfully.",
      });
    } catch (error) {
      toast({
        title: "Save Failed",
        description: "Failed to save system settings. Please try again.",
        variant: "destructive",
      });
    }
  };

  const getDataModeColor = () => {
    switch (dataMode) {
      case 'live': return 'bg-green-100 text-green-800';
      case 'mock': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-sm text-gray-600">
        Configure system-wide settings and business rules for your platform.
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Data Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Current Data Mode</p>
              <p className="text-sm text-gray-600">
                Application is configured to use live production data only
              </p>
            </div>
            <Badge className="bg-green-100 text-green-800">
              LIVE
            </Badge>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Business Rules
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label htmlFor="manual-payout">Manual Payout Mode</Label>
                <p className="text-sm text-gray-600">
                  Require manual approval for all provider payouts
                </p>
              </div>
              <Switch
                id="manual-payout"
                checked={systemSettings.enableManualPayoutMode}
                onCheckedChange={(value) => handleSettingChange('enableManualPayoutMode', value)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label htmlFor="ratings-system">Ratings System</Label>
                <p className="text-sm text-gray-600">
                  Allow clients to rate and review services
                </p>
              </div>
              <Switch
                id="ratings-system"
                checked={systemSettings.enableRatingsSystem}
                onCheckedChange={(value) => handleSettingChange('enableRatingsSystem', value)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label htmlFor="weekend-bonuses">Weekend Bonuses</Label>
                <p className="text-sm text-gray-600">
                  Apply weekend bonus to provider payouts
                </p>
              </div>
              <Switch
                id="weekend-bonuses"
                checked={systemSettings.enableWeekendBonuses}
                onCheckedChange={(value) => handleSettingChange('enableWeekendBonuses', value)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label htmlFor="emergency-bookings">Emergency Bookings</Label>
                <p className="text-sm text-gray-600">
                  Allow clients to make emergency bookings with priority
                </p>
              </div>
              <Switch
                id="emergency-bookings"
                checked={systemSettings.enableEmergencyBookings}
                onCheckedChange={(value) => handleSettingChange('enableEmergencyBookings', value)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label htmlFor="payment-proof">Require Payment Proof</Label>
                <p className="text-sm text-gray-600">
                  Require clients to upload payment proof for bookings
                </p>
              </div>
              <Switch
                id="payment-proof"
                checked={systemSettings.requirePaymentProof}
                onCheckedChange={(value) => handleSettingChange('requirePaymentProof', value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Notification Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label htmlFor="email-notifications">Email Notifications</Label>
                <p className="text-sm text-gray-600">
                  Send email notifications to users
                </p>
              </div>
              <Switch
                id="email-notifications"
                checked={systemSettings.enableEmailNotifications}
                onCheckedChange={(value) => handleSettingChange('enableEmailNotifications', value)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label htmlFor="sms-notifications">SMS Notifications</Label>
                <p className="text-sm text-gray-600">
                  Send SMS notifications for urgent updates
                </p>
              </div>
              <Switch
                id="sms-notifications"
                checked={systemSettings.enableSMSNotifications}
                onCheckedChange={(value) => handleSettingChange('enableSMSNotifications', value)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label htmlFor="whatsapp-notifications">WhatsApp Notifications</Label>
                <p className="text-sm text-gray-600">
                  Send WhatsApp messages for booking updates
                </p>
              </div>
              <Switch
                id="whatsapp-notifications"
                checked={systemSettings.enableWhatsAppNotifications}
                onCheckedChange={(value) => handleSettingChange('enableWhatsAppNotifications', value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={saveSystemSettings} className="flex items-center gap-2">
          <Save className="h-4 w-4" />
          Save Configuration
        </Button>
      </div>
    </div>
  );
};
