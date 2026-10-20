import { describe, expect, it } from "vitest";
import { filterAvailableBookingSlots } from "@/lib/booking-availability";
import { bookingRequestSchema } from "@/lib/booking-schema";

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
    guests: 2,
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
