
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useServices } from '@/contexts/ServiceContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BookingFormWithLocation } from '@/components/booking/BookingFormWithLocation';
import { ArrowLeft, Clock, DollarSign, MapPin, Star } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const ServiceDetail = () => {
  const { serviceId } = useParams<{ serviceId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { services, getServiceById } = useServices();
  
  const service = serviceId ? getServiceById(serviceId) : null;

  if (!service) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-white flex items-center justify-center">
        <Card className="max-w-md mx-auto">
          <CardContent className="p-8 text-center">
            <h2 className="text-xl font-semibold mb-4">Service Not Found</h2>
            <p className="text-gray-600 mb-6">The requested service could not be found.</p>
            <Button onClick={() => navigate('/services')}>
              Back to Services
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-white">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/services')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Services
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Service Info */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">{service.name}</CardTitle>
                <div className="flex items-center gap-4">
                  <Badge variant={service.type === 'subscription' ? 'default' : 'secondary'}>
                    {service.type === 'subscription' ? 'Package' : 'One-time'}
                  </Badge>
                  <div className="flex items-center gap-1 text-lg font-semibold text-green-600">
                    <DollarSign className="h-5 w-5" />
                    N${service.clientPrice}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-600">{service.description}</p>
                
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span>{Math.floor(service.duration.hours * 60 + service.duration.minutes)} minutes</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    <span>Available in your area</span>
                  </div>
                </div>

                {service.tags && service.tags.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-medium">Includes:</h4>
                    <div className="flex flex-wrap gap-2">
                      {service.tags.map((tag, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Booking Form */}
          <div>
            {user ? (
              <BookingFormWithLocation
                serviceId={service.id}
                serviceName={service.name}
                servicePrice={service.clientPrice}
                onSuccess={() => {
                  navigate('/client-dashboard?tab=bookings');
                }}
              />
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <h3 className="text-xl font-semibold mb-4">Ready to Book?</h3>
                  <p className="text-gray-600 mb-6">
                    Sign in to book this service and manage your appointments
                  </p>
                  <Button 
                    onClick={() => navigate('/auth')}
                    className="w-full"
                    size="lg"
                  >
                    Sign In to Book
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServiceDetail;
