
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Star, MapPin, MessageCircle, Calendar, Briefcase } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface ProviderProfileProps {
  id: string;
  full_name: string;
  current_work_location?: string;
  bio?: string;
  avatar_url?: string;
  rating: number;
  total_jobs: number;
  phone?: string;
  isAvailable?: boolean;
  onSelectProvider: (providerId: string) => void;
  onMessageProvider: (phone: string) => void;
  onCheckAvailability: (providerId: string) => void;
  isSelected?: boolean;
}

interface ProviderReview {
  id: string;
  rating: number;
  review: string;
  booking_date: string;
  client_name: string;
  service_name: string;
}

export const ProviderProfile: React.FC<ProviderProfileProps> = ({
  id,
  full_name,
  current_work_location,
  bio,
  avatar_url,
  rating,
  total_jobs,
  phone,
  isAvailable = true,
  onSelectProvider,
  onMessageProvider,
  onCheckAvailability,
  isSelected = false
}) => {
  const [realRating, setRealRating] = useState(rating);
  const [realTotalJobs, setRealTotalJobs] = useState(total_jobs);
  const [recentReviews, setRecentReviews] = useState<ProviderReview[]>([]);
  const [isLoadingReviews, setIsLoadingReviews] = useState(false);

  useEffect(() => {
    const fetchRealProviderData = async () => {
      setIsLoadingReviews(true);
      try {
        // Get real completed bookings with ratings and reviews
        const { data: bookingData, error } = await supabase
          .from('bookings')
          .select(`
            id,
            rating,
            review,
            booking_date,
            status,
            services!inner(name),
            users!bookings_client_id_fkey(full_name)
          `)
          .eq('provider_id', id)
          .eq('status', 'completed')
          .not('rating', 'is', null)
          .order('booking_date', { ascending: false })
          .limit(5);

        if (error) {
          console.error('Error fetching provider reviews:', error);
          return;
        }

        if (bookingData) {
          // Calculate real rating and job count
          const completedJobs = bookingData.length;
          const avgRating = completedJobs > 0 
            ? bookingData.reduce((sum, booking) => sum + (booking.rating || 0), 0) / completedJobs
            : 0;

          setRealRating(Math.round(avgRating * 10) / 10);
          setRealTotalJobs(completedJobs);

          // Format reviews
          const reviews: ProviderReview[] = bookingData
            .filter(booking => booking.review && booking.review.trim().length > 0)
            .map(booking => ({
              id: booking.id,
              rating: booking.rating || 0,
              review: booking.review || '',
              booking_date: new Date(booking.booking_date).toLocaleDateString(),
              client_name: booking.users?.full_name || 'Anonymous',
              service_name: booking.services?.name || 'Service'
            }));

          setRecentReviews(reviews);
        }
      } catch (error) {
        console.error('Error fetching real provider data:', error);
      } finally {
        setIsLoadingReviews(false);
      }
    };

    fetchRealProviderData();
  }, [id]);

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const handleWhatsAppMessage = () => {
    if (phone) {
      const formattedPhone = phone.replace(/\s+/g, '').replace('+', '');
      const message = encodeURIComponent(`Hello ${full_name}, I'm interested in booking your services through Longa.`);
      window.open(`https://wa.me/${formattedPhone}?text=${message}`, '_blank');
    }
  };

  const renderStars = (rating: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Star
          key={i}
          className={`h-4 w-4 ${
            i <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
          }`}
        />
      );
    }
    return stars;
  };

  return (
    <Card className={`relative transition-all duration-200 ${isSelected ? 'ring-2 ring-blue-500 border-blue-500' : 'hover:shadow-lg'}`}>
      {isSelected && (
        <div className="absolute -top-2 -right-2 bg-blue-500 text-white rounded-full p-1">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        </div>
      )}
      
      <CardHeader className="pb-4">
        <div className="flex items-start gap-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src={avatar_url} alt={full_name} />
            <AvatarFallback className="text-lg font-semibold">
              {getInitials(full_name)}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1">
            <CardTitle className="text-lg mb-1">{full_name}</CardTitle>
            
            <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
              {current_work_location && (
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  <span className="capitalize">{current_work_location}</span>
                </div>
              )}
              
              <div className="flex items-center gap-1">
                {realRating > 0 ? (
                  <>
                    <div className="flex items-center">
                      {renderStars(Math.round(realRating))}
                    </div>
                    <span className="font-medium">{realRating.toFixed(1)}</span>
                  </>
                ) : (
                  <span className="text-gray-400">No ratings yet</span>
                )}
              </div>
              
              <div className="flex items-center gap-1">
                <Briefcase className="h-4 w-4" />
                <span>{realTotalJobs} jobs</span>
              </div>
            </div>
            
            <div className="flex gap-2">
              <Badge variant={isAvailable ? "default" : "secondary"}>
                {isAvailable ? "Available" : "Busy"}
              </Badge>
              {realRating >= 4.5 && realTotalJobs >= 10 && (
                <Badge variant="outline" className="text-green-600 border-green-200">
                  Top Rated
                </Badge>
              )}
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {bio && (
          <p className="text-sm text-gray-600 leading-relaxed">{bio}</p>
        )}

        {/* Recent Reviews Section */}
        {recentReviews.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-900">Recent Reviews</h4>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {recentReviews.slice(0, 2).map((review) => (
                <div key={review.id} className="bg-gray-50 p-2 rounded text-xs">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="flex">
                      {renderStars(review.rating)}
                    </div>
                    <span className="font-medium">{review.client_name}</span>
                    <span className="text-gray-500">• {review.service_name}</span>
                  </div>
                  <p className="text-gray-700 line-clamp-2">"{review.review}"</p>
                </div>
              ))}
            </div>
          </div>
        )}
        
        <div className="flex gap-2">
          <Button
            onClick={() => onSelectProvider(id)}
            disabled={!isAvailable}
            className="flex-1"
            variant={isSelected ? "default" : "outline"}
          >
            {isSelected ? "Selected" : "Select Provider"}
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => onCheckAvailability(id)}
            className="flex items-center gap-1"
          >
            <Calendar className="h-4 w-4" />
            Availability
          </Button>
          
          {phone && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleWhatsAppMessage}
              className="flex items-center gap-1 text-green-600 hover:text-green-700"
            >
              <MessageCircle className="h-4 w-4" />
              WhatsApp
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
