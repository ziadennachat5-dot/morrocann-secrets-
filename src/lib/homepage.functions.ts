import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const localizedSchema = z.object({
  en: z.string().trim(),
  fr: z.string().trim(),
  ar: z.string().trim(),
});
const reasonSchema = z.array(localizedSchema).max(3);
const stepSchema = z.array(localizedSchema).max(3);

export const getHomepageContent = createServerFn({ method: "GET" }).handler(async () => {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const keys = ["home.hero", "home.idea", "home.reasons", "home.steps"];
  const result = await supabaseAdmin
    .from("site_settings")
    .select("setting_key,value")
    .in("setting_key", keys)
    .eq("is_public", true);
  if (result.error) throw new Error("Unable to load homepage text.");
  const values = new Map((result.data ?? []).map(({ setting_key, value }) => [setting_key, value]));
  const heroValue = values.get("home.hero");
  const ideaValue = values.get("home.idea");
  const reasonValue = values.get("home.reasons");
  const stepValue = values.get("home.steps");
  const idea = ideaValue === undefined ? null : localizedSchema.parse(ideaValue);
  const reasons = reasonValue === undefined ? [] : reasonSchema.parse(reasonValue);
  const steps = stepValue === undefined ? [] : stepSchema.parse(stepValue);
  return {
    hero: heroValue === undefined ? null : localizedSchema.parse(heroValue),
    idea,
    reasons,
    steps,
  };
});
