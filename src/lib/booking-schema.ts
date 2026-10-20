import { z } from "zod";

export const bookingRequestSchema = z
  .object({
    name: z.string().trim().min(2).max(100),
    email: z.string().trim().email().max(255),
    phone: z.string().trim().min(3).max(30),
    experienceId: z.string().trim().min(1).max(80),
    date: z.string().date(),
    guests: z.number().int().min(1).max(12),
    privateGroup: z.boolean(),
    dietaryNeeds: z.string().trim().max(500),
    specialOccasion: z.enum(["", "birthday", "anniversary", "honeymoon"]),
    language: z.enum(["en", "fr", "ar"]),
    honeypot: z.string().max(0),
  })
  .refine((booking) => !booking.privateGroup || booking.guests >= 6, {
    message: "Private groups require at least 6 guests.",
    path: ["guests"],
  });

export type BookingRequest = z.infer<typeof bookingRequestSchema>;
