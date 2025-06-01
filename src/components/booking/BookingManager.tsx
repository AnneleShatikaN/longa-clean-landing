
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from '@/hooks/use-toast';
import { useBookings, Booking } from '@/contexts/BookingContext';
import { BookingCalendar } from './BookingCalendar';
import { JobTracker } from './JobTracker';
import { 
  Calendar, 
  Search, 
  Filter, 
  Clock, 
  User, 
  MapPin,
  AlertCircle,
  CheckCircle,
  XCircle,
  RefreshCw
} from 'lucide-react';

interface BookingManagerProps {
  userRole: 'client' | 'provider' | 'admin';
  userId?: number;
}

export const BookingManager: React.FC<BookingManagerProps> = ({ userRole, userId }) => {
  const { bookings, updateBookingStatus, cancelBooking, isLoading, error } = useBookings();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [showCalendar, setShowCalendar] = useState(false);

  const filteredBookings = bookings.filter(booking => {
    const matchesSearch = booking.serviceName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         booking.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         booking.providerName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || booking.status === statusFilter;
    
    // Filter by user role
    if (userRole === 'client' && userId) {
      return matchesSearch && matchesStatus && booking.clientId === userId;
    }
    if (userRole === 'provider' && userId) {
      return matchesSearch && matchesStatus && booking.providerId === userId;
    }
    
    return matchesSearch && matchesStatus;
  });

  const handleStatusUpdate = async (bookingId: number, newStatus: Booking['status']) => {
    try {
      await updateBookingStatus(bookingId, newStatus);
      toast({
        title: "Success",
        description: `Booking status updated to ${newStatus}`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update booking status",
        variant: "destructive"
      });
    }
  };

  const handleCancelBooking = async (bookingId: number) => {
    try {
      await cancelBooking(bookingId);
      toast({
        title: "Success",
        description: "Booking cancelled successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to cancel booking",
        variant: "destructive"
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'accepted': return 'bg-blue-100 text-blue-800';
      case 'in-progress': return 'bg-purple-100 text-purple-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'accepted': return <CheckCircle className="h-4 w-4" />;
      case 'in-progress': return <RefreshCw className="h-4 w-4" />;
      case 'completed': return <CheckCircle className="h-4 w-4" />;
      case 'cancelled': return <XCircle className="h-4 w-4" />;
      default: return <AlertCircle className="h-4 w-4" />;
    }
  };

  const canUpdateStatus = (booking: Booking, newStatus: Booking['status']) => {
    if (userRole === 'provider') {
      return (booking.status === 'pending' && newStatus === 'accepted') ||
             (booking.status === 'accepted' && newStatus === 'in-progress') ||
             (booking.status === 'in-progress' && newStatus === 'completed');
    }
    if (userRole === 'admin') {
      return true;
    }
    return false;
  };

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (selectedBooking) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Button variant="outline" onClick={() => setSelectedBooking(null)}>
            ← Back to Bookings
          </Button>
          <h2 className="text-xl font-semibold">Job Details</h2>
        </div>
        <JobTracker 
          booking={selectedBooking}
          onStatusUpdate={(status) => handleStatusUpdate(selectedBooking.id, status)}
          onRatingSubmit={(rating, comment) => {
            // Handle rating submission
            toast({
              title: "Thank you!",
              description: "Your rating has been submitted.",
            });
          }}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">
          {userRole === 'client' ? 'My Bookings' : 
           userRole === 'provider' ? 'My Jobs' : 'All Bookings'}
        </h2>
        {userRole === 'client' && (
          <Button onClick={() => setShowCalendar(true)}>
            <Calendar className="h-4 w-4 mr-2" />
            New Booking
          </Button>
        )}
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search bookings..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="accepted">Accepted</SelectItem>
                <SelectItem value="in-progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Bookings List */}
      <div className="grid grid-cols-1 gap-4">
        {isLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-600 mt-2">Loading bookings...</p>
          </div>
        ) : filteredBookings.length === 0 ? (
          <Card>
            <CardContent className="pt-8 pb-8 text-center">
              <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No bookings found</h3>
              <p className="text-gray-600">
                {searchTerm || statusFilter !== 'all' 
                  ? 'Try adjusting your search or filter criteria'
                  : 'No bookings have been made yet'}
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredBookings.map((booking) => (
            <Card key={booking.id} className="hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <Badge className={getStatusColor(booking.status)}>
                        {getStatusIcon(booking.status)}
                        <span className="ml-1">{booking.status.replace('-', ' ')}</span>
                      </Badge>
                      <span className="text-sm text-gray-500">#{booking.id}</span>
                    </div>

                    <h3 className="font-semibold text-lg text-gray-900 mb-2">
                      {booking.serviceName}
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <span>{booking.date} at {booking.time}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        <span>
                          {userRole === 'provider' ? booking.clientName : booking.providerName}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-lg text-blue-600">
                          N${booking.amount}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 ml-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedBooking(booking)}
                    >
                      View Details
                    </Button>

                    {/* Provider Actions */}
                    {userRole === 'provider' && booking.status === 'pending' && (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleStatusUpdate(booking.id, 'accepted')}
                        >
                          Accept
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleCancelBooking(booking.id)}
                        >
                          Decline
                        </Button>
                      </div>
                    )}

                    {/* Client Actions */}
                    {userRole === 'client' && ['pending', 'accepted'].includes(booking.status) && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleCancelBooking(booking.id)}
                      >
                        Cancel
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* New Booking Calendar Modal would go here */}
      {showCalendar && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold">Book a Service</h3>
                <Button variant="outline" onClick={() => setShowCalendar(false)}>
                  ✕
                </Button>
              </div>
              <BookingCalendar
                serviceId={1}
                serviceName="House Cleaning"
                serviceDuration={120}
                onBookingConfirm={(booking) => {
                  console.log('New booking:', booking);
                  setShowCalendar(false);
                  toast({
                    title: "Booking Requested",
                    description: "Your booking request has been sent to the provider.",
                  });
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
