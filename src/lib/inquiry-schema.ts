import { z } from "zod";

export const inquirySchema = z
  .object({
    kind: z.enum(["private_event", "gift", "partner"]),
    fullName: z.string().trim().min(2).max(100),
    email: z.string().trim().email().max(255),
    phone: z.string().trim().max(30),
    organization: z.string().trim().max(160),
    eventType: z.enum(["", "birthday", "group", "corporate_dinner"]),
    requestedDate: z.union([z.literal(""), z.string().date()]),
    guestCount: z.number().int().min(1).max(500).nullable(),
    quantity: z.number().int().min(1).max(100).nullable(),
    message: z.string().trim().min(1).max(2000),
    honeypot: z.string().max(0),
  })
  .superRefine((inquiry, context) => {
    if (inquiry.requestedDate && inquiry.requestedDate < new Date().toISOString().slice(0, 10)) {
      context.addIssue({
        code: "custom",
        message: "Requested date must be today or later.",
        path: ["requestedDate"],
      });
    }
    if (inquiry.kind === "private_event" && !inquiry.eventType) {
      context.addIssue({
        code: "custom",
        message: "Choose an event type.",
        path: ["eventType"],
      });
    }
    if (inquiry.kind === "partner" && !inquiry.organization.trim()) {
      context.addIssue({
        code: "custom",
        message: "Enter your organization.",
        path: ["organization"],
      });
    }
    if (inquiry.kind === "gift" && inquiry.quantity === null) {
      context.addIssue({
        code: "custom",
        message: "Enter a voucher quantity.",
        path: ["quantity"],
      });
    }
  });

export type InquiryRequest = z.infer<typeof inquirySchema>;
