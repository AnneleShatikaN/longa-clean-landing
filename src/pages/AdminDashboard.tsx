
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  UserCheck, 
  Calendar, 
  DollarSign, 
  TrendingUp, 
  Activity,
  Settings,
  Eye,
  Edit,
  Ban,
  CheckCircle,
  Clock,
  XCircle
} from 'lucide-react';

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');

  // Mock data for dashboard
  const metrics = {
    totalUsers: 1247,
    activeProviders: 89,
    totalBookings: 3456,
    revenue: 51840, // 15% commission
    monthlyGrowth: 12.5
  };

  const recentActivity = [
    {
      id: 1,
      type: 'booking',
      message: 'New house cleaning booking by Sarah Wilson',
      time: '2 minutes ago',
      status: 'new'
    },
    {
      id: 2,
      type: 'provider',
      message: 'New provider registration: Mike Johnson',
      time: '15 minutes ago',
      status: 'pending'
    },
    {
      id: 3,
      type: 'payout',
      message: 'Payout processed for Mary Smith - N$340',
      time: '1 hour ago',
      status: 'completed'
    },
    {
      id: 4,
      type: 'booking',
      message: 'Booking completed: Garden maintenance',
      time: '2 hours ago',
      status: 'completed'
    }
  ];

  const users = [
    { id: 1, name: 'Sarah Wilson', email: 'sarah@email.com', role: 'client', status: 'active', joined: '2024-01-15' },
    { id: 2, name: 'Mike Johnson', email: 'mike@email.com', role: 'provider', status: 'pending', joined: '2024-01-20' },
    { id: 3, name: 'Emma Davis', email: 'emma@email.com', role: 'client', status: 'active', joined: '2024-01-18' },
    { id: 4, name: 'Mary Smith', email: 'mary@email.com', role: 'provider', status: 'active', joined: '2024-01-10' }
  ];

  const services = [
    { id: 1, name: 'House Cleaning', category: 'Home', providers: 25, bookings: 450, revenue: 6750 },
    { id: 2, name: 'Garden Maintenance', category: 'Outdoor', providers: 18, bookings: 320, revenue: 4800 },
    { id: 3, name: 'Laundry Service', category: 'Home', providers: 15, bookings: 280, revenue: 2800 },
    { id: 4, name: 'Car Washing', category: 'Automotive', providers: 12, bookings: 180, revenue: 2700 }
  ];

  const bookings = [
    { id: 1, client: 'Sarah Wilson', provider: 'Mary Smith', service: 'House Cleaning', amount: 150, status: 'completed', date: '2024-01-25' },
    { id: 2, client: 'Emma Davis', provider: 'John Doe', service: 'Garden Maintenance', amount: 200, status: 'in-progress', date: '2024-01-25' },
    { id: 3, client: 'Mike Brown', provider: 'Jane Smith', service: 'Laundry Service', amount: 80, status: 'pending', date: '2024-01-24' }
  ];

  const handleLogout = () => {
    logout();
    navigate('/auth');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': case 'completed': return 'bg-green-100 text-green-800';
      case 'pending': case 'in-progress': return 'bg-yellow-100 text-yellow-800';
      case 'inactive': case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'booking': return <Calendar className="h-4 w-4 text-blue-600" />;
      case 'provider': return <UserCheck className="h-4 w-4 text-green-600" />;
      case 'payout': return <DollarSign className="h-4 w-4 text-purple-600" />;
      default: return <Activity className="h-4 w-4 text-gray-600" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-purple-600">Longa Admin</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700">Welcome, {user?.name}</span>
              <Button variant="outline" onClick={handleLogout}>
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="services">Services</TabsTrigger>
            <TabsTrigger value="bookings">Bookings</TabsTrigger>
            <TabsTrigger value="payouts">Payouts</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Metrics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{metrics.totalUsers.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">
                    +12% from last month
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Providers</CardTitle>
                  <UserCheck className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{metrics.activeProviders}</div>
                  <p className="text-xs text-muted-foreground">
                    +8% from last month
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{metrics.totalBookings.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">
                    +15% from last month
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Revenue (15% Commission)</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">N${metrics.revenue.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">
                    +{metrics.monthlyGrowth}% from last month
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity & Quick Actions */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentActivity.map((activity) => (
                      <div key={activity.id} className="flex items-start space-x-3">
                        <div className="flex-shrink-0">
                          {getActivityIcon(activity.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-gray-900">{activity.message}</p>
                          <p className="text-xs text-gray-500">{activity.time}</p>
                        </div>
                        <Badge className={getStatusColor(activity.status)}>
                          {activity.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button className="w-full justify-start">
                    <UserCheck className="h-4 w-4 mr-2" />
                    Approve Pending Providers
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <DollarSign className="h-4 w-4 mr-2" />
                    Process Payouts
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <TrendingUp className="h-4 w-4 mr-2" />
                    Generate Reports
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Settings className="h-4 w-4 mr-2" />
                    System Settings
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>User Management</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {users.map((user) => (
                    <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h3 className="font-medium">{user.name}</h3>
                        <p className="text-sm text-gray-600">{user.email}</p>
                        <p className="text-xs text-gray-500">Joined: {user.joined}</p>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Badge className={`${user.role === 'provider' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}`}>
                          {user.role}
                        </Badge>
                        <Badge className={getStatusColor(user.status)}>
                          {user.status}
                        </Badge>
                        <div className="flex space-x-1">
                          <Button size="sm" variant="outline">
                            <Eye className="h-3 w-3" />
                          </Button>
                          <Button size="sm" variant="outline">
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button size="sm" variant="outline">
                            <Ban className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Services Tab */}
          <TabsContent value="services" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Service Management</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {services.map((service) => (
                    <Card key={service.id}>
                      <CardHeader>
                        <CardTitle className="text-lg">{service.name}</CardTitle>
                        <Badge variant="outline">{service.category}</Badge>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Providers:</span>
                            <span className="font-medium">{service.providers}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Bookings:</span>
                            <span className="font-medium">{service.bookings}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Revenue:</span>
                            <span className="font-medium">N${service.revenue}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Bookings Tab */}
          <TabsContent value="bookings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Booking Management</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {bookings.map((booking) => (
                    <div key={booking.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h3 className="font-medium">{booking.service}</h3>
                        <p className="text-sm text-gray-600">
                          {booking.client} → {booking.provider}
                        </p>
                        <p className="text-xs text-gray-500">{booking.date}</p>
                      </div>
                      <div className="flex items-center space-x-3">
                        <span className="font-medium">N${booking.amount}</span>
                        <Badge className={getStatusColor(booking.status)}>
                          {booking.status}
                        </Badge>
                        <div className="flex space-x-1">
                          <Button size="sm" variant="outline">
                            <Eye className="h-3 w-3" />
                          </Button>
                          <Button size="sm" variant="outline">
                            <Edit className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Payouts Tab */}
          <TabsContent value="payouts" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Payout Management</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <DollarSign className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                  <p className="text-gray-500">Payout management system coming soon</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default AdminDashboard;
