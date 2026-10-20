import { describe, expect, it } from "vitest";
import { inquirySchema } from "@/lib/inquiry-schema";

const commonRequest = {
  fullName: "Guest Name",
  email: "guest@example.com",
  phone: "",
  organization: "",
  eventType: "",
  requestedDate: "",
  guestCount: null,
  quantity: null,
  message: "Please share more information.",
  honeypot: "",
};

describe("public inquiry validation", () => {
  it("requires event type for private event inquiries", () => {
    expect(inquirySchema.safeParse({ ...commonRequest, kind: "private_event" }).success).toBe(
      false,
    );
    expect(
      inquirySchema.safeParse({
        ...commonRequest,
        kind: "private_event",
        eventType: "birthday",
      }).success,
    ).toBe(true);
  });

  it("requires an organization for partners and a quantity for gift inquiries", () => {
    expect(inquirySchema.safeParse({ ...commonRequest, kind: "partner" }).success).toBe(false);
    expect(
      inquirySchema.safeParse({
        ...commonRequest,
        kind: "partner",
        organization: "Local hotel",
      }).success,
    ).toBe(true);
    expect(inquirySchema.safeParse({ ...commonRequest, kind: "gift" }).success).toBe(false);
    expect(inquirySchema.safeParse({ ...commonRequest, kind: "gift", quantity: 2 }).success).toBe(
      true,
    );
  });

  it("rejects requested dates in the past", () => {
    expect(
      inquirySchema.safeParse({
        ...commonRequest,
        kind: "private_event",
        eventType: "birthday",
        requestedDate: "2000-01-01",
      }).success,
    ).toBe(false);
  });

  it("rejects a filled honeypot and oversized messages", () => {
    expect(
      inquirySchema.safeParse({
        ...commonRequest,
        kind: "gift",
        quantity: 1,
        honeypot: "bot",
      }).success,
    ).toBe(false);
    expect(
      inquirySchema.safeParse({
        ...commonRequest,
        kind: "gift",
        quantity: 1,
        message: "x".repeat(2001),
      }).success,
    ).toBe(false);
  });
});
