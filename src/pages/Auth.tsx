import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Home, LogIn, UserPlus, User, Shield, Briefcase, Eye, EyeOff, AlertCircle, Mail, CheckCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { UserRole } from "@/types/auth";
import { useToast } from "@/hooks/use-toast";
import { PhoneValidation } from "@/components/profile/PhoneValidation";
import { supabase } from "@/integrations/supabase/client";

type AuthMode = 'login' | 'signup' | 'forgot-password' | 'admin-setup';

const Auth = () => {
  const [mode, setMode] = useState<AuthMode>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    role: 'client' as UserRole,
    rememberMe: false,
    companyName: '',
    companyPhone: ''
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [emailSent, setEmailSent] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  const { 
    user,
    login, 
    signup, 
    requestPasswordReset, 
    setupAdmin, 
    isLoading, 
    error, 
    needsAdminSetup, 
    isInitialized 
  } = useAuth();
  
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  // Get the intended destination from location state
  const from = location.state?.from?.pathname || '/';

  // Handle email verification and auth callbacks
  useEffect(() => {
    const handleEmailVerification = async () => {
      const hashFragment = window.location.hash;
      const searchParams = new URLSearchParams(window.location.search);
      
      console.log('Checking for verification params:', { hashFragment, search: window.location.search });
      
      // Check both hash fragment and search params for verification tokens
      if (hashFragment.includes('access_token') || hashFragment.includes('type=') || searchParams.has('type')) {
        setIsVerifying(true);
        
        try {
          // Parse the hash fragment or search params to get the tokens
          let params: URLSearchParams;
          
          if (hashFragment) {
            params = new URLSearchParams(hashFragment.substring(1));
          } else {
            params = searchParams;
          }
          
          const accessToken = params.get('access_token');
          const refreshToken = params.get('refresh_token');
          const type = params.get('type');
          
          console.log('Verification params:', { accessToken: !!accessToken, refreshToken: !!refreshToken, type });
          
          if (type === 'signup' || type === 'email_confirmation' || type === 'recovery') {
            if (accessToken && refreshToken) {
              // Set the session using the tokens
              const { data, error } = await supabase.auth.setSession({
                access_token: accessToken,
                refresh_token: refreshToken
              });
              
              if (error) {
                console.error('Email verification error:', error);
                toast({
                  title: "Verification Failed",
                  description: "There was an error verifying your email. Please try again.",
                  variant: "destructive",
                });
              } else {
                console.log('Email verified successfully:', data);
                setEmailVerified(true);
                
                // Clear the URL parameters
                window.history.replaceState(null, '', window.location.pathname);
                
                toast({
                  title: "Email Verified!",
                  description: "Your email has been verified successfully. You are now logged in.",
                });
                
                // Redirect after a short delay
                setTimeout(() => {
                  if (data.user) {
                    // User is now logged in, redirect based on role
                    const userRole = data.user.user_metadata?.role || 'client';
                    switch (userRole) {
                      case 'admin':
                        navigate('/dashboard/admin');
                        break;
                      case 'provider':
                        navigate('/dashboard/provider');
                        break;
                      case 'client':
                        navigate('/dashboard/client');
                        break;
                      default:
                        navigate('/');
                    }
                  }
                }, 1500);
              }
            } else {
              // Handle verification without direct tokens (let Supabase handle it)
              const { data, error } = await supabase.auth.getSession();
              if (data.session) {
                setEmailVerified(true);
                toast({
                  title: "Email Verified!",
                  description: "Your email has been verified successfully.",
                });
                
                setTimeout(() => {
                  const userRole = data.session?.user?.user_metadata?.role || 'client';
                  switch (userRole) {
                    case 'admin':
                      navigate('/dashboard/admin');
                      break;
                    case 'provider':
                      navigate('/dashboard/provider');
                      break;
                    case 'client':
                      navigate('/dashboard/client');
                      break;
                    default:
                      navigate('/');
                  }
                }, 1500);
              } else if (error) {
                console.error('Session error:', error);
                toast({
                  title: "Verification Error",
                  description: "Please try clicking the verification link again.",
                  variant: "destructive",
                });
              }
            }
          }
        } catch (error) {
          console.error('Error handling email verification:', error);
          toast({
            title: "Verification Error",
            description: "There was an error processing your email verification.",
            variant: "destructive",
          });
        } finally {
          setIsVerifying(false);
        }
      }
    };

    handleEmailVerification();
  }, [navigate, toast]);

  // Redirect if already authenticated
  useEffect(() => {
    if (user && isInitialized && !emailVerified && !isVerifying) {
      // Redirect based on user role
      switch (user.role) {
        case 'admin':
          navigate('/dashboard/admin');
          break;
        case 'provider':
          navigate('/dashboard/provider');
          break;
        case 'client':
          navigate('/dashboard/client');
          break;
        default:
          navigate(from);
      }
    }
  }, [user, isInitialized, navigate, from, emailVerified, isVerifying]);

  // Check if admin setup is needed
  useEffect(() => {
    if (isInitialized && needsAdminSetup && !emailVerified && !isVerifying) {
      setMode('admin-setup');
    }
  }, [isInitialized, needsAdminSetup, emailVerified, isVerifying]);

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
      } else if (mode === 'signup' || mode === 'admin-setup') {
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

      if ((mode === 'signup' || mode === 'admin-setup') && formData.password !== formData.confirmPassword) {
        errors.confirmPassword = 'Passwords do not match';
      }
    }

    if (mode === 'signup' || mode === 'admin-setup') {
      if (!formData.name) {
        errors.name = 'Name is required';
      }
      if (!formData.phone) {
        errors.phone = 'Phone is required';
      }
    }

    if (mode === 'admin-setup') {
      if (!formData.companyName) {
        errors.companyName = 'Company name is required';
      }
      if (!formData.companyPhone) {
        errors.companyPhone = 'Company phone is required';
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
        const success = await login({
          email: formData.email,
          password: formData.password,
          role: formData.role,
          rememberMe: formData.rememberMe
        });

        // Navigation is handled by the useEffect hook after successful login
      } else if (mode === 'signup') {
        const result = await signup({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          password: formData.password,
          confirmPassword: formData.confirmPassword,
          role: formData.role
        });

        if (result.success) {
          if (result.needsEmailVerification) {
            setEmailSent(true);
          } else {
            setMode('login');
          }
        }
      } else if (mode === 'forgot-password') {
        const success = await requestPasswordReset({ email: formData.email });
        
        if (success) {
          setEmailSent(true);
        }
      } else if (mode === 'admin-setup') {
        const success = await setupAdmin({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          password: formData.password,
          confirmPassword: formData.confirmPassword,
          companyName: formData.companyName,
          companyPhone: formData.companyPhone
        });

        if (success) {
          setEmailSent(true);
        }
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
      case 'admin': return <Shield className="w-4 h-4" />;
    }
  };

  const getTitle = () => {
    switch (mode) {
      case 'login': return 'Welcome Back';
      case 'signup': return 'Join Longa';
      case 'forgot-password': return 'Reset Password';
      case 'admin-setup': return 'Setup Your Platform';
    }
  };

  const getSubtitle = () => {
    switch (mode) {
      case 'login': return 'Sign in to your account';
      case 'signup': return 'Create your account to get started';
      case 'forgot-password': return 'Enter your email to receive reset instructions';
      case 'admin-setup': return 'Create the first admin account for your Longa platform';
    }
  };

  if (isVerifying) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
            <CardTitle className="text-xl font-bold text-gray-800">Verifying Email...</CardTitle>
            <p className="text-gray-600">
              Please wait while we verify your email address.
            </p>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (emailVerified) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <CardTitle className="text-xl font-bold text-gray-800">Email Verified!</CardTitle>
            <p className="text-gray-600">
              Your email has been successfully verified. You will be redirected shortly.
            </p>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (emailSent) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <Mail className="w-6 h-6 text-green-600" />
            </div>
            <CardTitle className="text-xl font-bold text-gray-800">Check Your Email</CardTitle>
            <p className="text-gray-600">
              {mode === 'signup' || mode === 'admin-setup'
                ? 'We sent you a verification link to complete your registration.'
                : 'We sent you a link to reset your password.'
              }
            </p>
          </CardHeader>
          <CardContent>
            <Button
              onClick={() => {
                setEmailSent(false);
                setMode('login');
              }}
              className="w-full"
              variant="outline"
            >
              Back to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      {/* Header */}
      {mode !== 'admin-setup' && (
        <div className="absolute top-6 left-6">
          <div className="flex items-center space-x-2 cursor-pointer" onClick={() => navigate('/')}>
            <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center border border-gray-200">
              <Home className="w-6 h-6 text-purple-600" />
            </div>
            <span className="text-2xl font-bold text-gray-800">Longa</span>
          </div>
        </div>
      )}

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
            <form onSubmit={handleSubmit} className="space-y-4">
              {(mode === 'signup' || mode === 'admin-setup') && (
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-gray-700">Full Name</Label>
                  <Input
                    id="name"
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className={`${formErrors.name ? 'border-red-500' : 'border-gray-300'} focus:border-purple-500`}
                    placeholder="Enter your full name"
                  />
                  {formErrors.name && <p className="text-sm text-red-500">{formErrors.name}</p>}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-700">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className={`${formErrors.email ? 'border-red-500' : 'border-gray-300'} focus:border-purple-500`}
                  placeholder="Enter your email"
                />
                {formErrors.email && <p className="text-sm text-red-500">{formErrors.email}</p>}
              </div>

              {(mode === 'signup' || mode === 'admin-setup') && (
                <PhoneValidation
                  value={formData.phone}
                  onChange={(value) => handleInputChange('phone', value)}
                  error={formErrors.phone}
                />
              )}

              {mode === 'admin-setup' && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="companyName" className="text-gray-700">Company Name</Label>
                    <Input
                      id="companyName"
                      type="text"
                      value={formData.companyName}
                      onChange={(e) => handleInputChange('companyName', e.target.value)}
                      className={`${formErrors.companyName ? 'border-red-500' : 'border-gray-300'} focus:border-purple-500`}
                      placeholder="Your company name"
                    />
                    {formErrors.companyName && <p className="text-sm text-red-500">{formErrors.companyName}</p>}
                  </div>

                  <PhoneValidation
                    value={formData.companyPhone}
                    onChange={(value) => handleInputChange('companyPhone', value)}
                    error={formErrors.companyPhone}
                    label="Company Phone"
                    placeholder="+264 61 234 5678"
                  />
                </>
              )}

              {mode !== 'forgot-password' && (
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-gray-700">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={(e) => handleInputChange('password', e.target.value)}
                      className={`${formErrors.password ? 'border-red-500' : 'border-gray-300'} focus:border-purple-500 pr-10`}
                      placeholder="Enter your password"
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
                  {(mode === 'signup' || mode === 'admin-setup') && (
                    <p className="text-xs text-gray-500">
                      Must be 8+ characters with uppercase, lowercase, numbers, and special characters
                    </p>
                  )}
                </div>
              )}

              {(mode === 'signup' || mode === 'admin-setup') && (
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-gray-700">Confirm Password</Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      value={formData.confirmPassword}
                      onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                      className={`${formErrors.confirmPassword ? 'border-red-500' : 'border-gray-300'} focus:border-purple-500 pr-10`}
                      placeholder="Confirm your password"
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

              {(mode === 'login' || mode === 'signup') && (
                <div className="space-y-2">
                  <Label className="text-gray-700">Role</Label>
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
                          <span className="text-xs font-medium capitalize">{role}</span>
                        </div>
                      </button>
                    ))}
                  </div>
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
                      {mode === 'admin-setup' && 'Setting Up Platform...'}
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    {mode === 'login' && <><LogIn className="w-4 h-4" /><span>Sign In</span></>}
                    {mode === 'signup' && <><UserPlus className="w-4 h-4" /><span>Create Account</span></>}
                    {mode === 'forgot-password' && <><Mail className="w-4 h-4" /><span>Send Reset Link</span></>}
                    {mode === 'admin-setup' && <><Shield className="w-4 h-4" /><span>Setup Platform</span></>}
                  </div>
                )}
              </Button>
            </form>

            {mode !== 'admin-setup' && (
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
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Auth;
