import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const emailSchema = z.string().email().max(255);

function configuredHttpsUrl(name: string): string | null {
  const value = process.env[name]?.trim();
  if (!value) return null;
  const url = new URL(value);
  if (url.protocol !== "https:") throw new Error(`${name} must use HTTPS.`);
  return url.toString();
}

export const getPublicContactLinks = createServerFn({ method: "GET" }).handler(async () => {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const result = await supabaseAdmin
    .from("site_settings")
    .select("setting_key,value")
    .in("setting_key", ["contact.whatsapp", "contact.email", "contact.instagram"])
    .eq("is_public", true);
  if (result.error) throw new Error("Unable to load public contact settings.");
  const settings = new Map(
    (result.data ?? []).map((setting) => [
      setting.setting_key,
      typeof setting.value === "string" ? setting.value : "",
    ]),
  );
  const rawWhatsapp = (
    settings.get("contact.whatsapp") ||
    process.env["OWNER_WHATSAPP_NUMBER"] ||
    ""
  ).replace(/\D/g, "");
  const whatsapp = rawWhatsapp.length >= 8 && rawWhatsapp !== "212600000000" ? rawWhatsapp : null;
  const rawEmail = (
    settings.get("contact.email") ||
    process.env["PUBLIC_CONTACT_EMAIL"] ||
    ""
  ).trim();
  const email = rawEmail && emailSchema.safeParse(rawEmail).success ? rawEmail : null;
  const instagram = settings.get("contact.instagram") || configuredHttpsUrl("INSTAGRAM_URL");
  return {
    whatsapp,
    email,
    instagram: instagram ? validateHttpsUrl(instagram, "contact.instagram") : null,
  };
});

function validateHttpsUrl(value: string, name: string): string {
  const url = new URL(value);
  if (url.protocol !== "https:") throw new Error(`${name} must use HTTPS.`);
  return url.toString();
}
