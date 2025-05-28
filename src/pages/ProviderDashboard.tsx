
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, User, LogOut, MapPin, DollarSign, Clock } from 'lucide-react';

interface Job {
  id: number;
  service: string;
  clientName: string;
  location: string;
  amount: number;
  date: string;
  status: 'available' | 'accepted' | 'completed';
  duration: string;
}

const ProviderDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [jobs, setJobs] = useState<Job[]>([
    { id: 1, service: 'House Cleaning', clientName: 'Sarah Johnson', location: 'Klein Windhoek', amount: 150, date: '2024-05-30', status: 'available', duration: '3 hours' },
    { id: 2, service: 'Garden Maintenance', clientName: 'David Miller', location: 'Olympia', amount: 200, date: '2024-05-31', status: 'available', duration: '4 hours' },
    { id: 3, service: 'Car Wash', clientName: 'Lisa Brown', location: 'Windhoek Central', amount: 120, date: '2024-06-01', status: 'available', duration: '2 hours' },
    { id: 4, service: 'Deep Cleaning', clientName: 'Mike Wilson', location: 'Eros', amount: 300, date: '2024-05-28', status: 'accepted', duration: '5 hours' },
    { id: 5, service: 'Laundry Service', clientName: 'Emma Davis', location: 'Auasblick', amount: 80, date: '2024-05-25', status: 'completed', duration: '2 hours' },
  ]);

  const acceptJob = (jobId: number) => {
    setJobs(jobs.map(job => 
      job.id === jobId ? { ...job, status: 'accepted' as const } : job
    ));
  };

  const declineJob = (jobId: number) => {
    setJobs(jobs.filter(job => job.id !== jobId));
  };

  const completeJob = (jobId: number) => {
    setJobs(jobs.map(job => 
      job.id === jobId ? { ...job, status: 'completed' as const } : job
    ));
  };

  const calculateEarnings = (amount: number) => {
    return Math.round(amount * 0.85);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'accepted': return 'bg-blue-100 text-blue-800';
      case 'available': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const availableJobs = jobs.filter(job => job.status === 'available');
  const myJobs = jobs.filter(job => job.status === 'accepted' || job.status === 'completed');
  const totalEarnings = jobs
    .filter(job => job.status === 'completed')
    .reduce((sum, job) => sum + calculateEarnings(job.amount), 0);
  const completedJobs = jobs.filter(job => job.status === 'completed').length;

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
            {/* Available Jobs */}
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Available Jobs</h3>
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
                    <p className="text-gray-500">No available jobs at the moment.</p>
                    <p className="text-sm text-gray-400 mt-1">Check back later for new opportunities!</p>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* My Jobs */}
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">My Jobs</h3>
              <Card>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Service</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Client</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
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
                              {job.location}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                              {job.date}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-purple-600">
                              N${calculateEarnings(job.amount)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <Badge className={`${getStatusColor(job.status)} border-0`}>
                                {job.status}
                              </Badge>
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
                      <p className="text-gray-500">No accepted jobs yet.</p>
                      <p className="text-sm text-gray-400 mt-1">Accept jobs from the available section above.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Profile Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Provider Profile</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="bg-gray-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-3">
                    <User className="h-8 w-8 text-gray-600" />
                  </div>
                  <h4 className="font-semibold text-gray-900">{user?.name}</h4>
                  <p className="text-sm text-gray-600 mb-3">{user?.email}</p>
                  <div className="flex items-center justify-center space-x-1">
                    <span className="text-sm font-medium">4.9</span>
                    <span className="text-sm text-gray-600">(47 reviews)</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Earnings Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <DollarSign className="h-5 w-5 mr-2 text-green-600" />
                  Earnings Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Total Earnings</span>
                  <span className="font-semibold text-green-600">N${totalEarnings}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Completed Jobs</span>
                  <span className="font-semibold text-gray-900">{completedJobs}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Active Jobs</span>
                  <span className="font-semibold text-blue-600">{jobs.filter(j => j.status === 'accepted').length}</span>
                </div>
                <div className="pt-2 border-t">
                  <p className="text-xs text-gray-500">
                    You earn 85% of each booking amount
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">This Week</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Jobs Available</span>
                  <span className="font-semibold text-yellow-600">{availableJobs.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Average Rating</span>
                  <span className="font-semibold text-purple-600">4.9/5</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Response Rate</span>
                  <span className="font-semibold text-green-600">95%</span>
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
