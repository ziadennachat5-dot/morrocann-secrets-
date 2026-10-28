import { describe, expect, it } from "vitest";
import {
  calculateMonthStats,
  filterDatesByDayType,
  getCalendarSlotState,
  getDatesInMonth,
  getDatesInRange,
  nextCalendarSlotState,
} from "@/lib/admin-calendar";

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

  it("calculates all dates in a month correctly", () => {
    // October 2026 has 31 days
    const octDates = getDatesInMonth(2026, 9);
    expect(octDates.length).toBe(31);
    expect(octDates[0]).toBe("2026-10-01");
    expect(octDates[30]).toBe("2026-10-31");

    // February 2026 has 28 days
    const febDates = getDatesInMonth(2026, 1);
    expect(febDates.length).toBe(28);
  });

  it("calculates inclusive date ranges", () => {
    const range = getDatesInRange("2026-10-01", "2026-10-05");
    expect(range).toEqual(["2026-10-01", "2026-10-02", "2026-10-03", "2026-10-04", "2026-10-05"]);

    expect(getDatesInRange("2026-10-05", "2026-10-01")).toEqual([]);
  });

  it("filters dates by weekdays, weekends, and upcoming", () => {
    // 2026-10-23 is Friday, 2026-10-24 is Saturday, 2026-10-25 is Sunday, 2026-10-26 is Monday
    const dates = ["2026-10-23", "2026-10-24", "2026-10-25", "2026-10-26"];

    expect(filterDatesByDayType(dates, "weekdays")).toEqual(["2026-10-23", "2026-10-26"]);
    expect(filterDatesByDayType(dates, "weekends")).toEqual(["2026-10-24", "2026-10-25"]);
    expect(filterDatesByDayType(dates, "upcoming", "2026-10-25")).toEqual([
      "2026-10-25",
      "2026-10-26",
    ]);
  });

  it("calculates monthly statistics correctly", () => {
    const monthDates = ["2026-10-01", "2026-10-02", "2026-10-03"];
    const availability = [
      { experience_id: "exp-1", date: "2026-10-01", status: "available" as const, capacity: 25, booked_count: 5 },
      { experience_id: "exp-1", date: "2026-10-02", status: "booked" as const, capacity: 25, booked_count: 25 },
      { experience_id: "exp-1", date: "2026-10-03", status: "closed" as const, capacity: 25, booked_count: 0 },
    ];
    const bookings = [
      { experience_id: "exp-1", date: "2026-10-01", status: "confirmed", adults: 2, children: 1 },
      { experience_id: "exp-1", date: "2026-10-02", status: "confirmed", adults: 4, children: 0 },
    ];

    const stats = calculateMonthStats({
      monthDates,
      experienceId: "exp-1",
      availability,
      bookings,
    });

    expect(stats.availableDays).toBe(1);
    expect(stats.fullyBookedDays).toBe(1);
    expect(stats.closedDays).toBe(1);
    expect(stats.totalBookings).toBe(2);
    expect(stats.totalGuestsBooked).toBe(7); // 3 + 4
  });
});
