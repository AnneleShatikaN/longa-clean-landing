import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";
import { useUsers } from "@/contexts/UserContext";
import { useToast } from "@/hooks/use-toast";
import { User, Camera, Save, X } from "lucide-react";

interface UserProfileProps {
  onClose?: () => void;
}

const UserProfile: React.FC<UserProfileProps> = ({ onClose }) => {
  const { user } = useAuth();
  const { updateUserProfile, isLoading } = useUsers();
  const { toast } = useToast();
  
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: user?.address || '',
    profilePicture: user?.profilePicture || '',
    bankMobileNumber: user?.bankMobileNumber || '',
    paymentMethod: user?.paymentMethod || 'mobile_money',
    bankDetails: {
      accountNumber: user?.bankDetails?.accountNumber || '',
      bankName: user?.bankDetails?.bankName || '',
      accountHolder: user?.bankDetails?.accountHolder || ''
    },
    servicesOffered: user?.servicesOffered || [],
    available: user?.available || false
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  if (!user) return null;

  const validateForm = () => {
    const errors: Record<string, string> = {};

    if (!formData.name) {
      errors.name = 'Name is required';
    }

    if (!formData.email) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Email is invalid';
    }

    if (!formData.phone) {
      errors.phone = 'Phone is required';
    } else if (!/^\+264\s\d{2}\s\d{3}\s\d{4}$/.test(formData.phone)) {
      errors.phone = 'Phone must be in format +264 XX XXX XXXX';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    try {
      await updateUserProfile(user.id, formData);
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully.",
      });
      setIsEditing(false);
    } catch (error) {
      toast({
        title: "Update failed",
        description: "Failed to update profile. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleInputChange = (field: string, value: any) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent as keyof typeof prev] as object,
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
    
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const placeholderAvatars = [
    'photo-1618160702438-9b02ab6515c9',
    'photo-1582562124811-c09040d0a901',
    'photo-1535268647677-300dbf3d78d1',
    'photo-1581091226825-a6a2a5aee158'
  ];

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-xl font-bold">User Profile</CardTitle>
        <div className="flex items-center space-x-2">
          {isEditing ? (
            <>
              <Button
                onClick={handleSave}
                disabled={isLoading}
                size="sm"
                className="bg-green-600 hover:bg-green-700"
              >
                <Save className="w-4 h-4 mr-1" />
                Save
              </Button>
              <Button
                onClick={() => setIsEditing(false)}
                variant="outline"
                size="sm"
              >
                <X className="w-4 h-4 mr-1" />
                Cancel
              </Button>
            </>
          ) : (
            <Button
              onClick={() => setIsEditing(true)}
              size="sm"
            >
              Edit Profile
            </Button>
          )}
          {onClose && (
            <Button
              onClick={onClose}
              variant="ghost"
              size="sm"
            >
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Profile Picture */}
        <div className="flex flex-col items-center space-y-4">
          <Avatar className="w-24 h-24">
            <AvatarImage 
              src={formData.profilePicture ? `https://images.unsplash.com/${formData.profilePicture}?w=200&h=200&fit=crop&crop=face` : undefined} 
              alt={formData.name}
            />
            <AvatarFallback className="text-lg">
              <User className="w-8 h-8" />
            </AvatarFallback>
          </Avatar>
          
          {isEditing && (
            <div className="space-y-2">
              <Label className="text-sm font-medium">Choose Profile Picture</Label>
              <div className="grid grid-cols-4 gap-2">
                {placeholderAvatars.map((imageId) => (
                  <button
                    key={imageId}
                    type="button"
                    onClick={() => handleInputChange('profilePicture', imageId)}
                    className={`relative w-12 h-12 rounded-full overflow-hidden border-2 transition-all ${
                      formData.profilePicture === imageId 
                        ? 'border-purple-500 ring-2 ring-purple-200' 
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <img
                      src={`https://images.unsplash.com/${imageId}?w=100&h=100&fit=crop&crop=face`}
                      alt="Profile option"
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Basic Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              disabled={!isEditing}
              className={formErrors.name ? 'border-red-500' : ''}
            />
            {formErrors.name && <p className="text-sm text-red-500">{formErrors.name}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              disabled={!isEditing}
              className={formErrors.email ? 'border-red-500' : ''}
            />
            {formErrors.email && <p className="text-sm text-red-500">{formErrors.email}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              value={formData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              disabled={!isEditing}
              placeholder="+264 81 234 5678"
              className={formErrors.phone ? 'border-red-500' : ''}
            />
            {formErrors.phone && <p className="text-sm text-red-500">{formErrors.phone}</p>}
          </div>

          <div className="space-y-2">
            <Label>Role</Label>
            <div className="flex items-center space-x-2">
              <Badge variant="secondary" className="capitalize">
                {user.role}
              </Badge>
              <Badge 
                variant={user.status === 'active' ? 'default' : 'destructive'}
                className="capitalize"
              >
                {user.status}
              </Badge>
            </div>
          </div>
        </div>

        {/* Address */}
        <div className="space-y-2">
          <Label htmlFor="address">Address</Label>
          <Textarea
            id="address"
            value={formData.address}
            onChange={(e) => handleInputChange('address', e.target.value)}
            disabled={!isEditing}
            placeholder="Enter your address"
            rows={3}
          />
        </div>

        {/* Payment Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Payment Information</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="paymentMethod">Preferred Payment Method</Label>
              <Select
                value={formData.paymentMethod}
                onValueChange={(value) => handleInputChange('paymentMethod', value)}
                disabled={!isEditing}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mobile_money">Mobile Money</SelectItem>
                  <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bankMobileNumber">Mobile Money Number</Label>
              <Input
                id="bankMobileNumber"
                value={formData.bankMobileNumber}
                onChange={(e) => handleInputChange('bankMobileNumber', e.target.value)}
                disabled={!isEditing}
                placeholder="+264 81 234 5678"
              />
            </div>
          </div>

          {/* Bank Details */}
          <div className="space-y-4">
            <h4 className="font-medium">Bank Details (Optional)</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="bankName">Bank Name</Label>
                <Input
                  id="bankName"
                  value={formData.bankDetails.bankName}
                  onChange={(e) => handleInputChange('bankDetails.bankName', e.target.value)}
                  disabled={!isEditing}
                  placeholder="Bank of Namibia"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="accountNumber">Account Number</Label>
                <Input
                  id="accountNumber"
                  value={formData.bankDetails.accountNumber}
                  onChange={(e) => handleInputChange('bankDetails.accountNumber', e.target.value)}
                  disabled={!isEditing}
                  placeholder="123456789"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="accountHolder">Account Holder</Label>
                <Input
                  id="accountHolder"
                  value={formData.bankDetails.accountHolder}
                  onChange={(e) => handleInputChange('bankDetails.accountHolder', e.target.value)}
                  disabled={!isEditing}
                  placeholder="John Doe"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Provider-specific fields */}
        {user.role === 'provider' && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Provider Information</h3>
            
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="available"
                checked={formData.available}
                onChange={(e) => handleInputChange('available', e.target.checked)}
                disabled={!isEditing}
                className="rounded border-gray-300"
              />
              <Label htmlFor="available">Currently available for bookings</Label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">Rating</p>
                <p className="text-lg font-semibold">{user.rating?.toFixed(1) || 'N/A'}</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">Jobs Completed</p>
                <p className="text-lg font-semibold">{user.jobsCompleted || 0}</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">Total Earnings</p>
                <p className="text-lg font-semibold">N${user.totalEarnings || 0}</p>
              </div>
            </div>
          </div>
        )}

        {/* Account Information */}
        <div className="space-y-2 pt-4 border-t">
          <h3 className="text-lg font-semibold">Account Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
            <div>
              <p><span className="font-medium">Member since:</span> {user.joinDate}</p>
              <p><span className="font-medium">Last active:</span> {new Date(user.lastActive).toLocaleDateString()}</p>
            </div>
            <div>
              <p><span className="font-medium">Email verified:</span> {user.isEmailVerified ? 'Yes' : 'No'}</p>
              <p><span className="font-medium">Account status:</span> {user.status}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default UserProfile;
