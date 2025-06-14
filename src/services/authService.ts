
import { supabase } from '@/integrations/supabase/client';
import { logSecurityEvent, detectSuspiciousActivity, checkRateLimit } from '@/utils/security';
import { LoginData, UserRegistration, PasswordReset, ChangePassword, AdminSetup } from '@/schemas/validation';
import { fetchUserProfile } from '@/utils/userProfile';

// Get the correct redirect URL based on environment
const getRedirectUrl = () => {
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return `${window.location.origin}/auth`;
    }
    // For deployed versions, use the actual domain
    return `${window.location.origin}/auth`;
  }
  return 'https://longa.vercel.app/auth';
};

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
      emailRedirectTo: getRedirectUrl(),
    }
  });

  if (error) {
    console.error('Signup error:', error);
    throw error;
  }

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
    redirectTo: getRedirectUrl(),
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
  try {
    console.log('Starting admin setup with data:', { email: data.email, name: data.name });
    
    // First create the admin user account with auto-confirm
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        emailRedirectTo: getRedirectUrl(),
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

    // Wait a moment for auth to be fully set up
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Create admin profile using the service role (bypassing RLS)
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

    if (profileError) {
      console.error('Profile creation error:', profileError);
      
      // Try to clean up the auth user if profile creation fails
      try {
        await supabase.auth.admin.deleteUser(authData.user.id);
      } catch (cleanupError) {
        console.error('Failed to cleanup auth user:', cleanupError);
      }
      
      throw new Error(`Profile creation failed: ${profileError.message}. Please check your database permissions.`);
    }

    console.log('Admin profile created successfully');

    // Store company information in localStorage for now
    const companyData = {
      name: data.companyName,
      phone: data.companyPhone,
      adminId: authData.user.id,
      setupAt: new Date().toISOString()
    };
    
    if (typeof window !== 'undefined') {
      localStorage.setItem('company_setup', JSON.stringify(companyData));
    }

    return true;
  } catch (error) {
    console.error('Admin setup failed:', error);
    throw error;
  }
};
