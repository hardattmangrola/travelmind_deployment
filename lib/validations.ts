import { z } from "zod";

const dateStringSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format");

export const tripIntentSchema = z
  .object({
    destination: z.string().min(2).max(120),
    description: z.string().max(1000).optional().default(""),
    country: z.string().max(80).optional().default(""),
    startDate: dateStringSchema.optional(),
    endDate: dateStringSchema.optional(),
    budget: z.number().positive().max(10_000_000).optional().default(50000),
    currency: z.string().min(1).max(5).toUpperCase().optional().default("INR"),
    travelers: z.number().int().min(1).max(20).optional().default(2),
    travelStyle: z.string().optional().default("balanced"),
    interests: z.array(z.string()).optional().default([]),
    budgetRange: z.string().optional(),
  });

export const searchQuerySchema = z.object({
  query: z.string().min(2).max(280),
  destination: z.string().min(2).max(120).optional(),
  city: z.string().min(2).max(120).optional(),
  category: z.string().min(2).max(60).optional(),
  dateFrom: dateStringSchema.optional(),
  dateTo: dateStringSchema.optional(),
  maxBudget: z.number().positive().optional(),
  travelers: z.number().int().min(1).max(20).optional(),
});

export const bookingSchema = z.object({
  itineraryId: z.string().min(10),
  userId: z.string().min(10),
  itemType: z.enum(["hotel", "activity", "event"]),
  itemId: z.string().min(2),
  amount: z.number().positive(),
  currency: z.string().length(3).toUpperCase(),
  startDate: dateStringSchema.optional(),
  endDate: dateStringSchema.optional(),
});

export const collaboratorInviteSchema = z.object({
  itineraryId: z.string().min(10),
  email: z.string().email(),
  role: z.enum(["editor", "viewer"]),
  message: z.string().max(300).optional(),
});

export const profileUpdateSchema = z.object({
  name: z.string().min(2).max(80),
  avatar: z.string().url().optional(),
  currencyPreference: z.string().length(3).toUpperCase(),
  bio: z.string().max(280).optional(),
});

export type TripIntentInput = z.infer<typeof tripIntentSchema>;
export type SearchQueryInput = z.infer<typeof searchQuerySchema>;
export type BookingInput = z.infer<typeof bookingSchema>;
export type CollaboratorInviteInput = z.infer<typeof collaboratorInviteSchema>;
export type ProfileUpdateInput = z.infer<typeof profileUpdateSchema>;
