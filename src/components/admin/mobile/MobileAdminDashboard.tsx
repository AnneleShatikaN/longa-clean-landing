
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Users, 
  AlertCircle, 
  CheckCircle, 
  XCircle, 
  Phone, 
  MessageSquare,
  DollarSign,
  Clock,
  Settings,
  Bell
} from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { useMobileUtils } from '@/hooks/useMobileUtils';
import { useToast } from '@/hooks/use-toast';
import { TouchOptimizedActions } from './TouchOptimizedActions';
import { QuickActionPanel } from './QuickActionPanel';
import { EmergencyContactSystem } from './EmergencyContactSystem';

interface MobileAdminDashboardProps {
  data?: any;
  isLoading?: boolean;
}

export const MobileAdminDashboard: React.FC<MobileAdminDashboardProps> = ({ 
  data = {}, 
  isLoading = false 
}) => {
  const isMobile = useIsMobile();
  const { vibrate, handleTouchFeedback } = useMobileUtils();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('overview');

  const mockData = {
    pendingProviders: 3,
    pendingPayouts: 7,
    urgentIssues: 2,
    activeJobs: 15,
    totalRevenue: 12500,
    ...data
  };

  const handleQuickAction = async (action: string, id?: string) => {
    handleTouchFeedback();
    vibrate(50);

    try {
      switch (action) {
        case 'approve-provider':
          // Simulate approval
          toast({
            title: "Provider Approved",
            description: "Provider has been successfully approved",
          });
          break;
        case 'reject-provider':
          toast({
            title: "Provider Rejected", 
            description: "Provider application has been rejected",
            variant: "destructive"
          });
          break;
        case 'emergency-contact':
          // Handle emergency contact
          break;
        default:
          console.log(`Action: ${action}`, id);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to perform action",
        variant: "destructive"
      });
    }
  };

  if (!isMobile) {
    return (
      <div className="p-4 text-center">
        <p className="text-gray-600">Mobile admin dashboard is optimized for mobile devices.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Mobile Header */}
      <div className="bg-white shadow-sm sticky top-0 z-40">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <h1 className="text-lg font-semibold">Admin</h1>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm">
                <Bell className="h-5 w-5" />
                {mockData.urgentIssues > 0 && (
                  <Badge className="ml-1 bg-red-500 text-white h-5 w-5 p-0 text-xs">
                    {mockData.urgentIssues}
                  </Badge>
                )}
              </Button>
              <Button variant="ghost" size="sm">
                <Settings className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="p-4 space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <Card className="touch-manipulation">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Users className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Pending</p>
                  <p className="text-xl font-semibold">{mockData.pendingProviders}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="touch-manipulation">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <DollarSign className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Payouts</p>
                  <p className="text-xl font-semibold">{mockData.pendingPayouts}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Emergency Alert */}
        {mockData.urgentIssues > 0 && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <AlertCircle className="h-5 w-5 text-red-600" />
                  <div>
                    <p className="font-medium text-red-900">Urgent Issues</p>
                    <p className="text-sm text-red-700">{mockData.urgentIssues} require attention</p>
                  </div>
                </div>
                <Button 
                  size="sm" 
                  variant="destructive"
                  onClick={() => handleQuickAction('emergency-contact')}
                  className="min-h-[44px] min-w-[44px]"
                >
                  <Phone className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="px-4">
        <TabsList className="grid w-full grid-cols-3 mb-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="actions">Actions</TabsTrigger>
          <TabsTrigger value="emergency">Emergency</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <QuickActionPanel onAction={handleQuickAction} data={mockData} />
        </TabsContent>

        <TabsContent value="actions" className="space-y-4">
          <TouchOptimizedActions onAction={handleQuickAction} />
        </TabsContent>

        <TabsContent value="emergency" className="space-y-4">
          <EmergencyContactSystem />
        </TabsContent>
      </Tabs>
    </div>
  );
};
