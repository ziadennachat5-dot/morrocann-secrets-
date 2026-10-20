import { describe, expect, it } from "vitest";
import { createSignedReviewToken, verifySignedReviewToken } from "@/lib/review-token";

const secret = "a-secure-review-secret-with-at-least-32-characters";
const bookingId = "d2719a22-cf1b-4c49-87a1-c7d7340af8f2";

describe("signed booking review tokens", () => {
  it("verifies the signed booking, expiry, and language payload", async () => {
    const now = Date.UTC(2026, 9, 25);
    const token = await createSignedReviewToken(bookingId, "fr", secret, now);
    await expect(verifySignedReviewToken(token, secret, now)).resolves.toEqual({
      bookingId,
      expiresAt: Math.floor(now / 1000) + 45 * 24 * 60 * 60,
      language: "fr",
    });
  });

  it("rejects altered, expired, and malformed tokens", async () => {
    const now = Date.UTC(2026, 9, 25);
    const token = await createSignedReviewToken(bookingId, "en", secret, now);
    const [payload, signature] = token.split(".");
    await expect(
      verifySignedReviewToken(`${payload}.AAAA${signature}`, secret, now),
    ).resolves.toBeNull();
    await expect(verifySignedReviewToken(token, secret, now + 46 * 86400000)).resolves.toBeNull();
    await expect(verifySignedReviewToken("not-a-token", secret, now)).resolves.toBeNull();
  });
});
