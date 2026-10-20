import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { z } from "zod";
import { getClientIp } from "./client-ip";
import { bookingRequestSchema } from "./booking-schema";
import { filterAvailableBookingSlots } from "./booking-availability";

const currencySchema = z.string().regex(/^[A-Z]{3}$/);
const cancellationPolicySchema = z.object({
  en: z.string().trim().min(1),
  fr: z.string().trim().min(1),
  ar: z.string().trim().min(1),
});
const experienceSchema = z.object({
  id: z.string(),
  title: z.record(z.string(), z.string()),
  blurb: z.record(z.string(), z.string()),
  duration: z.record(z.string(), z.string()),
  price: z.number(),
  deposit_amount: z.number(),
  max_guests: z.number(),
  is_published: z.boolean(),
});

function localizedSetting(prefix: string): Record<"en" | "fr" | "ar", string> | null {
  const values = {
    en: process.env[`${prefix}_EN`]?.trim() ?? "",
    fr: process.env[`${prefix}_FR`]?.trim() ?? "",
    ar: process.env[`${prefix}_AR`]?.trim() ?? "",
  };
  return Object.values(values).every(Boolean) ? values : null;
}

export const getBookingOptions = createServerFn({ method: "GET" }).handler(async () => {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const today = new Date().toISOString().slice(0, 10);
  const [experienceResult, availabilityResult, settingsResult] = await Promise.all([
    supabaseAdmin
      .from("experiences")
      .select("id,title,blurb,duration,price,deposit_amount,max_guests,is_published")
      .eq("is_published", true)
      .order("id"),
    supabaseAdmin
      .from("availability")
      .select("id,date,experience_id,capacity,booked_count,status")
      .gte("date", today)
      .eq("status", "available")
      .order("date"),
    supabaseAdmin
      .from("site_settings")
      .select("setting_key,value")
      .in("setting_key", ["booking.currency", "booking.cancellation_policy"])
      .eq("is_public", true),
  ]);

  if (experienceResult.error) throw new Error("Unable to load published experiences.");
  if (availabilityResult.error) throw new Error("Unable to load availability.");
  if (settingsResult.error) throw new Error("Unable to load booking settings.");

  const experiences = z.array(experienceSchema).parse(experienceResult.data);
  const publishedIds = new Set(experiences.map((experience) => experience.id));
  const availability = filterAvailableBookingSlots(
    (availabilityResult.data ?? [])
      .filter(
        (slot) => publishedIds.has(slot.experience_id) && slot.capacity - slot.booked_count > 0,
      )
      .map((slot) => ({
        id: slot.id,
        date: slot.date,
        experienceId: slot.experience_id,
        remaining: slot.capacity - slot.booked_count,
      })),
    null,
    1,
    today,
    false,
  );

  const settings = new Map(
    (settingsResult.data ?? []).map((setting) => [setting.setting_key, setting.value]),
  );
  const currencyResult = currencySchema.safeParse(
    settings.has("booking.currency")
      ? settings.get("booking.currency")
      : process.env["BOOKING_CURRENCY"],
  );
  const policyResult = cancellationPolicySchema.safeParse(
    settings.get("booking.cancellation_policy"),
  );
  const whatsapp = process.env["OWNER_WHATSAPP_NUMBER"]?.replace(/\D/g, "") ?? "";

  return {
    experiences,
    availability,
    currency: currencyResult.success ? currencyResult.data : null,
    cancellationPolicy: policyResult.success
      ? policyResult.data
      : localizedSetting("CANCELLATION_POLICY"),
    whatsapp: whatsapp.length >= 8 && whatsapp !== "212600000000" ? whatsapp : null,
  };
});

export const submitBooking = createServerFn({ method: "POST" })
  .validator(bookingRequestSchema)
  .handler(async ({ data }) => {
    if (data.honeypot) throw new Error("Unable to process booking request.");
    if (data.privateGroup && data.guests < 6) {
      throw new Error("Private groups require at least 6 guests.");
    }

    const request = getRequest();
    const clientIp = getClientIp(request);
    const rateLimitSecret = process.env["BOOKING_RATE_LIMIT_SECRET"];
    if (!clientIp || !rateLimitSecret) {
      throw new Error("Booking requests are temporarily unavailable.");
    }

    const key = await crypto.subtle.importKey(
      "raw",
      new TextEncoder().encode(rateLimitSecret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"],
    );
    const digest = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(clientIp));
    const ipHash = Array.from(new Uint8Array(digest), (byte) =>
      byte.toString(16).padStart(2, "0"),
    ).join("");

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const rateLimit = await supabaseAdmin.rpc("consume_booking_rate_limit", {
      p_ip_hash: ipHash,
    });
    if (rateLimit.error) throw new Error("Unable to verify booking request limits.");
    if (!rateLimit.data) throw new Error("Too many booking requests. Please try again later.");

    const booking = await supabaseAdmin.rpc("book_experience_atomic", {
      p_name: data.name,
      p_email: data.email,
      p_phone: data.phone,
      p_experience_id: data.experienceId,
      p_date: data.date,
      p_guests: data.guests,
      p_dietary_needs: data.dietaryNeeds || null,
      p_language: data.language,
      p_special_occasion: data.specialOccasion || null,
      p_private_group: data.privateGroup,
    });
    if (booking.error) {
      console.error("Booking submission failed:", booking.error.message);
      throw new Error(
        "That date may no longer have enough space. Review availability and try again.",
      );
    }

    const result = z
      .object({
        success: z.literal(true),
        booking_id: z.string().uuid(),
        experience_id: z.string(),
        experience_title: z.record(z.string(), z.string()),
        date: z.string(),
        guests: z.number().int(),
        total_price: z.number(),
        status: z.literal("pending"),
      })
      .parse(booking.data);

    return result;
  });
