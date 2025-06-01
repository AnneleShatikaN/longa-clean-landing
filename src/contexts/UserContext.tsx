
import React, { createContext, useContext, useReducer, ReactNode, useEffect } from 'react';
import { UserRegistration, UserUpdate, LoginData, PasswordReset, ChangePassword, AdminSetup, userRegistrationSchema, userUpdateSchema, loginSchema, passwordResetSchema, changePasswordSchema, adminSetupSchema } from '@/schemas/validation';

export type UserRole = 'client' | 'provider' | 'admin';

export interface User {
  id: number;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  rating?: number;
  status: 'active' | 'inactive' | 'pending';
  available?: boolean;
  bankMobileNumber?: string;
  paymentMethod?: 'bank_transfer' | 'mobile_money';
  totalEarnings?: number;
  jobsCompleted?: number;
  responseRate?: number;
  joinDate: string;
  lastActive: string;
  createdAt: string;
  updatedAt: string;
  profilePicture?: string;
  address?: string;
  preferences?: Record<string, any>;
  servicesOffered?: string[];
  availability?: Record<string, any>;
  bankDetails?: {
    accountNumber?: string;
    bankName?: string;
    accountHolder?: string;
  };
  isEmailVerified: boolean;
  loginAttempts: number;
  lockedUntil?: string;
  passwordResetToken?: string;
  passwordResetExpires?: string;
}

interface UserState {
  users: User[];
  currentUser: User | null;
  isLoading: boolean;
  error: string | null;
  isInitialized: boolean;
  needsAdminSetup: boolean;
  rememberMe: boolean;
}

type UserAction = 
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_CURRENT_USER'; payload: User | null }
  | { type: 'ADD_USER'; payload: User }
  | { type: 'UPDATE_USER'; payload: { id: number; updates: Partial<User> } }
  | { type: 'DELETE_USER'; payload: number }
  | { type: 'SET_USERS'; payload: User[] }
  | { type: 'SET_INITIALIZED'; payload: boolean }
  | { type: 'SET_NEEDS_ADMIN_SETUP'; payload: boolean }
  | { type: 'SET_REMEMBER_ME'; payload: boolean };

const initialState: UserState = {
  users: [],
  currentUser: null,
  isLoading: false,
  error: null,
  isInitialized: false,
  needsAdminSetup: true,
  rememberMe: false
};

function userReducer(state: UserState, action: UserAction): UserState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload, isLoading: false };
    case 'SET_CURRENT_USER':
      return { ...state, currentUser: action.payload };
    case 'ADD_USER':
      return { ...state, users: [...state.users, action.payload] };
    case 'UPDATE_USER':
      return {
        ...state,
        users: state.users.map(user =>
          user.id === action.payload.id ? { ...user, ...action.payload.updates, updatedAt: new Date().toISOString() } : user
        ),
        currentUser: state.currentUser?.id === action.payload.id 
          ? { ...state.currentUser, ...action.payload.updates, updatedAt: new Date().toISOString() }
          : state.currentUser
      };
    case 'DELETE_USER':
      return {
        ...state,
        users: state.users.filter(user => user.id !== action.payload),
        currentUser: state.currentUser?.id === action.payload ? null : state.currentUser
      };
    case 'SET_USERS':
      return { ...state, users: action.payload };
    case 'SET_INITIALIZED':
      return { ...state, isInitialized: action.payload };
    case 'SET_NEEDS_ADMIN_SETUP':
      return { ...state, needsAdminSetup: action.payload };
    case 'SET_REMEMBER_ME':
      return { ...state, rememberMe: action.payload };
    default:
      return state;
  }
}

interface UserContextType extends UserState {
  registerUser: (userData: UserRegistration) => Promise<{ user: User; needsEmailVerification: boolean }>;
  loginUser: (loginData: LoginData) => Promise<User>;
  logoutUser: () => void;
  updateUser: (id: number, updates: UserUpdate) => Promise<void>;
  deleteUser: (id: number) => Promise<void>;
  getUserById: (id: number) => User | undefined;
  getUsersByRole: (role: UserRole) => User[];
  verifyEmail: (userId: number, token: string) => Promise<void>;
  requestPasswordReset: (data: PasswordReset) => Promise<void>;
  resetPassword: (token: string, newPassword: string) => Promise<void>;
  changePassword: (userId: number, data: ChangePassword) => Promise<void>;
  setupAdmin: (data: AdminSetup) => Promise<User>;
  checkInitialization: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(userReducer, initialState);

  // Check if system needs initialization
  useEffect(() => {
    const savedUsers = localStorage.getItem('longa_users');
    const savedCurrentUser = localStorage.getItem('longa_current_user');
    const rememberMe = localStorage.getItem('longa_remember_me') === 'true';

    if (savedUsers) {
      const users = JSON.parse(savedUsers);
      dispatch({ type: 'SET_USERS', payload: users });
      
      // Check if there are any admin users
      const hasAdmin = users.some((user: User) => user.role === 'admin');
      dispatch({ type: 'SET_NEEDS_ADMIN_SETUP', payload: !hasAdmin });
    }

    if (savedCurrentUser && rememberMe) {
      const currentUser = JSON.parse(savedCurrentUser);
      dispatch({ type: 'SET_CURRENT_USER', payload: currentUser });
    }

    dispatch({ type: 'SET_REMEMBER_ME', payload: rememberMe });
    dispatch({ type: 'SET_INITIALIZED', payload: true });
  }, []);

  // Save to localStorage when users change
  useEffect(() => {
    if (state.isInitialized) {
      localStorage.setItem('longa_users', JSON.stringify(state.users));
    }
  }, [state.users, state.isInitialized]);

  // Save current user to localStorage
  useEffect(() => {
    if (state.isInitialized) {
      if (state.currentUser && state.rememberMe) {
        localStorage.setItem('longa_current_user', JSON.stringify(state.currentUser));
      } else {
        localStorage.removeItem('longa_current_user');
      }
    }
  }, [state.currentUser, state.rememberMe, state.isInitialized]);

  const registerUser = async (userData: UserRegistration): Promise<{ user: User; needsEmailVerification: boolean }> => {
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });

    try {
      const validatedData = userRegistrationSchema.parse(userData);
      
      // Check if email already exists
      const existingUser = state.users.find(user => user.email === validatedData.email);
      if (existingUser) {
        throw new Error('Email already registered');
      }

      // Check if phone already exists
      const existingPhone = state.users.find(user => user.phone === validatedData.phone);
      if (existingPhone) {
        throw new Error('Phone number already registered');
      }

      await new Promise(resolve => setTimeout(resolve, 1000));

      const newUser: User = {
        id: Date.now(),
        name: validatedData.name,
        email: validatedData.email,
        phone: validatedData.phone,
        role: validatedData.role,
        status: validatedData.role === 'provider' ? 'pending' : 'active',
        joinDate: new Date().toISOString().split('T')[0],
        lastActive: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isEmailVerified: false,
        loginAttempts: 0
      };

      dispatch({ type: 'ADD_USER', payload: newUser });
      dispatch({ type: 'SET_LOADING', payload: false });
      
      return { user: newUser, needsEmailVerification: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Registration failed';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      throw error;
    }
  };

  const loginUser = async (loginData: LoginData): Promise<User> => {
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });

    try {
      const validatedData = loginSchema.parse(loginData);
      await new Promise(resolve => setTimeout(resolve, 1000));

      const user = state.users.find(u => u.email === validatedData.email && u.role === validatedData.role);
      if (!user) {
        throw new Error('Invalid email or role');
      }

      // Check if account is locked
      if (user.lockedUntil && new Date(user.lockedUntil) > new Date()) {
        throw new Error('Account is temporarily locked due to multiple failed login attempts');
      }

      // Check if email is verified
      if (!user.isEmailVerified) {
        throw new Error('Please verify your email before logging in');
      }

      if (user.status === 'inactive') {
        throw new Error('Account is deactivated');
      }

      if (user.status === 'pending' && user.role === 'provider') {
        throw new Error('Account is pending approval');
      }

      // Simulate password check (in real app, this would be properly hashed)
      // For demo purposes, we'll assume password is correct
      
      // Reset login attempts on successful login
      dispatch({ 
        type: 'UPDATE_USER', 
        payload: { 
          id: user.id, 
          updates: { 
            lastActive: new Date().toISOString(),
            loginAttempts: 0,
            lockedUntil: undefined
          }
        }
      });

      dispatch({ type: 'SET_CURRENT_USER', payload: user });
      dispatch({ type: 'SET_REMEMBER_ME', payload: validatedData.rememberMe || false });
      localStorage.setItem('longa_remember_me', String(validatedData.rememberMe || false));
      dispatch({ type: 'SET_LOADING', payload: false });
      
      return user;
    } catch (error) {
      // Increment login attempts on failed login
      const user = state.users.find(u => u.email === loginData.email && u.role === loginData.role);
      if (user) {
        const newAttempts = (user.loginAttempts || 0) + 1;
        const updates: Partial<User> = { loginAttempts: newAttempts };
        
        // Lock account after 5 failed attempts for 30 minutes
        if (newAttempts >= 5) {
          updates.lockedUntil = new Date(Date.now() + 30 * 60 * 1000).toISOString();
        }
        
        dispatch({ type: 'UPDATE_USER', payload: { id: user.id, updates } });
      }

      const errorMessage = error instanceof Error ? error.message : 'Login failed';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      throw error;
    }
  };

  const logoutUser = () => {
    dispatch({ type: 'SET_CURRENT_USER', payload: null });
    dispatch({ type: 'SET_ERROR', payload: null });
    localStorage.removeItem('longa_current_user');
  };

  const verifyEmail = async (userId: number, token: string): Promise<void> => {
    dispatch({ type: 'SET_LOADING', payload: true });
    
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // In real app, would verify token against backend
      dispatch({ 
        type: 'UPDATE_USER', 
        payload: { id: userId, updates: { isEmailVerified: true } }
      });
      
      dispatch({ type: 'SET_LOADING', payload: false });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Email verification failed';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      throw error;
    }
  };

  const requestPasswordReset = async (data: PasswordReset): Promise<void> => {
    dispatch({ type: 'SET_LOADING', payload: true });
    
    try {
      const validatedData = passwordResetSchema.parse(data);
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const user = state.users.find(u => u.email === validatedData.email);
      if (user) {
        const resetToken = Math.random().toString(36).substring(2, 15);
        const resetExpires = new Date(Date.now() + 60 * 60 * 1000).toISOString(); // 1 hour
        
        dispatch({ 
          type: 'UPDATE_USER', 
          payload: { 
            id: user.id, 
            updates: { 
              passwordResetToken: resetToken,
              passwordResetExpires: resetExpires
            }
          }
        });
      }
      
      dispatch({ type: 'SET_LOADING', payload: false });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Password reset request failed';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      throw error;
    }
  };

  const resetPassword = async (token: string, newPassword: string): Promise<void> => {
    dispatch({ type: 'SET_LOADING', payload: true });
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const user = state.users.find(u => 
        u.passwordResetToken === token && 
        u.passwordResetExpires && 
        new Date(u.passwordResetExpires) > new Date()
      );
      
      if (!user) {
        throw new Error('Invalid or expired reset token');
      }
      
      dispatch({ 
        type: 'UPDATE_USER', 
        payload: { 
          id: user.id, 
          updates: { 
            passwordResetToken: undefined,
            passwordResetExpires: undefined,
            loginAttempts: 0,
            lockedUntil: undefined
          }
        }
      });
      
      dispatch({ type: 'SET_LOADING', payload: false });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Password reset failed';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      throw error;
    }
  };

  const changePassword = async (userId: number, data: ChangePassword): Promise<void> => {
    dispatch({ type: 'SET_LOADING', payload: true });
    
    try {
      const validatedData = changePasswordSchema.parse(data);
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // In real app, would verify current password
      dispatch({ type: 'UPDATE_USER', payload: { id: userId, updates: {} } });
      dispatch({ type: 'SET_LOADING', payload: false });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Password change failed';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      throw error;
    }
  };

  const setupAdmin = async (data: AdminSetup): Promise<User> => {
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });

    try {
      const validatedData = adminSetupSchema.parse(data);
      await new Promise(resolve => setTimeout(resolve, 1000));

      const adminUser: User = {
        id: Date.now(),
        name: validatedData.name,
        email: validatedData.email,
        phone: validatedData.phone,
        role: 'admin',
        status: 'active',
        joinDate: new Date().toISOString().split('T')[0],
        lastActive: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isEmailVerified: true,
        loginAttempts: 0
      };

      dispatch({ type: 'ADD_USER', payload: adminUser });
      dispatch({ type: 'SET_NEEDS_ADMIN_SETUP', payload: false });
      dispatch({ type: 'SET_LOADING', payload: false });
      
      return adminUser;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Admin setup failed';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      throw error;
    }
  };

  const updateUser = async (id: number, updates: UserUpdate): Promise<void> => {
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });

    try {
      const validatedUpdates = userUpdateSchema.parse(updates);
      await new Promise(resolve => setTimeout(resolve, 500));

      dispatch({ type: 'UPDATE_USER', payload: { id, updates: validatedUpdates } });
      dispatch({ type: 'SET_LOADING', payload: false });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Update failed';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      throw error;
    }
  };

  const deleteUser = async (id: number): Promise<void> => {
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });

    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      dispatch({ type: 'DELETE_USER', payload: id });
      dispatch({ type: 'SET_LOADING', payload: false });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Delete failed';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      throw error;
    }
  };

  const getUserById = (id: number): User | undefined => {
    return state.users.find(user => user.id === id);
  };

  const getUsersByRole = (role: UserRole): User[] => {
    return state.users.filter(user => user.role === role);
  };

  const checkInitialization = () => {
    const hasAdmin = state.users.some(user => user.role === 'admin');
    dispatch({ type: 'SET_NEEDS_ADMIN_SETUP', payload: !hasAdmin });
  };

  const value: UserContextType = {
    ...state,
    registerUser,
    loginUser,
    logoutUser,
    updateUser,
    deleteUser,
    getUserById,
    getUsersByRole,
    verifyEmail,
    requestPasswordReset,
    resetPassword,
    changePassword,
    setupAdmin,
    checkInitialization
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};

export const useUsers = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUsers must be used within a UserProvider');
  }
  return context;
};
