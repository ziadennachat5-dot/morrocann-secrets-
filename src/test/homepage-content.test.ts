import { describe, expect, it } from "vitest";
import { visibleHomepageSections } from "@/lib/homepage-content";

describe("visibleHomepageSections", () => {
  it("hides sections without configured content", () => {
    expect(
      visibleHomepageSections({
        hasIdea: false,
        reasonCount: 0,
        experienceCount: 0,
        stepCount: 0,
        familyCount: 0,
        photoCount: 0,
        bookingExperienceCount: 0,
        faqCount: 0,
        hasContact: false,
      }),
    ).toEqual([]);
  });

  it("only exposes populated homepage sections", () => {
    expect(
      visibleHomepageSections({
        hasIdea: true,
        reasonCount: 3,
        experienceCount: 1,
        stepCount: 3,
        familyCount: 0,
        photoCount: 4,
        bookingExperienceCount: 1,
        faqCount: 0,
        hasContact: true,
      }),
    ).toEqual(["idea", "why", "how", "experiences", "photos", "booking", "contact"]);
  });

  it("waits for all three reasons and how-it-works steps", () => {
    expect(
      visibleHomepageSections({
        hasIdea: false,
        reasonCount: 2,
        experienceCount: 1,
        stepCount: 2,
        familyCount: 0,
        photoCount: 0,
        bookingExperienceCount: 0,
        faqCount: 0,
        hasContact: false,
      }),
    ).toEqual(["experiences"]);
  });
});
