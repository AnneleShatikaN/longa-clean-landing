
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Calendar, 
  DollarSign, 
  Star, 
  TrendingUp, 
  Clock, 
  CheckCircle,
  User,
  CreditCard,
  Settings,
  Shield,
  Briefcase
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { ProviderBankingDetails } from '@/components/provider/ProviderBankingDetails';

const ProviderDashboard = () => {
  const { user, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Provider Dashboard</h1>
            <p className="text-gray-600">Welcome back, {user?.full_name}</p>
          </div>
          <div className="flex items-center gap-4">
            <Badge variant="outline" className="flex items-center gap-1">
              <Star className="h-4 w-4" />
              {user?.rating || 0}/5
            </Badge>
            <Button onClick={signOut} variant="outline">
              Sign Out
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Jobs</CardTitle>
              <Briefcase className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{user?.total_jobs || 0}</div>
              <p className="text-xs text-muted-foreground">
                Completed successfully
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">This Month</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">8</div>
              <p className="text-xs text-muted-foreground">
                Jobs completed
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Earnings</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">N$2,340</div>
              <p className="text-xs text-muted-foreground">
                This month
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Rating</CardTitle>
              <Star className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{user?.rating || 0}/5</div>
              <p className="text-xs text-muted-foreground">
                Average rating
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="jobs" className="flex items-center gap-2">
              <Briefcase className="h-4 w-4" />
              Jobs
            </TabsTrigger>
            <TabsTrigger value="banking" className="flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              Banking
            </TabsTrigger>
            <TabsTrigger value="verification" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Verification
            </TabsTrigger>
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Profile
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Recent Jobs
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 border rounded">
                      <div>
                        <h4 className="font-medium">Plumbing Repair</h4>
                        <p className="text-sm text-gray-600">Kitchen sink fix</p>
                      </div>
                      <Badge variant="default">Completed</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded">
                      <div>
                        <h4 className="font-medium">Electrical Installation</h4>
                        <p className="text-sm text-gray-600">Light fixture setup</p>
                      </div>
                      <Badge variant="secondary">In Progress</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded">
                      <div>
                        <h4 className="font-medium">Garden Maintenance</h4>
                        <p className="text-sm text-gray-600">Lawn mowing</p>
                      </div>
                      <Badge variant="outline">Scheduled</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5" />
                    Earnings Overview
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">This Week</span>
                      <span className="font-medium">N$580</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">This Month</span>
                      <span className="font-medium">N$2,340</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Total Earnings</span>
                      <span className="font-medium">N$12,450</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Pending Payout</span>
                      <span className="font-medium text-orange-600">N$340</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="jobs">
            <Card>
              <CardHeader>
                <CardTitle>Job History</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Briefcase className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Jobs Yet</h3>
                  <p className="text-gray-600">Your completed jobs will appear here</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="banking">
            <ProviderBankingDetails />
          </TabsContent>

          <TabsContent value="verification">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Provider Verification
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded">
                    <div>
                      <h4 className="font-medium">Identity Verification</h4>
                      <p className="text-sm text-gray-600">Upload ID document</p>
                    </div>
                    <Badge variant="secondary">Pending</Badge>
                  </div>
                  <div className="flex items-center justify-between p-4 border rounded">
                    <div>
                      <h4 className="font-medium">Background Check</h4>
                      <p className="text-sm text-gray-600">Criminal background verification</p>
                    </div>
                    <Badge variant="secondary">Pending</Badge>
                  </div>
                  <div className="flex items-center justify-between p-4 border rounded">
                    <div>
                      <h4 className="font-medium">Banking Details</h4>
                      <p className="text-sm text-gray-600">Verify payment information</p>
                    </div>
                    <Badge variant="secondary">Pending</Badge>
                  </div>
                  <Button className="w-full">
                    Complete Verification Process
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Profile Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-600">Full Name</label>
                      <p className="text-sm">{user?.full_name}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Email</label>
                      <p className="text-sm">{user?.email}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Phone</label>
                      <p className="text-sm">{user?.phone || 'Not provided'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Location</label>
                      <p className="text-sm">{user?.current_work_location || 'Not specified'}</p>
                    </div>
                  </div>
                  <Button variant="outline">
                    <Settings className="h-4 w-4 mr-2" />
                    Edit Profile
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

export default ProviderDashboard;
