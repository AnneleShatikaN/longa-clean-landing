
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Home, LogIn, UserPlus, User, Shield, Briefcase, Eye, EyeOff } from "lucide-react";
import { useAuth, UserRole } from "@/contexts/AuthContext";

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    role: 'client' as UserRole,
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const { login, signup, isLoading, error } = useAuth();
  const navigate = useNavigate();

  const validateForm = () => {
    const errors: Record<string, string> = {};

    if (!formData.email) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Email is invalid';
    }

    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }

    if (!isLogin) {
      if (!formData.name) {
        errors.name = 'Name is required';
      }
      if (!formData.phone) {
        errors.phone = 'Phone is required';
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    const success = isLogin 
      ? await login(formData.email, formData.password, formData.role)
      : await signup(formData.name, formData.email, formData.phone, formData.password, formData.role);

    if (success) {
      navigate('/');
    }
  };

  const handleInputChange = (field: string, value: string) => {
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

  const demoCredentials = [
    { email: 'john@email.com', role: 'client', name: 'Client Demo' },
    { email: 'mary@email.com', role: 'provider', name: 'Provider Demo' },
    { email: 'admin@longa.com', role: 'admin', name: 'Admin Demo' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      {/* Header */}
      <div className="absolute top-6 left-6">
        <div className="flex items-center space-x-2 cursor-pointer" onClick={() => navigate('/')}>
          <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center border border-gray-200">
            <Home className="w-6 h-6 text-purple-600" />
          </div>
          <span className="text-2xl font-bold text-gray-800">Longa</span>
        </div>
      </div>

      <div className="w-full max-w-md space-y-6">
        {/* Main Auth Card */}
        <Card className="bg-white border-gray-200 shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-gray-800">
              {isLogin ? 'Welcome Back' : 'Join Longa'}
            </CardTitle>
            <p className="text-gray-600">
              {isLogin ? 'Sign in to your account' : 'Create your account to get started'}
            </p>
          </CardHeader>

          <CardContent className="space-y-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && (
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

              {!isLogin && (
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-gray-700">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className={`${formErrors.phone ? 'border-red-500' : 'border-gray-300'} focus:border-purple-500`}
                    placeholder="+264 81 234 5678"
                  />
                  {formErrors.phone && <p className="text-sm text-red-500">{formErrors.phone}</p>}
                </div>
              )}

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
              </div>

              <div className="space-y-2">
                <Label className="text-gray-700">Role</Label>
                <div className="grid grid-cols-3 gap-2">
                  {(['client', 'provider', 'admin'] as UserRole[]).map((role) => (
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

              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-200"
              >
                {isLoading ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>{isLogin ? 'Signing In...' : 'Creating Account...'}</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    {isLogin ? <LogIn className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
                    <span>{isLogin ? 'Sign In' : 'Create Account'}</span>
                  </div>
                )}
              </Button>
            </form>

            <div className="text-center">
              <button
                type="button"
                onClick={() => setIsLogin(!isLogin)}
                className="text-purple-600 hover:text-purple-700 font-medium transition-colors duration-200"
              >
                {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
              </button>
            </div>
          </CardContent>
        </Card>

        {/* Demo Credentials Card */}
        <Card className="bg-white border-gray-200">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-800 text-center">Demo Accounts</CardTitle>
            <p className="text-sm text-gray-600 text-center">Use these credentials for testing</p>
          </CardHeader>
          <CardContent className="space-y-3">
            {demoCredentials.map((demo, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  {getRoleIcon(demo.role as UserRole)}
                  <div>
                    <p className="font-medium text-gray-800">{demo.name}</p>
                    <p className="text-sm text-gray-600">{demo.email}</p>
                  </div>
                </div>
                <Badge variant="outline" className="text-xs bg-purple-50 text-purple-700 border-purple-200">
                  {demo.role}
                </Badge>
              </div>
            ))}
            <p className="text-xs text-gray-500 text-center mt-2">
              Password: Use any password (demo mode)
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Auth;
