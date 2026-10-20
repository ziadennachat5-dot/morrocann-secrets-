import { describe, expect, it } from "vitest";
import {
  emptyExperienceDraft,
  emptyFamilyDraft,
  isValidCurrencyCode,
  localizedIncludedItems,
} from "@/lib/admin-catalog";

describe("admin catalog drafts", () => {
  it("starts experiences and families empty and unpublished", () => {
    const experience = emptyExperienceDraft();
    const family = emptyFamilyDraft();

    expect(experience.published).toBe(false);
    expect(experience.title).toEqual({ en: "", fr: "", ar: "" });
    expect(experience.included).toEqual({ en: "", fr: "", ar: "" });
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

  it("rejects incomplete included-item translations", () => {
    expect(localizedIncludedItems({ en: "Dinner", fr: "", ar: "" }).error).toMatch(/same number/);
  });

  it("accepts only uppercase three-letter currency codes", () => {
    expect(isValidCurrencyCode("MAD")).toBe(true);
    expect(isValidCurrencyCode("usd")).toBe(false);
    expect(isValidCurrencyCode("US")).toBe(false);
  });
});
