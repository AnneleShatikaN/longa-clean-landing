
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { UserCheck, Trash2, Calendar, DollarSign } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface AdminOverviewProps {
  data: any;
  isLoading: boolean;
}

export const AdminOverview: React.FC<AdminOverviewProps> = ({ data, isLoading }) => {
  const { toast } = useToast();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDeleteBooking = async (bookingId: string, serviceName: string) => {
    setDeletingId(bookingId);
    
    try {
      const { error } = await supabase
        .from('bookings')
        .delete()
        .eq('id', bookingId);

      if (error) throw error;

      toast({
        title: "Booking Deleted",
        description: `${serviceName} booking has been deleted successfully.`,
      });

      // Trigger a refresh of the data
      window.location.reload();
    } catch (error) {
      console.error('Error deleting booking:', error);
      toast({
        title: "Delete Failed",
        description: "Failed to delete the booking. Please try again.",
        variant: "destructive",
      });
    } finally {
      setDeletingId(null);
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'completed': return 'default';
      case 'in_progress': return 'secondary';
      case 'cancelled': return 'destructive';
      case 'pending': return 'outline';
      default: return 'outline';
    }
  };

  const formatCurrency = (amount: number) => {
    return `N$${amount.toLocaleString()}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Bookings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center justify-between p-3 border rounded-lg animate-pulse">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                  <div>
                    <div className="w-32 h-4 bg-gray-200 rounded mb-1"></div>
                    <div className="w-24 h-3 bg-gray-200 rounded"></div>
                  </div>
                </div>
                <div className="w-16 h-6 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Bookings</CardTitle>
      </CardHeader>
      <CardContent>
        {data?.bookings?.length > 0 ? (
          <div className="space-y-4">
            {data.bookings.slice(0, 4).map((booking: any) => (
              <div key={booking.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-3">
                  <UserCheck className="h-8 w-8 bg-blue-100 p-2 rounded-full text-blue-600" />
                  <div>
                    <p className="font-medium">{booking.serviceName || 'Unknown Service'}</p>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <span>{booking.clientName || 'Unknown Client'}</span>
                      <span>•</span>
                      <Calendar className="h-3 w-3" />
                      <span>{formatDate(booking.booking_date)}</span>
                      {booking.total_amount && (
                        <>
                          <span>•</span>
                          <DollarSign className="h-3 w-3" />
                          <span>{formatCurrency(booking.total_amount)}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={getStatusBadgeVariant(booking.status)}>
                    {booking.status || 'pending'}
                  </Badge>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        disabled={deletingId === booking.id}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Booking</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete the booking for "{booking.serviceName || 'Unknown Service'}"? 
                          This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction 
                          onClick={() => handleDeleteBooking(booking.id, booking.serviceName || 'Unknown Service')}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <UserCheck className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No recent bookings</h3>
            <p className="text-gray-500">New bookings will appear here</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
