import { renderBookingEmail, type BookingEmailKind } from "./email-templates";
import { createSignedReviewToken } from "./review-token";
import type { Lang } from "./i18n";
import { parseCancellationTiers } from "./booking-pricing";
import { z } from "zod";

const supportedLanguages = ["en", "fr", "ar"] as const;

function localizedValue(value: unknown, language: Lang): string {
  if (typeof value !== "object" || value === null || Array.isArray(value)) return "";
  const record = value as Record<string, unknown>;
  const localized = record[language];
  return typeof localized === "string" ? localized : "";
}

function siteBaseUrl(): URL {
  const configured =
    process.env["VITE_SITE_URL"] ||
    (process.env["NODE_ENV"] === "production" ? undefined : process.env["APP_URL"]);
  if (!configured) throw new Error("VITE_SITE_URL or APP_URL is required for email links.");
  const url = new URL(configured);
  if (url.protocol !== "https:" && url.hostname !== "localhost") {
    throw new Error("The email site URL must use HTTPS.");
  }
  return url;
}

function whatsappUrl(settings: Map<string, unknown>, language: Lang): string {
  const configured = settings.get("contact.whatsapp") ?? process.env["OWNER_WHATSAPP_NUMBER"] ?? "";
  const number = typeof configured === "string" ? configured.replace(/\D/g, "") : "";
  if (number.length >= 8 && number !== "212600000000") return `https://wa.me/${number}`;
  const message = {
    en: "Hello, Moroccan Secrets",
    fr: "Bonjour, Moroccan Secrets",
    ar: "مرحباً، أسرار مغربية",
  }[language];
  return `https://wa.me/?text=${encodeURIComponent(message)}`;
}

function maskedEmail(email: string): string {
  const [local = "", domain = ""] = email.split("@");
  return `${local.slice(0, 1)}***@${domain}`;
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "Unknown email delivery error.";
}

function languageOrEnglish(value: string): Lang {
  return supportedLanguages.includes(value as Lang) ? (value as Lang) : "en";
}

async function loadEmailSettings(
  supabaseAdmin: typeof import("@/integrations/supabase/client.server").supabaseAdmin,
) {
  const [publicResult, privateResult] = await Promise.all([
    supabaseAdmin
      .from("site_settings")
      .select("setting_key,value")
      .in("setting_key", ["contact.whatsapp", "booking.cancellation_tiers"])
      .eq("is_public", true),
    supabaseAdmin
      .from("site_settings")
      .select("setting_key,value")
      .in("setting_key", ["trust.meeting_point", "booking.owner_email"])
      .eq("is_public", false),
  ]);
  if (publicResult.error || privateResult.error) {
    throw new Error("Unable to load booking email settings.");
  }
  return new Map(
    [...(publicResult.data ?? []), ...(privateResult.data ?? [])].map((row) => [
      row.setting_key,
      row.value,
    ]),
  );
}

export async function processBookingEmailOutbox(batchSize = 10) {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const baseUrl = siteBaseUrl();
  const settings = await loadEmailSettings(supabaseAdmin);
  const jobsResult = await supabaseAdmin.rpc("claim_booking_email_jobs", {
    p_batch_size: batchSize,
  });
  if (jobsResult.error) throw new Error(`Unable to claim email jobs: ${jobsResult.error.message}`);
  const apiKey = process.env["RESEND_API_KEY"]?.trim() ?? "";
  const from = process.env["NOTIFICATION_EMAIL_FROM"]?.trim() ?? "";
  const logoUrl = new URL("/brand/logo-full.png", baseUrl).toString();
  const counts = { processed: 0, sent: 0, logged: 0, failed: 0, skipped: 0 };

  for (const job of jobsResult.data ?? []) {
    counts.processed += 1;
    try {
      const bookingResult = await supabaseAdmin
        .from("bookings")
        .select(
          "id,name,email,experience_id,date,guests,adults,children,infants,start_time,meal_choice,dietary_needs,language,status",
        )
        .eq("id", job.booking_id)
        .maybeSingle();
      if (bookingResult.error) throw new Error("Unable to load email booking.");
      if (!bookingResult.data) throw new Error("Email booking no longer exists.");
      const booking = bookingResult.data;

      if (
        (job.kind === "booking_received" && booking.status === "cancelled") ||
        (job.kind === "booking_confirmed" && booking.status !== "confirmed") ||
        (job.kind === "booking_cancelled" && booking.status !== "cancelled")
      ) {
        const stale = await supabaseAdmin
          .from("booking_email_jobs")
          .update({
            status: "logged",
            last_error: "Skipped because the booking status changed before delivery.",
            updated_at: new Date().toISOString(),
          })
          .eq("id", job.id);
        if (stale.error) throw new Error("Unable to mark outdated booking email as skipped.");
        counts.skipped += 1;
        continue;
      }

      if (
        job.kind === "booking_reminder" &&
        (booking.status !== "confirmed" || booking.date <= new Date().toISOString().slice(0, 10))
      ) {
        const skipped = await supabaseAdmin
          .from("booking_email_jobs")
          .update({
            status: "logged",
            last_error: "Skipped because the booking is not upcoming and confirmed.",
            updated_at: new Date().toISOString(),
          })
          .eq("id", job.id);
        if (skipped.error) throw new Error("Unable to mark ineligible reminder as skipped.");
        counts.skipped += 1;
        continue;
      }
      if (
        job.kind === "review_request" &&
        (booking.status !== "confirmed" || booking.date >= new Date().toISOString().slice(0, 10))
      ) {
        const skipped = await supabaseAdmin
          .from("booking_email_jobs")
          .update({
            status: "logged",
            last_error: "Skipped because the booking was not completed.",
            updated_at: new Date().toISOString(),
          })
          .eq("id", job.id);
        if (skipped.error) throw new Error("Unable to mark ineligible review request as skipped.");
        counts.skipped += 1;
        continue;
      }

      const experienceResult = await supabaseAdmin
        .from("experiences")
        .select("title")
        .eq("id", booking.experience_id)
        .maybeSingle();
      if (experienceResult.error) throw new Error("Unable to load email experience.");
      const language = languageOrEnglish(booking.language);
      const kind = job.kind as BookingEmailKind;
      const meetingPoint =
        kind === "booking_confirmed"
          ? localizedValue(settings.get("trust.meeting_point"), language)
          : "";
      const ownerEmailValue = settings.get("booking.owner_email");
      const ownerEmail =
        typeof ownerEmailValue === "string" && z.string().email().safeParse(ownerEmailValue).success
          ? ownerEmailValue
          : null;
      const data = {
        guestName: booking.name,
        experienceTitle:
          localizedValue(experienceResult.data?.title, language) || booking.experience_id,
        date: booking.date,
        guests: booking.guests,
        adults: booking.adults,
        children: booking.children,
        infants: booking.infants,
        ...(booking.start_time ? { startTime: booking.start_time.slice(0, 5) } : {}),
        ...(booking.meal_choice ? { mealChoice: booking.meal_choice } : {}),
        ...(booking.dietary_needs ? { dietaryNeeds: booking.dietary_needs } : {}),
        cancellationTiers: parseCancellationTiers(settings.get("booking.cancellation_tiers")),
        bookingReference: booking.id,
        meetingPoint,
        whatsappUrl: whatsappUrl(settings, language),
        logoUrl,
      };
      let reviewUrl: string | undefined;
      if (kind === "review_request") {
        const secret = process.env["REVIEW_TOKEN_SECRET"]?.trim() ?? "";
        const token = await createSignedReviewToken(booking.id, language, secret);
        const url = new URL("/review", baseUrl);
        url.searchParams.set("token", token);
        url.searchParams.set("lang", language);
        reviewUrl = url.toString();
      }
      const email = renderBookingEmail(kind, language, reviewUrl ? { ...data, reviewUrl } : data);

      if (!apiKey) {
        console.info("Log-only booking email", {
          bookingId: booking.id,
          kind,
          recipient: maskedEmail(booking.email),
          subject: email.subject,
        });
        const logged = await supabaseAdmin
          .from("booking_email_jobs")
          .update({
            status: "logged",
            last_error: null,
            sent_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq("id", job.id);
        if (logged.error) throw new Error("Unable to record log-only booking email.");
        counts.logged += 1;
        continue;
      }

      if (!from) throw new Error("NOTIFICATION_EMAIL_FROM is required when RESEND_API_KEY is set.");
      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from,
          to: [booking.email],
          ...(kind === "booking_received" && ownerEmail ? { bcc: [ownerEmail] } : {}),
          subject: email.subject,
          html: email.html,
          text: email.text,
        }),
      });
      if (!response.ok) throw new Error(`Resend delivery failed with HTTP ${response.status}.`);
      const sent = await supabaseAdmin
        .from("booking_email_jobs")
        .update({
          status: "sent",
          last_error: null,
          sent_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", job.id);
      if (sent.error) throw new Error("Email sent, but its delivery status could not be saved.");
      counts.sent += 1;
    } catch (error) {
      const message = errorMessage(error).slice(0, 1000);
      console.error(`Booking email job ${job.id} failed:`, message);
      const retryDelay = Math.min(
        60 * 60 * 1000 * 2 ** Math.min(job.attempts, 5),
        24 * 60 * 60 * 1000,
      );
      const failed = await supabaseAdmin
        .from("booking_email_jobs")
        .update({
          status: "failed",
          last_error: message,
          scheduled_at: new Date(Date.now() + retryDelay).toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", job.id);
      if (failed.error) {
        throw new Error(`Email job ${job.id} failed and its retry could not be scheduled.`);
      }
      counts.failed += 1;
    }
  }
  return counts;
}
