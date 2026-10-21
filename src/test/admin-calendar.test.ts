import { describe, expect, it } from "vitest";
import { getCalendarSlotState, nextCalendarSlotState } from "@/lib/admin-calendar";

describe("availability calendar states", () => {
  it("marks capacity reached as fully booked even when the stored status is open", () => {
    expect(getCalendarSlotState({ status: "available", capacity: 4, booked_count: 2 }, 4)).toBe(
      "full",
    );
  });

  it("cycles available, fully booked, and closed", () => {
    expect(nextCalendarSlotState("available")).toBe("full");
    expect(nextCalendarSlotState("full")).toBe("closed");
    expect(nextCalendarSlotState("closed")).toBe("available");
  });
});
