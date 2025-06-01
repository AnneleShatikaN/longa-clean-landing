import { z } from 'zod';

export const serviceSchema = z.object({
  id: z.number(),
  name: z.string(),
  description: z.string(),
  clientPrice: z.number(),
  providerPrice: z.number(),
  duration: z.object({
    hours: z.number(),
    minutes: z.number()
  }),
  type: z.enum(['one-off', 'subscription']),
  status: z.enum(['active', 'inactive']),
  tags: z.string().array().optional(),
  averageRating: z.number().optional(),
  totalBookings: z.number().optional(),
  createdAt: z.string(),
  updatedAt: z.string()
});

export const userSchema = z.object({
  id: z.number(),
  name: z.string(),
  email: z.string().email(),
  role: z.enum(['client', 'provider', 'admin']),
  status: z.enum(['active', 'inactive']),
  createdAt: z.string(),
  updatedAt: z.string()
});

export const bookingSchema = z.object({
  clientId: z.number(),
  providerId: z.number(), 
  serviceId: z.number(),
  date: z.string(),
  time: z.string(),
  amount: z.number(),
  jobType: z.enum(['one-off', 'subscription']),
  duration: z.number().optional(),
  emergencyBooking: z.boolean().optional()
});

export const bookingUpdateSchema = z.object({
  status: z.enum(['pending', 'accepted', 'in-progress', 'completed', 'cancelled']).optional(),
  rating: z.number().min(1).max(5).optional(),
  reviewComment: z.string().optional(),
  completionDate: z.string().optional(),
  progressPhotos: z.array(z.string()).optional(),
  qualityScore: z.number().min(1).max(10).optional()
});

export type Service = z.infer<typeof serviceSchema>;
export type User = z.infer<typeof userSchema>;
export type BookingData = z.infer<typeof bookingSchema>;
export type BookingUpdate = z.infer<typeof bookingUpdateSchema>;
