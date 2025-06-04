
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Checkbox } from '@/components/ui/checkbox';
import { UserCheck, Activity, AlertCircle, Settings, Save, Ban, Plus } from 'lucide-react';
import ServiceManagement from '@/components/admin/ServiceManagement';
import { PayoutSystemTabs } from '@/components/admin/PayoutSystemTabs';
import { FinancialManagement } from '@/components/admin/FinancialManagement';
import { LaunchDashboard } from '@/components/admin/launch/LaunchDashboard';
import { AnalyticsDashboard } from '@/components/admin/analytics/AnalyticsDashboard';
import { SupportSystem } from '@/components/admin/support/SupportSystem';
import { SetupWizard } from '@/components/admin/setup/SetupWizard';
import { useToast } from '@/hooks/use-toast';

const AdminDashboard: React.FC = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('overview');
  const [settings, setSettings] = useState({
    maintenanceMode: false,
    newRegistrations: true,
    emailNotifications: true,
    smsNotifications: false,
    autoApproveProviders: false,
    emergencyBookings: true,
    paymentProcessing: true,
    dataBackup: true
  });

  const handleSettingChange = (key: string, value: boolean) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    toast({
      title: "Setting Updated",
      description: `${key.replace(/([A-Z])/g, ' $1').toLowerCase()} has been ${value ? 'enabled' : 'disabled'}.`,
    });
  };

  const handleSaveSettings = () => {
    toast({
      title: "Settings Saved",
      description: "All system settings have been saved successfully.",
    });
  };

  const handleResetSettings = () => {
    setSettings({
      maintenanceMode: false,
      newRegistrations: true,
      emailNotifications: true,
      smsNotifications: false,
      autoApproveProviders: false,
      emergencyBookings: true,
      paymentProcessing: true,
      dataBackup: true
    });
    toast({
      title: "Settings Reset",
      description: "All settings have been reset to default values.",
    });
  };

  // Mock data for dashboard overview
  const dashboardStats = {
    totalUsers: 1250,
    activeProviders: 85,
    totalBookings: 3456,
    revenue: 125430,
    pendingPayouts: 12340,
    systemHealth: 98.5
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-gray-600">Manage your marketplace platform</p>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="default" className="bg-green-100 text-green-800">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                System Online
              </div>
            </Badge>
          </div>
        </div>

        {/* Quick Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Users</p>
                  <p className="text-2xl font-bold">{dashboardStats.totalUsers.toLocaleString()}</p>
                  <p className="text-xs text-green-600">+12% from last month</p>
                </div>
                <UserCheck className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Providers</p>
                  <p className="text-2xl font-bold">{dashboardStats.activeProviders}</p>
                  <p className="text-xs text-green-600">+8% from last week</p>
                </div>
                <Activity className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Bookings</p>
                  <p className="text-2xl font-bold">{dashboardStats.totalBookings.toLocaleString()}</p>
                  <p className="text-xs text-green-600">+15% from last month</p>
                </div>
                <Activity className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Revenue</p>
                  <p className="text-2xl font-bold">N${dashboardStats.revenue.toLocaleString()}</p>
                  <p className="text-xs text-green-600">+22% from last month</p>
                </div>
                <Activity className="h-8 w-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* System Health Alert */}
        <Card className="border-l-4 border-l-yellow-400">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-yellow-600" />
              <div>
                <p className="font-medium">System Health: {dashboardStats.systemHealth}%</p>
                <p className="text-sm text-gray-600">All systems operational. Next maintenance scheduled for Sunday 2:00 AM.</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Admin Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-8">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="services">Services</TabsTrigger>
            <TabsTrigger value="payouts">Payouts</TabsTrigger>
            <TabsTrigger value="financial">Financial</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="launch">Go Live</TabsTrigger>
            <TabsTrigger value="support">Support</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Bookings</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[1, 2, 3, 4].map((item) => (
                      <div key={item} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <UserCheck className="h-8 w-8 bg-blue-100 p-2 rounded-full text-blue-600" />
                          <div>
                            <p className="font-medium">Plumbing Service</p>
                            <p className="text-sm text-gray-600">John Doe • 2 hours ago</p>
                          </div>
                        </div>
                        <Badge>Completed</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Pending Actions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 border rounded-lg border-yellow-200 bg-yellow-50">
                      <div className="flex items-center gap-3">
                        <UserCheck className="h-8 w-8 bg-yellow-100 p-2 rounded-full text-yellow-600" />
                        <div>
                          <p className="font-medium">Provider Verification</p>
                          <p className="text-sm text-gray-600">3 providers awaiting approval</p>
                        </div>
                      </div>
                      <Button size="sm">Review</Button>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 border rounded-lg border-red-200 bg-red-50">
                      <div className="flex items-center gap-3">
                        <Settings className="h-8 w-8 bg-red-100 p-2 rounded-full text-red-600" />
                        <div>
                          <p className="font-medium">Failed Payments</p>
                          <p className="text-sm text-gray-600">2 payment retries needed</p>
                        </div>
                      </div>
                      <Button size="sm" variant="destructive">Fix</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="services" className="space-y-6">
            <ServiceManagement />
          </TabsContent>

          <TabsContent value="payouts" className="space-y-6">
            <PayoutSystemTabs />
          </TabsContent>

          <TabsContent value="financial" className="space-y-6">
            <FinancialManagement />
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <AnalyticsDashboard />
          </TabsContent>

          <TabsContent value="launch" className="space-y-6">
            <LaunchDashboard />
          </TabsContent>

          <TabsContent value="support" className="space-y-6">
            <SupportSystem />
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>System Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">General Settings</h3>
                  
                  <div className="grid gap-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="maintenanceMode">Maintenance Mode</Label>
                        <p className="text-sm text-gray-600">Put the system in maintenance mode</p>
                      </div>
                      <Switch
                        id="maintenanceMode"
                        checked={settings.maintenanceMode}
                        onCheckedChange={(value) => handleSettingChange('maintenanceMode', value)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="newRegistrations">New Registrations</Label>
                        <p className="text-sm text-gray-600">Allow new user registrations</p>
                      </div>
                      <Switch
                        id="newRegistrations"
                        checked={settings.newRegistrations}
                        onCheckedChange={(value) => handleSettingChange('newRegistrations', value)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="emergencyBookings">Emergency Bookings</Label>
                        <p className="text-sm text-gray-600">Allow emergency booking requests</p>
                      </div>
                      <Switch
                        id="emergencyBookings"
                        checked={settings.emergencyBookings}
                        onCheckedChange={(value) => handleSettingChange('emergencyBookings', value)}
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Notification Settings</h3>
                  
                  <div className="grid gap-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="emailNotifications">Email Notifications</Label>
                        <p className="text-sm text-gray-600">Send email notifications to users</p>
                      </div>
                      <Switch
                        id="emailNotifications"
                        checked={settings.emailNotifications}
                        onCheckedChange={(value) => handleSettingChange('emailNotifications', value)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="smsNotifications">SMS Notifications</Label>
                        <p className="text-sm text-gray-600">Send SMS notifications to users</p>
                      </div>
                      <Switch
                        id="smsNotifications"
                        checked={settings.smsNotifications}
                        onCheckedChange={(value) => handleSettingChange('smsNotifications', value)}
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Automation Settings</h3>
                  
                  <div className="grid gap-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="autoApproveProviders">Auto-approve Providers</Label>
                        <p className="text-sm text-gray-600">Automatically approve new provider registrations</p>
                      </div>
                      <Switch
                        id="autoApproveProviders"
                        checked={settings.autoApproveProviders}
                        onCheckedChange={(value) => handleSettingChange('autoApproveProviders', value)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="paymentProcessing">Automatic Payment Processing</Label>
                        <p className="text-sm text-gray-600">Process payments automatically</p>
                      </div>
                      <Switch
                        id="paymentProcessing"
                        checked={settings.paymentProcessing}
                        onCheckedChange={(value) => handleSettingChange('paymentProcessing', value)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="dataBackup">Automatic Data Backup</Label>
                        <p className="text-sm text-gray-600">Perform daily data backups</p>
                      </div>
                      <Switch
                        id="dataBackup"
                        checked={settings.dataBackup}
                        onCheckedChange={(value) => handleSettingChange('dataBackup', value)}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex gap-4 pt-6 border-t">
                  <Button onClick={handleSaveSettings} className="flex items-center gap-2">
                    <Save className="h-4 w-4" />
                    Save Settings
                  </Button>
                  <Button variant="outline" onClick={handleResetSettings} className="flex items-center gap-2">
                    <Ban className="h-4 w-4" />
                    Reset to Default
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;
