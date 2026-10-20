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
  const rawWhatsapp = process.env["OWNER_WHATSAPP_NUMBER"]?.replace(/\D/g, "") ?? "";
  const whatsapp = rawWhatsapp.length >= 8 && rawWhatsapp !== "212600000000" ? rawWhatsapp : null;
  const rawEmail = process.env["PUBLIC_CONTACT_EMAIL"]?.trim() ?? "";
  const email = rawEmail && emailSchema.safeParse(rawEmail).success ? rawEmail : null;
  return {
    whatsapp,
    email,
    instagram: configuredHttpsUrl("INSTAGRAM_URL"),
  };
});
