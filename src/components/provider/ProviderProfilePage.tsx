
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  Star, 
  Save,
  Edit,
  ShieldCheck,
  Upload
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ProfileData {
  full_name: string;
  phone: string;
  email: string;
  current_work_location: string;
  verification_status: string;
  rating: number;
  total_jobs: number;
  avatar_url: string;
}

export const ProviderProfilePage: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [profileData, setProfileData] = useState<ProfileData>({
    full_name: '',
    phone: '',
    email: '',
    current_work_location: '',
    verification_status: 'pending',
    rating: 0,
    total_jobs: 0,
    avatar_url: ''
  });

  const fetchProfileData = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) throw error;

      if (data) {
        setProfileData({
          full_name: data.full_name || '',
          phone: data.phone || '',
          email: data.email || '',
          current_work_location: data.current_work_location || '',
          verification_status: data.verification_status || 'pending',
          rating: data.rating || 0,
          total_jobs: data.total_jobs || 0,
          avatar_url: data.avatar_url || ''
        });
      }
    } catch (error) {
      console.error('Error fetching profile data:', error);
    }
  };

  useEffect(() => {
    fetchProfileData();
  }, [user]);

  const handleSaveProfile = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('users')
        .update({
          full_name: profileData.full_name,
          phone: profileData.phone,
          current_work_location: profileData.current_work_location,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (error) throw error;

      toast({
        title: "Profile Updated",
        description: "Your profile has been updated successfully.",
      });
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getVerificationStatusColor = (status: string) => {
    switch (status) {
      case 'verified': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getVerificationStatusText = (status: string) => {
    switch (status) {
      case 'verified': return 'Verified';
      case 'pending': return 'Verification Pending';
      case 'rejected': return 'Verification Rejected';
      default: return 'Not Verified';
    }
  };

  const handleInputChange = (field: keyof ProfileData, value: string) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <div className="p-4 space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Profile</h1>
        <p className="text-gray-600">Manage your provider profile and settings</p>
      </div>

      {/* Profile Header */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col items-center space-y-4">
            <div className="relative">
              <Avatar className="h-24 w-24">
                <AvatarImage src={profileData.avatar_url} alt={profileData.full_name} />
                <AvatarFallback className="text-2xl font-semibold">
                  {getInitials(profileData.full_name || user?.full_name || user?.name || 'U')}
                </AvatarFallback>
              </Avatar>
              <Button
                size="sm"
                variant="outline"
                className="absolute -bottom-2 -right-2 rounded-full w-8 h-8 p-0"
              >
                <Upload className="h-3 w-3" />
              </Button>
            </div>
            
            <div className="text-center">
              <h2 className="text-xl font-semibold">{profileData.full_name || user?.full_name || user?.name}</h2>
              <div className="flex items-center justify-center space-x-2 mt-2">
                <Badge className={getVerificationStatusColor(profileData.verification_status)}>
                  <ShieldCheck className="h-3 w-3 mr-1" />
                  {getVerificationStatusText(profileData.verification_status)}
                </Badge>
              </div>
            </div>

            <div className="flex space-x-6 text-center">
              <div>
                <div className="flex items-center justify-center space-x-1">
                  <Star className="h-4 w-4 fill-current text-yellow-400" />
                  <span className="font-medium">{profileData.rating.toFixed(1)}</span>
                </div>
                <p className="text-xs text-gray-600">Rating</p>
              </div>
              <div>
                <p className="font-medium">{profileData.total_jobs}</p>
                <p className="text-xs text-gray-600">Jobs Completed</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Profile Information */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center space-x-2">
              <User className="h-5 w-5" />
              <span>Profile Information</span>
            </CardTitle>
            {!isEditing && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditing(true)}
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {isEditing ? (
            <>
              <div className="space-y-2">
                <Label htmlFor="full_name">Full Name</Label>
                <Input
                  id="full_name"
                  value={profileData.full_name}
                  onChange={(e) => handleInputChange('full_name', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  value={profileData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder="+264 81 234 5678"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Work Location</Label>
                <Input
                  id="location"
                  value={profileData.current_work_location}
                  onChange={(e) => handleInputChange('current_work_location', e.target.value)}
                  placeholder="Windhoek"
                />
              </div>

              <div className="flex space-x-2">
                <Button
                  onClick={handleSaveProfile}
                  disabled={isLoading}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {isLoading ? 'Saving...' : 'Save Changes'}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setIsEditing(false)}
                >
                  Cancel
                </Button>
              </div>
            </>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <User className="h-4 w-4 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-600">Full Name</p>
                  <p className="font-medium">{profileData.full_name || 'Not set'}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Phone className="h-4 w-4 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-600">Phone</p>
                  <p className="font-medium">{profileData.phone || 'Not set'}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Mail className="h-4 w-4 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-600">Email</p>
                  <p className="font-medium">{profileData.email}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <MapPin className="h-4 w-4 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-600">Work Location</p>
                  <p className="font-medium">{profileData.current_work_location || 'Not set'}</p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Verification Status */}
      {profileData.verification_status !== 'verified' && (
        <Card className="bg-yellow-50 border-yellow-200">
          <CardContent className="p-4">
            <div className="flex items-start space-x-3">
              <div className="bg-yellow-600 rounded-full p-1">
                <ShieldCheck className="h-4 w-4 text-white" />
              </div>
              <div>
                <h3 className="font-medium text-yellow-900">Complete Verification</h3>
                <p className="text-sm text-yellow-700 mt-1">
                  Upload your ID/passport and police clearance to start receiving job assignments.
                </p>
                <Button
                  size="sm"
                  className="mt-3 bg-yellow-600 hover:bg-yellow-700 text-white"
                >
                  Start Verification
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
