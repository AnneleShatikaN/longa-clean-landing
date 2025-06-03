import { supabase } from '@/integrations/supabase/client';
import { logSecurityEvent, detectSuspiciousActivity, checkRateLimit } from '@/utils/security';
import { LoginData, UserRegistration, PasswordReset, ChangePassword, AdminSetup } from '@/schemas/validation';
import { fetchUserProfile } from '@/utils/userProfile';

export const loginUser = async (loginData: LoginData) => {
  // Check rate limiting
  const rateLimitKey = `login_${loginData.email}`;
  if (!checkRateLimit(rateLimitKey, 5, 15 * 60 * 1000)) {
    logSecurityEvent({
      type: 'failed_login',
      details: { email: loginData.email, reason: 'rate_limited' }
    });
    throw new Error('Too many login attempts. Please try again later.');
  }

  // Clean up any existing session
  await supabase.auth.signOut();

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

    // Verify role matches if specified
    if (loginData.role && profile.role !== loginData.role) {
      await supabase.auth.signOut();
      throw new Error(`Access denied. This account is not registered as a ${loginData.role}.`);
    }

    // Log successful login
    logSecurityEvent({
      type: 'login',
      userId: profile.id,
      details: { email: loginData.email, role: profile.role }
    });

    // Check for suspicious activity
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

export const signupUser = async (userData: UserRegistration) => {
  // Check if email already exists
  const { data: existingUser } = await supabase
    .from('users')
    .select('email')
    .eq('email', userData.email)
    .single();

  if (existingUser) {
    throw new Error('An account with this email already exists');
  }

  // Sign up with Supabase Auth
  const { data, error } = await supabase.auth.signUp({
    email: userData.email,
    password: userData.password,
    options: {
      emailRedirectTo: `${window.location.origin}/auth`,
    }
  });

  if (error) throw error;

  if (data.user) {
    // Insert user profile into our users table
    const { error: profileError } = await supabase
      .from('users')
      .insert({
        id: data.user.id,
        email: userData.email,
        password_hash: 'managed_by_supabase_auth',
        full_name: userData.name,
        phone: userData.phone,
        role: userData.role,
        is_active: true,
        rating: 0,
        total_jobs: 0,
      });

    if (profileError) {
      // If profile creation fails, clean up the auth user
      console.error('Profile creation failed:', profileError);
      throw new Error('Failed to create user profile');
    }

    // Log new user registration
    logSecurityEvent({
      type: 'login',
      userId: data.user.id,
      details: { 
        action: 'registration',
        email: userData.email, 
        role: userData.role 
      }
    });

    const needsEmailVerification = !data.session;
    return { success: true, needsEmailVerification };
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
    redirectTo: `${window.location.origin}/auth`,
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

export const setupAdminService = async (data: AdminSetup) => {
  // First create the admin user account
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email: data.email,
    password: data.password,
    options: {
      emailRedirectTo: `${window.location.origin}/dashboard/admin`,
    }
  });

  if (authError) throw authError;

  if (authData.user) {
    // Insert admin profile
    const { error: profileError } = await supabase
      .from('users')
      .insert({
        id: authData.user.id,
        email: data.email,
        password_hash: 'managed_by_supabase_auth',
        full_name: data.name,
        phone: data.phone,
        role: 'admin',
        is_active: true,
        rating: 0,
        total_jobs: 0,
      });

    if (profileError) throw profileError;
    return true;
  }

  return false;
};
