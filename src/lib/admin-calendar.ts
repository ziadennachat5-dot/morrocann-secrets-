export type CalendarSlotState = "available" | "full" | "closed";

export function getCalendarSlotState(
  slot: {
    status: "available" | "booked" | "closed";
    capacity: number;
    booked_count: number;
  } | null,
  activeBookedGuests: number,
): CalendarSlotState {
  if (!slot || slot.status === "closed") return "closed";
  if (
    slot.status === "booked" ||
    slot.booked_count >= slot.capacity ||
    activeBookedGuests >= slot.capacity
  ) {
    return "full";
  }
  return "available";
}

export function nextCalendarSlotState(state: CalendarSlotState): CalendarSlotState {
  if (state === "available") return "full";
  if (state === "full") return "closed";
  return "available";
}

export function formatISODate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function getDatesInMonth(year: number, monthIndex: number): string[] {
  const dates: string[] = [];
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
  for (let day = 1; day <= daysInMonth; day++) {
    const d = new Date(year, monthIndex, day, 12, 0, 0);
    dates.push(formatISODate(d));
  }
  return dates;
}

export function getDatesInRange(startDate: string, endDate: string): string[] {
  if (!startDate || !endDate || startDate > endDate) return [];
  const [sy, sm, sd] = startDate.split("-").map(Number);
  const [ey, em, ed] = endDate.split("-").map(Number);
  if (!sy || !sm || !sd || !ey || !em || !ed) return [];

  const cur = new Date(sy, sm - 1, sd, 12, 0, 0);
  const end = new Date(ey, em - 1, ed, 12, 0, 0);
  const dates: string[] = [];
  while (cur <= end) {
    dates.push(formatISODate(cur));
    cur.setDate(cur.getDate() + 1);
  }
  return dates;
}

export function filterDatesByDayType(
  dates: string[],
  type: "all" | "weekdays" | "weekends" | "upcoming",
  todayStr?: string,
): string[] {
  const refToday = todayStr ?? formatISODate(new Date());
  return dates.filter((d) => {
    if (type === "upcoming") {
      return d >= refToday;
    }
    const [y, m, day] = d.split("-").map(Number);
    const dateObj = new Date(y!, m! - 1, day!, 12, 0, 0);
    const dayOfWeek = dateObj.getDay(); // 0 is Sunday, 6 is Saturday
    if (type === "weekdays") {
      return dayOfWeek >= 1 && dayOfWeek <= 5;
    }
    if (type === "weekends") {
      return dayOfWeek === 0 || dayOfWeek === 6;
    }
    return true;
  });
}
