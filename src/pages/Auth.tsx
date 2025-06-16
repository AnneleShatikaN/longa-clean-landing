
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Home, LogIn, UserPlus, User, Briefcase, Eye, EyeOff, AlertCircle, MapPin, CheckCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { UserRole } from "@/types/auth";
import { useToast } from "@/hooks/use-toast";
import { PhoneValidation } from "@/components/profile/PhoneValidation";
import { EmailVerificationPrompt } from "@/components/auth/EmailVerificationPrompt";

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

type AuthMode = 'login' | 'signup' | 'forgot-password';

const Auth = () => {
  const [mode, setMode] = useState<AuthMode>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showEmailVerification, setShowEmailVerification] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    role: 'client' as UserRole,
    workLocation: 'windhoek',
    rememberMe: false
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const { 
    user,
    login, 
    signup, 
    requestPasswordReset, 
    isLoading, 
    error, 
    isInitialized 
  } = useAuth();
  
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  console.log('Auth component state:', { user, isLoading, isInitialized, error });

  // Get the intended destination from location state
  const from = location.state?.from?.pathname || '/';

  // Redirect if already authenticated
  useEffect(() => {
    if (user && isInitialized) {
      console.log('🔀 User authenticated, redirecting...', user.role);
      const redirectPath = user.role === 'admin' ? '/dashboard/admin'
        : user.role === 'provider' ? '/dashboard/provider'
        : '/dashboard/client';
      
      navigate(redirectPath, { replace: true });
    }
  }, [user, isInitialized, navigate]);

  const validateForm = () => {
    const errors: Record<string, string> = {};

    if (!formData.email) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Email is invalid';
    }

    if (mode !== 'forgot-password') {
      if (!formData.password) {
        errors.password = 'Password is required';
      } else if (mode === 'signup') {
        if (formData.password.length < 8) {
          errors.password = 'Password must be at least 8 characters';
        } else if (!/[a-z]/.test(formData.password)) {
          errors.password = 'Password must contain lowercase letters';
        } else if (!/[A-Z]/.test(formData.password)) {
          errors.password = 'Password must contain uppercase letters';
        } else if (!/\d/.test(formData.password)) {
          errors.password = 'Password must contain numbers';
        } else if (!/[^a-zA-Z0-9]/.test(formData.password)) {
          errors.password = 'Password must contain special characters';
        }
      }

      if (mode === 'signup' && formData.password !== formData.confirmPassword) {
        errors.confirmPassword = 'Passwords do not match';
      }
    }

    if (mode === 'signup') {
      if (!formData.name) {
        errors.name = 'Name is required';
      }
      if (!formData.phone) {
        errors.phone = 'Phone is required';
      }
      if (formData.role === 'provider' && !formData.workLocation) {
        errors.workLocation = 'Work location is required for providers';
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      if (mode === 'login') {
        console.log('🔑 Attempting login with:', formData.email);
        const success = await login({
          email: formData.email,
          password: formData.password,
          rememberMe: formData.rememberMe
        });
        
        if (success) {
          console.log('✅ Login successful');
        }
      } else if (mode === 'signup') {
        const result = await signup({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          password: formData.password,
          confirmPassword: formData.confirmPassword,
          role: formData.role,
          workLocation: formData.role === 'provider' ? formData.workLocation : undefined
        });

        if (result.success) {
          // Show success message for all signups
          setShowSuccessMessage(true);
          
          // Show email verification prompt for provider signups
          if (formData.role === 'provider') {
            setTimeout(() => {
              setShowSuccessMessage(false);
              setShowEmailVerification(true);
            }, 3000);
          } else {
            // For clients, show success and switch to login after a delay
            setTimeout(() => {
              setShowSuccessMessage(false);
              setMode('login');
            }, 4000);
          }
        }
      } else if (mode === 'forgot-password') {
        await requestPasswordReset({ email: formData.email });
      }
    } catch (err) {
      console.error('Auth error:', err);
    }
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const getRoleIcon = (role: UserRole) => {
    switch (role) {
      case 'client': return <User className="w-4 h-4" />;
      case 'provider': return <Briefcase className="w-4 h-4" />;
      case 'admin': return null; // Admin role is no longer available
    }
  };

  const getTitle = () => {
    switch (mode) {
      case 'login': return 'Welcome Back';
      case 'signup': return 'Join Longa';
      case 'forgot-password': return 'Reset Password';
    }
  };

  const getSubtitle = () => {
    switch (mode) {
      case 'login': return 'Sign in to your account';
      case 'signup': return 'Create your account to get started';
      case 'forgot-password': return 'Enter your email to receive reset instructions';
    }
  };

  // Show simple loading while auth is initializing - but with timeout
  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <Card className="bg-white border-gray-200 shadow-lg">
            <CardContent className="text-center py-8">
              <div className="flex flex-col items-center space-y-4">
                <div className="w-8 h-8 border-2 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-gray-600">Initializing...</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <EmailVerificationPrompt
        isOpen={showEmailVerification}
        onClose={() => {
          setShowEmailVerification(false);
          setMode('login');
        }}
        email={formData.email}
      />

      {/* Success Message Alert */}
      {showSuccessMessage && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-md px-4">
          <Alert className="bg-green-50 border-green-200 text-green-800">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="font-medium">
              🎉 Success! Please check your email to verify your account before logging in.
            </AlertDescription>
          </Alert>
        </div>
      )}

      {/* Header */}
      <div className="absolute top-6 left-6">
        <div className="flex items-center space-x-2 cursor-pointer" onClick={() => navigate('/')}>
          <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center border border-gray-200">
            <Home className="w-6 h-6 text-purple-600" />
          </div>
          <span className="text-2xl font-bold text-gray-800">Longa</span>
        </div>
      </div>

      <div className="w-full max-w-md">
        <Card className="bg-white border-gray-200 shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-gray-800">
              {getTitle()}
            </CardTitle>
            <p className="text-gray-600">
              {getSubtitle()}
            </p>
          </CardHeader>

          <CardContent className="space-y-4">
            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              {mode === 'signup' && (
                <div className="space-y-2">
                  <Label htmlFor={`name-${mode}`} className="text-gray-700">Full Name</Label>
                  <Input
                    id={`name-${mode}`}
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className={`${formErrors.name ? 'border-red-500' : 'border-gray-300'} focus:border-purple-500`}
                    placeholder="Enter your full name"
                    autoComplete="name"
                  />
                  {formErrors.name && <p className="text-sm text-red-500">{formErrors.name}</p>}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor={`email-${mode}`} className="text-gray-700">Email</Label>
                <Input
                  id={`email-${mode}`}
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className={`${formErrors.email ? 'border-red-500' : 'border-gray-300'} focus:border-purple-500`}
                  placeholder="Enter your email"
                  autoComplete="email"
                />
                {formErrors.email && <p className="text-sm text-red-500">{formErrors.email}</p>}
              </div>

              {mode === 'signup' && (
                <PhoneValidation
                  value={formData.phone}
                  onChange={(value) => handleInputChange('phone', value)}
                  error={formErrors.phone}
                />
              )}

              {mode !== 'forgot-password' && (
                <div className="space-y-2">
                  <Label htmlFor={`password-${mode}`} className="text-gray-700">Password</Label>
                  <div className="relative">
                    <Input
                      id={`password-${mode}`}
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={(e) => handleInputChange('password', e.target.value)}
                      className={`${formErrors.password ? 'border-red-500' : 'border-gray-300'} focus:border-purple-500 pr-10`}
                      placeholder="Enter your password"
                      autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {formErrors.password && <p className="text-sm text-red-500">{formErrors.password}</p>}
                  {mode === 'signup' && (
                    <p className="text-xs text-gray-500">
                      Must be 8+ characters with uppercase, lowercase, numbers, and special characters
                    </p>
                  )}
                </div>
              )}

              {mode === 'signup' && (
                <div className="space-y-2">
                  <Label htmlFor={`confirmPassword-${mode}`} className="text-gray-700">Confirm Password</Label>
                  <div className="relative">
                    <Input
                      id={`confirmPassword-${mode}`}
                      type={showConfirmPassword ? "text" : "password"}
                      value={formData.confirmPassword}
                      onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                      className={`${formErrors.confirmPassword ? 'border-red-500' : 'border-gray-300'} focus:border-purple-500 pr-10`}
                      placeholder="Confirm your password"
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {formErrors.confirmPassword && <p className="text-sm text-red-500">{formErrors.confirmPassword}</p>}
                </div>
              )}

              {/* Role selection only for signup - Admin removed */}
              {mode === 'signup' && (
                <div className="space-y-2">
                  <Label className="text-gray-700">I want to</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {(['client', 'provider'] as UserRole[]).map((role) => (
                      <button
                        key={role}
                        type="button"
                        onClick={() => handleInputChange('role', role)}
                        className={`p-3 rounded-lg border-2 transition-all duration-200 ${
                          formData.role === role
                            ? 'border-purple-500 bg-purple-50 text-purple-700'
                            : 'border-gray-200 hover:border-gray-300 text-gray-600'
                        }`}
                      >
                        <div className="flex flex-col items-center space-y-1">
                          {getRoleIcon(role)}
                          <span className="text-xs font-medium">
                            {role === 'client' ? 'Book Services' : 'Provide Services'}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Work Location for Provider signup */}
              {mode === 'signup' && formData.role === 'provider' && (
                <div className="space-y-2">
                  <Label className="text-gray-700 flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    Work Location
                  </Label>
                  <Select
                    value={formData.workLocation}
                    onValueChange={(value) => handleInputChange('workLocation', value)}
                  >
                    <SelectTrigger className={`${formErrors.workLocation ? 'border-red-500' : 'border-gray-300'} focus:border-purple-500`}>
                      <SelectValue placeholder="Select your primary work location" />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      {NAMIBIAN_TOWNS.map((town) => (
                        <SelectItem key={town.value} value={town.value}>
                          {town.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {formErrors.workLocation && <p className="text-sm text-red-500">{formErrors.workLocation}</p>}
                  <p className="text-xs text-gray-500">
                    You can change this later in your profile settings.
                  </p>
                </div>
              )}

              {mode === 'login' && (
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="rememberMe"
                    checked={formData.rememberMe}
                    onCheckedChange={(checked) => handleInputChange('rememberMe', checked as boolean)}
                  />
                  <Label htmlFor="rememberMe" className="text-sm text-gray-700">
                    Remember me
                  </Label>
                </div>
              )}

              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-200"
              >
                {isLoading ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>
                      {mode === 'login' && 'Signing In...'}
                      {mode === 'signup' && 'Creating Account...'}
                      {mode === 'forgot-password' && 'Sending Reset Link...'}
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    {mode === 'login' && <><LogIn className="w-4 h-4" /><span>Sign In</span></>}
                    {mode === 'signup' && <><UserPlus className="w-4 h-4" /><span>Create Account</span></>}
                    {mode === 'forgot-password' && <><span>Send Reset Link</span></>}
                  </div>
                )}
              </Button>
            </form>

            <div className="space-y-2 text-center">
              {mode === 'login' && (
                <>
                  <button
                    type="button"
                    onClick={() => setMode('signup')}
                    className="text-purple-600 hover:text-purple-700 font-medium transition-colors duration-200 text-sm"
                  >
                    Don't have an account? Sign up
                  </button>
                  <br />
                  <button
                    type="button"
                    onClick={() => setMode('forgot-password')}
                    className="text-gray-600 hover:text-gray-700 font-medium transition-colors duration-200 text-sm"
                  >
                    Forgot your password?
                  </button>
                </>
              )}
              {mode === 'signup' && (
                <button
                  type="button"
                  onClick={() => setMode('login')}
                  className="text-purple-600 hover:text-purple-700 font-medium transition-colors duration-200 text-sm"
                >
                  Already have an account? Sign in
                </button>
              )}
              {mode === 'forgot-password' && (
                <button
                  type="button"
                  onClick={() => setMode('login')}
                  className="text-purple-600 hover:text-purple-700 font-medium transition-colors duration-200 text-sm"
                >
                  Back to Login
                </button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Auth;
