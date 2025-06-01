
import { z } from 'zod';

// Enhanced password validation
const passwordSchema = z.string()
  .min(8, 'Password must be at least 8 characters')
  .max(100, 'Password too long')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/\d/, 'Password must contain at least one number')
  .regex(/[^a-zA-Z0-9]/, 'Password must contain at least one special character');

// User validation schemas
export const userRegistrationSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(50, 'Name must be less than 50 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().regex(/^\+264\s\d{2}\s\d{3}\s\d{4}$/, 'Phone must be in format +264 XX XXX XXXX'),
  password: passwordSchema,
  confirmPassword: z.string(),
  role: z.enum(['client', 'provider', 'admin'])
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export const userUpdateSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(50, 'Name must be less than 50 characters').optional(),
  email: z.string().email('Invalid email address').optional(),
  phone: z.string().regex(/^\+264\s\d{2}\s\d{3}\s\d{4}$/, 'Phone must be in format +264 XX XXX XXXX').optional(),
  rating: z.number().min(1).max(5).optional(),
  status: z.enum(['active', 'inactive', 'pending']).optional(),
  available: z.boolean().optional(),
  bankMobileNumber: z.string().optional(),
  paymentMethod: z.enum(['bank_transfer', 'mobile_money']).optional(),
  profilePicture: z.string().optional(),
  address: z.string().optional(),
  preferences: z.record(z.any()).optional(),
  servicesOffered: z.array(z.string()).optional(),
  availability: z.record(z.any()).optional(),
  bankDetails: z.object({
    accountNumber: z.string(),
    bankName: z.string(),
    accountHolder: z.string()
  }).optional()
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
  role: z.enum(['client', 'provider', 'admin']),
  rememberMe: z.boolean().optional()
});

export const passwordResetSchema = z.object({
  email: z.string().email('Invalid email address')
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: passwordSchema,
  confirmPassword: z.string()
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export const adminSetupSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().regex(/^\+264\s\d{2}\s\d{3}\s\d{4}$/, 'Phone must be in format +264 XX XXX XXXX'),
  password: passwordSchema,
  confirmPassword: z.string(),
  companyName: z.string().min(2, 'Company name is required'),
  companyPhone: z.string().regex(/^\+264\s\d{2}\s\d{3}\s\d{4}$/, 'Company phone must be in format +264 XX XXX XXXX')
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

// Service validation schemas
export const serviceSchema = z.object({
  name: z.string().min(3, 'Service name must be at least 3 characters').max(100, 'Service name too long'),
  type: z.enum(['one-off', 'subscription']),
  clientPrice: z.number().min(50, 'Price must be at least N$50').max(10000, 'Price cannot exceed N$10,000'),
  providerFee: z.number().optional(),
  commissionPercentage: z.number().min(5, 'Commission must be at least 5%').max(30, 'Commission cannot exceed 30%').optional(),
  duration: z.object({
    hours: z.number().min(0).max(24),
    minutes: z.number().min(0).max(59)
  }),
  status: z.enum(['active', 'inactive']),
  tags: z.array(z.string()).min(1, 'At least one tag is required'),
  description: z.string().min(10, 'Description must be at least 10 characters').max(500, 'Description too long'),
  requirements: z.array(z.string()).optional()
});

// Booking validation schemas
export const bookingSchema = z.object({
  clientId: z.number().positive(),
  providerId: z.number().positive(),
  serviceId: z.number().positive(),
  date: z.string().refine((date) => {
    const bookingDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return bookingDate >= today;
  }, 'Booking date must be today or in the future'),
  time: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Time must be in HH:MM format'),
  duration: z.number().positive(),
  amount: z.number().positive(),
  jobType: z.enum(['one-off', 'subscription'])
});

export const bookingUpdateSchema = z.object({
  status: z.enum(['pending', 'accepted', 'in-progress', 'completed', 'cancelled']),
  completionDate: z.string().optional(),
  rating: z.number().min(1).max(5).optional(),
  reviewComment: z.string().max(500).optional()
});

// Payout validation schemas
export const payoutSchema = z.object({
  providerId: z.number().positive(),
  bookingIds: z.array(z.number().positive()).min(1, 'At least one booking is required'),
  totalEarnings: z.number().positive(),
  commission: z.number().min(0),
  netPayout: z.number().positive(),
  paymentMethod: z.enum(['bank_transfer', 'mobile_money', 'cash']),
  type: z.enum(['weekly_auto', 'manual', 'instant'])
});

export type UserRegistration = z.infer<typeof userRegistrationSchema>;
export type UserUpdate = z.infer<typeof userUpdateSchema>;
export type LoginData = z.infer<typeof loginSchema>;
export type PasswordReset = z.infer<typeof passwordResetSchema>;
export type ChangePassword = z.infer<typeof changePasswordSchema>;
export type AdminSetup = z.infer<typeof adminSetupSchema>;
export type ServiceData = z.infer<typeof serviceSchema>;
export type BookingData = z.infer<typeof bookingSchema>;
export type BookingUpdate = z.infer<typeof bookingUpdateSchema>;
export type PayoutData = z.infer<typeof payoutSchema>;
