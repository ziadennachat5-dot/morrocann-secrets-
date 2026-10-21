import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const localizedTextSchema = z.object({
  en: z.string().trim().min(1),
  fr: z.string().trim().min(1),
  ar: z.string().trim().min(1),
});
const experienceTextSchema = z.object({
  en: z.string().trim().min(1),
  fr: z.string().trim(),
  ar: z.string().trim(),
});
const faqSchema = z.object({
  id: z.string().uuid(),
  category: experienceTextSchema,
  question: experienceTextSchema,
  answer: experienceTextSchema,
});
const postSchema = z.object({
  slug: z.string().min(1),
  title: localizedTextSchema,
  summary: localizedTextSchema,
  body: localizedTextSchema,
  published_at: z.string().nullable(),
});
const experienceSchema = z.object({
  id: z.string(),
  title: experienceTextSchema,
  blurb: experienceTextSchema,
  duration: experienceTextSchema,
  price: z.number().nonnegative(),
  child_price: z.number().nonnegative().nullable(),
  child_age_min: z.number().int().nullable(),
  child_age_max: z.number().int().nullable(),
  min_guests: z.number().int().positive().nullable(),
  max_guests: z.number().int().positive(),
  start_time: z.string().nullable(),
  image_url: z.string(),
  image_alt: experienceTextSchema.nullable(),
  included: z.array(experienceTextSchema),
  why_love: z.array(experienceTextSchema),
  what_to_expect: experienceTextSchema.nullable(),
  what_to_remember: experienceTextSchema.nullable(),
  host_languages: experienceTextSchema.nullable(),
});
const familySchema = z.object({
  id: z.string(),
  name: localizedTextSchema,
  area: localizedTextSchema,
  languages: localizedTextSchema,
  signature_dish: localizedTextSchema,
  story: localizedTextSchema,
  image_url: z.string(),
  image_alt: localizedTextSchema.nullable(),
});
export type PublishedExperience = z.infer<typeof experienceSchema>;
export type PublishedFamily = z.infer<typeof familySchema>;

function configuredCurrency(): string | null {
  const value = process.env["BOOKING_CURRENCY"]?.trim();
  return value && /^[A-Z]{3}$/.test(value) ? value : null;
}

export const getPublishedExperiences = createServerFn({ method: "GET" }).handler(async () => {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const [result, currencyResult, meetingAreaResult] = await Promise.all([
    supabaseAdmin
      .from("experiences")
      .select(
        "id,title,blurb,duration,price,child_price,child_age_min,child_age_max,min_guests,max_guests,start_time,image_url,image_alt,included,why_love,what_to_expect,what_to_remember,host_languages",
      )
      .eq("is_published", true)
      .order("id"),
    supabaseAdmin
      .from("site_settings")
      .select("value")
      .eq("setting_key", "booking.currency")
      .eq("is_public", true)
      .maybeSingle(),
    supabaseAdmin
      .from("site_settings")
      .select("value")
      .eq("setting_key", "trust.meeting_area")
      .eq("is_public", true)
      .maybeSingle(),
  ]);
  if (result.error) throw new Error("Unable to load published experiences.");
  if (currencyResult.error) throw new Error("Unable to load booking currency.");
  if (meetingAreaResult.error) throw new Error("Unable to load the public meeting area.");
  const configuredSettingCurrency =
    typeof currencyResult.data?.value === "string" ? currencyResult.data.value : null;
  const currency =
    configuredSettingCurrency && /^[A-Z]{3}$/.test(configuredSettingCurrency)
      ? configuredSettingCurrency
      : configuredCurrency();
  return {
    experiences: z.array(experienceSchema).parse(result.data),
    currency,
    meetingArea: meetingAreaResult.data
      ? localizedTextSchema.parse(meetingAreaResult.data.value)
      : null,
  };
});

export const getPublishedFamilies = createServerFn({ method: "GET" }).handler(async () => {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const result = await supabaseAdmin
    .from("host_families")
    .select("id,name,area,languages,signature_dish,story,image_url,image_alt")
    .eq("is_published", true)
    .order("id");
  if (result.error) throw new Error("Unable to load published host profiles.");
  return z.array(familySchema).parse(result.data);
});

export const getPublishedFaqs = createServerFn({ method: "GET" }).handler(async () => {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const result = await supabaseAdmin
    .from("faqs")
    .select("id,category,question,answer")
    .eq("is_published", true)
    .order("sort_order")
    .order("created_at");
  if (result.error) throw new Error("Unable to load published FAQs.");
  return z.array(faqSchema).parse(result.data);
});

export const getPublishedPosts = createServerFn({ method: "GET" }).handler(async () => {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const result = await supabaseAdmin
    .from("posts")
    .select("slug,title,summary,body,published_at")
    .eq("status", "published")
    .not("published_at", "is", null)
    .order("published_at", { ascending: false });
  if (result.error) throw new Error("Unable to load published articles.");
  return z.array(postSchema).parse(result.data);
});

export const getPublishedPost = createServerFn({ method: "GET" })
  .validator(
    z.object({
      slug: z
        .string()
        .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
        .max(120),
    }),
  )
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const result = await supabaseAdmin
      .from("posts")
      .select("slug,title,summary,body,published_at")
      .eq("slug", data.slug)
      .eq("status", "published")
      .not("published_at", "is", null)
      .maybeSingle();
    if (result.error) throw new Error("Unable to load the published article.");
    return result.data ? postSchema.parse(result.data) : null;
  });
