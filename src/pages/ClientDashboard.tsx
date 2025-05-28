import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loading, TableSkeleton, CardSkeleton } from '@/components/ui/loading';
import { useToast } from '@/hooks/use-toast';
import { 
  Calendar, 
  Star, 
  User, 
  LogOut, 
  Plus, 
  RotateCcw, 
  AlertCircle,
  Filter,
  Search,
  Menu,
  X
} from 'lucide-react';

const ClientDashboard = () => {
  const { user, logout } = useAuth();
  const { bookings, users, isLoading, error } = useData();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Filter bookings for current user
  const userBookings = bookings.filter(booking => 
    booking.clientName === user?.name || (booking.clientId && booking.clientId === parseInt(user?.id || '0'))
  );

  // Apply filters
  const filteredBookings = userBookings.filter(booking => {
    const matchesStatus = statusFilter === 'all' || booking.status === statusFilter;
    const matchesSearch = booking.serviceName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         booking.providerName.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'accepted': case 'in-progress': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const stats = {
    totalBookings: userBookings.length,
    completedJobs: userBookings.filter(b => b.status === 'completed').length,
    totalSpent: userBookings.filter(b => b.status === 'completed').reduce((sum, b) => sum + b.amount, 0)
  };

  const nextAppointment = userBookings
    .filter(b => b.status === 'accepted' || b.status === 'pending')
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())[0];

  const currentUser = users.find(u => u.email === user?.email);

  const handleQuickAction = (action: string) => {
    toast({
      title: "Navigation",
      description: `Navigating to ${action}...`,
    });
    
    if (action === 'one-off') {
      navigate('/booking/one-off');
    } else if (action === 'subscription') {
      navigate('/subscription-packages');
    }
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Alert variant="destructive" className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-30 backdrop-blur-sm bg-white/95">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-purple-600 transition-colors hover:text-purple-700">
                Longa
              </h1>
              <span className="text-gray-300 hidden sm:block">|</span>
              <h2 className="text-lg text-gray-700 hidden sm:block">
                Welcome back, {user?.name}
              </h2>
            </div>
            
            {/* Mobile menu button */}
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                aria-label="Toggle mobile menu"
              >
                {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
              
              <Button 
                variant="ghost" 
                onClick={logout}
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                <LogOut className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Logout</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 lg:gap-8">
          {/* Main Content */}
          <div className="xl:col-span-3 space-y-6 lg:space-y-8">
            {/* Quick Actions */}
            <div className="animate-fade-in">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Card 
                  className="hover:shadow-lg transition-all duration-300 cursor-pointer border-purple-100 hover:border-purple-200 hover:scale-105 transform"
                  onClick={() => handleQuickAction('one-off')}
                >
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex items-center space-x-4">
                      <div className="bg-purple-100 p-3 rounded-lg transition-colors hover:bg-purple-200">
                        <Plus className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="font-semibold text-gray-900 text-sm sm:text-base">One-Off Booking</h4>
                        <p className="text-xs sm:text-sm text-gray-600 truncate">Book a service for a specific date</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card 
                  className="hover:shadow-lg transition-all duration-300 cursor-pointer border-purple-100 hover:border-purple-200 hover:scale-105 transform"
                  onClick={() => handleQuickAction('subscription')}
                >
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex items-center space-x-4">
                      <div className="bg-purple-100 p-3 rounded-lg transition-colors hover:bg-purple-200">
                        <RotateCcw className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="font-semibold text-gray-900 text-sm sm:text-base">Subscription Plan</h4>
                        <p className="text-xs sm:text-sm text-gray-600 truncate">Set up recurring services</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Booking Filters */}
            <div className="animate-fade-in" style={{ animationDelay: '0.1s' }}>
              <div className="flex flex-col sm:flex-row gap-4 mb-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <input
                    type="text"
                    placeholder="Search bookings..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    aria-label="Search bookings"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Filter className="h-4 w-4 text-gray-500" />
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    aria-label="Filter by status"
                  >
                    <option value="all">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="accepted">Accepted</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>
            </div>

            {/* My Bookings */}
            <div className="animate-fade-in" style={{ animationDelay: '0.2s' }}>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">My Bookings</h3>
              <Card className="overflow-hidden">
                <CardContent className="p-0">
                  {isLoading ? (
                    <div className="p-6">
                      <TableSkeleton rows={3} columns={5} />
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Service
                            </th>
                            <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                              Provider
                            </th>
                            <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Date
                            </th>
                            <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                              Amount
                            </th>
                            <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Status
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {filteredBookings.map((booking, index) => (
                            <tr 
                              key={booking.id} 
                              className="hover:bg-gray-50 transition-colors animate-fade-in"
                              style={{ animationDelay: `${index * 0.1}s` }}
                            >
                              <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                                <div>
                                  <div className="text-sm font-medium text-gray-900">
                                    {booking.serviceName}
                                  </div>
                                  <div className="text-xs text-gray-500 sm:hidden">
                                    {booking.providerName}
                                  </div>
                                </div>
                              </td>
                              <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-600 hidden sm:table-cell">
                                {booking.providerName}
                              </td>
                              <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">{booking.date}</div>
                                <div className="text-xs text-gray-500">{booking.time}</div>
                              </td>
                              <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-600 hidden md:table-cell">
                                N${booking.amount}
                              </td>
                              <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                                <Badge className={`${getStatusColor(booking.status)} text-xs`}>
                                  {booking.status}
                                </Badge>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      {filteredBookings.length === 0 && (
                        <div className="text-center py-8 text-gray-500">
                          No bookings found matching your criteria.
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Sidebar */}
          <div className={`xl:col-span-1 space-y-6 ${isMobileMenuOpen ? 'fixed inset-y-0 right-0 w-80 bg-white z-50 p-6 shadow-2xl overflow-y-auto transform transition-transform duration-300 ease-in-out lg:transform-none' : 'hidden xl:block'}`}>
            {/* Mobile sidebar close button */}
            {isMobileMenuOpen && (
              <div className="flex justify-end lg:hidden mb-4">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsMobileMenuOpen(false)}
                  aria-label="Close sidebar"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
            )}

            {/* User Profile Card */}
            <Card className="animate-fade-in">
              <CardHeader>
                <CardTitle className="text-lg">Profile</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <CardSkeleton />
                ) : (
                  <div className="text-center">
                    <div className="bg-gradient-to-br from-purple-100 to-purple-200 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-3 transition-transform hover:scale-105">
                      <User className="h-8 w-8 text-purple-600" />
                    </div>
                    <h4 className="font-semibold text-gray-900">{user?.name}</h4>
                    <p className="text-sm text-gray-600 mb-3 break-all">{user?.email}</p>
                    <div className="flex items-center justify-center space-x-1">
                      <Star className="h-4 w-4 text-yellow-400 fill-current" />
                      <span className="text-sm font-medium">{currentUser?.rating || 4.8}</span>
                      <span className="text-sm text-gray-600">(24 reviews)</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card className="animate-fade-in" style={{ animationDelay: '0.1s' }}>
              <CardHeader>
                <CardTitle className="text-lg">Quick Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {isLoading ? (
                  <CardSkeleton />
                ) : (
                  <>
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg transition-colors hover:bg-gray-100">
                      <span className="text-sm text-gray-600">Total Bookings</span>
                      <span className="font-semibold text-gray-900 text-lg">{stats.totalBookings}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg transition-colors hover:bg-green-100">
                      <span className="text-sm text-gray-600">Completed Jobs</span>
                      <span className="font-semibold text-green-600 text-lg">{stats.completedJobs}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg transition-colors hover:bg-purple-100">
                      <span className="text-sm text-gray-600">Total Spent</span>
                      <span className="font-semibold text-purple-600 text-lg">N${stats.totalSpent}</span>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Next Appointment */}
            <Card className="animate-fade-in" style={{ animationDelay: '0.2s' }}>
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <Calendar className="h-5 w-5 mr-2 text-purple-600" />
                  Next Appointment
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <CardSkeleton />
                ) : nextAppointment ? (
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <p className="font-medium text-gray-900">{nextAppointment.serviceName}</p>
                    <p className="text-sm text-gray-600">{nextAppointment.date} at {nextAppointment.time}</p>
                    <p className="text-sm text-gray-600">with {nextAppointment.providerName}</p>
                  </div>
                ) : (
                  <div className="text-center p-6 text-gray-500">
                    <Calendar className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                    <p className="text-sm">No upcoming appointments</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientDashboard;
