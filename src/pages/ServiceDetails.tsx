
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Clock, DollarSign, Loader2 } from 'lucide-react';
import { useServicesEnhanced } from '@/hooks/useServicesEnhanced';

const ServiceDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getServiceById, isLoading } = useServicesEnhanced();

  const service = id ? getServiceById(id) : null;

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
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Service Not Found</h1>
          <p className="text-gray-600 mb-6">The requested service could not be found.</p>
          <Button onClick={() => navigate('/services')}>
            Browse All Services
          </Button>
        </div>
      </div>
    );
  }

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
          <Card>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-2xl mb-2">{service.name}</CardTitle>
                  <div className="flex gap-2 mb-4">
                    <Badge variant={service.service_type === 'one-off' ? 'default' : 'secondary'}>
                      {service.service_type === 'one-off' ? 'One-time Service' : 'Subscription Package'}
                    </Badge>
                    <Badge variant="outline">Available</Badge>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1 text-lg font-semibold">
                    <DollarSign className="h-5 w-5" />
                    <span>N${service.client_price}</span>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="font-semibold mb-2">Description</h3>
                <p className="text-gray-600">
                  {service.description || 'Professional service tailored to your needs.'}
                </p>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span className="text-sm">Duration: {Math.floor(service.duration_minutes / 60)} hours {service.duration_minutes % 60} minutes</span>
                </div>
              </div>

              {service.tags && service.tags.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-2">Service Features</h3>
                  <div className="flex flex-wrap gap-2">
                    {service.tags.map((tag, index) => (
                      <Badge key={index} variant="outline">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {service.coverage_areas && service.coverage_areas.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-2">Available Locations</h3>
                  <div className="flex flex-wrap gap-2">
                    {service.coverage_areas.map((area, index) => (
                      <Badge key={index} variant="outline" className="capitalize">
                        {area.replace('_', ' ')}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="flex gap-4">
                <Button onClick={() => navigate(`/one-off-booking?service_id=${service.id}`)}>
                  Book This Service
                </Button>
                <Button variant="outline" onClick={() => navigate('/services')}>
                  Browse More Services
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ServiceDetails;
