
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { User, Mail, Phone, MapPin, Edit } from 'lucide-react';
import { ProfileEditForm } from './ProfileEditForm';

const NAMIBIAN_TOWNS = [
  { value: 'Windhoek', label: 'Windhoek' },
  { value: 'Walvis Bay', label: 'Walvis Bay' },
  { value: 'Swakopmund', label: 'Swakopmund' },
];

export const ProfileTab = () => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);

  if (!user) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <p className="text-gray-600">Please sign in to view your profile.</p>
        </CardContent>
      </Card>
    );
  }

  if (isEditing) {
    return (
      <ProfileEditForm
        onCancel={() => setIsEditing(false)}
        onSuccess={() => setIsEditing(false)}
      />
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              My Profile
            </CardTitle>
            <Button onClick={() => setIsEditing(true)}>
              <Edit className="h-4 w-4 mr-2" />
              Edit Profile
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <User className="h-4 w-4" />
                Full Name
              </Label>
              <p className="text-gray-900 font-medium">{user.full_name || 'Not provided'}</p>
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <Mail className="h-4 w-4" />
                Email Address
              </Label>
              <p className="text-gray-900 font-medium">{user.email}</p>
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <Phone className="h-4 w-4" />
                Phone Number
              </Label>
              <p className="text-gray-900 font-medium">{user.phone || 'Not provided'}</p>
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <MapPin className="h-4 w-4" />
                Location
              </Label>
              <p className="text-gray-900 font-medium">
                {user.town && user.suburb 
                  ? `${user.suburb}, ${user.town}`
                  : 'Not specified'
                }
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Account Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Account Status</span>
            <Badge variant={user.is_active ? "default" : "destructive"}>
              {user.is_active ? "Active" : "Inactive"}
            </Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Account Type</span>
            <Badge variant="outline" className="capitalize">
              {user.role}
            </Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Member Since</span>
            <span className="text-gray-900">
              {new Date(user.created_at || '').toLocaleDateString()}
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const Label: React.FC<{ className?: string; children: React.ReactNode }> = ({ className, children }) => (
  <label className={className}>{children}</label>
);
