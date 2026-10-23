import { describe, expect, it } from "vitest";
import { filterPhotosWithConsent, selectHeroAndGalleryPhotos } from "@/lib/guest-photos.functions";

describe("filterPhotosWithConsent", () => {
  it("returns only photos with confirmed guest consent", () => {
    expect(
      filterPhotosWithConsent([
        { id: "pending", guest_consent_confirmed: false },
        { id: "approved", guest_consent_confirmed: true },
      ]),
    ).toEqual([{ id: "approved", guest_consent_confirmed: true }]);
  });

  it("does not expose photos when consent is pending", () => {
    expect(filterPhotosWithConsent([{ guest_consent_confirmed: false }])).toEqual([]);
  });
});

describe("selectHeroAndGalleryPhotos", () => {
  const fallbackUrl = "https://example.com/experience-hero.jpg";

  it("selects 6.jpeg as hero when consent is confirmed and excludes it from gallery", () => {
    const publicPhotos = [
      {
        id: "photo-1",
        source_file: "1.jpeg",
        guest_consent_confirmed: true,
        url: "https://example.com/1.webp",
        alt: { en: "One", fr: "Un", ar: "واحد" },
      },
      {
        id: "photo-6",
        source_file: "6.jpeg",
        guest_consent_confirmed: true,
        url: "https://example.com/6.webp",
        srcSet: "https://example.com/6-640.webp 640w, https://example.com/6.webp 657w",
        alt: { en: "Six", fr: "Six", ar: "ستة" },
      },
    ];

    const result = selectHeroAndGalleryPhotos(publicPhotos, fallbackUrl);

    expect(result.isGuestHero).toBe(true);
    expect(result.heroImageUrl).toBe("https://example.com/6.webp");
    expect(result.heroImageSrcSet).toBe(
      "https://example.com/6-640.webp 640w, https://example.com/6.webp 657w",
    );
    expect(result.heroGuestPhoto?.id).toBe("photo-6");
    expect(result.galleryPhotos).toEqual([publicPhotos[0]]);
    expect(result.galleryPhotos.some((p) => p.source_file === "6.jpeg")).toBe(false);
  });

  it("falls back to experience photo and keeps gallery intact if 6.jpeg is not present", () => {
    const publicPhotos = [
      {
        id: "photo-1",
        source_file: "1.jpeg",
        guest_consent_confirmed: true,
        url: "https://example.com/1.webp",
        alt: { en: "One", fr: "Un", ar: "واحد" },
      },
    ];

    const result = selectHeroAndGalleryPhotos(publicPhotos, fallbackUrl);

    expect(result.isGuestHero).toBe(false);
    expect(result.heroImageUrl).toBe(fallbackUrl);
    expect(result.heroImageSrcSet).toBeUndefined();
    expect(result.heroGuestPhoto).toBeUndefined();
    expect(result.galleryPhotos).toEqual(publicPhotos);
  });

  it("never selects 6.jpeg if guest_consent_confirmed is false", () => {
    const publicPhotos = [
      {
        id: "photo-6",
        source_file: "6.jpeg",
        guest_consent_confirmed: false,
        url: "https://example.com/unapproved-6.webp",
        alt: { en: "Six", fr: "Six", ar: "ستة" },
      },
    ];

    const result = selectHeroAndGalleryPhotos(publicPhotos, fallbackUrl);

    expect(result.isGuestHero).toBe(false);
    expect(result.heroImageUrl).toBe(fallbackUrl);
    expect(result.heroGuestPhoto).toBeUndefined();
  });
});
