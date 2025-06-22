import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from "@/hooks/use-toast";
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Mail, KeyRound, User, CheckCircle, AlertTriangle } from "lucide-react";

const Auth = () => {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    full_name: '',
    phone: '',
    role: 'client',
    provider_category: '',
    current_work_location: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const navigate = useNavigate();
  const { signIn } = useAuth();
  const { toast } = useToast();

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (mode === 'signup') {
      if (!formData.full_name) {
        newErrors.full_name = 'Full name is required';
      }

      if (formData.role === 'provider' && !formData.provider_category) {
        newErrors.provider_category = 'Provider category is required';
      }

      if (formData.role === 'provider' && !formData.current_work_location) {
        newErrors.current_work_location = 'Work location is required';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const { error } = await signIn(formData.email, formData.password);
      if (error) throw error;

      toast({
        title: "Signed in!",
        description: "You have successfully signed in.",
      });
      navigate('/client-dashboard');
    } catch (error: any) {
      console.error('Signin error:', error);
      toast({
        title: "Sign in failed",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      console.log('Signing up with data:', { 
        email: formData.email, 
        role: formData.role,
        provider_category: formData.provider_category,
        current_work_location: formData.current_work_location 
      });

      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.full_name,
            phone: formData.phone,
            role: formData.role,
            provider_category: formData.provider_category,
            current_work_location: formData.current_work_location
          }
        }
      });

      if (error) throw error;

      // Additional step: Update the user record directly after signup to ensure all fields are saved
      if (data.user && formData.role === 'provider') {
        console.log('Updating provider profile after signup...');
        const { error: updateError } = await supabase
          .from('users')
          .update({
            provider_category: formData.provider_category,
            current_work_location: formData.current_work_location,
            phone: formData.phone
          })
          .eq('id', data.user.id);

        if (updateError) {
          console.error('Error updating provider profile:', updateError);
        } else {
          console.log('Provider profile updated successfully');
        }
      }

      toast({
        title: "Account created!",
        description: "Please check your email to verify your account.",
      });
      
      setMode('signin');
    } catch (error: any) {
      console.error('Signup error:', error);
      toast({
        title: "Sign up failed",
        description: error.message,
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

  const handleRoleChange = (role: string) => {
    setFormData(prev => ({
      ...prev,
      role,
      provider_category: '',
      current_work_location: ''
    }));
  };

  const isFormValid = Object.keys(errors).length === 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <Card className="max-w-md w-full space-y-8">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold">
            {mode === 'signin' ? 'Sign In' : 'Create Account'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={mode === 'signin' ? handleSignIn : handleSignUp}
            className="space-y-6"
          >
            {mode === 'signup' && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="full_name">Full Name</Label>
                  <Input
                    id="full_name"
                    type="text"
                    placeholder="Enter your full name"
                    value={formData.full_name}
                    onChange={(e) => handleInputChange('full_name', e.target.value)}
                    className={errors.full_name ? 'border-red-500' : ''}
                  />
                  {errors.full_name && (
                    <p className="text-sm text-red-500">{errors.full_name}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">Account Type</Label>
                  <div className="flex space-x-4">
                    <Button
                      variant={formData.role === 'client' ? 'default' : 'outline'}
                      onClick={() => handleRoleChange('client')}
                      type="button"
                    >
                      Client
                    </Button>
                    <Button
                      variant={formData.role === 'provider' ? 'default' : 'outline'}
                      onClick={() => handleRoleChange('provider')}
                      type="button"
                    >
                      Provider
                    </Button>
                  </div>
                </div>
              </>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className={errors.email ? 'border-red-500' : ''}
              />
              {errors.email && (
                <p className="text-sm text-red-500">{errors.email}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                className={errors.password ? 'border-red-500' : ''}
              />
              {errors.password && (
                <p className="text-sm text-red-500">{errors.password}</p>
              )}
            </div>

            {formData.role === 'provider' && mode === 'signup' && (
              <>
                <ProviderCategorySelect
                  value={formData.provider_category}
                  onChange={(value) => handleInputChange('provider_category', value)}
                  error={errors.provider_category}
                />
                <WorkLocationSelect
                  value={formData.current_work_location}
                  onChange={(value) => handleInputChange('current_work_location', value)}
                  error={errors.current_work_location}
                />
              </>
            )}

            <div>
              <Button
                type="submit"
                disabled={isLoading || !isFormValid}
                className="w-full"
              >
                {isLoading ? (
                  <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M12 4V2m0 20v-2m8-8h2M4 12H2m15.364 6.364l1.414-1.414M2.636 5.636L4.05 4.222m16.728 0l-1.414 1.414M5.636 18.364L4.222 19.778" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                ) : (
                  mode === 'signin' ? 'Sign In' : 'Create Account'
                )}
              </Button>
            </div>
          </form>
          <div className="text-sm text-center">
            {mode === 'signin' ? (
              <>
                Don't have an account?{' '}
                <Button variant="link" onClick={() => setMode('signup')}>
                  Sign Up
                </Button>
              </>
            ) : (
              <>
                Already have an account?{' '}
                <Button variant="link" onClick={() => setMode('signin')}>
                  Sign In
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

interface ProviderCategorySelectProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
}

const providerCategories = [
  { value: 'cleaning', label: 'Cleaning Services' },
  { value: 'car_wash', label: 'Car Wash Services' },
  { value: 'gardening', label: 'Gardening Services' },
  { value: 'plumbing', label: 'Plumbing Services' },
  { value: 'electrical', label: 'Electrical Services' },
  { value: 'maintenance', label: 'General Maintenance' },
];

const ProviderCategorySelect: React.FC<ProviderCategorySelectProps> = ({ value, onChange, error }) => (
  <div className="space-y-2">
    <Label htmlFor="provider_category">Provider Category</Label>
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className={error ? 'border-red-500' : ''}>
        <SelectValue placeholder="Select category" />
      </SelectTrigger>
      <SelectContent>
        {providerCategories.map((category) => (
          <SelectItem key={category.value} value={category.value}>
            {category.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
    {error && <p className="text-sm text-red-500">{error}</p>}
  </div>
);

interface WorkLocationSelectProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
}

const workLocations = [
  { value: 'windhoek', label: 'Windhoek' },
  { value: 'walvis_bay', label: 'Walvis Bay' },
  { value: 'swakopmund', label: 'Swakopmund' },
  { value: 'oshakati', label: 'Oshakati' },
  { value: 'rundu', label: 'Rundu' },
  { value: 'katima_mulilo', label: 'Katima Mulilo' },
];

const WorkLocationSelect: React.FC<WorkLocationSelectProps> = ({ value, onChange, error }) => (
  <div className="space-y-2">
    <Label htmlFor="current_work_location">Work Location</Label>
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className={error ? 'border-red-500' : ''}>
        <SelectValue placeholder="Select location" />
      </SelectTrigger>
      <SelectContent>
        {workLocations.map((location) => (
          <SelectItem key={location.value} value={location.value}>
            {location.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
    {error && <p className="text-sm text-red-500">{error}</p>}
  </div>
);

export default Auth;
