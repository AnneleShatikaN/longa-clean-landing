
import { z } from 'zod';

// User validation schemas
export const userRegistrationSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(50, 'Name must be less than 50 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().regex(/^\+264\s\d{2}\s\d{3}\s\d{4}$/, 'Phone must be in format +264 XX XXX XXXX'),
  password: z.string().min(8, 'Password must be at least 8 characters').max(100, 'Password too long'),
  role: z.enum(['client', 'provider', 'admin'])
});

export const userUpdateSchema = userRegistrationSchema.partial();

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
export type ServiceData = z.infer<typeof serviceSchema>;
export type BookingData = z.infer<typeof bookingSchema>;
export type BookingUpdate = z.infer<typeof bookingUpdateSchema>;
export type PayoutData = z.infer<typeof payoutSchema>;
