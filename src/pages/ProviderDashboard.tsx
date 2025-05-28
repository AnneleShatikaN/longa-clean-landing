
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Calendar, User, LogOut, MapPin, DollarSign, Clock, 
  Phone, Mail, Star, Filter, Bell 
} from 'lucide-react';
import JobFilters from '@/components/JobFilters';
import AvailabilityToggle from '@/components/AvailabilityToggle';
import RatingSystem from '@/components/RatingSystem';
import EarningsTracker from '@/components/EarningsTracker';
import NotificationSystem from '@/components/NotificationSystem';

interface Job {
  id: number;
  service: string;
  clientName: string;
  clientPhone: string;
  clientEmail: string;
  location: string;
  amount: number;
  date: string;
  status: 'requested' | 'accepted' | 'completed';
  duration: string;
  completedDate?: string;
  rating?: number;
  reviewComment?: string;
}

const ProviderDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // State management
  const [isAvailable, setIsAvailable] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [locationFilter, setLocationFilter] = useState('all');

  const [jobs, setJobs] = useState<Job[]>([
    { 
      id: 1, 
      service: 'House Cleaning', 
      clientName: 'Sarah Johnson',
      clientPhone: '+264 81 123 4567',
      clientEmail: 'sarah.j@email.com',
      location: 'Klein Windhoek', 
      amount: 150, 
      date: '2024-05-30', 
      status: 'requested', 
      duration: '3 hours' 
    },
    { 
      id: 2, 
      service: 'Garden Maintenance', 
      clientName: 'David Miller',
      clientPhone: '+264 81 234 5678',
      clientEmail: 'david.m@email.com',
      location: 'Olympia', 
      amount: 200, 
      date: '2024-05-31', 
      status: 'requested', 
      duration: '4 hours' 
    },
    { 
      id: 3, 
      service: 'Car Wash', 
      clientName: 'Lisa Brown',
      clientPhone: '+264 81 345 6789',
      clientEmail: 'lisa.b@email.com',
      location: 'Windhoek Central', 
      amount: 120, 
      date: '2024-06-01', 
      status: 'requested', 
      duration: '2 hours' 
    },
    { 
      id: 4, 
      service: 'Deep Cleaning', 
      clientName: 'Mike Wilson',
      clientPhone: '+264 81 456 7890',
      clientEmail: 'mike.w@email.com',
      location: 'Eros', 
      amount: 300, 
      date: '2024-05-28', 
      status: 'accepted', 
      duration: '5 hours' 
    },
    { 
      id: 5, 
      service: 'Laundry Service', 
      clientName: 'Emma Davis',
      clientPhone: '+264 81 567 8901',
      clientEmail: 'emma.d@email.com',
      location: 'Auasblick', 
      amount: 80, 
      date: '2024-05-25', 
      status: 'completed', 
      duration: '2 hours',
      completedDate: '2024-05-25',
      rating: 5,
      reviewComment: 'Excellent service! Very professional and thorough.'
    },
  ]);

  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: 'new_job' as const,
      title: 'New Job Request',
      message: 'House Cleaning job in Klein Windhoek for N$150',
      time: '5 minutes ago',
      read: false,
      actionable: true
    },
    {
      id: 2,
      type: 'rating_received' as const,
      title: 'New Rating Received',
      message: 'Emma Davis rated your service 5 stars',
      time: '2 hours ago',
      read: false
    },
    {
      id: 3,
      type: 'payment_received' as const,
      title: 'Payment Received',
      message: 'N$68 payment received for completed laundry service',
      time: '1 day ago',
      read: true
    }
  ]);

  const ratings = [
    {
      id: 1,
      jobId: 5,
      clientName: 'Emma Davis',
      rating: 5,
      comment: 'Excellent service! Very professional and thorough.',
      date: '2024-05-25',
      service: 'Laundry Service'
    }
  ];

  const monthlyEarnings = [
    { month: 'Jan 2024', earnings: 2400, jobsCompleted: 28, averageRating: 4.8 },
    { month: 'Feb 2024', earnings: 2100, jobsCompleted: 25, averageRating: 4.7 },
    { month: 'Mar 2024', earnings: 2800, jobsCompleted: 32, averageRating: 4.9 },
    { month: 'Apr 2024', earnings: 2650, jobsCompleted: 30, averageRating: 4.8 },
    { month: 'May 2024', earnings: 1250, jobsCompleted: 15, averageRating: 4.9 }
  ];

  // Job management functions
  const acceptJob = (jobId: number) => {
    setJobs(jobs.map(job => 
      job.id === jobId ? { ...job, status: 'accepted' as const } : job
    ));
    
    addNotification({
      type: 'new_job',
      title: 'Job Accepted',
      message: 'You have successfully accepted the job',
      time: 'Just now'
    });
  };

  const declineJob = (jobId: number) => {
    setJobs(jobs.filter(job => job.id !== jobId));
  };

  const completeJob = (jobId: number) => {
    setJobs(jobs.map(job => 
      job.id === jobId ? { 
        ...job, 
        status: 'completed' as const,
        completedDate: new Date().toISOString().split('T')[0]
      } : job
    ));
    
    addNotification({
      type: 'job_completed',
      title: 'Job Completed',
      message: 'Job marked as completed successfully',
      time: 'Just now'
    });
  };

  // Notification functions
  const addNotification = (notification: Omit<typeof notifications[0], 'id' | 'read'>) => {
    const newNotification = {
      ...notification,
      id: notifications.length + 1,
      read: false
    };
    setNotifications([newNotification, ...notifications]);
  };

  const markAsRead = (id: number) => {
    setNotifications(notifications.map(n => 
      n.id === id ? { ...n, read: true } : n
    ));
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  const dismissNotification = (id: number) => {
    setNotifications(notifications.filter(n => n.id !== id));
  };

  // Filter and search functions
  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.service.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.location.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || job.status === statusFilter;
    const matchesLocation = locationFilter === 'all' || job.location === locationFilter;
    
    return matchesSearch && matchesStatus && matchesLocation;
  });

  const calculateEarnings = (amount: number) => {
    return Math.round(amount * 0.85);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'accepted': return 'bg-blue-100 text-blue-800';
      case 'requested': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const availableJobs = filteredJobs.filter(job => job.status === 'requested');
  const myJobs = filteredJobs.filter(job => job.status === 'accepted' || job.status === 'completed');
  const totalEarnings = jobs
    .filter(job => job.status === 'completed')
    .reduce((sum, job) => sum + calculateEarnings(job.amount), 0);
  const completedJobs = jobs.filter(job => job.status === 'completed').length;
  const currentMonthEarnings = monthlyEarnings[monthlyEarnings.length - 1]?.earnings || 0;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-purple-600">Longa Provider</h1>
              <span className="text-gray-300">|</span>
              <h2 className="text-lg text-gray-700">Welcome back, {user?.name}</h2>
            </div>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Bell className="h-6 w-6 text-gray-600" />
                {notifications.filter(n => !n.read).length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {notifications.filter(n => !n.read).length}
                  </span>
                )}
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
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3 space-y-8">
            {/* Availability Toggle */}
            <AvailabilityToggle 
              isAvailable={isAvailable}
              onToggle={setIsAvailable}
            />

            {/* Job Filters */}
            <JobFilters
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              statusFilter={statusFilter}
              onStatusFilterChange={setStatusFilter}
              locationFilter={locationFilter}
              onLocationFilterChange={setLocationFilter}
            />

            {/* Available Jobs */}
            {isAvailable && (
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  Available Jobs ({availableJobs.length})
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {availableJobs.map((job) => (
                    <Card key={job.id} className="hover:shadow-md transition-shadow border-purple-100">
                      <CardHeader className="pb-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="text-lg font-semibold text-gray-900">
                              {job.service}
                            </CardTitle>
                            <p className="text-sm text-gray-600 flex items-center mt-1">
                              <User className="h-4 w-4 mr-1" />
                              {job.clientName}
                            </p>
                          </div>
                          <Badge className={getStatusColor(job.status)}>
                            {job.status}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="space-y-3">
                          <div className="flex items-center text-sm text-gray-600">
                            <MapPin className="h-4 w-4 mr-2" />
                            {job.location}
                          </div>
                          <div className="flex items-center text-sm text-gray-600">
                            <Calendar className="h-4 w-4 mr-2" />
                            {job.date}
                          </div>
                          <div className="flex items-center text-sm text-gray-600">
                            <Clock className="h-4 w-4 mr-2" />
                            {job.duration}
                          </div>
                          <div className="flex items-center text-sm text-gray-600">
                            <Phone className="h-4 w-4 mr-2" />
                            {job.clientPhone}
                          </div>
                          <div className="flex items-center text-sm text-gray-600">
                            <Mail className="h-4 w-4 mr-2" />
                            {job.clientEmail}
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="text-sm text-gray-600">
                              <span className="font-medium text-purple-600">
                                N${calculateEarnings(job.amount)}
                              </span>
                              <span className="text-xs text-gray-500 ml-1">
                                (85% of N${job.amount})
                              </span>
                            </div>
                          </div>
                          <div className="flex space-x-2 pt-2">
                            <Button 
                              onClick={() => acceptJob(job.id)}
                              className="flex-1 bg-green-600 hover:bg-green-700"
                              size="sm"
                            >
                              Accept
                            </Button>
                            <Button 
                              onClick={() => declineJob(job.id)}
                              variant="outline"
                              className="flex-1"
                              size="sm"
                            >
                              Decline
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
                {availableJobs.length === 0 && (
                  <Card>
                    <CardContent className="p-8 text-center">
                      <p className="text-gray-500">No available jobs match your current filters.</p>
                      <p className="text-sm text-gray-400 mt-1">Try adjusting your search or filters!</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}

            {/* My Jobs */}
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                My Jobs ({myJobs.length})
              </h3>
              <Card>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Service</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Client</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Earnings</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {myJobs.map((job) => (
                          <tr key={job.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {job.service}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                              {job.clientName}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                              <div className="flex flex-col">
                                <span>{job.clientPhone}</span>
                                <span className="text-xs text-gray-500">{job.clientEmail}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                              <div className="flex flex-col">
                                <span>{job.date}</span>
                                {job.completedDate && (
                                  <span className="text-xs text-green-600">Completed: {job.completedDate}</span>
                                )}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-purple-600">
                              N${calculateEarnings(job.amount)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex flex-col">
                                <Badge className={`${getStatusColor(job.status)} border-0 mb-1`}>
                                  {job.status}
                                </Badge>
                                {job.rating && (
                                  <div className="flex items-center">
                                    <Star className="h-3 w-3 text-yellow-400 fill-current mr-1" />
                                    <span className="text-xs text-gray-600">{job.rating}/5</span>
                                  </div>
                                )}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              {job.status === 'accepted' && (
                                <Button 
                                  onClick={() => completeJob(job.id)}
                                  size="sm"
                                  className="bg-green-600 hover:bg-green-700"
                                >
                                  Mark Complete
                                </Button>
                              )}
                              {job.status === 'completed' && (
                                <span className="text-green-600 font-medium">✓ Completed</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {myJobs.length === 0 && (
                    <div className="p-8 text-center">
                      <p className="text-gray-500">No jobs match your current filters.</p>
                      <p className="text-sm text-gray-400 mt-1">Try adjusting your search or filters!</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Notifications */}
            <NotificationSystem
              notifications={notifications}
              onMarkAsRead={markAsRead}
              onMarkAllAsRead={markAllAsRead}
              onDismiss={dismissNotification}
            />

            {/* Earnings Tracker */}
            <EarningsTracker
              currentMonthEarnings={currentMonthEarnings}
              totalEarnings={totalEarnings}
              monthlyData={monthlyEarnings}
              completedJobs={completedJobs}
            />

            {/* Ratings & Reviews */}
            <RatingSystem ratings={ratings} />

            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quick Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Jobs Available</span>
                  <span className="font-semibold text-yellow-600">{availableJobs.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Response Rate</span>
                  <span className="font-semibold text-green-600">95%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Avg. Completion Time</span>
                  <span className="font-semibold text-purple-600">2.5 hours</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProviderDashboard;
