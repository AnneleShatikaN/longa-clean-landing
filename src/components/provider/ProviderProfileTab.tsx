
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { User, Star, Calendar, MapPin, Phone, Mail, Save } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const NAMIBIAN_TOWNS = [
  { value: 'windhoek', label: 'Windhoek' },
  { value: 'walvis-bay', label: 'Walvis Bay' },
  { value: 'swakopmund', label: 'Swakopmund' },
  { value: 'oshakati', label: 'Oshakati' },
  { value: 'rundu', label: 'Rundu' },
  { value: 'otjiwarongo', label: 'Otjiwarongo' },
  { value: 'gobabis', label: 'Gobabis' },
  { value: 'katima-mulilo', label: 'Katima Mulilo' },
  { value: 'tsumeb', label: 'Tsumeb' },
  { value: 'keetmanshoop', label: 'Keetmanshoop' },
  { value: 'rehoboth', label: 'Rehoboth' },
  { value: 'mariental', label: 'Mariental' }
];

const ProviderProfileTab: React.FC = () => {
  const { user, refreshUser } = useAuth();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    full_name: user?.full_name || '',
    phone: user?.phone || '',
    current_work_location: user?.current_work_location || 'windhoek'
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.full_name.trim()) {
      newErrors.full_name = 'Full name is required';
    }

    if (formData.phone && !/^\+264\s\d{2}\s\d{3}\s\d{4}$/.test(formData.phone)) {
      newErrors.phone = 'Phone must be in format +264 XX XXX XXXX';
    }

    if (!formData.current_work_location) {
      newErrors.current_work_location = 'Work location is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('users')
        .update({
          full_name: formData.full_name,
          phone: formData.phone || null,
          current_work_location: formData.current_work_location,
          updated_at: new Date().toISOString()
        })
        .eq('id', user?.id);

      if (error) {
        console.error('Error updating profile:', error);
        throw error;
      }

      await refreshUser();
      setIsEditing(false);
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully.",
      });
    } catch (error) {
      console.error('Profile update error:', error);
      toast({
        title: "Update failed",
        description: "Failed to update profile. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const getLocationLabel = (value: string) => {
    return NAMIBIAN_TOWNS.find(town => town.value === value)?.label || value;
  };

  if (!user) return null;

  return (
    <div className="space-y-6">
      {/* Profile Information */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center space-x-2">
              <User className="h-5 w-5" />
              <span>Profile Information</span>
            </CardTitle>
            {!isEditing && (
              <Button onClick={() => setIsEditing(true)} variant="outline" size="sm">
                Edit Profile
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {isEditing ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="full_name">Full Name *</Label>
                <Input
                  id="full_name"
                  value={formData.full_name}
                  onChange={(e) => handleInputChange('full_name', e.target.value)}
                  className={errors.full_name ? 'border-red-500' : ''}
                />
                {errors.full_name && <p className="text-sm text-red-500">{errors.full_name}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder="+264 81 234 5678"
                  className={errors.phone ? 'border-red-500' : ''}
                />
                {errors.phone && <p className="text-sm text-red-500">{errors.phone}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="current_work_location">Work Location *</Label>
                <Select
                  value={formData.current_work_location}
                  onValueChange={(value) => handleInputChange('current_work_location', value)}
                >
                  <SelectTrigger className={errors.current_work_location ? 'border-red-500' : ''}>
                    <SelectValue placeholder="Select your work location" />
                  </SelectTrigger>
                  <SelectContent>
                    {NAMIBIAN_TOWNS.map((town) => (
                      <SelectItem key={town.value} value={town.value}>
                        {town.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.current_work_location && <p className="text-sm text-red-500">{errors.current_work_location}</p>}
              </div>

              <div className="flex space-x-2">
                <Button type="submit" disabled={isLoading} className="bg-green-600 hover:bg-green-700">
                  <Save className="h-4 w-4 mr-2" />
                  {isLoading ? 'Saving...' : 'Save Changes'}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => {
                    setIsEditing(false);
                    setFormData({
                      full_name: user?.full_name || '',
                      phone: user?.phone || '',
                      current_work_location: user?.current_work_location || 'windhoek'
                    });
                    setErrors({});
                  }}
                >
                  Cancel
                </Button>
              </div>
            </form>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <User className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-600">Name:</span>
                    <span className="font-medium">{user.full_name || 'Not set'}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Phone className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-600">Phone:</span>
                    <span className="font-medium">{user.phone || 'Not set'}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Mail className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-600">Email:</span>
                    <span className="font-medium">{user.email}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <MapPin className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-600">Location:</span>
                    <span className="font-medium">
                      {user.current_work_location ? getLocationLabel(user.current_work_location) : 'Not set'}
                    </span>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Star className="h-4 w-4 text-yellow-400 fill-current" />
                    <span className="text-sm text-gray-600">Rating:</span>
                    <span className="font-medium">{user.rating || 0}/5</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-600">Joined:</span>
                    <span className="font-medium">
                      {user.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600">Status:</span>
                    <Badge className={user.verification_status === 'verified' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                      {user.verification_status === 'verified' ? 'Active Provider' : 'Pending Verification'}
                    </Badge>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600">Total Jobs:</span>
                    <span className="font-medium">{user.total_jobs || 0}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ProviderProfileTab;
