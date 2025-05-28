import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Switch } from '@/components/ui/switch';
import { Toggle } from '@/components/ui/toggle';
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
  XCircle,
  Plus,
  Save
} from 'lucide-react';
import { useForm } from 'react-hook-form';

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [editingUser, setEditingUser] = useState<number | null>(null);
  const [editingService, setEditingService] = useState<number | null>(null);
  const [showAddService, setShowAddService] = useState(false);

  const addServiceForm = useForm({
    defaultValues: {
      name: '',
      description: '',
      price: '',
      duration: ''
    }
  });

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

  const [users, setUsers] = useState([
    { id: 1, name: 'Sarah Wilson', email: 'sarah@email.com', role: 'client', status: 'active', rating: 4.8, available: null, joined: '2024-01-15' },
    { id: 2, name: 'Mike Johnson', email: 'mike@email.com', role: 'provider', status: 'pending', rating: 0, available: true, joined: '2024-01-20' },
    { id: 3, name: 'Emma Davis', email: 'emma@email.com', role: 'client', status: 'active', rating: 4.5, available: null, joined: '2024-01-18' },
    { id: 4, name: 'Mary Smith', email: 'mary@email.com', role: 'provider', status: 'active', rating: 4.9, available: false, joined: '2024-01-10' },
    { id: 5, name: 'Admin User', email: 'admin@longa.com', role: 'admin', status: 'active', rating: null, available: null, joined: '2024-01-01' }
  ]);

  const [services, setServices] = useState([
    { id: 1, name: 'House Cleaning', description: 'Professional home cleaning service', price: 150, duration: 120, active: true, providers: 25, bookings: 450 },
    { id: 2, name: 'Garden Maintenance', description: 'Complete garden care and maintenance', price: 200, duration: 180, active: true, providers: 18, bookings: 320 },
    { id: 3, name: 'Laundry Service', description: 'Wash, dry and fold laundry service', price: 80, duration: 60, active: true, providers: 15, bookings: 280 },
    { id: 4, name: 'Car Washing', description: 'Complete car cleaning service', price: 120, duration: 90, active: false, providers: 12, bookings: 180 }
  ]);

  const bookings = [
    { id: 1, client: 'Sarah Wilson', provider: 'Mary Smith', service: 'House Cleaning', amount: 150, status: 'completed', date: '2024-01-25' },
    { id: 2, client: 'Emma Davis', provider: 'John Doe', service: 'Garden Maintenance', amount: 200, status: 'in-progress', date: '2024-01-25' },
    { id: 3, client: 'Mike Brown', provider: 'Jane Smith', service: 'Laundry Service', amount: 80, status: 'pending', date: '2024-01-24' }
  ];

  const handleLogout = () => {
    logout();
    navigate('/auth');
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800';
      case 'provider': return 'bg-green-100 text-green-800';
      case 'client': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
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

  const handleUserEdit = (userId: number, field: string, value: any) => {
    setUsers(users.map(user => 
      user.id === userId ? { ...user, [field]: value } : user
    ));
  };

  const handleServiceToggle = (serviceId: number) => {
    setServices(services.map(service => 
      service.id === serviceId ? { ...service, active: !service.active } : service
    ));
  };

  const handleServiceEdit = (serviceId: number, field: string, value: any) => {
    setServices(services.map(service => 
      service.id === serviceId ? { ...service, [field]: value } : service
    ));
  };

  const handleAddService = (data: any) => {
    const newService = {
      id: services.length + 1,
      name: data.name,
      description: data.description,
      price: parseInt(data.price),
      duration: parseInt(data.duration),
      active: true,
      providers: 0,
      bookings: 0
    };
    setServices([...services, newService]);
    addServiceForm.reset();
    setShowAddService(false);
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
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Rating</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Available</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>
                          {editingUser === user.id ? (
                            <Input 
                              value={user.name}
                              onChange={(e) => handleUserEdit(user.id, 'name', e.target.value)}
                              className="w-32"
                            />
                          ) : (
                            user.name
                          )}
                        </TableCell>
                        <TableCell>
                          {editingUser === user.id ? (
                            <Input 
                              value={user.email}
                              onChange={(e) => handleUserEdit(user.id, 'email', e.target.value)}
                              className="w-40"
                            />
                          ) : (
                            user.email
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge className={getRoleBadgeColor(user.role)}>
                            {user.role}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {user.rating !== null ? `${user.rating}/5` : 'N/A'}
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(user.status)}>
                            {user.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {user.role === 'provider' ? (
                            <div className="flex items-center space-x-2">
                              {user.available ? (
                                <Badge className="bg-green-100 text-green-800">
                                  <CheckCircle className="h-3 w-3 mr-1" />
                                  Available
                                </Badge>
                              ) : (
                                <Badge className="bg-red-100 text-red-800">
                                  <XCircle className="h-3 w-3 mr-1" />
                                  Unavailable
                                </Badge>
                              )}
                            </div>
                          ) : (
                            'N/A'
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-1">
                            {editingUser === user.id ? (
                              <Button 
                                size="sm" 
                                onClick={() => setEditingUser(null)}
                              >
                                <Save className="h-3 w-3" />
                              </Button>
                            ) : (
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => setEditingUser(user.id)}
                              >
                                <Edit className="h-3 w-3" />
                              </Button>
                            )}
                            <Button size="sm" variant="outline">
                              <Eye className="h-3 w-3" />
                            </Button>
                            <Button size="sm" variant="outline">
                              <Ban className="h-3 w-3" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Services Tab */}
          <TabsContent value="services" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Service Management</h2>
              <Button onClick={() => setShowAddService(!showAddService)}>
                <Plus className="h-4 w-4 mr-2" />
                Add New Service
              </Button>
            </div>

            {showAddService && (
              <Card>
                <CardHeader>
                  <CardTitle>Add New Service</CardTitle>
                </CardHeader>
                <CardContent>
                  <Form {...addServiceForm}>
                    <form onSubmit={addServiceForm.handleSubmit(handleAddService)} className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={addServiceForm.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Service Name</FormLabel>
                              <FormControl>
                                <Input placeholder="Enter service name" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={addServiceForm.control}
                          name="price"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Price (N$)</FormLabel>
                              <FormControl>
                                <Input type="number" placeholder="Enter price" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={addServiceForm.control}
                          name="duration"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Duration (minutes)</FormLabel>
                              <FormControl>
                                <Input type="number" placeholder="Enter duration" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <FormField
                        control={addServiceForm.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Description</FormLabel>
                            <FormControl>
                              <Textarea placeholder="Enter service description" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <div className="flex space-x-2">
                        <Button type="submit">Add Service</Button>
                        <Button type="button" variant="outline" onClick={() => setShowAddService(false)}>
                          Cancel
                        </Button>
                      </div>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle>Services List</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Price (N$)</TableHead>
                      <TableHead>Duration (min)</TableHead>
                      <TableHead>Providers</TableHead>
                      <TableHead>Bookings</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {services.map((service) => (
                      <TableRow key={service.id}>
                        <TableCell>
                          {editingService === service.id ? (
                            <Input 
                              value={service.name}
                              onChange={(e) => handleServiceEdit(service.id, 'name', e.target.value)}
                              className="w-32"
                            />
                          ) : (
                            service.name
                          )}
                        </TableCell>
                        <TableCell>
                          {editingService === service.id ? (
                            <Textarea 
                              value={service.description}
                              onChange={(e) => handleServiceEdit(service.id, 'description', e.target.value)}
                              className="w-48 min-h-[60px]"
                            />
                          ) : (
                            <div className="max-w-48 truncate">{service.description}</div>
                          )}
                        </TableCell>
                        <TableCell>
                          {editingService === service.id ? (
                            <Input 
                              type="number"
                              value={service.price}
                              onChange={(e) => handleServiceEdit(service.id, 'price', parseInt(e.target.value))}
                              className="w-20"
                            />
                          ) : (
                            service.price
                          )}
                        </TableCell>
                        <TableCell>
                          {editingService === service.id ? (
                            <Input 
                              type="number"
                              value={service.duration}
                              onChange={(e) => handleServiceEdit(service.id, 'duration', parseInt(e.target.value))}
                              className="w-20"
                            />
                          ) : (
                            service.duration
                          )}
                        </TableCell>
                        <TableCell>{service.providers}</TableCell>
                        <TableCell>{service.bookings}</TableCell>
                        <TableCell>
                          <Toggle 
                            pressed={service.active}
                            onPressedChange={() => handleServiceToggle(service.id)}
                            className="data-[state=on]:bg-green-500 data-[state=on]:text-white"
                          >
                            {service.active ? 'Active' : 'Inactive'}
                          </Toggle>
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-1">
                            {editingService === service.id ? (
                              <Button 
                                size="sm" 
                                onClick={() => setEditingService(null)}
                              >
                                <Save className="h-3 w-3" />
                              </Button>
                            ) : (
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => setEditingService(service.id)}
                              >
                                <Edit className="h-3 w-3" />
                              </Button>
                            )}
                            <Button size="sm" variant="outline">
                              <Eye className="h-3 w-3" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
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
