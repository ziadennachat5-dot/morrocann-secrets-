import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { z } from "zod";
import { getClientIp } from "./client-ip";
import type { Lang } from "./i18n";

const subscriptionSchema = z.object({
  email: z.string().trim().email().max(255),
  language: z.enum(["en", "fr", "ar"]),
  honeypot: z.string().max(200),
});
const confirmationSchema = z.object({ token: z.string().min(40).max(60) });

function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

async function hashToken(token: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(token));
  return bytesToHex(new Uint8Array(digest));
}

async function createRateLimitHash(ip: string, secret: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const digest = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(ip));
  return bytesToHex(new Uint8Array(digest));
}

function siteBaseUrl(): URL {
  const configured = process.env["VITE_SITE_URL"];
  if (!configured) throw new Error("VITE_SITE_URL is required for newsletter confirmation links.");
  const url = new URL(configured);
  if (url.protocol !== "https:" && url.hostname !== "localhost") {
    throw new Error("Newsletter confirmation URL must use HTTPS.");
  }
  return url;
}

function maskEmail(email: string): string {
  const [local = "", domain = ""] = email.split("@");
  return `${local.slice(0, 1)}***@${domain}`;
}

const confirmationCopy: Record<
  Lang,
  { subject: string; title: string; body: string; action: string }
> = {
  en: {
    subject: "Confirm your email subscription",
    title: "One quick confirmation",
    body: "Please confirm that you would like to receive occasional updates from Moroccan Secrets.",
    action: "Confirm subscription",
  },
  fr: {
    subject: "Confirmez votre inscription par e-mail",
    title: "Une dernière confirmation",
    body: "Veuillez confirmer que vous souhaitez recevoir occasionnellement des nouvelles de Moroccan Secrets.",
    action: "Confirmer l'inscription",
  },
  ar: {
    subject: "أكد اشتراك بريدك الإلكتروني",
    title: "خطوة تأكيد أخيرة",
    body: "يرجى تأكيد رغبتك في تلقي تحديثات من أسرار مغربية من حين لآخر.",
    action: "تأكيد الاشتراك",
  },
};

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (character) => {
    const entities: Record<string, string> = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    };
    return entities[character] ?? character;
  });
}

async function sendConfirmation(email: string, language: Lang, confirmationUrl: string) {
  const apiKey = process.env["RESEND_API_KEY"]?.trim() ?? "";
  const copy = confirmationCopy[language];
  const logo = new URL("/brand/logo-full.png", siteBaseUrl()).toString();
  const html = `<!doctype html><html lang="${language}" dir="${language === "ar" ? "rtl" : "ltr"}"><body style="margin:0;background:#FDFCF9;color:#2A2A2A;font-family:Arial,Helvetica,sans-serif"><main style="max-width:600px;margin:32px auto;padding:28px;background:#fff;border:1px solid #eadfd2;border-radius:12px;text-align:center"><img src="${escapeHtml(logo)}" alt="Moroccan Secrets Riad" width="200" style="max-width:80%;height:auto"><h1 style="color:#8B1A1A">${escapeHtml(copy.title)}</h1><p style="line-height:1.6">${escapeHtml(copy.body)}</p><p style="margin:28px"><a href="${escapeHtml(confirmationUrl)}" style="background:#8B1A1A;color:#fff;padding:12px 20px;border-radius:6px;text-decoration:none">${escapeHtml(copy.action)}</a></p><p style="font-size:12px;color:#6b6259">Moroccan Secrets Riad</p></main></body></html>`;
  const text = `${copy.title}\n\n${copy.body}\n\n${copy.action}: ${confirmationUrl}`;
  if (!apiKey) {
    console.info("Log-only newsletter confirmation", {
      recipient: maskEmail(email),
      subject: copy.subject,
    });
    return;
  }
  const from = process.env["NOTIFICATION_EMAIL_FROM"]?.trim() ?? "";
  if (!from) throw new Error("NOTIFICATION_EMAIL_FROM is required when RESEND_API_KEY is set.");
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ from, to: [email], subject: copy.subject, html, text }),
  });
  if (!response.ok) throw new Error(`Newsletter confirmation failed with HTTP ${response.status}.`);
}

export const requestNewsletterSubscription = createServerFn({ method: "POST" })
  .validator(subscriptionSchema)
  .handler(async ({ data }) => {
    if (data.honeypot) throw new Error("Unable to process newsletter request.");
    const ip = getClientIp(getRequest()) || "127.0.0.1";
    const rateLimitSecret = process.env["PUBLIC_FORM_RATE_LIMIT_SECRET"] || "5k0CiuQVxaWofJDgRHXBT9LYEdNmUn7OhSeyAjPI";
    if (!rateLimitSecret || rateLimitSecret.length < 32) {
      throw new Error("Newsletter subscriptions are temporarily unavailable.");
    }
    const ipHash = await createRateLimitHash(ip, rateLimitSecret);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const rateLimit = await supabaseAdmin.rpc("consume_public_form_rate_limit", {
      p_ip_hash: ipHash,
    });
    if (rateLimit.error) throw new Error("Unable to verify newsletter request limits.");
    if (!rateLimit.data) throw new Error("Too many newsletter requests. Try again later.");

    const email = data.email.toLowerCase();
    const existing = await supabaseAdmin
      .from("subscribers")
      .select("id,status")
      .eq("email", email)
      .maybeSingle();
    if (existing.error) throw new Error("Unable to check newsletter subscription.");
    if (existing.data?.status === "confirmed") return { success: true };

    const tokenBytes = crypto.getRandomValues(new Uint8Array(32));
    let tokenBinary = "";
    for (const byte of tokenBytes) tokenBinary += String.fromCharCode(byte);
    const token = btoa(tokenBinary).replaceAll("+", "-").replaceAll("/", "_").replace(/=+$/, "");
    const tokenHash = await hashToken(token);
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const row = {
      email,
      language: data.language,
      status: "pending" as const,
      confirmation_token_hash: tokenHash,
      confirmation_expires_at: expiresAt.toISOString(),
      consented_at: now.toISOString(),
      confirmed_at: null,
      updated_at: now.toISOString(),
    };
    const saved = existing.data
      ? await supabaseAdmin.from("subscribers").update(row).eq("id", existing.data.id)
      : await supabaseAdmin.from("subscribers").insert(row);
    if (saved.error) throw new Error("Unable to save newsletter subscription request.");

    const confirmationUrl = siteBaseUrl();
    confirmationUrl.pathname = "/newsletter/confirm";
    confirmationUrl.search = "";
    confirmationUrl.searchParams.set("lang", data.language);
    confirmationUrl.hash = `token=${token}`;
    await sendConfirmation(email, data.language, confirmationUrl.toString());
    return { success: true };
  });

export const confirmNewsletterSubscription = createServerFn({ method: "POST" })
  .validator(confirmationSchema)
  .handler(async ({ data }) => {
    const ip = getClientIp(getRequest()) || "127.0.0.1";
    const rateLimitSecret = process.env["PUBLIC_FORM_RATE_LIMIT_SECRET"] || "5k0CiuQVxaWofJDgRHXBT9LYEdNmUn7OhSeyAjPI";
    if (!rateLimitSecret || rateLimitSecret.length < 32) {
      throw new Error("Newsletter confirmations are temporarily unavailable.");
    }
    const ipHash = await createRateLimitHash(ip, rateLimitSecret);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const rateLimit = await supabaseAdmin.rpc("consume_public_form_rate_limit", {
      p_ip_hash: ipHash,
    });
    if (rateLimit.error) throw new Error("Unable to verify newsletter confirmation limits.");
    if (!rateLimit.data) throw new Error("Too many newsletter confirmation attempts.");
    if (!/^[A-Za-z0-9_-]+$/.test(data.token)) return { confirmed: false };
    const tokenHash = await hashToken(data.token);
    const now = new Date().toISOString();
    const result = await supabaseAdmin
      .from("subscribers")
      .update({
        status: "confirmed",
        confirmation_token_hash: null,
        confirmation_expires_at: null,
        confirmed_at: now,
        updated_at: now,
      })
      .eq("confirmation_token_hash", tokenHash)
      .eq("status", "pending")
      .gt("confirmation_expires_at", now)
      .select("id")
      .maybeSingle();
    if (result.error) throw new Error("Unable to confirm newsletter subscription.");
    return { confirmed: Boolean(result.data) };
  });
