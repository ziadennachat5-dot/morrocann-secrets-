import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { z } from "zod";
import { getClientIp } from "./client-ip";
import { bookingRequestSchema } from "./booking-schema";
import { filterAvailableBookingSlots } from "./booking-availability";
import { parseCancellationTiers } from "./booking-pricing";

const currencySchema = z.string().regex(/^[A-Z]{3}$/);
const localizedSchema = z.object({
  en: z.string().trim().min(1),
  fr: z.string(),
  ar: z.string(),
});
const experienceSchema = z.object({
  id: z.string(),
  title: localizedSchema,
  blurb: localizedSchema,
  duration: localizedSchema,
  price: z.number(),
  child_price: z.number().nullable(),
  child_age_min: z.number().int().nullable(),
  child_age_max: z.number().int().nullable(),
  min_guests: z.number().int().nullable(),
  deposit_amount: z.number(),
  max_guests: z.number().int(),
  start_time: z.string().nullable(),
  meal_options: z.array(localizedSchema),
  why_love: z.array(localizedSchema),
  what_to_expect: localizedSchema.nullable(),
  what_to_remember: localizedSchema.nullable(),
  host_languages: localizedSchema.nullable(),
  is_published: z.boolean(),
});

function readLocalized(value: unknown) {
  const result = localizedSchema.safeParse(value);
  return result.success ? result.data : null;
}

export const getBookingOptions = createServerFn({ method: "GET" }).handler(async () => {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const today = new Date().toISOString().slice(0, 10);
  const [experienceResult, availabilityResult, settingsResult] = await Promise.all([
    supabaseAdmin
      .from("experiences")
      .select(
        "id,title,blurb,duration,price,child_price,child_age_min,child_age_max,min_guests,deposit_amount,max_guests,start_time,meal_options,why_love,what_to_expect,what_to_remember,host_languages,is_published",
      )
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
      .in("setting_key", ["booking.currency", "booking.cancellation_tiers", "trust.meeting_area"])
      .eq("is_public", true),
  ]);

  if (experienceResult.error) throw new Error("Unable to load published experiences.");
  if (availabilityResult.error) throw new Error("Unable to load availability.");
  if (settingsResult.error) throw new Error("Unable to load booking settings.");

  const experiences = z.array(experienceSchema).parse(experienceResult.data);
  const publishedIds = new Set(
    experiences
      .filter((experience) => experience.start_time !== null && experience.min_guests !== null)
      .map((experience) => experience.id),
  );
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
  const cancellationTiers = parseCancellationTiers(settings.get("booking.cancellation_tiers"));
  const whatsapp = process.env["OWNER_WHATSAPP_NUMBER"]?.replace(/\D/g, "") ?? "";

  return {
    experiences: experiences.filter(
      (experience) => experience.start_time !== null && experience.min_guests !== null,
    ),
    availability,
    currency: currencyResult.success ? currencyResult.data : null,
    cancellationTiers,
    meetingArea: readLocalized(settings.get("trust.meeting_area")),
    whatsapp: whatsapp.length >= 8 && whatsapp !== "212600000000" ? whatsapp : null,
  };
});

export const getPublicCancellationTiers = createServerFn({ method: "GET" }).handler(async () => {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const result = await supabaseAdmin
    .from("site_settings")
    .select("value")
    .eq("setting_key", "booking.cancellation_tiers")
    .eq("is_public", true)
    .maybeSingle();
  if (result.error) throw new Error("Unable to load cancellation terms.");
  return parseCancellationTiers(result.data?.value);
});

export const submitBooking = createServerFn({ method: "POST" })
  .validator(bookingRequestSchema)
  .handler(async ({ data }) => {
    if (data.honeypot) throw new Error("Unable to process booking request.");
    const guests = data.adults + data.children + data.infants;
    if (data.privateGroup && data.adults + data.children < 6) {
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
    const settingsResult = await supabaseAdmin
      .from("site_settings")
      .select("setting_key,value")
      .in("setting_key", ["booking.cancellation_tiers", "booking.currency"])
      .eq("is_public", true)
      .limit(2);
    if (settingsResult.error) throw new Error("Unable to verify booking cancellation terms.");
    const settings = new Map(
      (settingsResult.data ?? []).map((setting) => [setting.setting_key, setting.value]),
    );
    if (parseCancellationTiers(settings.get("booking.cancellation_tiers")).length === 0) {
      throw new Error("Booking is unavailable until cancellation tiers are configured.");
    }
    if (
      !currencySchema.safeParse(
        settings.has("booking.currency")
          ? settings.get("booking.currency")
          : process.env["BOOKING_CURRENCY"],
      ).success
    ) {
      throw new Error("Booking is unavailable until a booking currency is configured.");
    }
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
      p_guests: guests,
      p_adults: data.adults,
      p_children: data.children,
      p_infants: data.infants,
      p_meal_choice: data.mealChoice || null,
      p_dietary_needs: data.dietaryNeeds || null,
      p_message: null,
      p_language: data.language,
      p_payment_method: "arrival",
      p_deposit_paid: 0,
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
        adults: z.number().int(),
        children: z.number().int(),
        infants: z.number().int(),
        start_time: z.string(),
        total_price: z.number(),
        status: z.literal("pending"),
      })
      .parse(booking.data);

    return result;
  });
