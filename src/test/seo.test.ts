import { describe, expect, it } from "vitest";
import { localizedSeo, pageHead } from "@/lib/seo";

const pages = [
  "/",
  "/experiences",
  "/families",
  "/booking",
  "/faq",
  "/blog",
  "/private-events",
  "/gift",
  "/partners",
  "/privacy",
  "/terms",
  "/cancellation-policy",
];

describe("localized SEO metadata", () => {
  it.each(pages)("provides metadata in all languages for %s", (path) => {
    for (const language of ["en", "fr", "ar"] as const) {
      const metadata = localizedSeo(path, language);
      expect(metadata?.title.trim()).not.toBe("");
      expect(metadata?.description.trim()).not.toBe("");
    }
  });

  it("includes canonical and language alternates plus breadcrumbs", () => {
    const head = pageHead("/faq", "FAQ", "Frequently asked questions.");
    expect(head.links).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ rel: "canonical" }),
        expect.objectContaining({ rel: "alternate", hrefLang: "fr" }),
        expect.objectContaining({ rel: "alternate", hrefLang: "ar" }),
      ]),
    );
    expect(head.scripts?.[0]?.children).toContain("BreadcrumbList");
  });
});
