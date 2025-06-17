
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

const BookingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
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
          <h1 className="text-3xl font-bold text-gray-900">Book a Service</h1>
        </div>

        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Choose Your Booking Type</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4">
                <Button 
                  onClick={() => navigate('/one-off-booking')}
                  className="h-20 text-left flex-col items-start justify-center"
                >
                  <div className="font-semibold">One-Off Booking</div>
                  <div className="text-sm opacity-90">Book individual services as needed</div>
                </Button>
                
                <Button 
                  onClick={() => navigate('/subscription-packages')}
                  variant="outline"
                  className="h-20 text-left flex-col items-start justify-center"
                >
                  <div className="font-semibold">Subscription Package</div>
                  <div className="text-sm opacity-70">Get better rates with monthly packages</div>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default BookingPage;
