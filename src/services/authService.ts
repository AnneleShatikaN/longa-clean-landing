import { supabase } from '@/integrations/supabase/client';
import { logSecurityEvent, detectSuspiciousActivity, checkRateLimit } from '@/utils/security';
import { LoginData, UserRegistration, PasswordReset, ChangePassword } from '@/schemas/validation';
import { fetchUserProfile } from '@/utils/userProfile';

// Note: This service is deprecated in favor of AuthContext.tsx
// Keeping minimal functionality for backward compatibility

export const loginUser = async (loginData: LoginData) => {
  // Redirect to use AuthContext instead
  console.warn('authService.loginUser is deprecated. Use AuthContext.signIn instead.');
  
  const rateLimitKey = `login_${loginData.email}`;
  if (!checkRateLimit(rateLimitKey, 5, 15 * 60 * 1000)) {
    throw new Error('Too many login attempts. Please try again later.');
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email: loginData.email,
    password: loginData.password,
  });

  if (error) throw error;

  if (data.user) {
    const profile = await fetchUserProfile(data.user.id);
    
    if (!profile) {
      throw new Error('User profile not found');
    }

    logSecurityEvent({
      type: 'login',
      userId: profile.id,
      details: { email: loginData.email, role: profile.role }
    });

    const suspiciousCheck = detectSuspiciousActivity({
      userId: profile.id,
      action: 'login',
      timestamp: Date.now(),
      metadata: { email: loginData.email }
    });

    if (suspiciousCheck.isSuspicious) {
      logSecurityEvent({
        type: 'suspicious_activity',
        userId: profile.id,
        details: { reasons: suspiciousCheck.reasons, action: 'login' }
      });
    }

    return true;
  }

  return false;
};

export const signupUser = async (userData: UserRegistration & { workLocation?: string }) => {
  console.warn('authService.signupUser is deprecated. Use AuthContext.signUp instead.');
  
  const { data: existingUser } = await supabase
    .from('users')
    .select('email')
    .eq('email', userData.email)
    .single();

  if (existingUser) {
    throw new Error('An account with this email already exists');
  }

  const { data, error } = await supabase.auth.signUp({
    email: userData.email,
    password: userData.password,
    options: {
      emailRedirectTo: `${window.location.origin}/auth/callback`,
      data: {
        full_name: userData.name,
        phone: userData.phone,
        role: userData.role,
        work_location: userData.workLocation
      }
    }
  });

  if (error) {
    console.error('Signup error:', error);
    throw error;
  }

  if (data.user) {
    return { success: true, needsEmailVerification: !data.session };
  }

  return { success: false, needsEmailVerification: false };
};

export const logoutUser = async (userId?: string, email?: string) => {
  if (userId) {
    logSecurityEvent({
      type: 'logout',
      userId: userId,
      details: { email: email }
    });
  }

  await supabase.auth.signOut();
};

export const requestPasswordResetService = async (data: PasswordReset) => {
  const { error } = await supabase.auth.resetPasswordForEmail(data.email, {
    redirectTo: `${window.location.origin}/auth/callback`
  });

  if (error) throw error;
  return true;
};

export const resetPasswordService = async (token: string, newPassword: string) => {
  const { error } = await supabase.auth.updateUser({
    password: newPassword
  });

  if (error) throw error;
  return true;
};

export const changePasswordService = async (data: ChangePassword) => {
  const { error } = await supabase.auth.updateUser({
    password: data.newPassword
  });

  if (error) throw error;
  return true;
};
