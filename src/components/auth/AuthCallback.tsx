
import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const AuthCallback = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        const accessToken = searchParams.get('access_token');
        const refreshToken = searchParams.get('refresh_token');
        const type = searchParams.get('type');
        const error = searchParams.get('error');
        const errorDescription = searchParams.get('error_description');

        // Handle errors first
        if (error) {
          console.error('Auth callback error:', error, errorDescription);
          toast.error(errorDescription || 'Authentication failed');
          navigate('/auth');
          return;
        }

        if (type === 'recovery' && accessToken && refreshToken) {
          // Password reset callback
          const { error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken
          });

          if (error) {
            console.error('Password reset session error:', error);
            toast.error('Invalid reset link');
            navigate('/auth');
          } else {
            toast.success('You can now reset your password');
            navigate('/auth/reset-password');
          }
        } else if (type === 'signup' || searchParams.has('access_token')) {
          // Email verification callback - handle both explicit signup type and implicit verification
          console.log('Processing email verification callback');
          
          if (accessToken && refreshToken) {
            // Set the session with the tokens
            const { error: sessionError } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken
            });

            if (sessionError) {
              console.error('Session error:', sessionError);
              toast.error('Failed to verify email. Please try again.');
              navigate('/auth');
              return;
            }
          }

          // Try to exchange the code for session if no tokens
          if (!accessToken || !refreshToken) {
            const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(window.location.search);
            if (exchangeError) {
              console.error('Code exchange error:', exchangeError);
              toast.error('Failed to verify email. Please try again.');
              navigate('/auth');
              return;
            }
          }

          // Get the current session to check verification status
          const { data: { session }, error: sessionCheckError } = await supabase.auth.getSession();
          
          if (sessionCheckError) {
            console.error('Session check error:', sessionCheckError);
            toast.error('Authentication failed');
            navigate('/auth');
            return;
          }

          if (session?.user) {
            if (session.user.email_confirmed_at) {
              toast.success('Email verified successfully! Welcome to Longa!');
              
              // Redirect based on user role
              try {
                const { data: userProfile } = await supabase
                  .from('users')
                  .select('role')
                  .eq('id', session.user.id)
                  .single();

                if (userProfile?.role === 'client') {
                  navigate('/client-dashboard');
                } else if (userProfile?.role === 'provider') {
                  navigate('/provider-dashboard');
                } else if (userProfile?.role === 'admin') {
                  navigate('/admin-dashboard');
                } else {
                  navigate('/');
                }
              } catch (profileError) {
                console.error('Error fetching user profile:', profileError);
                // Default redirect if profile fetch fails
                navigate('/');
              }
            } else {
              toast.warning('Email verification pending. Please check your email.');
              navigate('/auth');
            }
          } else {
            toast.error('No user session found');
            navigate('/auth');
          }
        } else {
          // Default callback handling for other auth flows
          const { error } = await supabase.auth.exchangeCodeForSession(window.location.search);
          if (error) {
            console.error('Default auth callback error:', error);
            toast.error('Authentication failed');
            navigate('/auth');
          } else {
            toast.success('Successfully authenticated!');
            navigate('/');
          }
        }
      } catch (error) {
        console.error('Auth callback error:', error);
        toast.error('Authentication failed. Please try again.');
        navigate('/auth');
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
