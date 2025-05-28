
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
  Save,
  Filter,
  CreditCard,
  AlertCircle
} from 'lucide-react';
import { useForm } from 'react-hook-form';

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const { 
    services, 
    users, 
    bookings, 
    payouts, 
    addService, 
    updateService, 
    toggleServiceStatus, 
    updateUser, 
    updateBookingStatus, 
    processPayout,
    isLoading,
    error 
  } = useData();
  
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [editingUser, setEditingUser] = useState<number | null>(null);
  const [editingService, setEditingService] = useState<number | null>(null);
  const [showAddService, setShowAddService] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');

  const addServiceForm = useForm({
    defaultValues: {
      name: '',
      description: '',
      price: '',
      duration: ''
    }
  });

  // Calculate metrics from real data
  const metrics = {
    totalUsers: users.length,
    activeProviders: users.filter(u => u.role === 'provider' && u.status === 'active').length,
    totalBookings: bookings.length,
    revenue: Math.round(bookings.filter(b => b.status === 'completed').reduce((sum, b) => sum + (b.amount * 0.15), 0)),
    monthlyGrowth: 12.5
  };

  const recentActivity = [
    {
      id: 1,
      type: 'booking',
      message: `New ${bookings[bookings.length - 1]?.serviceName || 'service'} booking by ${bookings[bookings.length - 1]?.clientName || 'client'}`,
      time: '2 minutes ago',
      status: 'new'
    },
    {
      id: 2,
      type: 'provider',
      message: `New provider registration: ${users.filter(u => u.role === 'provider' && u.status === 'pending')[0]?.name || 'Provider'}`,
      time: '15 minutes ago',
      status: 'pending'
    },
    {
      id: 3,
      type: 'payout',
      message: `Payout processed for ${payouts.filter(p => p.status === 'completed')[0]?.providerName || 'Provider'} - N$${payouts.filter(p => p.status === 'completed')[0]?.totalEarnings || 0}`,
      time: '1 hour ago',
      status: 'completed'
    }
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
    updateUser(userId, { [field]: value });
  };

  const handleServiceEdit = (serviceId: number, field: string, value: any) => {
    updateService(serviceId, { [field]: value });
  };

  const handleAddService = (data: any) => {
    addService({
      name: data.name,
      description: data.description,
      price: parseInt(data.price),
      duration: parseInt(data.duration),
      active: true
    });
    addServiceForm.reset();
    setShowAddService(false);
  };

  const filteredBookings = statusFilter === 'all' 
    ? bookings 
    : bookings.filter(booking => booking.status === statusFilter);

  const calculateProviderEarnings = (amount: number) => Math.round(amount * 0.85);
  const calculateCommission = (amount: number) => Math.round(amount * 0.15);

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="p-6">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Error</h2>
            <p className="text-gray-600">{error}</p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-purple-600">Longa Admin</h1>
              {isLoading && <div className="ml-4 text-sm text-gray-500">Loading...</div>}
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
                  <div className="text-2xl font-bold">{metrics.totalUsers}</div>
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
                  <div className="text-2xl font-bold">{metrics.totalBookings}</div>
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
                  <div className="text-2xl font-bold">N${metrics.revenue}</div>
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
                            onPressedChange={() => toggleServiceStatus(service.id)}
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
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Booking Management</h2>
              <div className="flex items-center space-x-2">
                <Filter className="h-4 w-4" />
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Bookings</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="in-progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Bookings Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Booking ID</TableHead>
                      <TableHead>Client</TableHead>
                      <TableHead>Provider</TableHead>
                      <TableHead>Service</TableHead>
                      <TableHead>Date & Time</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredBookings.map((booking) => (
                      <TableRow key={booking.id}>
                        <TableCell className="font-medium">#{booking.id}</TableCell>
                        <TableCell>{booking.clientName}</TableCell>
                        <TableCell>{booking.providerName}</TableCell>
                        <TableCell>{booking.serviceName}</TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div>{booking.date}</div>
                            <div className="text-gray-500">{booking.time}</div>
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">N${booking.amount}</TableCell>
                        <TableCell>
                          <Select 
                            value={booking.status} 
                            onValueChange={(value) => updateBookingStatus(booking.id, value as any)}
                          >
                            <SelectTrigger className="w-32">
                              <SelectValue>
                                <Badge className={getStatusColor(booking.status)}>
                                  {booking.status}
                                </Badge>
                              </SelectValue>
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pending">Pending</SelectItem>
                              <SelectItem value="accepted">Accepted</SelectItem>
                              <SelectItem value="in-progress">In Progress</SelectItem>
                              <SelectItem value="completed">Completed</SelectItem>
                              <SelectItem value="cancelled">Cancelled</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-1">
                            <Button size="sm" variant="outline">
                              <Eye className="h-3 w-3" />
                            </Button>
                            <Button size="sm" variant="outline">
                              <Edit className="h-3 w-3" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* Booking Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{bookings.length}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Completed</CardTitle>
                  <CheckCircle className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{bookings.filter(b => b.status === 'completed').length}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">In Progress</CardTitle>
                  <Clock className="h-4 w-4 text-yellow-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{bookings.filter(b => b.status === 'in-progress').length}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                  <DollarSign className="h-4 w-4 text-purple-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    N${bookings.filter(b => b.status === 'completed').reduce((sum, b) => sum + b.amount, 0)}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Payouts Tab */}
          <TabsContent value="payouts" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Payout Management</h2>
              <Button>
                <CreditCard className="h-4 w-4 mr-2" />
                Bulk Process Payouts
              </Button>
            </div>

            {/* Financial Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Provider Earnings</CardTitle>
                  <DollarSign className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    N${payouts.reduce((sum, p) => sum + p.totalEarnings, 0)}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    85% of booking amounts
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Platform Commission</CardTitle>
                  <TrendingUp className="h-4 w-4 text-purple-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    N${payouts.reduce((sum, p) => sum + p.commission, 0)}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    15% commission rate
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pending Payouts</CardTitle>
                  <AlertCircle className="h-4 w-4 text-yellow-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {payouts.filter(p => p.status === 'pending').length}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Awaiting processing
                  </p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Provider Payouts</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Provider</TableHead>
                      <TableHead>Booking IDs</TableHead>
                      <TableHead>Gross Earnings</TableHead>
                      <TableHead>Commission (15%)</TableHead>
                      <TableHead>Net Payout (85%)</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {payouts.map((payout) => (
                      <TableRow key={payout.id}>
                        <TableCell className="font-medium">{payout.providerName}</TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {payout.bookingIds.map(id => (
                              <Badge key={id} variant="outline" className="text-xs">
                                #{id}
                              </Badge>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell>N${payout.totalEarnings + payout.commission}</TableCell>
                        <TableCell className="text-red-600">-N${payout.commission}</TableCell>
                        <TableCell className="font-medium text-green-600">N${payout.totalEarnings}</TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(payout.status)}>
                            {payout.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {payout.status === 'pending' ? (
                            <Button 
                              size="sm"
                              onClick={() => processPayout(payout.id)}
                            >
                              Process Payout
                            </Button>
                          ) : (
                            <Button size="sm" variant="outline">
                              <Eye className="h-3 w-3" />
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* Individual Booking Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle>Completed Bookings - Financial Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Booking ID</TableHead>
                      <TableHead>Provider</TableHead>
                      <TableHead>Service</TableHead>
                      <TableHead>Total Amount</TableHead>
                      <TableHead>Provider Earnings (85%)</TableHead>
                      <TableHead>Platform Commission (15%)</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {bookings.filter(booking => booking.status === 'completed').map((booking) => (
                      <TableRow key={booking.id}>
                        <TableCell className="font-medium">#{booking.id}</TableCell>
                        <TableCell>{booking.providerName}</TableCell>
                        <TableCell>{booking.serviceName}</TableCell>
                        <TableCell className="font-medium">N${booking.amount}</TableCell>
                        <TableCell className="text-green-600">N${calculateProviderEarnings(booking.amount)}</TableCell>
                        <TableCell className="text-purple-600">N${calculateCommission(booking.amount)}</TableCell>
                        <TableCell>{booking.date}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default AdminDashboard;
