export type AvailabilitySlot = {
  id: string;
  date: string;
  experienceId: string;
  remaining: number;
};

export function filterAvailableBookingSlots<T extends AvailabilitySlot>(
  slots: T[],
  experienceId: string | null,
  guests: number,
  today: string,
  privateGroup: boolean,
): T[] {
  return slots.filter(
    (slot) =>
      (experienceId === null || slot.experienceId === experienceId) &&
      slot.date >= today &&
      slot.remaining >= guests &&
      (!privateGroup || guests >= 6),
  );
}
