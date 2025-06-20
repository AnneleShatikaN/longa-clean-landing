import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useServiceCategories } from '@/hooks/useServiceCategories';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Eye, EyeOff, User, Briefcase, ArrowLeft, Mail, CheckCircle, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from 'sonner';

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

const Auth = () => {
  const navigate = useNavigate();
  const { user, loading, isInitialized, needsEmailVerification, signUp, signIn, resendVerificationEmail } = useAuth();
  const { categories, isLoading: categoriesLoading } = useServiceCategories();
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    phone: '',
    role: 'client' as 'client' | 'provider',
    location: '',
    providerCategory: ''
  });

  // Redirect if already authenticated
  useEffect(() => {
    if (user && isInitialized && !loading && !needsEmailVerification) {
      if (user.role === 'client') {
        navigate('/client-dashboard');
      } else if (user.role === 'provider') {
        navigate('/provider-dashboard');
      } else if (user.role === 'admin') {
        navigate('/admin-dashboard');
      }
    }
  }, [user, loading, isInitialized, needsEmailVerification, navigate]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateForm = () => {
    if (!formData.email || !formData.password) {
      toast.error('Email and password are required');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error('Please enter a valid email address');
      return false;
    }

    if (isSignUp) {
      if (!formData.fullName.trim()) {
        toast.error('Full name is required');
        return false;
      }

      if (!formData.location) {
        toast.error('Location is required');
        return false;
      }

      if (formData.role === 'provider' && !formData.providerCategory) {
        toast.error('Please select a service category');
        return false;
      }

      if (formData.password.length < 6) {
        toast.error('Password must be at least 6 characters');
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    setAuthError(null);
    
    try {
      if (isSignUp) {
        console.log('Creating account with data:', {
          email: formData.email,
          role: formData.role,
          fullName: formData.fullName,
          location: formData.location,
          providerCategory: formData.providerCategory
        });

        const result = await signUp(formData.email, formData.password, {
          full_name: formData.fullName,
          phone: formData.phone,
          role: formData.role,
          current_work_location: formData.location,
          provider_category: formData.role === 'provider' ? formData.providerCategory : null
        });
        
        if (result.error) {
          throw result.error;
        }
        
        if (result.needsEmailVerification) {
          toast.success('Account created! Please check your email to verify your account.');
        } else {
          toast.success('Account created and signed in successfully!');
        }
        
        // Reset form
        setFormData({
          email: '',
          password: '',
          fullName: '',
          phone: '',
          role: 'client',
          location: '',
          providerCategory: ''
        });
      } else {
        const result = await signIn(formData.email, formData.password);
        
        if (result.error) {
          throw result.error;
        }
        
        toast.success('Signed in successfully!');
      }
    } catch (error: any) {
      console.error('Auth error:', error);
      
      let errorMessage = 'An error occurred. Please try again.';
      
      if (error.message) {
        if (error.message.includes('User already registered')) {
          errorMessage = 'An account with this email already exists. Please sign in instead.';
        } else if (error.message.includes('Invalid login credentials')) {
          errorMessage = 'Invalid email or password. Please check your credentials.';
        } else if (error.message.includes('Password should be at least')) {
          errorMessage = 'Password must be at least 6 characters long.';
        } else if (error.message.includes('Unable to validate email address')) {
          errorMessage = 'Please enter a valid email address.';
        } else if (error.message.includes('verify your email')) {
          errorMessage = 'Please verify your email address before signing in.';
        } else {
          errorMessage = error.message;
        }
      }
      
      setAuthError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendVerification = async () => {
    try {
      setIsSubmitting(true);
      await resendVerificationEmail();
      toast.success('Verification email sent! Please check your inbox.');
    } catch (error: any) {
      toast.error(error.message || 'Failed to resend verification email');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getRoleInfo = (role: string) => {
    switch (role) {
      case 'client':
        return {
          icon: <User className="h-4 w-4" />,
          title: 'Client',
          description: 'Book services from trusted providers'
        };
      case 'provider':
        return {
          icon: <Briefcase className="h-4 w-4" />,
          title: 'Service Provider',
          description: 'Offer your services and earn income'
        };
      default:
        return { icon: null, title: '', description: '' };
    }
  };

  // Show loading only when auth is not yet initialized
  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  // Email verification screen
  if (needsEmailVerification) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <Card>
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Mail className="h-6 w-6 text-blue-600" />
              </div>
              <CardTitle>Verify Your Email</CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <p className="text-gray-600">
                We've sent a verification link to your email address.
              </p>
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  Click the verification link in your email to activate your account, then you can sign in.
                </AlertDescription>
              </Alert>
              <div className="space-y-2">
                <Button
                  onClick={handleResendVerification}
                  disabled={isSubmitting}
                  className="w-full"
                >
                  {isSubmitting ? 'Sending...' : 'Resend Verification Email'}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsSignUp(false);
                    setAuthError(null);
                  }}
                  className="w-full"
                >
                  Back to Sign In
                </Button>
              </div>
              <p className="text-xs text-gray-500">
                Check your spam folder if you don't see the email.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <Button
            variant="ghost"
            className="absolute top-4 left-4"
            onClick={() => navigate('/')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Button>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Longa</h1>
          <p className="text-gray-600">
            {isSignUp ? 'Create your account' : 'Welcome back'}
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-center">
              {isSignUp ? 'Sign Up' : 'Sign In'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* Show error alert if there's an auth error */}
            {authError && (
              <Alert className="mb-4 border-red-200 bg-red-50">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-red-800">
                  {authError}
                </AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Role Selection for Sign Up */}
              {isSignUp && (
                <div className="space-y-3">
                  <Label>Account Type</Label>
                  <Tabs 
                    value={formData.role} 
                    onValueChange={(value) => handleInputChange('role', value)}
                    className="w-full"
                  >
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="client">Client</TabsTrigger>
                      <TabsTrigger value="provider">Provider</TabsTrigger>
                    </TabsList>
                  </Tabs>
                  
                  {/* Role Description */}
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      {getRoleInfo(formData.role).icon}
                      <span className="font-medium">{getRoleInfo(formData.role).title}</span>
                    </div>
                    <p className="text-sm text-gray-600">{getRoleInfo(formData.role).description}</p>
                  </div>
                </div>
              )}

              {/* Full Name for Sign Up */}
              {isSignUp && (
                <div>
                  <Label htmlFor="fullName">Full Name *</Label>
                  <Input
                    id="fullName"
                    value={formData.fullName}
                    onChange={(e) => handleInputChange('fullName', e.target.value)}
                    placeholder="Enter your full name"
                    required
                  />
                </div>
              )}

              {/* Email */}
              <div>
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="Enter your email"
                  required
                />
              </div>

              {/* Password */}
              <div>
                <Label htmlFor="password">Password *</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    placeholder="Enter your password"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
                {isSignUp && (
                  <p className="text-xs text-gray-500 mt-1">Minimum 6 characters</p>
                )}
              </div>

              {/* Service Category for Provider Sign Up */}
              {isSignUp && formData.role === 'provider' && (
                <div>
                  <Label htmlFor="providerCategory">Service Category *</Label>
                  <Select
                    value={formData.providerCategory}
                    onValueChange={(value) => handleInputChange('providerCategory', value)}
                    disabled={categoriesLoading}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select your service category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.filter(cat => cat.is_active).map((category) => (
                        <SelectItem key={category.id} value={category.name}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-gray-500 mt-1">
                    Choose the primary service category you'll provide
                  </p>
                </div>
              )}

              {/* Location for Sign Up */}
              {isSignUp && (
                <div>
                  <Label htmlFor="location">Location *</Label>
                  <Select
                    value={formData.location}
                    onValueChange={(value) => handleInputChange('location', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select your location" />
                    </SelectTrigger>
                    <SelectContent>
                      {NAMIBIAN_TOWNS.map((town) => (
                        <SelectItem key={town.value} value={town.value}>
                          {town.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Phone for Sign Up */}
              {isSignUp && (
                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    placeholder="+264 XX XXX XXXX"
                  />
                </div>
              )}

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Please wait...' : (isSignUp ? 'Create Account' : 'Sign In')}
              </Button>
            </form>

            {/* Forgot Password Link */}
            {!isSignUp && (
              <div className="mt-4 text-center">
                <Button
                  variant="link"
                  className="text-purple-600"
                  onClick={() => navigate('/auth/forgot-password')}
                >
                  Forgot your password?
                </Button>
              </div>
            )}

            {/* Toggle Sign In/Up */}
            <div className="mt-6 text-center">
              <p className="text-gray-600">
                {isSignUp ? 'Already have an account?' : "Don't have an account?"}
                <Button
                  variant="link"
                  className="p-0 ml-1 text-purple-600"
                  onClick={() => {
                    setIsSignUp(!isSignUp);
                    setAuthError(null);
                  }}
                >
                  {isSignUp ? 'Sign In' : 'Sign Up'}
                </Button>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Auth;
