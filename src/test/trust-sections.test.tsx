import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { TrustSections } from "@/components/site/TrustSections";
import { I18nProvider } from "@/lib/i18n";
import { getTrustContent } from "@/lib/trust.functions";

vi.mock("@/lib/trust.functions", () => ({ getTrustContent: vi.fn() }));

const emptyTrustContent = {
  included: null,
  notIncluded: null,
  goodToKnow: {
    arrivalTime: null,
    meetingPoint: null,
    dress: null,
    alcoholPolicy: null,
    whatToBring: null,
  },
  whyFamilyHome: null,
  safetyHygiene: null,
  reviews: [],
  reviewLinks: { tripAdvisor: null, googleBusiness: null },
};

afterEach(cleanup);

describe("trust content sections", () => {
  beforeEach(() => {
    vi.mocked(getTrustContent).mockResolvedValue(emptyTrustContent);
  });

  it("hides sections until real content or approved reviews exist", async () => {
    render(
      <I18nProvider>
        <TrustSections />
      </I18nProvider>,
    );

    await waitFor(() => expect(getTrustContent).toHaveBeenCalledOnce());
    expect(screen.queryByText("What's included")).toBeNull();
    expect(screen.queryByText("Remembered long after the trip")).toBeNull();
  });

  it("renders configured multilingual content and approved reviews", async () => {
    vi.mocked(getTrustContent).mockResolvedValue({
      ...emptyTrustContent,
      included: {
        en: ["Dinner"],
        fr: ["Dîner"],
        ar: ["عشاء"],
      },
      goodToKnow: {
        ...emptyTrustContent.goodToKnow,
        meetingPoint: {
          en: "Confirmed meeting point",
          fr: "Point de rendez-vous confirmé",
          ar: "نقطة لقاء مؤكدة",
        },
      },
      reviews: [
        {
          id: "567e3164-8c55-4b0c-849e-582e61fbd239",
          experience_id: null,
          author: "Verified guest",
          origin: "",
          quote: { en: "A real review.", fr: "Un vrai avis.", ar: "تقييم حقيقي." },
          rating: 5,
          created_at: "2026-10-20T12:00:00.000Z",
        },
      ],
    });

    render(
      <I18nProvider>
        <TrustSections />
      </I18nProvider>,
    );

    expect(await screen.findByText("Dinner")).toBeTruthy();
    expect(screen.getByText("Confirmed meeting point")).toBeTruthy();
    expect(screen.getByText(/A real review\./)).toBeTruthy();
  });
});
