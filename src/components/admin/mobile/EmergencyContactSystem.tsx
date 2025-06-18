
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  Phone, 
  MessageSquare, 
  AlertTriangle, 
  Users,
  Clock,
  Send,
  PhoneCall
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useMobileUtils } from '@/hooks/useMobileUtils';

export const EmergencyContactSystem: React.FC = () => {
  const [emergencyMessage, setEmergencyMessage] = useState('');
  const [selectedUrgency, setSelectedUrgency] = useState('high');
  const { toast } = useToast();
  const { vibrate, speakNotification } = useMobileUtils();

  const urgencyLevels = [
    { value: 'low', label: 'Low', color: 'bg-blue-100 text-blue-800' },
    { value: 'medium', label: 'Medium', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'high', label: 'High', color: 'bg-orange-100 text-orange-800' },
    { value: 'critical', label: 'Critical', color: 'bg-red-100 text-red-800' }
  ];

  const emergencyContacts = [
    { name: 'Operations Manager', phone: '+264 81 123 4567', role: 'Primary' },
    { name: 'Technical Support', phone: '+264 81 765 4321', role: 'Secondary' },
    { name: 'CEO Office', phone: '+264 81 999 8888', role: 'Escalation' }
  ];

  const handleEmergencyCall = (contact: any) => {
    vibrate([100, 50, 100]);
    speakNotification(`Calling ${contact.name}`);
    
    // In a real app, this would initiate a phone call
    toast({
      title: "Emergency Call Initiated",
      description: `Calling ${contact.name} at ${contact.phone}`,
    });
  };

  const handleSendEmergencyMessage = () => {
    if (!emergencyMessage.trim()) {
      toast({
        title: "Message Required",
        description: "Please enter an emergency message",
        variant: "destructive"
      });
      return;
    }

    vibrate(200);
    
    toast({
      title: "Emergency Alert Sent",
      description: `${selectedUrgency.toUpperCase()} priority message sent to all contacts`,
    });

    setEmergencyMessage('');
  };

  return (
    <div className="space-y-4">
      {/* Emergency Alert Composer */}
      <Card className="border-red-200">
        <CardHeader className="bg-red-50">
          <CardTitle className="flex items-center gap-2 text-red-900">
            <AlertTriangle className="h-5 w-5" />
            Emergency Alert System
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 space-y-4">
          {/* Urgency Selection */}
          <div>
            <label className="text-sm font-medium mb-2 block">Urgency Level</label>
            <div className="flex gap-2 flex-wrap">
              {urgencyLevels.map((level) => (
                <Button
                  key={level.value}
                  variant={selectedUrgency === level.value ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedUrgency(level.value)}
                  className="touch-manipulation"
                >
                  {level.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Message Input */}
          <div>
            <label className="text-sm font-medium mb-2 block">Emergency Message</label>
            <Textarea
              placeholder="Describe the emergency situation..."
              value={emergencyMessage}
              onChange={(e) => setEmergencyMessage(e.target.value)}
              className="min-h-[100px] text-base"
            />
          </div>

          {/* Send Button */}
          <Button
            onClick={handleSendEmergencyMessage}
            className="w-full h-12 touch-manipulation bg-red-600 hover:bg-red-700"
            disabled={!emergencyMessage.trim()}
          >
            <Send className="h-4 w-4 mr-2" />
            Send Emergency Alert
          </Button>
        </CardContent>
      </Card>

      {/* Quick Call Contacts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Phone className="h-5 w-5" />
            Emergency Contacts
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {emergencyContacts.map((contact, index) => (
            <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <p className="font-medium">{contact.name}</p>
                <p className="text-sm text-gray-600">{contact.phone}</p>
                <Badge variant="outline" className="text-xs mt-1">
                  {contact.role}
                </Badge>
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="touch-manipulation"
                  onClick={() => {
                    toast({
                      title: "Message Sent",
                      description: `SMS sent to ${contact.name}`,
                    });
                  }}
                >
                  <MessageSquare className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  className="touch-manipulation bg-green-600 hover:bg-green-700"
                  onClick={() => handleEmergencyCall(contact)}
                >
                  <PhoneCall className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Recent Emergency Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6 text-gray-500">
            <Users className="h-8 w-8 mx-auto mb-2 text-gray-300" />
            <p>No recent emergency activity</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
