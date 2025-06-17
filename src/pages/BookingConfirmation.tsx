
import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Clock, Calendar, User, MapPin, DollarSign, ArrowLeft, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useSupabaseBookings } from '@/contexts/SupabaseBookingContext';
import { useAuth } from '@/contexts/AuthContext';
import { useBankingSettings } from '@/hooks/useBankingSettings';

const BookingConfirmation = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { bookings } = useSupabaseBookings();
  const { bankingDetails, paymentInstructions, isLoading: bankingLoading } = useBankingSettings();
  const [searchParams] = useSearchParams();
  const bookingId = searchParams.get('booking_id');
  const [booking, setBooking] = useState<any>(null);

  useEffect(() => {
    if (bookingId && bookings.length > 0) {
      const foundBooking = bookings.find(b => b.id === bookingId);
      if (foundBooking) {
        setBooking(foundBooking);
      }
    }
  }, [bookingId, bookings]);

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Please Sign In</h1>
          <p className="text-gray-600 mb-6">You need to be logged in to view booking confirmations</p>
          <Button onClick={() => navigate('/auth')}>
            Sign In
          </Button>
        </div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Booking Not Found</h1>
          <p className="text-gray-600 mb-6">The booking confirmation could not be found.</p>
          <Button onClick={() => navigate('/client-dashboard')}>
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/client-dashboard')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Button>
        </div>

        {/* Status Message */}
        <Card className="mb-6" style={{ 
          borderRadius: '8px', 
          padding: '20px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)' 
        }}>
          <CardContent className="text-center p-6">
            <AlertCircle className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Booking Submitted Successfully!
            </h1>
            <p className="text-gray-600 text-lg mb-4">
              Your booking is pending payment confirmation
            </p>
            <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
              <p className="text-sm text-yellow-800">
                <strong>Next Step:</strong> Complete payment using the instructions below. 
                Once payment is verified by our admin team, your booking will be confirmed and a provider will be assigned.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Booking Summary */}
        <Card style={{ 
          borderRadius: '8px', 
          padding: '20px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)' 
        }}>
          <CardHeader>
            <CardTitle className="text-xl">Booking Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <Calendar className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium">Service Date</p>
                  <p className="text-gray-600">{booking.booking_date}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <Clock className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium">Time</p>
                  <p className="text-gray-600">{booking.booking_time}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <User className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium">Service</p>
                  <p className="text-gray-600">{booking.service?.name || 'Service Details'}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <MapPin className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium">Location</p>
                  <p className="text-gray-600">{booking.location_town || 'Windhoek'}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <DollarSign className="h-4 w-4 text-green-600" />
                </div>
                <div>
                  <p className="font-medium">Total Amount</p>
                  <p className="text-2xl font-bold text-green-600">N${booking.total_amount}</p>
                </div>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Provider Assignment:</strong> A provider will be assigned automatically after payment confirmation based on your location and time.
                </p>
              </div>
            </div>

            {/* Dynamic Payment Instructions */}
            <div className="border-t pt-4 mt-6">
              <h3 className="font-medium text-lg mb-3">Payment Instructions</h3>
              
              {bankingLoading ? (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">Loading payment instructions...</p>
                </div>
              ) : (
                <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                  <p className="text-sm text-yellow-800 mb-2">
                    <strong>Bank Transfer Details:</strong>
                  </p>
                  {bankingDetails ? (
                    <div className="space-y-1 text-sm">
                      <p><strong>Business Name:</strong> {bankingDetails.businessName}</p>
                      <p><strong>Bank:</strong> {bankingDetails.bankName}</p>
                      <p><strong>Account Number:</strong> {bankingDetails.accountNumber}</p>
                      <p><strong>Branch Code:</strong> {bankingDetails.branchCode}</p>
                      <p><strong>Account Type:</strong> {bankingDetails.accountType}</p>
                      <p><strong>Reference:</strong> {booking.id.slice(0, 8)}</p>
                      <p><strong>Amount:</strong> N${booking.total_amount}</p>
                    </div>
                  ) : (
                    <div className="space-y-1 text-sm">
                      <p><strong>Bank:</strong> Standard Bank Namibia</p>
                      <p><strong>Account Name:</strong> Longa Services</p>
                      <p><strong>Account Number:</strong> 123456789</p>
                      <p><strong>Reference:</strong> {booking.id.slice(0, 8)}</p>
                      <p><strong>Amount:</strong> N${booking.total_amount}</p>
                    </div>
                  )}
                  
                  {paymentInstructions?.whatsappNumber && (
                    <div className="mt-3 pt-3 border-t border-yellow-300">
                      <p className="text-sm text-yellow-800 mb-1">
                        <strong>After Payment:</strong> Send proof of payment to:
                      </p>
                      <p className="font-medium text-yellow-900">WhatsApp: {paymentInstructions.whatsappNumber}</p>
                    </div>
                  )}
                  
                  <p className="text-xs text-yellow-700 mt-3">
                    Please complete payment within 24 hours. Your booking will be confirmed once payment is verified by our admin team.
                  </p>
                </div>
              )}
            </div>

            {/* Action Button */}
            <div className="flex flex-col gap-3 pt-4">
              <Button 
                onClick={() => navigate('/client-dashboard')}
                className="w-full bg-blue-100 text-blue-900 hover:bg-blue-200"
                style={{ 
                  fontSize: '16px', 
                  padding: '10px'
                }}
              >
                Back to Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default BookingConfirmation;
