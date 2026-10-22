import { z } from "zod";

export const bookingRequestSchema = z
  .object({
    name: z.string().trim().min(2).max(100),
    email: z.string().trim().email().max(255),
    phone: z.string().trim().min(3).max(30),
    experienceId: z.string().trim().min(1).max(80),
    date: z.string().date(),
    adults: z.number().int().min(0).max(2147483647),
    children: z.number().int().min(0).max(2147483647),
    infants: z.number().int().min(0).max(2147483647),
    mealChoice: z.string().trim().max(200),
    privateGroup: z.boolean(),
    dietaryNeeds: z.string().trim().max(500),
    specialOccasion: z.enum(["", "birthday", "anniversary", "honeymoon"]),
    message: z.string().trim().max(1000).optional().default(""),
    language: z.enum(["en", "fr", "ar"]),
    honeypot: z.string().max(0),
  })
  .refine((booking) => booking.adults + booking.children + booking.infants >= 1, {
    message: "At least one guest is required.",
    path: ["adults"],
  })
  .refine((booking) => booking.adults + booking.children + booking.infants <= 2147483647, {
    message: "Guest count is too large.",
    path: ["adults"],
  })
  .refine((booking) => !booking.privateGroup || booking.adults + booking.children >= 6, {
    message: "Private groups require at least 6 guests.",
    path: ["adults"],
  });

export type BookingRequest = z.infer<typeof bookingRequestSchema>;
