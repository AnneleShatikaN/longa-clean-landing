
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Star, User, LogOut, Plus, RotateCcw } from 'lucide-react';

const ClientDashboard = () => {
  const { user, logout } = useAuth();

  // Mock data for bookings
  const bookings = [
    { id: 1, service: 'House Cleaning', date: '2024-05-25', status: 'completed', provider: 'Mary Smith', amount: 150 },
    { id: 2, service: 'Garden Maintenance', date: '2024-05-28', status: 'accepted', provider: 'John Doe', amount: 200 },
    { id: 3, service: 'Plumbing Repair', date: '2024-05-30', status: 'pending', provider: 'Mike Johnson', amount: 120 },
    { id: 4, service: 'House Cleaning', date: '2024-05-20', status: 'completed', provider: 'Mary Smith', amount: 150 },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'accepted': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const stats = {
    totalBookings: bookings.length,
    completedJobs: bookings.filter(b => b.status === 'completed').length,
    totalSpent: bookings.filter(b => b.status === 'completed').reduce((sum, b) => sum + b.amount, 0)
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-purple-600">Longa</h1>
              <span className="text-gray-300">|</span>
              <h2 className="text-lg text-gray-700">Welcome back, {user?.name}</h2>
            </div>
            <Button 
              variant="ghost" 
              onClick={logout}
              className="text-gray-600 hover:text-gray-900"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3 space-y-8">
            {/* Quick Actions */}
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="hover:shadow-md transition-shadow cursor-pointer border-purple-100">
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-4">
                      <div className="bg-purple-100 p-3 rounded-lg">
                        <Plus className="h-6 w-6 text-purple-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">One-Off Booking</h4>
                        <p className="text-sm text-gray-600">Book a service for a specific date</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="hover:shadow-md transition-shadow cursor-pointer border-purple-100">
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-4">
                      <div className="bg-purple-100 p-3 rounded-lg">
                        <RotateCcw className="h-6 w-6 text-purple-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">Subscription Plan</h4>
                        <p className="text-sm text-gray-600">Set up recurring services</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* My Bookings */}
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">My Bookings</h3>
              <Card>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Service</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Provider</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {bookings.map((booking) => (
                          <tr key={booking.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {booking.service}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                              {booking.provider}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                              {booking.date}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                              N${booking.amount}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <Badge className={`${getStatusColor(booking.status)} border-0`}>
                                {booking.status}
                              </Badge>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* User Profile Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Profile</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="bg-gray-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-3">
                    <User className="h-8 w-8 text-gray-600" />
                  </div>
                  <h4 className="font-semibold text-gray-900">{user?.name}</h4>
                  <p className="text-sm text-gray-600 mb-3">{user?.email}</p>
                  <div className="flex items-center justify-center space-x-1">
                    <Star className="h-4 w-4 text-yellow-400 fill-current" />
                    <span className="text-sm font-medium">4.8</span>
                    <span className="text-sm text-gray-600">(24 reviews)</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quick Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Total Bookings</span>
                  <span className="font-semibold text-gray-900">{stats.totalBookings}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Completed Jobs</span>
                  <span className="font-semibold text-green-600">{stats.completedJobs}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Total Spent</span>
                  <span className="font-semibold text-purple-600">N${stats.totalSpent}</span>
                </div>
              </CardContent>
            </Card>

            {/* Next Appointment */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <Calendar className="h-5 w-5 mr-2 text-purple-600" />
                  Next Appointment
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div>
                  <p className="font-medium text-gray-900">Garden Maintenance</p>
                  <p className="text-sm text-gray-600">May 28, 2024 at 10:00 AM</p>
                  <p className="text-sm text-gray-600">with John Doe</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientDashboard;
