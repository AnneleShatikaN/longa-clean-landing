
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { BookingEditModal } from './BookingEditModal';
import { BookingReassignmentModal } from './BookingReassignmentModal';
import { BookingStatusManager } from './BookingStatusManager';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  User, 
  DollarSign,
  Edit3,
  Users,
  MoreVertical,
  Phone,
  Mail
} from 'lucide-react';
import { format } from 'date-fns';

interface EnhancedBookingManagerProps {
  booking: any;
  onBookingUpdated: () => void;
}

export const EnhancedBookingManager: React.FC<EnhancedBookingManagerProps> = ({
  booking,
  onBookingUpdated
}) => {
  const { toast } = useToast();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isReassignModalOpen, setIsReassignModalOpen] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

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

  const getPriorityBadge = () => {
    if (booking.emergency_booking) {
      return <Badge variant="destructive" className="text-xs">Emergency</Badge>;
    }
    return null;
  };

  return (
    <>
      <Card className="w-full">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div className="space-y-2">
              <CardTitle className="flex items-center gap-2">
                {booking.service?.name}
                {getPriorityBadge()}
              </CardTitle>
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <Badge className={getStatusColor(booking.status)}>
                  {booking.status.replace('_', ' ').toUpperCase()}
                </Badge>
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {format(new Date(booking.booking_date), 'MMM dd, yyyy')}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {booking.booking_time}
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {booking.location_town}
                </span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-green-600">
                N${booking.total_amount}
              </div>
              <div className="text-sm text-gray-500">
                ID: {booking.id.slice(0, 8)}
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Client Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-medium flex items-center gap-2">
                <User className="h-4 w-4" />
                Client Information
              </h4>
              <div className="text-sm space-y-1 pl-6">
                <p><strong>Name:</strong> {booking.client?.full_name}</p>
                {booking.client?.phone && (
                  <p className="flex items-center gap-1">
                    <Phone className="h-3 w-3" />
                    {booking.client.phone}
                  </p>
                )}
                {booking.client?.email && (
                  <p className="flex items-center gap-1">
                    <Mail className="h-3 w-3" />
                    {booking.client.email}
                  </p>
                )}
              </div>
            </div>

            {/* Provider Information */}
            <div className="space-y-2">
              <h4 className="font-medium flex items-center gap-2">
                <Users className="h-4 w-4" />
                Provider Assignment
              </h4>
              <div className="text-sm space-y-1 pl-6">
                {booking.provider ? (
                  <>
                    <p><strong>Name:</strong> {booking.provider.full_name}</p>
                    <p><strong>Rating:</strong> ⭐ {booking.provider.rating?.toFixed(1) || 'N/A'}</p>
                    {booking.provider.phone && (
                      <p className="flex items-center gap-1">
                        <Phone className="h-3 w-3" />
                        {booking.provider.phone}
                      </p>
                    )}
                  </>
                ) : (
                  <p className="text-orange-600">Unassigned</p>
                )}
              </div>
            </div>
          </div>

          {/* Special Instructions */}
          {booking.special_instructions && (
            <div className="space-y-2">
              <h4 className="font-medium">Special Instructions</h4>
              <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                {booking.special_instructions}
              </p>
            </div>
          )}

          {/* Booking Details */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <strong>Duration:</strong> {booking.duration_minutes} minutes
            </div>
            <div>
              <strong>Created:</strong> {format(new Date(booking.created_at), 'MMM dd, HH:mm')}
            </div>
            {booking.provider_payout && (
              <div>
                <strong>Provider Payout:</strong> N${booking.provider_payout}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2 pt-4 border-t">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditModalOpen(true)}
              className="flex items-center gap-2"
            >
              <Edit3 className="h-4 w-4" />
              Edit Booking
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsReassignModalOpen(true)}
              className="flex items-center gap-2"
            >
              <Users className="h-4 w-4" />
              Reassign Provider
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowDetails(!showDetails)}
              className="flex items-center gap-2"
            >
              <MoreVertical className="h-4 w-4" />
              {showDetails ? 'Hide' : 'Show'} Actions
            </Button>
          </div>

          {/* Expanded Actions */}
          {showDetails && (
            <div className="pt-4 border-t">
              <BookingStatusManager 
                booking={booking} 
                onStatusUpdated={onBookingUpdated}
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modals */}
      <BookingEditModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        booking={booking}
        onBookingUpdated={onBookingUpdated}
      />

      <BookingReassignmentModal
        isOpen={isReassignModalOpen}
        onClose={() => setIsReassignModalOpen(false)}
        booking={booking}
        onReassignmentComplete={onBookingUpdated}
      />
    </>
  );
};
