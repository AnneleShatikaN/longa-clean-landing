
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Star, MapPin, Calendar, Clock, ArrowLeft, MessageCircle } from 'lucide-react';
import { useProviderProfiles } from '@/hooks/useProviderProfiles';
import RatingSystem from '@/components/RatingSystem';
import { supabase } from '@/integrations/supabase/client';

const ProviderProfile = () => {
  const { providerId } = useParams<{ providerId: string }>();
  const navigate = useNavigate();
  const { getProviderById } = useProviderProfiles();
  const [provider, setProvider] = useState<any>(null);
  const [services, setServices] = useState<any[]>([]);
  const [ratings, setRatings] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProviderData = async () => {
      if (!providerId) return;

      try {
        setIsLoading(true);
        
        // Get provider details
        const providerData = await getProviderById(providerId);
        setProvider(providerData);

        // Get provider's completed bookings for ratings
        const { data: bookings } = await supabase
          .from('bookings')
          .select(`
            id,
            rating,
            review,
            booking_date,
            service:services(name),
            client:users!bookings_client_id_fkey(full_name)
          `)
          .eq('provider_id', providerId)
          .eq('status', 'completed')
          .not('rating', 'is', null)
          .order('created_at', { ascending: false });

        // Transform ratings data
        const ratingsData = (bookings || []).map((booking: any, index: number) => ({
          id: index + 1,
          jobId: booking.id,
          clientName: booking.client?.full_name || 'Anonymous',
          rating: booking.rating || 0,
          comment: booking.review || '',
          date: new Date(booking.booking_date).toLocaleDateString(),
          service: booking.service?.name || 'Service'
        }));

        setRatings(ratingsData);

        // Get services (for future use)
        const { data: servicesData } = await supabase
          .from('services')
          .select('*')
          .eq('is_active', true);

        setServices(servicesData || []);

      } catch (error) {
        console.error('Error fetching provider data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProviderData();
  }, [providerId]);

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const handleWhatsAppContact = () => {
    if (provider?.phone) {
      const formattedPhone = provider.phone.replace(/\s+/g, '').replace('+', '');
      const message = encodeURIComponent(`Hello ${provider.full_name}, I found your profile on Longa and would like to discuss your services.`);
      window.open(`https://wa.me/${formattedPhone}?text=${message}`, '_blank');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="container mx-auto max-w-4xl">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
            <div className="h-48 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!provider) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="text-center py-8">
            <h2 className="text-xl font-semibold mb-2">Provider Not Found</h2>
            <p className="text-gray-600 mb-4">The provider profile you're looking for doesn't exist.</p>
            <Button onClick={() => navigate('/')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        {/* Header */}
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </div>

        {/* Provider Profile Card */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex flex-col md:flex-row md:items-start gap-6">
              <Avatar className="h-24 w-24 mx-auto md:mx-0">
                <AvatarImage src={provider.avatar_url} alt={provider.full_name} />
                <AvatarFallback className="text-2xl font-semibold">
                  {getInitials(provider.full_name)}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 text-center md:text-left">
                <CardTitle className="text-2xl mb-2">{provider.full_name}</CardTitle>
                
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mb-4">
                  <div className="flex items-center gap-1">
                    <Star className="h-5 w-5 fill-current text-yellow-400" />
                    <span className="font-medium text-lg">
                      {provider.rating > 0 ? provider.rating.toFixed(1) : 'Not yet rated'}
                    </span>
                    <span className="text-gray-600">({provider.total_jobs} jobs)</span>
                  </div>
                  
                  {provider.current_work_location && (
                    <div className="flex items-center gap-1 text-gray-600">
                      <MapPin className="h-4 w-4" />
                      <span className="capitalize">{provider.current_work_location}</span>
                    </div>
                  )}
                  
                  <Badge variant={provider.is_active ? "default" : "secondary"}>
                    {provider.is_active ? "Available" : "Unavailable"}
                  </Badge>
                </div>

                {provider.bio && (
                  <p className="text-gray-700 mb-4">{provider.bio}</p>
                )}

                <div className="flex flex-wrap gap-2">
                  {provider.phone && (
                    <Button
                      onClick={handleWhatsAppContact}
                      className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
                    >
                      <MessageCircle className="h-4 w-4" />
                      Contact via WhatsApp
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Availability Card */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Availability
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium mb-2">Working Hours</h4>
                <div className="flex items-center gap-1 text-gray-600">
                  <Clock className="h-4 w-4" />
                  <span>Monday - Friday: 8:00 AM - 6:00 PM</span>
                </div>
                <div className="flex items-center gap-1 text-gray-600 mt-1">
                  <Clock className="h-4 w-4" />
                  <span>Saturday: 9:00 AM - 4:00 PM</span>
                </div>
                <div className="flex items-center gap-1 text-gray-600 mt-1">
                  <Clock className="h-4 w-4" />
                  <span>Sunday: Closed</span>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">Service Areas</h4>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline" className="capitalize">
                    {provider.current_work_location || 'Windhoek'}
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Service Categories */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Service Categories</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {services.length > 0 ? (
                services.slice(0, 6).map((service) => (
                  <Badge key={service.id} variant="outline">
                    {service.name}
                  </Badge>
                ))
              ) : (
                <p className="text-gray-600">All general services available</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Ratings and Reviews */}
        <RatingSystem ratings={ratings} />
      </div>
    </div>
  );
};

export default ProviderProfile;
