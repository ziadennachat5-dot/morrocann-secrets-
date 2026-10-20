import { describe, expect, it } from "vitest";
import {
  emptyExperienceDraft,
  emptyFamilyDraft,
  duplicateExperienceId,
  isValidCurrencyCode,
  localizedIncludedItems,
} from "@/lib/admin-catalog";
import { localizedTextForLanguage } from "@/lib/localized-content";

describe("admin catalog drafts", () => {
  it("starts experiences and families empty and unpublished", () => {
    const experience = emptyExperienceDraft();
    const family = emptyFamilyDraft();

    expect(experience.published).toBe(false);
    expect(experience.title).toEqual({ en: "", fr: "", ar: "" });
    expect(experience.included).toEqual({ en: "", fr: "", ar: "" });
    expect(experience.childPrice).toBe("");
    expect(experience.mealOptions).toEqual({ en: "", fr: "", ar: "" });
    expect(experience.whyLove).toEqual([
      { en: "", fr: "", ar: "" },
      { en: "", fr: "", ar: "" },
      { en: "", fr: "", ar: "" },
    ]);
    expect(family.published).toBe(false);
    expect(family.story).toEqual({ en: "", fr: "", ar: "" });
  });

  it("keeps included item translations aligned by line", () => {
    expect(
      localizedIncludedItems({
        en: "Dinner\nTea",
        fr: "Dîner\nThé",
        ar: "عشاء\nشاي",
      }),
    ).toEqual({
      items: [
        { en: "Dinner", fr: "Dîner", ar: "عشاء" },
        { en: "Tea", fr: "Thé", ar: "شاي" },
      ],
      error: null,
    });
  });

  it("allows French and Arabic included-item translations to be blank", () => {
    expect(localizedIncludedItems({ en: "Dinner\nTea", fr: "", ar: "" })).toEqual({
      items: [
        { en: "Dinner", fr: "", ar: "" },
        { en: "Tea", fr: "", ar: "" },
      ],
      error: null,
    });
  });

  it("rejects translations whose lines do not match the English items", () => {
    expect(localizedIncludedItems({ en: "Dinner\nTea", fr: "Dîner", ar: "" }).error).toMatch(
      /matching line/,
    );
  });

  it("accepts only uppercase three-letter currency codes", () => {
    expect(isValidCurrencyCode("MAD")).toBe(true);
    expect(isValidCurrencyCode("usd")).toBe(false);
    expect(isValidCurrencyCode("US")).toBe(false);
  });

  it("falls back to English when a public experience translation is blank", () => {
    expect(localizedTextForLanguage({ en: "Dinner", fr: "", ar: "عشاء" }, "fr")).toBe("Dinner");
    expect(localizedTextForLanguage({ en: "Dinner", fr: "", ar: "عشاء" }, "ar")).toBe("عشاء");
  });

  it("creates unique draft IDs for duplicated experiences", () => {
    expect(duplicateExperienceId("family-dinner", ["family-dinner"])).toBe("family-dinner-copy");
    expect(
      duplicateExperienceId("family-dinner", ["family-dinner-copy", "family-dinner-copy-2"]),
    ).toBe("family-dinner-copy-3");
  });
});
