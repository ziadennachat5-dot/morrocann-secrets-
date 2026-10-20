import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const localizedCopySchema = z.object({
  en: z.string().max(5000),
  fr: z.string().max(5000),
  ar: z.string().max(5000),
});

export const getPublicCopyOverrides = createServerFn({ method: "GET" }).handler(async () => {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const result = await supabaseAdmin
    .from("site_settings")
    .select("setting_key,value")
    .like("setting_key", "copy.%")
    .eq("is_public", true);
  if (result.error) throw new Error("Unable to load published page text.");
  return (result.data ?? []).map((row) => ({
    settingKey: row.setting_key,
    value: localizedCopySchema.parse(row.value),
  }));
});
