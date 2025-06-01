import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useBookings } from '@/contexts/BookingContext';
import { useData } from '@/contexts/DataContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loading, TableSkeleton, CardSkeleton } from '@/components/ui/loading';
import { useToast } from '@/hooks/use-toast';
import { BookingManager } from '@/components/booking/BookingManager';
import Footer from '@/components/Footer';
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
  X,
  Bell
} from 'lucide-react';

const ClientDashboard = () => {
  const { user, logout } = useAuth();
  const { bookings, getBookingsByClient, getUpcomingBookings, notifications, isLoading, error } = useBookings();
  const { users } = useData();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'bookings'>('overview');

  // Get user bookings
  const userId = parseInt(user?.id?.toString() || '0');
  const userBookings = getBookingsByClient(userId);
  const upcomingBookings = getUpcomingBookings(userId, 'client');
  const unreadNotifications = notifications.filter(n => !n.read);

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
    totalSpent: userBookings.filter(b => b.status === 'completed').reduce((sum, b) => sum + b.amount, 0),
    upcomingJobs: upcomingBookings.length
  };

  const nextAppointment = upcomingBookings
    .sort((a, b) => new Date(a.date + 'T' + a.time).getTime() - new Date(b.date + 'T' + b.time).getTime())[0];

  const currentUser = users.find(u => u.email === user?.email);

  const handleLogout = async () => {
    try {
      await logout();
      toast({
        title: "Success",
        description: "You have been logged out successfully.",
      });
      navigate('/');
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to logout. Please try again.",
        variant: "destructive"
      });
    }
  };

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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col">
      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="mobile-sidebar-overlay"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-30 backdrop-blur-sm bg-white/95">
        <div className="max-w-7xl mx-auto mobile-container">
          <div className="mobile-header h-16">
            <div className="flex items-center space-x-4">
              <h1 className="text-xl sm:text-2xl font-bold text-purple-600 transition-colors hover:text-purple-700">
                Longa
              </h1>
              <span className="text-gray-300 mobile-hide">|</span>
              <h2 className="text-sm sm:text-lg text-gray-700 mobile-hide">
                Welcome back, {user?.name}
              </h2>
            </div>
            
            {/* Header Actions */}
            <div className="flex items-center space-x-2">
              {/* Notifications */}
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-4 w-4" />
                {unreadNotifications.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {unreadNotifications.length}
                  </span>
                )}
              </Button>

              {/* Mobile menu button */}
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
                onClick={handleLogout}
                className="text-gray-600 hover:text-gray-900 transition-colors mobile-button"
              >
                <LogOut className="h-4 w-4 mr-2" />
                <span className="mobile-hide">Logout</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex-1">
        <div className="max-w-7xl mx-auto mobile-container py-4 sm:py-8">
          {/* Tab Navigation */}
          <div className="mb-6">
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8">
                <button
                  onClick={() => setActiveTab('overview')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'overview'
                      ? 'border-purple-500 text-purple-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Dashboard Overview
                </button>
                <button
                  onClick={() => setActiveTab('bookings')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'bookings'
                      ? 'border-purple-500 text-purple-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  My Bookings
                </button>
              </nav>
            </div>
          </div>

          {activeTab === 'overview' ? (
            <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 lg:gap-8">
              {/* Main Content */}
              <div className="xl:col-span-3 space-y-6 lg:space-y-8">
                {/* Quick Actions */}
                <div className="animate-fade-in">
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">Quick Actions</h3>
                  <div className="mobile-grid">
                    <Card 
                      className="hover:shadow-lg transition-all duration-300 cursor-pointer border-purple-100 hover:border-purple-200 hover-lift"
                      onClick={() => handleQuickAction('one-off')}
                    >
                      <CardContent className="mobile-card">
                        <div className="flex items-center space-x-4">
                          <div className="bg-purple-100 p-3 rounded-lg transition-colors hover:bg-purple-200 flex-shrink-0">
                            <Plus className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <h4 className="font-semibold text-gray-900 text-sm sm:text-base">One-Off Booking</h4>
                            <p className="text-xs sm:text-sm text-gray-600 line-clamp-2">Book a service for a specific date</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card 
                      className="hover:shadow-lg transition-all duration-300 cursor-pointer border-purple-100 hover:border-purple-200 hover-lift"
                      onClick={() => handleQuickAction('subscription')}
                    >
                      <CardContent className="mobile-card">
                        <div className="flex items-center space-x-4">
                          <div className="bg-purple-100 p-3 rounded-lg transition-colors hover:bg-purple-200 flex-shrink-0">
                            <RotateCcw className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <h4 className="font-semibold text-gray-900 text-sm sm:text-base">Subscription Plan</h4>
                            <p className="text-xs sm:text-sm text-gray-600 line-clamp-2">Set up recurring services</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>

                {/* Recent Bookings Preview */}
                <div className="animate-fade-in" style={{ animationDelay: '0.2s' }}>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg sm:text-xl font-semibold text-gray-900">Recent Bookings</h3>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setActiveTab('bookings')}
                    >
                      View All
                    </Button>
                  </div>
                  <Card className="overflow-hidden">
                    <CardContent className="p-0">
                      {isLoading ? (
                        <div className="p-6">
                          <TableSkeleton rows={3} columns={4} />
                        </div>
                      ) : userBookings.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                          <Calendar className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                          <p>No bookings yet</p>
                          <p className="text-sm text-gray-400 mt-1">Start by booking your first service!</p>
                        </div>
                      ) : (
                        <div className="overflow-x-auto">
                          <table className="w-full mobile-table">
                            <thead className="bg-gray-50">
                              <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Service</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                              </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                              {userBookings.slice(0, 3).map((booking) => (
                                <tr key={booking.id} className="hover:bg-gray-50">
                                  <td className="px-6 py-4">
                                    <div className="text-sm font-medium text-gray-900">{booking.serviceName}</div>
                                    <div className="text-sm text-gray-500">{booking.providerName}</div>
                                  </td>
                                  <td className="px-6 py-4">
                                    <div className="text-sm text-gray-900">{booking.date}</div>
                                    <div className="text-sm text-gray-500">{booking.time}</div>
                                  </td>
                                  <td className="px-6 py-4">
                                    <Badge className={getStatusColor(booking.status)}>
                                      {booking.status}
                                    </Badge>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Sidebar */}
              <div className={`xl:col-span-1 space-y-6 ${isMobileMenuOpen ? 'mobile-sidebar-panel' : 'mobile-sidebar'}`}>
                {/* Mobile sidebar close button */}
                {isMobileMenuOpen && (
                  <div className="flex justify-end lg:hidden mb-4 pt-4 px-4">
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

                <div className={`space-y-6 ${isMobileMenuOpen ? 'p-6' : ''}`}>
                  {/* User Profile Card */}
                  <Card className="animate-fade-in">
                    <CardHeader>
                      <CardTitle className="text-lg">Profile</CardTitle>
                    </CardHeader>
                    <CardContent>
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
                    </CardContent>
                  </Card>

                  {/* Quick Stats */}
                  <Card className="animate-fade-in" style={{ animationDelay: '0.1s' }}>
                    <CardHeader>
                      <CardTitle className="text-lg">Quick Stats</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <span className="text-sm text-gray-600">Total Bookings</span>
                        <span className="font-semibold text-gray-900 text-lg">{stats.totalBookings}</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                        <span className="text-sm text-gray-600">Completed Jobs</span>
                        <span className="font-semibold text-green-600 text-lg">{stats.completedJobs}</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                        <span className="text-sm text-gray-600">Total Spent</span>
                        <span className="font-semibold text-purple-600 text-lg">N${stats.totalSpent}</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                        <span className="text-sm text-gray-600">Upcoming</span>
                        <span className="font-semibold text-blue-600 text-lg">{stats.upcomingJobs}</span>
                      </div>
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
                      {nextAppointment ? (
                        <div className="p-3 bg-blue-50 rounded-lg">
                          <p className="font-medium text-gray-900">{nextAppointment.serviceName}</p>
                          <p className="text-sm text-gray-600">{nextAppointment.date} at {nextAppointment.time}</p>
                          <p className="text-sm text-gray-600">with {nextAppointment.providerName}</p>
                          <Badge className="mt-2" variant="outline">
                            {nextAppointment.status}
                          </Badge>
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
          ) : (
            // Bookings Tab
            <BookingManager userRole="client" userId={userId} />
          )}
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default ClientDashboard;
