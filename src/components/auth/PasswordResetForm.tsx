
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { useAuthEnhanced } from '@/hooks/useAuthEnhanced';
import { useNavigate, useSearchParams } from 'react-router-dom';

export const PasswordResetForm = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { requestPasswordReset, resetPassword } = useAuthEnhanced();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: ''
  });

  const isResetMode = searchParams.has('access_token');

  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email) return;

    setIsLoading(true);
    try {
      await requestPasswordReset(formData.email);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.password || formData.password !== formData.confirmPassword) {
      return;
    }

    setIsLoading(true);
    try {
      await resetPassword(formData.password);
      navigate('/auth');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Button
            variant="ghost"
            className="absolute top-4 left-4"
            onClick={() => navigate('/auth')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Login
          </Button>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Longa</h1>
          <p className="text-gray-600">
            {isResetMode ? 'Set your new password' : 'Reset your password'}
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-center">
              {isResetMode ? 'New Password' : 'Forgot Password'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={isResetMode ? handlePasswordReset : handleRequestReset} className="space-y-4">
              {!isResetMode ? (
                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="Enter your email"
                    required
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    We'll send you a link to reset your password
                  </p>
                </div>
              ) : (
                <>
                  <div>
                    <Label htmlFor="password">New Password</Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        placeholder="Enter new password"
                        required
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="confirmPassword">Confirm New Password</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                      placeholder="Confirm new password"
                      required
                    />
                    {formData.password && formData.confirmPassword && 
                     formData.password !== formData.confirmPassword && (
                      <p className="text-sm text-red-500 mt-1">Passwords don't match</p>
                    )}
                  </div>
                </>
              )}

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800"
                disabled={isLoading || (isResetMode && formData.password !== formData.confirmPassword)}
              >
                {isLoading ? 'Please wait...' : (isResetMode ? 'Update Password' : 'Send Reset Link')}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
