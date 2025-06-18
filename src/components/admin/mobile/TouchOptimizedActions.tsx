
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  User,
  MapPin,
  Star,
  Phone,
  MessageSquare
} from 'lucide-react';
import { useMobileUtils } from '@/hooks/useMobileUtils';

interface TouchOptimizedActionsProps {
  onAction: (action: string, id?: string) => void;
}

export const TouchOptimizedActions: React.FC<TouchOptimizedActionsProps> = ({ onAction }) => {
  const { vibrate, handleTouchFeedback } = useMobileUtils();
  const [processingAction, setProcessingAction] = useState<string | null>(null);

  const mockPendingProviders = [
    {
      id: '1',
      name: 'John Doe',
      service: 'Plumbing',
      location: 'Windhoek',
      rating: 4.8,
      experience: '5 years'
    },
    {
      id: '2', 
      name: 'Sarah Smith',
      service: 'Cleaning',
      location: 'Swakopmund',
      rating: 4.9,
      experience: '3 years'
    }
  ];

  const handleSwipeAction = async (action: string, providerId: string) => {
    setProcessingAction(`${action}-${providerId}`);
    handleTouchFeedback();
    vibrate(100);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    onAction(action, providerId);
    setProcessingAction(null);
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Pending Provider Approvals
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {mockPendingProviders.map((provider) => (
            <Card key={provider.id} className="border border-gray-200">
              <CardContent className="p-4">
                <div className="space-y-3">
                  {/* Provider Info */}
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium">{provider.name}</h4>
                      <p className="text-sm text-gray-600">{provider.service}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <MapPin className="h-3 w-3 text-gray-400" />
                        <span className="text-xs text-gray-500">{provider.location}</span>
                        <Star className="h-3 w-3 text-yellow-400" />
                        <span className="text-xs text-gray-500">{provider.rating}</span>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {provider.experience}
                    </Badge>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 h-12 touch-manipulation"
                      onClick={() => onAction('view-provider', provider.id)}
                    >
                      <User className="h-4 w-4 mr-2" />
                      View Profile
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 h-12 touch-manipulation"
                      onClick={() => onAction('contact-provider', provider.id)}
                    >
                      <Phone className="h-4 w-4 mr-2" />
                      Contact
                    </Button>
                  </div>

                  {/* Approve/Reject Buttons */}
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="destructive"
                      className="flex-1 h-12 touch-manipulation"
                      onClick={() => handleSwipeAction('reject-provider', provider.id)}
                      disabled={processingAction === `reject-provider-${provider.id}`}
                    >
                      {processingAction === `reject-provider-${provider.id}` ? (
                        <Clock className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <XCircle className="h-4 w-4 mr-2" />
                      )}
                      Reject
                    </Button>
                    <Button
                      size="sm"
                      className="flex-1 h-12 touch-manipulation bg-green-600 hover:bg-green-700"
                      onClick={() => handleSwipeAction('approve-provider', provider.id)}
                      disabled={processingAction === `approve-provider-${provider.id}`}
                    >
                      {processingAction === `approve-provider-${provider.id}` ? (
                        <Clock className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <CheckCircle className="h-4 w-4 mr-2" />
                      )}
                      Approve
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};
