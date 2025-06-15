
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { ServiceDisplayWithEntitlements } from '@/components/ServiceDisplayWithEntitlements';
import { SupabaseBookingForm } from '@/components/booking/SupabaseBookingForm';
import { RealTimeBookingManager } from '@/components/booking/RealTimeBookingManager';

const OneOffBooking = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null);
  const [showBookingForm, setShowBookingForm] = useState(false);

  const handleServiceSelection = (serviceId: string) => {
    setSelectedServiceId(serviceId);
    setShowBookingForm(true);
  };

  const handleBookingCreated = () => {
    setShowBookingForm(false);
    setSelectedServiceId(null);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Please Sign In</h1>
          <p className="text-gray-600 mb-6">You need to be logged in to book services</p>
          <Button onClick={() => navigate('/auth')}>
            Sign In
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(-1)}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Book One-Off Services</h1>
            <p className="text-gray-600 mt-2">Choose from our available one-time services</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Service Selection or Booking Form */}
          <div>
            {showBookingForm && selectedServiceId ? (
              <SupabaseBookingForm
                serviceId={selectedServiceId}
                onBookingCreated={handleBookingCreated}
              />
            ) : (
              <ServiceDisplayWithEntitlements
                onBookService={handleServiceSelection}
                showBookingButton={true}
              />
            )}
          </div>

          {/* Right Column - Booking Management */}
          <div>
            <RealTimeBookingManager />
          </div>
        </div>
      </div>
    </div>
  );
};

export default OneOffBooking;
