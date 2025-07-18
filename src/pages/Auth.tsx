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
import { EmailVerificationPrompt } from '@/components/auth/EmailVerificationPrompt';

const Auth = () => {
  const [mode, setMode] = useState<'signin' | 'signup' | 'verification'>('signin');
  const [isLoading, setIsLoading] = useState(false);
  const [signupEmail, setSignupEmail] = useState('');
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

  const getLoginErrorMessage = (error: any) => {
    const errorMessage = error.message?.toLowerCase() || '';
    
    if (errorMessage.includes('invalid login credentials') || 
        errorMessage.includes('invalid credentials') ||
        errorMessage.includes('email not confirmed')) {
      return "Incorrect email or password. Please try again.";
    }
    
    if (errorMessage.includes('email not found') || 
        errorMessage.includes('user not found')) {
      return "No account found with that email address.";
    }
    
    if (errorMessage.includes('too many requests') || 
        errorMessage.includes('rate limit')) {
      return "Too many login attempts. Please wait a moment before trying again.";
    }
    
    if (errorMessage.includes('verify') || 
        errorMessage.includes('confirm')) {
      return "Please verify your email address before signing in.";
    }
    
    if (errorMessage.includes('password')) {
      return "Incorrect password. Please try again.";
    }
    
    // Fallback for any other errors
    return "Unable to sign in. Please check your credentials and try again.";
  };

  const redirectToDashboard = (userRole: string) => {
    console.log('Redirecting user with role:', userRole);
    
    switch (userRole) {
      case 'client':
        navigate('/client-dashboard');
        break;
      case 'provider':
        navigate('/provider-dashboard');
        break;
      case 'admin':
        navigate('/admin-dashboard');
        break;
      default:
        console.warn('Unknown user role:', userRole);
        toast({
          title: "Setup required",
          description: "Please complete your profile setup to continue.",
          variant: "destructive"
        });
        navigate('/auth');
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const { error } = await signIn(formData.email, formData.password);
      if (error) {
        // Check if error is related to email verification
        if (error.message.includes('verify') || error.message.includes('confirm')) {
          setSignupEmail(formData.email);
          setMode('verification');
          toast({
            title: "Email verification required",
            description: "Please verify your email address before signing in.",
            variant: "destructive"
          });
          return;
        }
        throw error;
      }

      // Get user profile to determine role-based redirect
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const { data: userProfile, error: profileError } = await supabase
          .from('users')
          .select('role')
          .eq('id', session.user.id)
          .single();

        if (profileError) {
          console.error('Error fetching user profile:', profileError);
          toast({
            title: "Profile error",
            description: "Unable to load your profile. Please try again.",
            variant: "destructive"
          });
          return;
        }

        toast({
          title: "Signed in!",
          description: "You have successfully signed in.",
        });

        // Redirect based on user role
        if (userProfile?.role) {
          redirectToDashboard(userProfile.role);
        } else {
          toast({
            title: "Setup required",
            description: "Please complete your profile setup to continue.",
            variant: "destructive"
          });
          navigate('/auth');
        }
      }
    } catch (error: any) {
      console.error('Signin error:', error);
      const friendlyMessage = getLoginErrorMessage(error);
      toast({
        title: "Sign in failed",
        description: friendlyMessage,
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
          emailRedirectTo: `${window.location.origin}/auth/callback`,
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

      // Check if user needs email verification
      if (data.user && !data.session) {
        setSignupEmail(formData.email);
        setMode('verification');
        toast({
          title: "Account created successfully!",
          description: "Please check your email to verify your account before signing in.",
        });
        return;
      }

      // If user is immediately signed in (email confirmation disabled)
      if (data.session) {
        toast({
          title: "Account created and signed in!",
          description: "Welcome to our platform!",
        });
        redirectToDashboard(formData.role);
      }
      
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

  // Show email verification prompt
  if (mode === 'verification') {
    return (
      <EmailVerificationPrompt
        email={signupEmail}
        onBackToSignIn={() => {
          setMode('signin');
          setFormData(prev => ({ ...prev, email: signupEmail, password: '' }));
        }}
        onBackToSignUp={() => setMode('signup')}
      />
    );
  }

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
