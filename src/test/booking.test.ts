import { describe, expect, it } from "vitest";
import { filterAvailableBookingSlots } from "@/lib/booking-availability";
import { bookingRequestSchema } from "@/lib/booking-schema";
import {
  calculateBookingTotal,
  countCapacityGuests,
  formatCancellationTiers,
  parseCancellationTiers,
} from "@/lib/booking-pricing";

describe("booking availability filtering", () => {
  const slots = [
    { id: "a", date: "2026-11-01", experienceId: "dinner", remaining: 6 },
    { id: "b", date: "2026-11-02", experienceId: "dinner", remaining: 2 },
    { id: "c", date: "2026-11-03", experienceId: "cooking", remaining: 10 },
    { id: "d", date: "2026-10-19", experienceId: "dinner", remaining: 10 },
  ];

  it("returns only future slots for the selected experience with enough capacity", () => {
    expect(filterAvailableBookingSlots(slots, "dinner", 3, "2026-10-20", false)).toEqual([
      slots[0],
    ]);
  });

  it("requires six available guests for a private group", () => {
    expect(filterAvailableBookingSlots(slots, "dinner", 6, "2026-10-20", true)).toEqual([slots[0]]);
    expect(filterAvailableBookingSlots(slots, "dinner", 5, "2026-10-20", true)).toEqual([]);
  });
});

describe("booking request validation", () => {
  const validRequest = {
    name: "Guest Name",
    email: "guest@example.com",
    phone: "+212600000000",
    experienceId: "family-dinner",
    date: "2026-11-01",
    adults: 2,
    children: 0,
    infants: 0,
    mealChoice: "",
    privateGroup: false,
    dietaryNeeds: "",
    specialOccasion: "",
    language: "en",
    honeypot: "",
  };

  it("accepts a complete booking request", () => {
    expect(bookingRequestSchema.safeParse(validRequest).success).toBe(true);
  });

  it("rejects a private group smaller than six and a filled honeypot", () => {
    expect(bookingRequestSchema.safeParse({ ...validRequest, privateGroup: true }).success).toBe(
      false,
    );
    expect(bookingRequestSchema.safeParse({ ...validRequest, honeypot: "bot" }).success).toBe(
      false,
    );
  });
});

describe("booking pricing and cancellation tiers", () => {
  it("prices adults and children separately while infants remain free", () => {
    expect(calculateBookingTotal(100, 40, 2, 1)).toBe(240);
    expect(calculateBookingTotal(100, null, 2, 0)).toBe(200);
  });

  it("counts only adults and children toward capacity", () => {
    expect(countCapacityGuests(2, 1)).toBe(3);
    expect(countCapacityGuests(2, 0)).toBe(2);
  });

  it("parses and displays configured cancellation tiers in all supported languages", () => {
    const tiers = parseCancellationTiers([
      { hours_before: 72, refund_percent: 100 },
      { hours_before: 24, refund_percent: 50 },
    ]);

    expect(formatCancellationTiers(tiers, "en")).toEqual([
      "Cancel at least 72 hours before the start for a 100% refund.",
      "Cancel at least 24 hours before the start for a 50% refund.",
    ]);
    expect(formatCancellationTiers(tiers, "fr")[0]).toContain("72 heures");
    expect(formatCancellationTiers(tiers, "ar")[0]).toContain("٧٢");
  });

  it("rejects malformed or unsorted cancellation tiers", () => {
    expect(
      parseCancellationTiers([
        { hours_before: 24, refund_percent: 50 },
        { hours_before: 72, refund_percent: 100 },
      ]),
    ).toEqual([]);
    expect(parseCancellationTiers([{ hours_before: 24, refund_percent: 101 }])).toEqual([]);
    expect(parseCancellationTiers([])).toEqual([]);
  });
});
