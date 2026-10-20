import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const localesSchema = z.object({
  en: z.string().trim().min(1),
  fr: z.string().trim().min(1),
  ar: z.string().trim().min(1),
});
const localizedListSchema = z.object({
  en: z.array(z.string().trim().min(1)),
  fr: z.array(z.string().trim().min(1)),
  ar: z.array(z.string().trim().min(1)),
});
const quoteSchema = z.record(z.string(), z.string());

const settingKeys = [
  "trust.included",
  "trust.not_included",
  "trust.arrival_time",
  "trust.meeting_point",
  "trust.dress",
  "trust.alcohol_policy",
  "trust.what_to_bring",
  "trust.why_family_home",
  "trust.safety_hygiene",
] as const;

function configuredHttpsUrl(name: string): string | null {
  const value = process.env[name]?.trim();
  if (!value) return null;
  const url = new URL(value);
  if (url.protocol !== "https:") throw new Error(`${name} must use HTTPS.`);
  return url.toString();
}

export const getTrustContent = createServerFn({ method: "GET" }).handler(async () => {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const [settingsResult, reviewsResult] = await Promise.all([
    supabaseAdmin
      .from("site_settings")
      .select("setting_key,value")
      .in("setting_key", [...settingKeys])
      .eq("is_public", true),
    supabaseAdmin
      .from("reviews")
      .select("id,experience_id,author,origin,quote,rating,language,created_at")
      .eq("approved", true)
      .order("created_at", { ascending: false }),
  ]);

  if (settingsResult.error) throw new Error("Unable to load published trust information.");
  if (reviewsResult.error) throw new Error("Unable to load approved reviews.");

  const settings = new Map(
    (settingsResult.data ?? []).map((setting) => [setting.setting_key, setting.value]),
  );
  const localizedLists = new Map(
    ["trust.included", "trust.not_included"].map((key) => [
      key,
      settings.has(key) ? localizedListSchema.parse(settings.get(key)) : null,
    ]),
  );
  const localizedText = new Map(
    settingKeys
      .filter((key) => key !== "trust.included" && key !== "trust.not_included")
      .map((key) => [key, settings.has(key) ? localesSchema.parse(settings.get(key)) : null]),
  );
  const reviews = z
    .array(
      z.object({
        id: z.string().uuid(),
        experience_id: z.string().nullable(),
        author: z.string().trim().min(2).max(80),
        origin: z.string().trim().max(100),
        quote: quoteSchema,
        rating: z.number().int().min(1).max(5),
        language: z.enum(["en", "fr", "ar"]),
        created_at: z.string(),
      }),
    )
    .parse(reviewsResult.data)
    .filter(
      (review) =>
        ["en", "fr", "ar"].every((lang) => review.quote[lang]?.trim()) ||
        Boolean(review.quote[review.language]?.trim()),
    );

  return {
    included: localizedLists.get("trust.included") ?? null,
    notIncluded: localizedLists.get("trust.not_included") ?? null,
    goodToKnow: {
      arrivalTime: localizedText.get("trust.arrival_time") ?? null,
      meetingPoint: localizedText.get("trust.meeting_point") ?? null,
      dress: localizedText.get("trust.dress") ?? null,
      alcoholPolicy: localizedText.get("trust.alcohol_policy") ?? null,
      whatToBring: localizedText.get("trust.what_to_bring") ?? null,
    },
    whyFamilyHome: localizedText.get("trust.why_family_home") ?? null,
    safetyHygiene: localizedText.get("trust.safety_hygiene") ?? null,
    reviews,
    reviewLinks: {
      tripAdvisor: configuredHttpsUrl("TRIPADVISOR_REVIEWS_URL"),
      googleBusiness: configuredHttpsUrl("GOOGLE_BUSINESS_REVIEWS_URL"),
    },
  };
});
