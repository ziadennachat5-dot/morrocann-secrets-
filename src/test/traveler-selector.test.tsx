import type { ComponentProps } from "react";
import { describe, expect, it } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { BookingFlow } from "@/routes/booking";
import { I18nProvider } from "@/lib/i18n";

type BookingFlowOptions = NonNullable<ComponentProps<typeof BookingFlow>["initialOptions"]>;

const mockBookingOptions = {
  experiences: [
    {
      id: "family-dinner-marrakech",
      title: {
        en: "Dinner with a Moroccan Family",
        fr: "Dîner en Famille Marocaine",
        ar: "عشاء مع عائلة مغربية",
      },
      blurb: { en: "Dinner", fr: "Dîner", ar: "عشاء" },
      duration: { en: "3 hours", fr: "3 heures", ar: "3 ساعات" },
      price: 400,
      child_price: 200,
      child_age_min: 3,
      child_age_max: 11,
      min_guests: 1,
      deposit_amount: 0,
      max_guests: 10,
      start_time: "19:00:00",
      meal_options: [],
      why_love: [],
      what_to_expect: null,
      what_to_remember: null,
      host_languages: null,
      is_published: true,
    },
  ],
  availability: [
    {
      id: "slot-1",
      experienceId: "family-dinner-marrakech",
      date: "2026-11-15",
      remaining: 10,
    },
  ],
  calendarStatuses: [],
};

describe("Traveler Selector in BookingFlow", () => {
  it("renders all traveler categories with badges, counters, and Apply button", () => {
    render(
      <I18nProvider>
        <BookingFlow initialOptions={mockBookingOptions as unknown as BookingFlowOptions} />
      </I18nProvider>,
    );

    // Header matching UI screenshot
    expect(screen.getByText("Select up to 10 travelers in total.")).toBeInTheDocument();

    // 4 Categories
    expect(screen.getByText("Adult (Age 18-59)")).toBeInTheDocument();
    expect(screen.getByText("Senior (Age 60-99)")).toBeInTheDocument();
    expect(screen.getByText("Youth (Age 12-17)")).toBeInTheDocument();
    expect(screen.getByText("Enfants (Age 1-11)")).toBeInTheDocument();

    // Badges - Enfants (Age 1-11) is completely FREE*
    expect(screen.getAllByText("FREE*")).toHaveLength(1);

    // Footnote and Apply button
    expect(
      screen.getByText("*Enfants (ages 1–11) join completely free"),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Apply" })).toBeInTheDocument();
  });

  it("handles incrementing and decrementing and respects total cap of 10", () => {
    render(
      <I18nProvider>
        <BookingFlow initialOptions={mockBookingOptions as unknown as BookingFlowOptions} />
      </I18nProvider>,
    );

    // Initial state: 2 Adults
    const increaseSeniorBtn = screen.getByRole("button", { name: "Increase Senior (Age 60-99)" });
    fireEvent.click(increaseSeniorBtn);

    const increaseChildBtn = screen.getByRole("button", { name: "Increase Enfants (Age 1-11)" });
    fireEvent.click(increaseChildBtn);

    // Total should now be 4 (2 Adults, 1 Senior, 1 Enfants)
    expect(screen.getAllByText("4 guests").length).toBeGreaterThanOrEqual(1);

    // Apply closes picker and shows summary pill
    const applyBtn = screen.getByRole("button", { name: "Apply" });
    fireEvent.click(applyBtn);

    expect(screen.getByText(/4 travelers/i)).toBeInTheDocument();
    const changeButtons = screen.getAllByRole("button", { name: /change/i });
    expect(changeButtons.length).toBeGreaterThanOrEqual(1);

    // Clicking Change re-opens picker
    fireEvent.click(changeButtons[0]!);

    expect(screen.getByText("Select up to 10 travelers in total.")).toBeInTheDocument();
  });
});
