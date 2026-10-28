import { describe, expect, it } from "vitest";
import { formatClientWhatsappUrl } from "@/lib/whatsapp-client";

describe("formatClientWhatsappUrl", () => {
  it("formats international number properly", () => {
    const url = formatClientWhatsappUrl({
      phone: "+33 6 12 34 56 78",
      name: "Jean Dupont",
      experienceTitle: "Dinner with a Moroccan Family",
      date: "2026-10-30",
      lang: "fr",
    });

    expect(url).toContain("https://wa.me/33612345678?text=");
    expect(decodeURIComponent(url!)).toContain("Jean Dupont");
    expect(decodeURIComponent(url!)).toContain("Dinner with a Moroccan Family");
  });

  it("normalizes Moroccan local 06 number to 2126", () => {
    const url = formatClientWhatsappUrl({
      phone: "06 12 34 56 78",
      name: "Fatima Zahra",
      date: "2026-11-05",
      lang: "ar",
    });

    expect(url).toContain("https://wa.me/212612345678?text=");
    expect(decodeURIComponent(url!)).toContain("Fatima Zahra");
  });

  it("returns null for empty or invalid phone", () => {
    expect(formatClientWhatsappUrl({ phone: "" })).toBeNull();
    expect(formatClientWhatsappUrl({ phone: "123" })).toBeNull();
  });
});
