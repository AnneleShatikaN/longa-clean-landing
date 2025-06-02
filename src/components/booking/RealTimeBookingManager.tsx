
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Clock, MapPin, User, Calendar, Star, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { useSupabaseBookings } from '@/contexts/SupabaseBookingContext';
import { useAuth } from '@/contexts/AuthContext';
import { format } from 'date-fns';

export const RealTimeBookingManager = () => {
  const { user } = useAuth();
  const {
    bookings,
    notifications,
    isLoading,
    acceptBooking,
    startJob,
    completeJob,
    cancelBooking,
    getAvailableJobs,
    markNotificationAsRead
  } = useSupabaseBookings();

  const [availableJobs, setAvailableJobs] = useState<any[]>([]);
  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  const [rating, setRating] = useState(5);
  const [review, setReview] = useState('');

  // Fetch available jobs for providers
  useEffect(() => {
    if (user?.role === 'provider') {
      loadAvailableJobs();
    }
  }, [user]);

  const loadAvailableJobs = async () => {
    try {
      const jobs = await getAvailableJobs();
      setAvailableJobs(jobs);
    } catch (error) {
      console.error('Error loading available jobs:', error);
    }
  };

  const handleAcceptJob = async (bookingId: string) => {
    try {
      await acceptBooking(bookingId);
      await loadAvailableJobs(); // Refresh available jobs
    } catch (error) {
      console.error('Error accepting job:', error);
    }
  };

  const handleStartJob = async (bookingId: string) => {
    try {
      await startJob(bookingId);
    } catch (error) {
      console.error('Error starting job:', error);
    }
  };

  const handleCompleteJob = async (bookingId: string) => {
    try {
      await completeJob(bookingId, rating, review);
      setSelectedBooking(null);
      setRating(5);
      setReview('');
    } catch (error) {
      console.error('Error completing job:', error);
    }
  };

  const handleCancelBooking = async (bookingId: string) => {
    try {
      await cancelBooking(bookingId);
    } catch (error) {
      console.error('Error cancelling booking:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'accepted': return 'bg-blue-100 text-blue-800';
      case 'in_progress': return 'bg-purple-100 text-purple-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'accepted': return <CheckCircle className="h-4 w-4" />;
      case 'in_progress': return <AlertCircle className="h-4 w-4" />;
      case 'completed': return <CheckCircle className="h-4 w-4" />;
      case 'cancelled': return <XCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="pt-6">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue={user?.role === 'provider' ? 'available' : 'my-bookings'} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          {user?.role === 'provider' && (
            <TabsTrigger value="available">Available Jobs</TabsTrigger>
          )}
          <TabsTrigger value="my-bookings">My Bookings</TabsTrigger>
          <TabsTrigger value="notifications">
            Notifications {notifications.filter(n => !n.read).length > 0 && (
              <Badge variant="destructive" className="ml-1 h-5 w-5 rounded-full p-0 text-xs">
                {notifications.filter(n => !n.read).length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        {user?.role === 'provider' && (
          <TabsContent value="available" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Available Jobs
                </CardTitle>
              </CardHeader>
              <CardContent>
                {availableJobs.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No available jobs at the moment</p>
                ) : (
                  <div className="space-y-4">
                    {availableJobs.map((job) => (
                      <Card key={job.id} className="border-l-4 border-l-blue-500">
                        <CardContent className="pt-4">
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <h3 className="font-semibold text-lg">{job.service?.name}</h3>
                              <p className="text-gray-600">{job.service?.description}</p>
                            </div>
                            <Badge className="bg-green-100 text-green-800">
                              N${job.total_amount}
                            </Badge>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4 mb-4">
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-gray-500" />
                              <span>{format(new Date(job.booking_date), 'MMM dd, yyyy')}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4 text-gray-500" />
                              <span>{job.booking_time}</span>
                            </div>
                          </div>

                          {job.special_instructions && (
                            <div className="mb-4">
                              <p className="text-sm text-gray-600">
                                <strong>Instructions:</strong> {job.special_instructions}
                              </p>
                            </div>
                          )}

                          <div className="flex gap-2">
                            <Button onClick={() => handleAcceptJob(job.id)} className="flex-1">
                              Accept Job
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        )}

        <TabsContent value="my-bookings" className="space-y-4">
          {bookings.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center py-8">
                <p className="text-gray-500">No bookings found</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {bookings.map((booking) => (
                <Card key={booking.id}>
                  <CardContent className="pt-4">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="font-semibold text-lg">
                          {booking.service?.name || 'Service'}
                        </h3>
                        <div className="flex items-center gap-2 mt-1">
                          <User className="h-4 w-4 text-gray-500" />
                          <span className="text-sm text-gray-600">
                            {user?.role === 'client' 
                              ? `Provider: ${booking.provider?.full_name || 'Unassigned'}`
                              : `Client: ${booking.client?.full_name}`
                            }
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge className={`${getStatusColor(booking.status)} flex items-center gap-1`}>
                          {getStatusIcon(booking.status)}
                          {booking.status.replace('_', ' ')}
                        </Badge>
                        <p className="text-lg font-bold mt-1">N${booking.total_amount}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-gray-500" />
                        <span>{format(new Date(booking.booking_date), 'MMM dd, yyyy')}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-gray-500" />
                        <span>{booking.booking_time}</span>
                      </div>
                    </div>

                    {booking.special_instructions && (
                      <div className="mb-4">
                        <p className="text-sm text-gray-600">
                          <strong>Instructions:</strong> {booking.special_instructions}
                        </p>
                      </div>
                    )}

                    {/* Action buttons based on status and user role */}
                    <div className="flex gap-2">
                      {user?.role === 'provider' && booking.status === 'accepted' && (
                        <Button onClick={() => handleStartJob(booking.id)}>
                          Start Job
                        </Button>
                      )}
                      
                      {user?.role === 'provider' && booking.status === 'in_progress' && (
                        <Button 
                          onClick={() => setSelectedBooking(booking)}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          Complete Job
                        </Button>
                      )}

                      {['pending', 'accepted'].includes(booking.status) && (
                        <Button 
                          variant="outline" 
                          onClick={() => handleCancelBooking(booking.id)}
                          className="text-red-600 border-red-600"
                        >
                          Cancel
                        </Button>
                      )}
                    </div>

                    {booking.rating && (
                      <div className="mt-4 pt-4 border-t">
                        <div className="flex items-center gap-2">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span className="font-medium">Rating: {booking.rating}/5</span>
                        </div>
                        {booking.review && (
                          <p className="text-sm text-gray-600 mt-1">{booking.review}</p>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          {notifications.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center py-8">
                <p className="text-gray-500">No notifications</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2">
              {notifications.map((notification) => (
                <Card 
                  key={notification.id} 
                  className={`cursor-pointer transition-colors ${
                    !notification.read ? 'bg-blue-50 border-blue-200' : ''
                  }`}
                  onClick={() => markNotificationAsRead(notification.id)}
                >
                  <CardContent className="pt-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium">{notification.title}</h4>
                        <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-500">
                          {format(new Date(notification.created_at), 'MMM dd, HH:mm')}
                        </p>
                        {!notification.read && (
                          <Badge variant="destructive" className="mt-1">New</Badge>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Job Completion Modal */}
      {selectedBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Complete Job</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="rating">Rating (1-5)</Label>
                <Input
                  id="rating"
                  type="number"
                  min="1"
                  max="5"
                  value={rating}
                  onChange={(e) => setRating(Number(e.target.value))}
                />
              </div>
              <div>
                <Label htmlFor="review">Review (Optional)</Label>
                <Textarea
                  id="review"
                  placeholder="Leave a review..."
                  value={review}
                  onChange={(e) => setReview(e.target.value)}
                />
              </div>
              <div className="flex gap-2">
                <Button 
                  onClick={() => handleCompleteJob(selectedBooking.id)}
                  className="flex-1"
                >
                  Complete Job
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setSelectedBooking(null)}
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};
