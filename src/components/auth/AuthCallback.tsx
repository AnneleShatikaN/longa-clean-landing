
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
        console.log('AuthCallback - Starting auth callback processing');
        console.log('AuthCallback - URL params:', {
          access_token: searchParams.get('access_token') ? 'present' : 'missing',
          refresh_token: searchParams.get('refresh_token') ? 'present' : 'missing',
          type: searchParams.get('type'),
          error: searchParams.get('error'),
          code: searchParams.get('code') ? 'present' : 'missing'
        });

        const accessToken = searchParams.get('access_token');
        const refreshToken = searchParams.get('refresh_token');
        const type = searchParams.get('type');
        const error = searchParams.get('error');
        const errorDescription = searchParams.get('error_description');
        const code = searchParams.get('code');

        // Handle errors first
        if (error) {
          console.error('AuthCallback - Error in URL params:', error, errorDescription);
          toast.error(errorDescription || 'Authentication failed');
          navigate('/auth');
          return;
        }

        // Handle different auth callback types
        if (type === 'recovery' && accessToken && refreshToken) {
          console.log('AuthCallback - Processing password recovery');
          // Password reset callback
          const { error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken
          });

          if (error) {
            console.error('AuthCallback - Password reset session error:', error);
            toast.error('Invalid reset link');
            navigate('/auth');
          } else {
            console.log('AuthCallback - Password reset successful');
            toast.success('You can now reset your password');
            navigate('/auth/reset-password');
          }
          return;
        }

        // Handle email verification or sign-in callbacks
        if (type === 'signup' || accessToken || code) {
          console.log('AuthCallback - Processing email verification/sign-in callback');
          
          // Try to set session with tokens if available
          if (accessToken && refreshToken) {
            console.log('AuthCallback - Setting session with tokens');
            const { error: sessionError } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken
            });

            if (sessionError) {
              console.error('AuthCallback - Session error:', sessionError);
              toast.error('Failed to verify email. Please try again.');
              navigate('/auth');
              return;
            }
          } else if (code) {
            // Try to exchange code for session
            console.log('AuthCallback - Exchanging code for session');
            const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(window.location.search);
            if (exchangeError) {
              console.error('AuthCallback - Code exchange error:', exchangeError);
              toast.error('Failed to verify email. Please try again.');
              navigate('/auth');
              return;
            }
          }

          // Get the current session to check user status
          console.log('AuthCallback - Checking current session after auth');
          const { data: { session }, error: sessionCheckError } = await supabase.auth.getSession();
          
          if (sessionCheckError) {
            console.error('AuthCallback - Session check error:', sessionCheckError);
            toast.error('Authentication failed');
            navigate('/auth');
            return;
          }

          console.log('AuthCallback - Session check result:', {
            hasSession: !!session,
            hasUser: !!session?.user,
            emailConfirmed: session?.user?.email_confirmed_at ? 'yes' : 'no',
            userEmail: session?.user?.email
          });

          if (session?.user) {
            if (session.user.email_confirmed_at) {
              console.log('AuthCallback - Email verified, fetching user profile and redirecting');
              toast.success('Email verified successfully! Welcome to Longa!');
              
              // Redirect based on user role
              try {
                const { data: userProfile, error: profileError } = await supabase
                  .from('users')
                  .select('role')
                  .eq('id', session.user.id)
                  .single();

                console.log('AuthCallback - User profile fetch result:', {
                  profile: userProfile,
                  error: profileError
                });

                if (profileError) {
                  console.error('AuthCallback - Error fetching user profile:', profileError);
                  // Default redirect if profile fetch fails
                  navigate('/');
                  return;
                }

                // Role-based redirect
                const role = userProfile?.role;
                console.log('AuthCallback - Redirecting based on role:', role);
                
                if (role === 'client') {
                  navigate('/client-dashboard');
                } else if (role === 'provider') {
                  navigate('/provider-dashboard');
                } else if (role === 'admin') {
                  navigate('/admin-dashboard');
                } else {
                  console.log('AuthCallback - Unknown role, redirecting to home');
                  navigate('/');
                }
              } catch (profileError) {
                console.error('AuthCallback - Error in profile fetch:', profileError);
                // Default redirect if profile fetch fails
                navigate('/');
              }
            } else {
              console.log('AuthCallback - Email not verified yet');
              toast.warning('Email verification pending. Please check your email.');
              navigate('/auth');
            }
          } else {
            console.log('AuthCallback - No user session found');
            toast.error('No user session found');
            navigate('/auth');
          }
        } else {
          // Default callback handling for other auth flows
          console.log('AuthCallback - Default callback handling');
          const { error } = await supabase.auth.exchangeCodeForSession(window.location.search);
          if (error) {
            console.error('AuthCallback - Default auth callback error:', error);
            toast.error('Authentication failed');
            navigate('/auth');
          } else {
            console.log('AuthCallback - Default auth callback successful');
            toast.success('Successfully authenticated!');
            navigate('/');
          }
        }
      } catch (error) {
        console.error('AuthCallback - Unexpected error:', error);
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
        <p className="text-sm text-gray-500 mt-2">Please wait while we verify your account</p>
      </div>
    </div>
  );
};
