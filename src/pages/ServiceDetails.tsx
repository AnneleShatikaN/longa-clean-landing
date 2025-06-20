
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Clock, DollarSign, Loader2, MapPin, Users } from 'lucide-react';
import { useServicesEnhanced } from '@/hooks/useServicesEnhanced';
import { useAuth } from '@/contexts/AuthContext';

const ServiceDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { getServiceById, isLoading } = useServicesEnhanced();

  const service = id ? getServiceById(id) : null;

  const handleBookNow = () => {
    if (!user) {
      navigate('/auth');
      return;
    }
    
    if (!service) {
      console.error('No service data available for booking');
      return;
    }

    // Navigate to booking page with service ID
    navigate(`/one-off-booking?service_id=${service.id}`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Loading service details...</p>
        </div>
      </div>
    );
  }

  if (!service) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Service Not Found</h1>
            <p className="text-gray-600 mb-6">
              The requested service could not be found or may no longer be available.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button onClick={() => navigate('/services')} variant="default">
                Browse All Services
              </Button>
              <Button onClick={() => navigate(-1)} variant="outline">
                Go Back
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
    }
    return `${mins}m`;
  };

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
          <h1 className="text-3xl font-bold text-gray-900">Service Details</h1>
        </div>

        <div className="max-w-4xl mx-auto">
          <Card className="shadow-lg">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-2xl mb-2">{service.name}</CardTitle>
                  <div className="flex gap-2 mb-4">
                    <Badge variant={service.service_type === 'one-off' ? 'default' : 'secondary'}>
                      {service.service_type === 'one-off' ? 'One-time Service' : 'Subscription Service'}
                    </Badge>
                    <Badge variant="outline" className="text-green-700 border-green-300">
                      Available
                    </Badge>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1 text-2xl font-bold text-blue-600">
                    <DollarSign className="h-6 w-6" />
                    <span>N${service.client_price}</span>
                  </div>
                  {service.service_type === 'subscription' && (
                    <p className="text-sm text-gray-500">per service</p>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="font-semibold mb-2 text-lg">Description</h3>
                <p className="text-gray-600 leading-relaxed">
                  {service.description || 'Professional service tailored to your needs with high-quality standards and reliable execution.'}
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                  <Clock className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="text-sm text-gray-600">Duration</p>
                    <p className="font-semibold">{formatDuration(service.duration_minutes)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                  <DollarSign className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="text-sm text-gray-600">Price</p>
                    <p className="font-semibold">N${service.client_price}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                  <Users className="h-5 w-5 text-purple-600" />
                  <div>
                    <p className="text-sm text-gray-600">Type</p>
                    <p className="font-semibold capitalize">{service.service_type}</p>
                  </div>
                </div>
              </div>

              {service.tags && service.tags.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-3 text-lg">Service Features</h3>
                  <div className="flex flex-wrap gap-2">
                    {service.tags.map((tag, index) => (
                      <Badge key={index} variant="outline" className="text-sm py-1">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {service.coverage_areas && service.coverage_areas.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-3 text-lg">Available Locations</h3>
                  <div className="flex flex-wrap gap-2">
                    {service.coverage_areas.map((area, index) => (
                      <Badge key={index} variant="outline" className="capitalize text-sm py-1">
                        <MapPin className="h-3 w-3 mr-1" />
                        {area.replace('_', ' ')}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Button 
                  onClick={handleBookNow}
                  size="lg" 
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                >
                  {user ? 'Book This Service' : 'Sign In to Book'}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => navigate('/services')}
                  size="lg"
                  className="flex-1"
                >
                  Browse More Services
                </Button>
              </div>

              {!user && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
                  <p className="text-blue-800">
                    <strong>Ready to book?</strong> Sign in to your account to schedule this service or create a new account to get started.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ServiceDetails;
