
import { Session } from '@supabase/supabase-js';

export type UserRole = 'client' | 'provider' | 'admin';

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  name: string;
  phone: string | null;
  role: UserRole;
  avatar_url: string | null;
  is_active: boolean;
  rating: number;
  total_jobs: number;
  created_at: string;
  updated_at: string;
  // Additional properties for compatibility
  address?: string;
  profilePicture?: string;
  bankMobileNumber?: string;
  paymentMethod?: 'bank_transfer' | 'mobile_money';
  bankDetails?: {
    accountNumber?: string;
    bankName?: string;
    accountHolder?: string;
  };
  servicesOffered?: string[];
  available?: boolean;
  status: 'active' | 'inactive' | 'pending';
  jobsCompleted?: number;
  totalEarnings?: number;
  joinDate: string;
  lastActive: string;
  isEmailVerified: boolean;
}

export interface AuthContextType {
  user: UserProfile | null;
  session: Session | null;
  isLoading: boolean;
  error: string | null;
  isInitialized: boolean;
  needsAdminSetup: boolean;
  login: (loginData: any) => Promise<boolean>;
  signup: (userData: any) => Promise<{ success: boolean; needsEmailVerification: boolean }>;
  logout: () => Promise<void>;
  requestPasswordReset: (data: any) => Promise<boolean>;
  resetPassword: (token: string, newPassword: string) => Promise<boolean>;
  changePassword: (data: any) => Promise<boolean>;
  verifyEmail: (userId: string, token: string) => Promise<boolean>;
  setupAdmin: (data: any) => Promise<boolean>;
}
