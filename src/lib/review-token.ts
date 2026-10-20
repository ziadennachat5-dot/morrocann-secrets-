import { z } from "zod";
import type { Lang } from "./i18n";

const payloadSchema = z.object({
  bookingId: z.string().uuid(),
  expiresAt: z.number().int().positive(),
  language: z.enum(["en", "fr", "ar"]),
});

export type ReviewTokenPayload = z.infer<typeof payloadSchema>;

function encodeBase64Url(value: string): string {
  return btoa(value).replaceAll("+", "-").replaceAll("/", "_").replace(/=+$/, "");
}

function decodeBase64Url(value: string): string | null {
  if (!/^[A-Za-z0-9_-]+$/.test(value)) return null;
  try {
    const base64 = value.replaceAll("-", "+").replaceAll("_", "/");
    return atob(base64.padEnd(Math.ceil(base64.length / 4) * 4, "="));
  } catch {
    return null;
  }
}

async function sign(value: string, secret: string): Promise<Uint8Array> {
  if (secret.length < 32)
    throw new Error("REVIEW_TOKEN_SECRET must contain at least 32 characters.");
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(value));
  return new Uint8Array(signature);
}

function toBase64Url(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replaceAll("+", "-").replaceAll("/", "_").replace(/=+$/, "");
}

function signaturesMatch(expected: Uint8Array, supplied: Uint8Array): boolean {
  let difference = expected.length ^ supplied.length;
  const length = Math.max(expected.length, supplied.length);
  for (let index = 0; index < length; index += 1) {
    difference |= (expected[index] ?? 0) ^ (supplied[index] ?? 0);
  }
  return difference === 0;
}

export async function createSignedReviewToken(
  bookingId: string,
  language: Lang,
  secret: string,
  now = Date.now(),
): Promise<string> {
  const payload = payloadSchema.parse({
    bookingId,
    expiresAt: Math.floor(now / 1000) + 45 * 24 * 60 * 60,
    language,
  });
  const encodedPayload = encodeBase64Url(JSON.stringify(payload));
  const signature = await sign(encodedPayload, secret);
  return `${encodedPayload}.${toBase64Url(signature)}`;
}

export async function verifySignedReviewToken(
  token: string,
  secret: string,
  now = Date.now(),
): Promise<ReviewTokenPayload | null> {
  const [encodedPayload, encodedSignature, extra] = token.split(".");
  if (!encodedPayload || !encodedSignature || extra !== undefined) return null;
  const payloadText = decodeBase64Url(encodedPayload);
  const signatureText = decodeBase64Url(encodedSignature);
  if (!payloadText || !signatureText) return null;
  let payload: unknown;
  try {
    payload = JSON.parse(payloadText);
  } catch {
    return null;
  }
  const parsedPayload = payloadSchema.safeParse(payload);
  if (!parsedPayload.success || parsedPayload.data.expiresAt <= Math.floor(now / 1000)) return null;
  const expectedSignature = await sign(encodedPayload, secret);
  const suppliedSignature = Uint8Array.from(signatureText, (character) => character.charCodeAt(0));
  return signaturesMatch(expectedSignature, suppliedSignature) ? parsedPayload.data : null;
}
