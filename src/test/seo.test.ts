import { describe, expect, it } from "vitest";
import { localizedSeo, pageHead, getSiteUrl, getLocalizedPath } from "@/lib/seo";
import { BRAND_NAME } from "@/lib/brand";

const pages = [
  "/",
  "/booking",
  "/blog",
  "/private-events",
  "/gift",
  "/partners",
  "/privacy",
  "/terms",
  "/cancellation-policy",
];

const languages = ["en", "fr", "ar"] as const;

describe("SEO titles and descriptions", () => {
  it.each(pages)("page %s has title under 60 chars and description under 155 chars in EN, FR, AR", (path) => {
    for (const language of languages) {
      const metadata = localizedSeo(path, language);
      expect(metadata).not.toBeNull();
      expect(metadata?.title).toBeDefined();
      expect(metadata?.description).toBeDefined();

      // Title must be under 60 chars
      expect(metadata!.title.length).toBeLessThan(60);
      expect(metadata!.title.length).toBeGreaterThan(10);

      // Main phrase first, brand last
      expect(metadata!.title).toContain(BRAND_NAME);
      expect(metadata!.title.endsWith(BRAND_NAME)).toBe(true);

      // Meta description must be under 155 chars
      expect(metadata!.description.length).toBeLessThan(155);
      expect(metadata!.description.length).toBeGreaterThan(20);
    }
  });

  it("targets primary keyword phrases in titles across languages", () => {
    const enHome = localizedSeo("/", "en");
    expect(enHome?.title.toLowerCase()).toContain("dinner with a local family marrakech");

    const frHome = localizedSeo("/", "fr");
    expect(frHome?.title.toLowerCase()).toContain("dîner chez l'habitant marrakech");

    const arHome = localizedSeo("/", "ar");
    expect(arHome?.title).toContain("عشاء عند عائلة مغربية مراكش");
  });
});

describe("Crawlable URLs, canonical, and hreflang", () => {
  it("generates correct canonical and hreflang tags for English (/)", () => {
    const baseUrl = getSiteUrl();
    const head = pageHead("/", "en");

    expect(head.links).toEqual(
      expect.arrayContaining([
        { rel: "canonical", href: `${baseUrl}/` },
        { rel: "alternate", hrefLang: "en", href: `${baseUrl}/` },
        { rel: "alternate", hrefLang: "fr", href: `${baseUrl}/fr` },
        { rel: "alternate", hrefLang: "ar", href: `${baseUrl}/ar` },
        { rel: "alternate", hrefLang: "x-default", href: `${baseUrl}/` },
      ]),
    );
  });

  it("generates correct canonical and hreflang tags for French (/fr)", () => {
    const baseUrl = getSiteUrl();
    const head = pageHead("/", "fr");

    expect(head.links).toEqual(
      expect.arrayContaining([
        { rel: "canonical", href: `${baseUrl}/fr` },
        { rel: "alternate", hrefLang: "en", href: `${baseUrl}/` },
        { rel: "alternate", hrefLang: "fr", href: `${baseUrl}/fr` },
        { rel: "alternate", hrefLang: "ar", href: `${baseUrl}/ar` },
        { rel: "alternate", hrefLang: "x-default", href: `${baseUrl}/` },
      ]),
    );
  });

  it("generates correct canonical and hreflang tags for Arabic subpages (/ar/booking)", () => {
    const baseUrl = getSiteUrl();
    const head = pageHead("/booking", "ar");

    expect(head.links).toEqual(
      expect.arrayContaining([
        { rel: "canonical", href: `${baseUrl}/ar/booking` },
        { rel: "alternate", hrefLang: "en", href: `${baseUrl}/booking` },
        { rel: "alternate", hrefLang: "fr", href: `${baseUrl}/fr/booking` },
        { rel: "alternate", hrefLang: "ar", href: `${baseUrl}/ar/booking` },
        { rel: "alternate", hrefLang: "x-default", href: `${baseUrl}/booking` },
      ]),
    );
  });

  it("converts paths cleanly with getLocalizedPath", () => {
    expect(getLocalizedPath("/", "en")).toBe("/");
    expect(getLocalizedPath("/", "fr")).toBe("/fr");
    expect(getLocalizedPath("/", "ar")).toBe("/ar");

    expect(getLocalizedPath("/booking", "en")).toBe("/booking");
    expect(getLocalizedPath("/booking", "fr")).toBe("/fr/booking");
    expect(getLocalizedPath("/booking", "ar")).toBe("/ar/booking");

    expect(getLocalizedPath("/fr/blog/article", "en")).toBe("/blog/article");
    expect(getLocalizedPath("/fr/blog/article", "ar")).toBe("/ar/blog/article");
  });
});

describe("Structured Data (JSON-LD)", () => {
  it("includes LocalBusiness and TouristAttraction with consistent local signals", () => {
    const head = pageHead("/", "en");
    const jsonLdScripts = head.scripts?.map((s) => JSON.parse(s.children));
    const business = jsonLdScripts?.find((d) => Array.isArray(d["@type"]) && d["@type"].includes("LocalBusiness"));

    expect(business).toBeDefined();
    expect(business.name).toBe("Moroccan Secrets");
    expect(business.address.streetAddress).toBe("Bab Ghmat");
    expect(business.address.addressLocality).toBe("Marrakech");
    expect(business.telephone).toBe("+212707072556");

    // Must never output email when empty/unfilled
    expect(business.email).toBeUndefined();

    // Must never leak private meeting points
    expect(JSON.stringify(business)).not.toContain("derb");
    expect(JSON.stringify(business)).not.toContain("exact");
  });

  it("strictly avoids AggregateRating or Review markup when approved reviews do not exist", () => {
    const head = pageHead("/", "en", undefined, {
      experiences: [
        {
          title: { en: "Dinner with a Moroccan Family" },
          blurb: { en: "Share a home-cooked tagine." },
          price: 23,
        },
      ],
    });

    const allJsonLd = head.scripts?.map((s) => s.children).join(" ") ?? "";
    expect(allJsonLd).not.toContain("AggregateRating");
    expect(allJsonLd).not.toContain("aggregateRating");
    expect(allJsonLd).not.toContain('"@type":"Review"');
    expect(allJsonLd).not.toContain('"@type": "Review"');
  });

  it("includes TouristTrip with Offer for experiences", () => {
    const head = pageHead("/", "en", undefined, {
      experiences: [
        {
          title: { en: "Dinner with a Moroccan Family" },
          blurb: { en: "Share a home-cooked tagine." },
          price: 23,
        },
      ],
    });

    const jsonLdScripts = head.scripts?.map((s) => JSON.parse(s.children));
    const trip = jsonLdScripts?.find((d) => d["@type"] === "TouristTrip");

    expect(trip).toBeDefined();
    expect(trip.name).toBe("Dinner with a Moroccan Family");
    expect(trip.offers.price).toBe(23);
    expect(trip.offers.priceCurrency).toBe("EUR");
    expect(trip.offers.availability).toBe("https://schema.org/InStock");
  });

  it("includes Article markup for blog posts", () => {
    const head = pageHead("/blog/dinner-etiquette", "en", "Moroccan Dining Etiquette", "Essential etiquette tips", {
      article: {
        publishedAt: "2026-10-25T00:00:00Z",
      },
    });

    const jsonLdScripts = head.scripts?.map((s) => JSON.parse(s.children));
    const article = jsonLdScripts?.find((d) => d["@type"] === "Article");

    expect(article).toBeDefined();
    expect(article.headline).toBe("Moroccan Dining Etiquette");
    expect(article.author.name).toBe("Moroccan Secrets");
  });
});

describe("robots.txt rules", () => {
  it("blocks admin, api, review, newsletter confirmation and references sitemap", async () => {
    const siteUrl = getSiteUrl();
    const expectedRules = [
      "Allow: /",
      "Disallow: /admin",
      "Disallow: /api",
      "Disallow: /review",
      "Disallow: /newsletter/confirm",
      `Sitemap: ${siteUrl}/sitemap.xml`,
    ];

    const fs = await import("fs");
    const robotsContent = fs.readFileSync("public/robots.txt", "utf-8");

    for (const rule of expectedRules) {
      if (rule.startsWith("Sitemap:")) {
        expect(robotsContent).toContain("Sitemap:");
      } else {
        expect(robotsContent).toContain(rule);
      }
    }
  });
});
