import { z } from "zod";

const dateStringSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format");

export const tripIntentSchema = z
  .object({
    destination: z.string().min(2).max(120),
    country: z.string().min(2).max(80),
    startDate: dateStringSchema,
    endDate: dateStringSchema,
    budget: z.number().positive().max(10_000_000),
    currency: z.string().length(3).toUpperCase(),
    travelers: z.number().int().min(1).max(20),
    travelStyle: z.enum(["relaxed", "adventure", "cultural", "luxury", "budget"]),
    interests: z.array(z.string().min(2)).min(1).max(12),
    budgetRange: z.enum(["under-10k", "10k-30k", "30k-60k", "60k-1L", "above-1L"]),
  })
  .refine((value) => new Date(value.endDate) >= new Date(value.startDate), {
    path: ["endDate"],
    message: "End date must be after start date",
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
