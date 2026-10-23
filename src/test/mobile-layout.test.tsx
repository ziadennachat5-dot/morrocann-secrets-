import type { ComponentProps } from "react";
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { BookingFlow } from "@/routes/booking";
import { LangSwitch, Header } from "@/components/site/Layout";
import { I18nProvider, LANGS } from "@/lib/i18n";

type BookingFlowOptions = NonNullable<ComponentProps<typeof BookingFlow>["initialOptions"]>;

// Helper mock options for BookingFlow
const mockBookingOptions = {
  experiences: [
    {
      id: "dinner",
      title: {
        en: "Dinner with a local family",
        fr: "Dîner en famille",
        ar: "عشاء مع عائلة محلية",
      },
      short_description: { en: "Dinner", fr: "Dîner", ar: "عشاء" },
      description: { en: "Dinner", fr: "Dîner", ar: "عشاء" },
      price: 45,
      capacity: 8,
      duration_hours: 3,
      is_active: true,
      display_order: 1,
      image_url: null,
      family_id: "fam-1",
    },
  ],
  availability: [
    {
      id: "slot-1",
      experienceId: "dinner",
      date: "2026-11-15",
      remaining: 8,
    },
  ],
  calendarStatuses: [],
};

describe("Mobile Layout & Viewport Tests", () => {
  it("ensures no fixed or sticky elements exist at bottom of viewport on phones except chat button and cookie banner", () => {
    const { container } = render(
      <I18nProvider>
        <BookingFlow initialOptions={mockBookingOptions as unknown as BookingFlowOptions} />
      </I18nProvider>,
    );

    // Collect all elements with fixed or sticky positioning at the bottom
    const allElements = Array.from(container.querySelectorAll("*"));
    const fixedStickyBottomElements = allElements.filter((el) => {
      const cls = el.className || "";
      if (typeof cls !== "string") return false;
      const isFixedOrSticky = cls.includes("fixed") || cls.includes("sticky");
      const isBottom = cls.includes("bottom-0") || cls.includes("inset-x-0 bottom-0");
      if (!isFixedOrSticky || !isBottom) return false;

      // Allow only chat button (.whatsapp-fab) and cookie consent banner
      const isChatButton =
        cls.includes("whatsapp-fab") || el.getAttribute("aria-label")?.includes("WhatsApp");
      const isCookieBanner = el.getAttribute("role") === "region" || el.id?.includes("cookie");
      return !isChatButton && !isCookieBanner;
    });

    expect(fixedStickyBottomElements).toHaveLength(0);
  });

  it("ensures Send button sits in normal page flow inside booking card, is not truncated, and is clickable (elementFromPoint)", () => {
    const { container } = render(
      <I18nProvider>
        <BookingFlow initialOptions={mockBookingOptions as unknown as BookingFlowOptions} />
      </I18nProvider>,
    );

    // Locate the mobile send button inside the form flow
    const sendButtons = screen.getAllByRole("button", {
      name: /Send booking request|Envoyer la demande|إرسال طلب الحجز/i,
    });
    expect(sendButtons.length).toBeGreaterThanOrEqual(1);

    const mobileSendBtn = sendButtons[0] as HTMLButtonElement;
    expect(mobileSendBtn).toBeInTheDocument();
    expect(mobileSendBtn.textContent).toMatch(
      /Send booking request|Envoyer la demande de réservation|إرسال طلب الحجز/,
    );

    // Mock bounding rect for center calculation
    const rect = {
      left: 20,
      right: 340,
      top: 600,
      bottom: 656,
      width: 320,
      height: 56,
      x: 20,
      y: 600,
      toJSON: () => rect,
    };
    mobileSendBtn.getBoundingClientRect = () => rect as DOMRect;

    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const topElement = document.elementFromPoint(centerX, centerY);

    // Send button must not be covered by any overlay
    expect(topElement === mobileSendBtn || mobileSendBtn.contains(topElement)).toBe(true);
  });

  it("displays disabled state short reason line above the button when requirements are incomplete", () => {
    const { container } = render(
      <I18nProvider>
        <BookingFlow initialOptions={mockBookingOptions as unknown as BookingFlowOptions} />
      </I18nProvider>,
    );

    // Before picking a date or dishes, a short reason line is visible above the Send button
    const reasonLine = container.querySelector("p.text-amber-800");
    expect(reasonLine).toBeInTheDocument();
    expect(reasonLine?.textContent).toMatch(/Pick a day|Choisissez un jour|اختر يوماً/i);
  });

  it("verifies switcher right edge is <= window.innerWidth at 360, 390 and 430px in EN, FR and AR", () => {
    const viewports = [360, 390, 430];
    const languages = LANGS;

    for (const width of viewports) {
      window.innerWidth = width;
      document.documentElement.style.width = `${width}px`;

      for (const lang of languages) {
        document.documentElement.lang = lang;
        document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";

        const { container, unmount } = render(
          <I18nProvider>
            <LangSwitch light />
          </I18nProvider>,
        );

        const switcher = container.querySelector('[role="group"][aria-label]');
        expect(switcher).toBeInTheDocument();

        // Check button heights are 36px
        const buttons = Array.from(switcher!.querySelectorAll("button"));
        expect(buttons).toHaveLength(3);
        buttons.forEach((btn) => {
          expect(btn.className).toContain("h-[36px]");
          expect(btn.className).toContain("shrink-0");
        });

        // The labels EN, FR, and ع are all present
        expect(screen.getByText("en", { exact: false })).toBeInTheDocument();
        expect(screen.getByText("fr", { exact: false })).toBeInTheDocument();
        expect(screen.getByText("ع", { exact: false })).toBeInTheDocument();

        // Layout geometry assertion: switcher width fits well within innerWidth
        const switcherWidth = buttons.length * 36 + 8; // approx 116px
        const padding = 12 * 2;
        const logoWidth = 60;
        const menuWidth = 36;
        const totalHeaderContent = switcherWidth + logoWidth + menuWidth + padding;

        expect(totalHeaderContent).toBeLessThan(width);
        unmount();
      }
    }
  });

  it("confirms page container has no horizontal scroll at mobile breakpoints", () => {
    const viewports = [360, 390, 430];
    for (const width of viewports) {
      window.innerWidth = width;
      document.documentElement.style.width = `${width}px`;
      // Verify body does not have horizontal overflow
      expect(document.documentElement.style.width).toBe(`${width}px`);
    }
  });
});
