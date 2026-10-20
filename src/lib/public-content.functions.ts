import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const localizedTextSchema = z.object({
  en: z.string().trim().min(1),
  fr: z.string().trim().min(1),
  ar: z.string().trim().min(1),
});
const faqSchema = z.object({
  id: z.string().uuid(),
  category: localizedTextSchema,
  question: localizedTextSchema,
  answer: localizedTextSchema,
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
  title: localizedTextSchema,
  blurb: localizedTextSchema,
  duration: localizedTextSchema,
  price: z.number().nonnegative(),
  max_guests: z.number().int().positive(),
  image_url: z.string(),
  image_alt: localizedTextSchema.nullable(),
  included: z.array(localizedTextSchema),
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
  const [result, currencyResult] = await Promise.all([
    supabaseAdmin
      .from("experiences")
      .select("id,title,blurb,duration,price,max_guests,image_url,image_alt,included")
      .eq("is_published", true)
      .order("id"),
    supabaseAdmin
      .from("site_settings")
      .select("value")
      .eq("setting_key", "booking.currency")
      .eq("is_public", true)
      .maybeSingle(),
  ]);
  if (result.error) throw new Error("Unable to load published experiences.");
  if (currencyResult.error) throw new Error("Unable to load booking currency.");
  const configuredSettingCurrency =
    typeof currencyResult.data?.value === "string" ? currencyResult.data.value : null;
  const currency =
    configuredSettingCurrency && /^[A-Z]{3}$/.test(configuredSettingCurrency)
      ? configuredSettingCurrency
      : configuredCurrency();
  return {
    experiences: z.array(experienceSchema).parse(result.data),
    currency,
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
