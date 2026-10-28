import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { AdminAvailabilityManager } from "@/components/admin/AdminAvailabilityManager";
import type { Tables } from "@/integrations/supabase/types";

afterEach(cleanup);

const mockExperiences: Tables<"experiences">[] = [
  {
    id: "dinner-moroccan-family",
    title: { en: "Dinner with a Moroccan Family", fr: "Dîner en Famille Marocaine", ar: "عشاء مع عائلة مغربية" },
    description: { en: "Authentic dinner", fr: "Dîner authentique", ar: "عشاء أصيل" },
    duration: { en: "3 hours", fr: "3 heures", ar: "3 ساعات" },
    price_adult: 400,
    price_child: 200,
    max_guests: 25,
    min_guests: 1,
    cover_image_url: "https://example.com/cover.jpg",
    rating: 5,
    reviews_count: 10,
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
    published: true,
  } as unknown as Tables<"experiences">,
];

const mockAvailability: Tables<"availability">[] = [
  {
    id: "av-1",
    experience_id: "dinner-moroccan-family",
    date: "2026-10-15",
    capacity: 25,
    booked_count: 5,
    status: "available",
  } as unknown as Tables<"availability">,
  {
    id: "av-2",
    experience_id: "dinner-moroccan-family",
    date: "2026-10-16",
    capacity: 25,
    booked_count: 25,
    status: "booked",
  } as unknown as Tables<"availability">,
];

const mockBookings: Tables<"bookings">[] = [
  {
    id: "book-1",
    name: "Amina Benali",
    email: "amina@example.com",
    phone: "+212600112233",
    experience_id: "dinner-moroccan-family",
    date: "2026-10-15",
    guests: 5,
    adults: 3,
    children: 2,
    infants: 0,
    status: "confirmed",
    meal_choice: "Royal Couscous with Lamb",
    dietary_needs: "Nut allergy",
    message: "Celebrating a birthday!",
  } as unknown as Tables<"bookings">,
];

describe("AdminAvailabilityManager component", () => {
  it("renders availability title, monthly stats, and controls", () => {
    render(
      <AdminAvailabilityManager
        adminLang="en"
        experiences={mockExperiences}
        availability={mockAvailability}
        bookings={mockBookings}
        onRefresh={vi.fn()}
        onError={vi.fn()}
        onSuccess={vi.fn()}
      />,
    );

    expect(screen.getByText("Availability calendar")).toBeTruthy();
    expect(screen.getByText("Available days")).toBeTruthy();
    expect(screen.getAllByText("Fully booked").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("Closed days")).toBeTruthy();
    expect(screen.getByText("Booked guests")).toBeTruthy();

    // Mode switchers
    expect(screen.getByText("Inspect & Bookings")).toBeTruthy();
    expect(screen.getByText("Quick Paintbrush")).toBeTruthy();
    expect(screen.getByText("Bulk & Presets")).toBeTruthy();
  });

  it("switches modes between Inspect, Paintbrush, and Bulk", () => {
    render(
      <AdminAvailabilityManager
        adminLang="en"
        experiences={mockExperiences}
        availability={mockAvailability}
        bookings={mockBookings}
        onRefresh={vi.fn()}
        onError={vi.fn()}
        onSuccess={vi.fn()}
      />,
    );

    // Switch to Paintbrush mode
    fireEvent.click(screen.getByText("Quick Paintbrush"));
    expect(screen.getByText("Paintbrush Active:")).toBeTruthy();

    // Switch to Bulk mode
    fireEvent.click(screen.getByText("Bulk & Presets"));
    expect(screen.getByText("1. Target status")).toBeTruthy();
    expect(screen.getByText("2. Quick Presets")).toBeTruthy();
    expect(screen.getByText("Custom date range:")).toBeTruthy();
  });

  it("opens day details drawer when clicking a day in Inspect mode", async () => {
    render(
      <AdminAvailabilityManager
        adminLang="en"
        experiences={mockExperiences}
        availability={mockAvailability}
        bookings={mockBookings}
        onRefresh={vi.fn()}
        onError={vi.fn()}
        onSuccess={vi.fn()}
      />,
    );

    // Find and click the 15th (which has mock booking)
    const dayButton = screen.getByLabelText(/2026-10-15/);
    fireEvent.click(dayButton);

    // Day inspector should display guest bookings
    expect(await screen.findByText("Amina Benali")).toBeTruthy();
    expect(screen.getByText("Royal Couscous with Lamb")).toBeTruthy();
    expect(screen.getByText(/Nut allergy/)).toBeTruthy();
    expect(screen.getByText(/Celebrating a birthday!/)).toBeTruthy();
  });
});
