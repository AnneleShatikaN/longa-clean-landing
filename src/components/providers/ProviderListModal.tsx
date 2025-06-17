
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Star, MapPin, MessageCircle, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useProviderProfiles, ProviderProfile } from '@/hooks/useProviderProfiles';
import { useLocation } from '@/contexts/LocationContext';

interface ProviderListModalProps {
  isOpen: boolean;
  onClose: () => void;
  serviceId: string;
  serviceName: string;
  onSelectProvider?: (providerId: string) => void;
  showBookingButtons?: boolean;
}

export const ProviderListModal: React.FC<ProviderListModalProps> = ({
  isOpen,
  onClose,
  serviceId,
  serviceName,
  onSelectProvider,
  showBookingButtons = false
}) => {
  const navigate = useNavigate();
  const { providers, isLoading, fetchProviders } = useProviderProfiles();
  const { selectedLocation } = useLocation();

  React.useEffect(() => {
    if (isOpen && serviceId) {
      // Fetch providers filtered by location
      fetchProviders({
        location: selectedLocation,
        isActive: true
      });
    }
  }, [isOpen, serviceId, selectedLocation, fetchProviders]);

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const handleViewProfile = (providerId: string) => {
    navigate(`/provider-profile/${providerId}`);
  };

  const handleWhatsAppContact = (phone: string, name: string) => {
    if (phone) {
      const formattedPhone = phone.replace(/\s+/g, '').replace('+', '');
      const message = encodeURIComponent(`Hello ${name}, I'm interested in your ${serviceName} service.`);
      window.open(`https://wa.me/${formattedPhone}?text=${message}`, '_blank');
    }
  };

  const handleBookWithProvider = (providerId: string) => {
    if (onSelectProvider) {
      onSelectProvider(providerId);
      onClose();
    } else {
      navigate('/one-off-booking', { 
        state: { 
          serviceId, 
          providerId,
          serviceName 
        } 
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Providers for {serviceName}
            <Badge variant="secondary" className="ml-auto">
              {providers.length} available
            </Badge>
          </DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="flex items-start gap-4 p-4 border rounded-lg">
                  <div className="h-16 w-16 bg-gray-200 rounded-full"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : providers.length > 0 ? (
          <div className="space-y-4">
            {providers.map((provider: ProviderProfile) => (
              <div key={provider.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start gap-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={provider.avatar_url || ''} alt={provider.full_name} />
                    <AvatarFallback className="text-lg font-semibold">
                      {getInitials(provider.full_name)}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-semibold text-lg">{provider.full_name}</h3>
                        <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                          {provider.current_work_location && (
                            <div className="flex items-center gap-1">
                              <MapPin className="h-4 w-4" />
                              <span className="capitalize">{provider.current_work_location}</span>
                            </div>
                          )}
                          
                          <div className="flex items-center gap-1">
                            <Star className="h-4 w-4 fill-current text-yellow-400" />
                            <span className="font-medium">{provider.rating.toFixed(1)}</span>
                          </div>
                          
                          <span>{provider.total_jobs} jobs completed</span>
                        </div>
                      </div>
                      
                      <Badge variant="default">
                        Available
                      </Badge>
                    </div>
                    
                    <div className="flex gap-2 mt-3">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewProfile(provider.id)}
                        className="flex items-center gap-1"
                      >
                        <User className="h-4 w-4" />
                        View Profile
                      </Button>
                      
                      {provider.phone && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleWhatsAppContact(provider.phone!, provider.full_name)}
                          className="flex items-center gap-1 text-green-600 hover:text-green-700"
                        >
                          <MessageCircle className="h-4 w-4" />
                          WhatsApp
                        </Button>
                      )}
                      
                      {showBookingButtons && (
                        <Button
                          size="sm"
                          onClick={() => handleBookWithProvider(provider.id)}
                          className="flex items-center gap-1"
                        >
                          Book with {provider.full_name.split(' ')[0]}
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <User className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No providers available</h3>
            <p className="text-gray-600">
              No providers are currently available for this service in your selected location.
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
