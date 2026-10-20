import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { z } from "zod";
import { verifySignedReviewToken } from "./review-token";

const reviewSubmissionSchema = z.object({
  token: z.string().min(1).max(512),
  language: z.enum(["en", "fr", "ar"]),
  author: z.string().trim().min(2).max(80),
  origin: z.string().trim().max(100),
  quote: z.string().trim().min(10).max(2000),
  rating: z.number().int().min(1).max(5),
  honeypot: z.string().max(200),
});

function marrakeshToday(): string {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Africa/Casablanca",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${values["year"]}-${values["month"]}-${values["day"]}`;
}

export const submitGuestReview = createServerFn({ method: "POST" })
  .validator(reviewSubmissionSchema)
  .handler(async ({ data }) => {
    if (data.honeypot) throw new Error("Unable to accept this review.");
    const request = getRequest();
    const clientIp = request.headers.get("cf-connecting-ip");
    const rateLimitSecret = process.env["PUBLIC_FORM_RATE_LIMIT_SECRET"];
    if (!clientIp || !rateLimitSecret || rateLimitSecret.length < 32) {
      throw new Error("Guest review submissions are temporarily unavailable.");
    }
    const rateKey = await crypto.subtle.importKey(
      "raw",
      new TextEncoder().encode(rateLimitSecret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"],
    );
    const rateDigest = await crypto.subtle.sign(
      "HMAC",
      rateKey,
      new TextEncoder().encode(clientIp),
    );
    const ipHash = Array.from(new Uint8Array(rateDigest), (byte) =>
      byte.toString(16).padStart(2, "0"),
    ).join("");
    const secret = process.env["REVIEW_TOKEN_SECRET"]?.trim() ?? "";
    if (secret.length < 32) throw new Error("Guest review submissions are not configured.");
    const token = await verifySignedReviewToken(data.token, secret);
    if (!token || token.language !== data.language) {
      throw new Error("This review link is invalid or has expired.");
    }

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const rateLimit = await supabaseAdmin.rpc("consume_public_form_rate_limit", {
      p_ip_hash: ipHash,
    });
    if (rateLimit.error) throw new Error("Unable to verify the review request limit.");
    if (!rateLimit.data) throw new Error("Too many review attempts. Please try again later.");
    const bookingResult = await supabaseAdmin
      .from("bookings")
      .select("id,experience_id,date,status")
      .eq("id", token.bookingId)
      .maybeSingle();
    if (bookingResult.error) throw new Error("Unable to verify this review invitation.");
    const booking = bookingResult.data;
    if (!booking || booking.status !== "confirmed" || booking.date >= marrakeshToday()) {
      throw new Error("This review invitation is not available for this booking.");
    }

    const quote = { en: "", fr: "", ar: "" };
    quote[data.language] = data.quote;
    const result = await supabaseAdmin.from("reviews").insert({
      booking_id: booking.id,
      experience_id: booking.experience_id,
      author: data.author,
      origin: data.origin,
      quote,
      rating: data.rating,
      language: data.language,
      approved: false,
    });
    if (result.error) {
      if (result.error.code === "23505") {
        throw new Error("A review has already been submitted for this booking.");
      }
      console.error("Guest review submission failed:", result.error.message);
      throw new Error("Unable to save this review. Please try again later.");
    }
    return { success: true, pendingApproval: true };
  });
