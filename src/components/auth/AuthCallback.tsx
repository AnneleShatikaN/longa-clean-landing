
import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const AuthCallback = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const handleAuthCallback = async () => {
      const accessToken = searchParams.get('access_token');
      const refreshToken = searchParams.get('refresh_token');
      const type = searchParams.get('type');

      if (type === 'recovery' && accessToken && refreshToken) {
        // Password reset callback
        const { error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken
        });

        if (error) {
          toast.error('Invalid reset link');
          navigate('/auth');
        } else {
          toast.success('You can now reset your password');
          navigate('/auth/reset-password');
        }
      } else if (type === 'signup') {
        // Email verification callback
        toast.success('Email verified successfully! You can now sign in.');
        navigate('/auth');
      } else {
        // Default callback handling
        const { error } = await supabase.auth.exchangeCodeForSession(window.location.search);
        if (error) {
          toast.error('Authentication failed');
          navigate('/auth');
        } else {
          toast.success('Successfully authenticated!');
          navigate('/');
        }
      }
    };

    handleAuthCallback();
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Processing authentication...</p>
      </div>
    </div>
  );
};
