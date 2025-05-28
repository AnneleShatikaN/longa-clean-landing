
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Clock, CheckCircle } from 'lucide-react';

interface AvailabilityToggleProps {
  isAvailable: boolean;
  onToggle: (available: boolean) => void;
}

const AvailabilityToggle: React.FC<AvailabilityToggleProps> = ({
  isAvailable,
  onToggle,
}) => {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center">
          {isAvailable ? <CheckCircle className="h-5 w-5 mr-2 text-green-600" /> : <Clock className="h-5 w-5 mr-2 text-gray-500" />}
          Availability Status
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-gray-900">
              {isAvailable ? 'Available for Jobs' : 'Not Available'}
            </p>
            <p className="text-sm text-gray-600">
              {isAvailable ? 'You will receive new job requests' : 'No new jobs will be sent to you'}
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant={isAvailable ? "default" : "secondary"} className={isAvailable ? "bg-green-100 text-green-800" : ""}>
              {isAvailable ? 'Online' : 'Offline'}
            </Badge>
            <Switch
              checked={isAvailable}
              onCheckedChange={onToggle}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AvailabilityToggle;
