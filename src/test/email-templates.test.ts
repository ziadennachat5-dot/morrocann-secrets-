import { describe, expect, it } from "vitest";
import { renderBookingEmail, type BookingEmailKind } from "@/lib/email-templates";
import type { CancellationTier } from "@/lib/booking-pricing";
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
    expect(email.html).toContain('alt="Moroccan Secrets"');
    expect(email.html).toContain(sampleData.logoUrl);
    expect(email.html).toContain(sampleData.whatsappUrl);
    expect(email.html).not.toContain(
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

  it("includes the exact meeting point only in the booking-confirmed email", () => {
    const privatePoint = "Private door code 123";
    const data = { ...sampleData, meetingPoint: privatePoint };

    expect(renderBookingEmail("booking_received", "en", data).text).not.toContain(privatePoint);
    expect(renderBookingEmail("booking_reminder", "en", data).text).not.toContain(privatePoint);
    expect(renderBookingEmail("booking_confirmed", "en", data).text).toContain(privatePoint);
  });

  it("includes guest choices, dietary notes and cancellation tiers in booking emails", () => {
    const cancellationTiers: CancellationTier[] = [{ hours_before: 72, refund_percent: 100 }];
    const email = renderBookingEmail("booking_received", "en", {
      ...sampleData,
      adults: 2,
      children: 1,
      infants: 1,
      startTime: "18:30",
      mealChoice: "Vegetarian",
      dietaryNeeds: "Peanut allergy",
      cancellationTiers,
    });

    expect(email.text).toContain("Vegetarian");
    expect(email.text).toContain("Peanut allergy");
    expect(email.text).toContain("18:30");
    expect(email.text).toContain("2 adults · 1 child · 1 infant");
    expect(email.text).toContain("100% refund");
  });
});
