
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  Mail, 
  Phone, 
  MessageSquare, 
  Edit, 
  Save, 
  X, 
  Eye, 
  EyeOff,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { SupportContact } from '@/hooks/useSupportContacts';

interface EditableContactCardProps {
  contact: SupportContact;
  onUpdate: (
    contactType: string,
    contactValue: string,
    displayName?: string,
    description?: string,
    availabilityHours?: string
  ) => Promise<{ success: boolean; isVerified: boolean }>;
}

export const EditableContactCard: React.FC<EditableContactCardProps> = ({
  contact,
  onUpdate
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [showSensitive, setShowSensitive] = useState(false);
  const [formData, setFormData] = useState({
    contact_value: contact.contact_value,
    display_name: contact.display_name,
    description: contact.description || '',
    availability_hours: contact.availability_hours || ''
  });

  const getContactIcon = (type: string) => {
    switch (type) {
      case 'email':
        return <Mail className="h-6 w-6 text-blue-500" />;
      case 'phone':
        return <Phone className="h-6 w-6 text-green-500" />;
      case 'live_chat':
        return <MessageSquare className="h-6 w-6 text-purple-500" />;
      default:
        return <Mail className="h-6 w-6 text-gray-500" />;
    }
  };

  const validateContact = (value: string, type: string): boolean => {
    switch (type) {
      case 'email':
        return /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(value);
      case 'phone':
        return /^\+264\s\d{2}\s\d{3}\s\d{4}$/.test(value) || value === '+264 XX XXX XXXX';
      default:
        return value.trim().length > 0;
    }
  };

  const isValid = validateContact(formData.contact_value, contact.contact_type);
  const isSensitive = contact.contact_type === 'phone' || contact.contact_type === 'email';

  const handleSave = async () => {
    if (!isValid) return;

    setIsUpdating(true);
    try {
      const result = await onUpdate(
        contact.contact_type,
        formData.contact_value,
        formData.display_name,
        formData.description,
        formData.availability_hours
      );

      if (result.success) {
        setIsEditing(false);
      }
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      contact_value: contact.contact_value,
      display_name: contact.display_name,
      description: contact.description || '',
      availability_hours: contact.availability_hours || ''
    });
    setIsEditing(false);
  };

  const renderContactValue = () => {
    if (!isSensitive || showSensitive) {
      return formData.contact_value;
    }
    
    if (contact.contact_type === 'email') {
      const [local, domain] = formData.contact_value.split('@');
      return `${local.substring(0, 2)}***@${domain}`;
    }
    
    if (contact.contact_type === 'phone') {
      return formData.contact_value.replace(/\d(?=\d{4})/g, '*');
    }
    
    return formData.contact_value;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {getContactIcon(contact.contact_type)}
            <div>
              {isEditing ? (
                <Input
                  value={formData.display_name}
                  onChange={(e) => setFormData({ ...formData, display_name: e.target.value })}
                  className="text-lg font-semibold"
                />
              ) : (
                <span>{contact.display_name}</span>
              )}
              <div className="flex items-center space-x-2 mt-1">
                <Badge variant={contact.is_verified ? 'default' : 'destructive'}>
                  {contact.is_verified ? (
                    <CheckCircle className="h-3 w-3 mr-1" />
                  ) : (
                    <AlertCircle className="h-3 w-3 mr-1" />
                  )}
                  {contact.is_verified ? 'Verified' : 'Invalid'}
                </Badge>
                {!isValid && isEditing && (
                  <Badge variant="destructive">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    Invalid Format
                  </Badge>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {isSensitive && !isEditing && (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setShowSensitive(!showSensitive)}
              >
                {showSensitive ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            )}
            {isEditing ? (
              <div className="flex space-x-2">
                <Button
                  size="sm"
                  onClick={handleSave}
                  disabled={!isValid || isUpdating}
                >
                  <Save className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleCancel}
                  disabled={isUpdating}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setIsEditing(true)}
              >
                <Edit className="h-4 w-4" />
              </Button>
            )}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="text-sm font-medium">Contact Value</label>
          {isEditing ? (
            <Input
              value={formData.contact_value}
              onChange={(e) => setFormData({ ...formData, contact_value: e.target.value })}
              placeholder={contact.contact_type === 'email' ? 'support@example.com' : '+264 XX XXX XXXX'}
              className={!isValid ? 'border-red-500' : ''}
            />
          ) : (
            <p className="text-sm text-gray-600">{renderContactValue()}</p>
          )}
        </div>
        
        <div>
          <label className="text-sm font-medium">Description</label>
          {isEditing ? (
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={2}
            />
          ) : (
            <p className="text-sm text-gray-600">{contact.description}</p>
          )}
        </div>
        
        <div>
          <label className="text-sm font-medium">Availability Hours</label>
          {isEditing ? (
            <Input
              value={formData.availability_hours}
              onChange={(e) => setFormData({ ...formData, availability_hours: e.target.value })}
              placeholder="e.g., Mon-Fri 8AM-6PM WAT"
            />
          ) : (
            <p className="text-xs text-gray-500">{contact.availability_hours}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
