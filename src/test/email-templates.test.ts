import { describe, expect, it } from "vitest";
import { renderBookingEmail, type BookingEmailKind } from "@/lib/email-templates";
import type { Lang } from "@/lib/i18n";

const kinds: BookingEmailKind[] = [
  "booking_received",
  "booking_confirmed",
  "booking_reminder",
  "booking_cancelled",
  "review_request",
];
const languages: Lang[] = ["en", "fr", "ar"];
const sampleData = {
  guestName: "<Guest>",
  experienceTitle: "Home dinner",
  date: "2026-11-10",
  guests: 2,
  bookingReference: "booking-reference",
  meetingPoint: "",
  whatsappUrl: "https://wa.me/?text=Hello",
  logoUrl: "https://example.com/brand/logo.png",
  reviewUrl: "https://example.com/review?token=signed",
};

describe("localized booking email templates", () => {
  it.each(languages)("renders accessible branded details in %s", (language) => {
    const email = renderBookingEmail("booking_received", language, sampleData);
    expect(email.html).toContain('alt="Moroccan Secrets Riad"');
    expect(email.html).toContain(sampleData.logoUrl);
    expect(email.html).toContain(sampleData.whatsappUrl);
    expect(email.html).toContain(
      language === "fr"
        ? "Point de rendez-vous"
        : language === "ar"
          ? "نقطة اللقاء"
          : "Meeting point",
    );
    expect(email.html).not.toContain("<Guest>");
    expect(email.html).toContain("&lt;Guest&gt;");
    expect(email.html).toContain(language === "ar" ? 'dir="rtl"' : 'dir="ltr"');
  });

  it.each(kinds)("renders the review action only for review requests: %s", (kind) => {
    const email = renderBookingEmail(kind, "en", sampleData);
    expect(email.html.includes(sampleData.reviewUrl ?? "")).toBe(kind === "review_request");
    expect(email.text).toContain(sampleData.bookingReference);
  });
});
