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
