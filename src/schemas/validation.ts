
import { z } from 'zod';
import { validateNamibianPhone } from '@/utils/locationUtils';

// Service schemas
export const serviceSchema = z.object({
  id: z.string().optional(), // Changed from z.number() to z.string() to match Service interface
  name: z.string().min(1, "Service name is required"),
  description: z.string().min(1, "Description is required"),
  clientPrice: z.number().min(50, "Minimum price is NAD 50").max(5000, "Maximum price is NAD 5000"),
  providerPrice: z.number().optional(),
  providerFee: z.number().optional(),
  commissionPercentage: z.number().min(0, "Commission must be 0% or higher").max(100, "Commission cannot exceed 100%").optional(),
  duration: z.object({
    hours: z.number().min(0).max(8),
    minutes: z.number().min(0).max(59)
  }).optional(),
  type: z.enum(['one-off', 'subscription']),
  status: z.enum(['active', 'inactive']),
  tags: z.string().array().optional(),
  requirements: z.string().array().optional(),
  averageRating: z.number().optional(),
  totalBookings: z.number().optional(),
  popularity: z.number().optional(),
  coverageAreas: z.string().array().optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
  categoryId: z.string().min(1, "Service category is required"),
});

// Location schemas
export const locationSchema = z.object({
  street: z.string().min(1, "Street address is required"),
  suburb: z.string().optional(),
  city: z.enum(['Windhoek', 'Walvis Bay', 'Swakopmund'], {
    errorMap: () => ({ message: "Please select a valid Namibian city" })
  }),
  district: z.string().min(1, "District is required"),
  postalCode: z.string().regex(/^\d{5}$/, "Postal code must be 5 digits").optional(),
  coordinates: z.object({
    lat: z.number(),
    lng: z.number()
  }).optional()
});

// User schemas with Namibian validations
export const userRegistrationSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().refine(validateNamibianPhone, {
    message: "Please provide a valid Namibian phone number (+264)"
  }),
  role: z.enum(['client', 'provider', 'admin']),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string(),
  location: locationSchema.optional()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"]
});

export const userUpdateSchema = z.object({
  name: z.string().min(2).optional(),
  email: z.string().email().optional(),
  phone: z.string().refine((phone) => !phone || validateNamibianPhone(phone), {
    message: "Please provide a valid Namibian phone number (+264)"
  }).optional(),
  status: z.enum(['active', 'inactive', 'pending']).optional(),
  available: z.boolean().optional(),
  bankMobileNumber: z.string().optional(),
  paymentMethod: z.enum(['bank_transfer', 'mobile_money']).optional(),
  profilePicture: z.string().optional(),
  address: z.string().optional(),
  servicesOffered: z.string().array().optional(),
  location: locationSchema.optional(),
  serviceRadius: z.number().min(1).max(50).optional(), // kilometers
  travelRate: z.number().min(0).optional(), // NAD per km
  bankDetails: z.object({
    accountNumber: z.string().optional(),
    bankName: z.string().optional(),
    accountHolder: z.string().optional()
  }).optional()
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
  role: z.enum(['client', 'provider', 'admin']).optional(), // Made optional
  rememberMe: z.boolean().optional()
});

export const passwordResetSchema = z.object({
  email: z.string().email("Invalid email address")
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(8, "New password must be at least 8 characters"),
  confirmPassword: z.string()
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"]
});

export const adminSetupSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().refine(validateNamibianPhone, {
    message: "Please provide a valid Namibian phone number (+264)"
  }),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string(),
  companyName: z.string().min(1, "Company name is required").optional(),
  companyPhone: z.string().refine((phone) => !phone || validateNamibianPhone(phone), {
    message: "Please provide a valid Namibian phone number (+264)"
  }).optional()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"]
});

// Booking schemas with location
export const bookingSchema = z.object({
  clientId: z.number(),
  providerId: z.number(), 
  serviceId: z.number(),
  date: z.string(),
  time: z.string(),
  amount: z.number(),
  jobType: z.enum(['one-off', 'subscription']),
  duration: z.number().optional(),
  emergencyBooking: z.boolean().optional(),
  location: locationSchema.optional(),
  travelDistance: z.number().optional(), // kilometers
  travelCost: z.number().optional() // NAD
});

export const bookingUpdateSchema = z.object({
  status: z.enum(['pending', 'accepted', 'in-progress', 'completed', 'cancelled']).optional(),
  rating: z.number().min(1).max(5).optional(),
  reviewComment: z.string().optional(),
  completionDate: z.string().optional(),
  progressPhotos: z.array(z.string()).optional(),
  qualityScore: z.number().min(1).max(10).optional()
});

// Payout schemas
export const payoutSchema = z.object({
  id: z.number().optional(),
  providerId: z.number(),
  amount: z.number().min(0),
  method: z.enum(['bank_transfer', 'mobile_money']),
  status: z.enum(['pending', 'processing', 'completed', 'failed']),
  transactionId: z.string().optional(),
  processedAt: z.string().optional(),
  createdAt: z.string().optional(),
  bookingIds: z.array(z.number()).optional(),
  totalEarnings: z.number().optional(),
  commission: z.number().optional(),
  netPayout: z.number().optional(),
  paymentMethod: z.enum(['bank_transfer', 'mobile_money', 'cash']).optional(),
  type: z.enum(['weekly_auto', 'manual', 'instant']).optional(),
  taxWithheld: z.number().optional(),
  namraTaxReference: z.string().optional() // Namibian tax reference
});

// Type exports
export type Service = z.infer<typeof serviceSchema>;
export type ServiceData = z.infer<typeof serviceSchema>;
export type Location = z.infer<typeof locationSchema>;
export type User = z.infer<typeof userRegistrationSchema>;
export type UserRegistration = z.infer<typeof userRegistrationSchema>;
export type UserUpdate = z.infer<typeof userUpdateSchema>;
export type LoginData = z.infer<typeof loginSchema>;
export type PasswordReset = z.infer<typeof passwordResetSchema>;
export type ChangePassword = z.infer<typeof changePasswordSchema>;
export type AdminSetup = z.infer<typeof adminSetupSchema>;
export type BookingData = z.infer<typeof bookingSchema>;
export type BookingUpdate = z.infer<typeof bookingUpdateSchema>;
export type PayoutData = z.infer<typeof payoutSchema>;
