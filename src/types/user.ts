
import { UserRole } from '@/types/auth';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  profilePicture?: string;
  address?: string;
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
  rating: number;
  jobsCompleted?: number;
  totalEarnings?: number;
  joinDate: string;
  lastActive: string;
  isEmailVerified: boolean;
  current_work_location?: string;
  // Location fields
  town?: string;
  suburb?: string;
  max_distance?: number;
  // Additional properties for database compatibility
  full_name: string;
  avatar_url: string | null;
  is_active: boolean;
  total_jobs: number;
  created_at: string;
  updated_at: string;
}

export interface UserContextType {
  users: UserProfile[];
  providers: UserProfile[];
  clients: UserProfile[];
  admins: UserProfile[];
  isLoading: boolean;
  error: string | null;
  fetchUsers: () => Promise<void>;
  updateUserStatus: (userId: string, status: 'active' | 'inactive' | 'pending') => Promise<void>;
  updateUserProfile: (userId: string, updates: Partial<UserProfile>) => Promise<void>;
  deleteUser: (userId: string) => Promise<void>;
  searchUsers: (query: string, role?: UserRole) => UserProfile[];
  getUserById: (userId: string) => UserProfile | undefined;
  getUsersByRole: (role: UserRole) => UserProfile[];
  getActiveProviders: () => UserProfile[];
}
