
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Star, MapPin, MessageCircle, Calendar, Briefcase } from 'lucide-react';

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
                <Star className="h-4 w-4 fill-current text-yellow-400" />
                <span className="font-medium">{rating.toFixed(1)}</span>
              </div>
              
              <div className="flex items-center gap-1">
                <Briefcase className="h-4 w-4" />
                <span>{total_jobs} jobs</span>
              </div>
            </div>
            
            <div className="flex gap-2">
              <Badge variant={isAvailable ? "default" : "secondary"}>
                {isAvailable ? "Available" : "Busy"}
              </Badge>
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {bio && (
          <p className="text-sm text-gray-600 leading-relaxed">{bio}</p>
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
