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

    // Role verification removed - we trust the database role
    // The user will be redirected based on their actual role from the database

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

  // Sign up with Supabase Auth with email confirmation
  const { data, error } = await supabase.auth.signUp({
    email: userData.email,
    password: userData.password,
    options: {
      emailRedirectTo: `${window.location.origin}/auth/callback`,
      data: {
        full_name: userData.name,
        phone: userData.phone,
        role: userData.role
      }
    }
  });

  if (error) {
    console.error('Signup error:', error);
    throw error;
  }

  if (data.user) {
    // User needs to verify email before they can log in
    return { success: true, needsEmailVerification: true };
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
  const { error } = await supabase.auth.resetPasswordForEmail(data.email);

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
  try {
    console.log('Starting admin setup with data:', { email: data.email, name: data.name });
    
    // Create the admin user account with email confirmation
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
        data: {
          full_name: data.name,
          phone: data.phone,
          role: 'admin'
        }
      }
    });

    if (authError) {
      console.error('Auth signup error:', authError);
      throw new Error(`Authentication error: ${authError.message}`);
    }

    if (!authData.user) {
      throw new Error('Failed to create user account');
    }

    console.log('Auth user created:', authData.user.id);

    // Store company information in localStorage
    const companyData = {
      name: data.companyName,
      phone: data.companyPhone,
      adminId: authData.user.id,
      setupAt: new Date().toISOString()
    };
    
    if (typeof window !== 'undefined') {
      localStorage.setItem('company_setup', JSON.stringify(companyData));
      localStorage.setItem('admin_setup_completed', 'true');
    }

    // User needs to verify email before they can access the admin dashboard
    return true;
  } catch (error) {
    console.error('Admin setup failed:', error);
    throw error;
  }
};
