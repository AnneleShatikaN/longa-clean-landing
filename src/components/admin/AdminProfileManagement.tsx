
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useEnhancedToast } from '@/hooks/useEnhancedToast';
import { supabase } from '@/integrations/supabase/client';
import { User, Phone, Mail, Save } from 'lucide-react';

export const AdminProfileManagement: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useEnhancedToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    whatsappNumber: ''
  });

  useEffect(() => {
    if (user) {
      setFormData({
        fullName: user.full_name || '',
        email: user.email || '',
        whatsappNumber: user.phone || ''
      });
    }
  }, [user]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const validateForm = () => {
    if (!formData.fullName.trim()) {
      toast.error('Full name is required');
      return false;
    }

    if (!formData.email.trim()) {
      toast.error('Email is required');
      return false;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error('Please enter a valid email address');
      return false;
    }

    // WhatsApp number validation (optional but must be valid if provided)
    if (formData.whatsappNumber && !formData.whatsappNumber.match(/^\+264\d{8,9}$/)) {
      toast.error('WhatsApp number must be in format +264XXXXXXXX');
      return false;
    }

    return true;
  };

  const handleSaveChanges = async () => {
    if (!validateForm() || !user) return;

    setIsLoading(true);
    try {
      // Update user profile in the users table
      const { error } = await supabase
        .from('users')
        .update({
          full_name: formData.fullName.trim(),
          email: formData.email.trim(),
          phone: formData.whatsappNumber.trim() || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (error) throw error;

      toast.success('Profile updated successfully');
      
      // You might want to refresh the user context here
      // The user context should automatically update when the page refreshes
      
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const hasChanges = user && (
    formData.fullName !== (user.full_name || '') ||
    formData.email !== (user.email || '') ||
    formData.whatsappNumber !== (user.phone || '')
  );

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          Admin Profile Management
        </CardTitle>
        <p className="text-sm text-gray-600">
          Update your account details. Changes will reflect across the entire platform.
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Full Name Field */}
        <div className="space-y-2">
          <Label htmlFor="fullName" className="text-sm font-medium">
            Full Name
          </Label>
          <Input
            id="fullName"
            type="text"
            value={formData.fullName}
            onChange={(e) => handleInputChange('fullName', e.target.value)}
            placeholder="Enter your full name"
            disabled={isLoading}
            className="w-full"
          />
        </div>

        {/* Email Field */}
        <div className="space-y-2">
          <Label htmlFor="email" className="text-sm font-medium flex items-center gap-2">
            <Mail className="h-4 w-4" />
            Email Address
          </Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            placeholder="Enter your email address"
            disabled={isLoading}
            className="w-full"
          />
          <p className="text-xs text-gray-500">
            This email will be used for admin notifications and reports
          </p>
        </div>

        {/* WhatsApp Number Field */}
        <div className="space-y-2">
          <Label htmlFor="whatsappNumber" className="text-sm font-medium flex items-center gap-2">
            <Phone className="h-4 w-4" />
            WhatsApp Number
          </Label>
          <Input
            id="whatsappNumber"
            type="tel"
            value={formData.whatsappNumber}
            onChange={(e) => handleInputChange('whatsappNumber', e.target.value)}
            placeholder="+264814124606"
            disabled={isLoading}
            className="w-full"
          />
          <p className="text-xs text-gray-500">
            Used for payment approval notifications and client communication
          </p>
        </div>

        {/* Save Button */}
        <div className="pt-4">
          <Button 
            onClick={handleSaveChanges}
            disabled={isLoading || !hasChanges}
            className="w-full sm:w-auto min-w-[140px]"
          >
            <Save className="h-4 w-4 mr-2" />
            {isLoading ? 'Saving...' : 'Save Changes'}
          </Button>
          
          {hasChanges && (
            <p className="text-xs text-orange-600 mt-2">
              You have unsaved changes
            </p>
          )}
        </div>

        {/* Information */}
        <div className="bg-blue-50 p-4 rounded-lg">
          <h4 className="font-medium text-blue-900 mb-2">Important Notes</h4>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Changes to your email address will affect login credentials</li>
            <li>• WhatsApp number will be used in payment instruction links</li>
            <li>• Profile updates are reflected immediately across the platform</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};
