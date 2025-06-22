
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { ArrowLeft, User, Star, Calendar, MapPin, Phone, Mail, Save, AlertCircle } from 'lucide-react';

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

const PROVIDER_CATEGORIES = [
  { value: 'cleaning', label: 'Cleaning Services' },
  { value: 'car_wash', label: 'Car Wash Services' },
  { value: 'gardening', label: 'Gardening Services' },
  { value: 'plumbing', label: 'Plumbing Services' },
  { value: 'electrical', label: 'Electrical Services' },
  { value: 'maintenance', label: 'General Maintenance' }
];

const ProviderProfile = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, refreshUser } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    full_name: user?.full_name || '',
    phone: user?.phone || '',
    current_work_location: user?.current_work_location || 'windhoek',
    provider_category: user?.provider_category || ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Check for highlight message from location state
  const shouldHighlightCategory = location.state?.highlightCategory;
  const locationMessage = location.state?.message;

  useEffect(() => {
    if (locationMessage) {
      toast({
        title: "Profile Update Required",
        description: locationMessage,
        variant: "default",
      });
    }
  }, [locationMessage, toast]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.full_name.trim()) {
      newErrors.full_name = 'Full name is required';
    }

    if (!formData.provider_category) {
      newErrors.provider_category = 'Provider category is required';
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
          provider_category: formData.provider_category,
          updated_at: new Date().toISOString()
        })
        .eq('id', user?.id);

      if (error) {
        console.error('Error updating profile:', error);
        throw error;
      }

      await refreshUser();
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully. You can now proceed with verification.",
      });

      // Redirect back to verification if that's where they came from
      if (location.state?.from === 'verification') {
        navigate('/provider-verification');
      } else {
        navigate('/provider-dashboard');
      }
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

  const getCategoryLabel = (value: string) => {
    return PROVIDER_CATEGORIES.find(cat => cat.value === value)?.label || value;
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(-1)}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <h1 className="text-3xl font-bold text-gray-900">Provider Profile</h1>
        </div>

        {shouldHighlightCategory && (
          <Alert className="mb-6 border-yellow-200 bg-yellow-50">
            <AlertCircle className="h-4 w-4 text-yellow-600" />
            <AlertDescription className="text-yellow-800">
              Please set your provider category to continue with verification and access training materials.
            </AlertDescription>
          </Alert>
        )}

        {/* Profile Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <User className="h-5 w-5" />
              <span>Profile Information</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
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
                <Label htmlFor="provider_category">Provider Category *</Label>
                <Select
                  value={formData.provider_category}
                  onValueChange={(value) => handleInputChange('provider_category', value)}
                >
                  <SelectTrigger className={`${errors.provider_category ? 'border-red-500' : ''} ${shouldHighlightCategory ? 'ring-2 ring-yellow-400' : ''}`}>
                    <SelectValue placeholder="Select your service category" />
                  </SelectTrigger>
                  <SelectContent>
                    {PROVIDER_CATEGORIES.map((category) => (
                      <SelectItem key={category.value} value={category.value}>
                        {category.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.provider_category && <p className="text-sm text-red-500">{errors.provider_category}</p>}
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

              <div className="pt-4 border-t">
                <h3 className="text-lg font-semibold mb-4">Current Profile Status</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <Mail className="h-4 w-4 text-gray-500" />
                      <span className="text-sm text-gray-600">Email:</span>
                      <span className="font-medium">{user.email}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Star className="h-4 w-4 text-yellow-400 fill-current" />
                      <span className="text-sm text-gray-600">Rating:</span>
                      <span className="font-medium">{user.rating || 0}/5</span>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
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
                  </div>
                </div>
              </div>

              <div className="flex space-x-2 pt-4">
                <Button type="submit" disabled={isLoading} className="bg-green-600 hover:bg-green-700">
                  <Save className="h-4 w-4 mr-2" />
                  {isLoading ? 'Saving...' : 'Save Profile'}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => navigate('/provider-dashboard')}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProviderProfile;
