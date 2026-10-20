import { BRAND_NAME } from "./brand";
import { dict } from "./translations";
import type { Lang } from "./i18n";
import type { Dict } from "./translations";

const DEFAULT_SITE_URL = "https://moroccansecrets.com";

export function getSiteUrl(): string {
  const envUrl =
    (typeof import.meta !== "undefined" && import.meta.env?.["VITE_SITE_URL"]) ||
    (typeof process !== "undefined" && process.env?.["VITE_SITE_URL"]) ||
    DEFAULT_SITE_URL;
  return envUrl.replace(/\/+$/, "");
}

const seoKeyByPath: Record<string, keyof typeof dict.en.seo> = {
  "/": "home",
  "/experiences": "experiences",
  "/families": "families",
  "/booking": "booking",
  "/faq": "faq",
  "/blog": "blog",
  "/private-events": "privateEvents",
  "/gift": "gift",
  "/partners": "partners",
  "/privacy": "privacy",
  "/terms": "terms",
  "/cancellation-policy": "cancellationPolicy",
};

const openGraphImages: Record<string, { path: string; alt: string }> = {
  "/": {
    path: "/og-image.png",
    alt: "A Moroccan dinner table in a Marrakesh riad.",
  },
  "/experiences": {
    path: "/images/moroccan-dishes-on-shared-table-1200.jpg",
    alt: "Moroccan dishes arranged on a shared dinner table.",
  },
  "/families": {
    path: "/images/family-sharing-tagine-1200.jpg",
    alt: "Adults and children sharing a tagine at a family table.",
  },
  "/booking": {
    path: "/images/couple-sharing-tagine-960.jpg",
    alt: "Two guests sharing a Moroccan tagine meal.",
  },
  "/blog": {
    path: "/images/couscous-with-group-of-guests-1200.jpg",
    alt: "Guests gathered around a couscous meal.",
  },
  "/faq": {
    path: "/images/four-guests-around-dinner-960.jpg",
    alt: "Four guests sharing a meal in a riad.",
  },
  "/private-events": {
    path: "/images/large-riad-dinner-gathering-1200.jpg",
    alt: "Guests sharing dinner around a table in a riad.",
  },
  "/gift": {
    path: "/images/guests-sharing-tagine-1200.jpg",
    alt: "Guests sharing a Moroccan tagine.",
  },
  "/partners": {
    path: "/images/low-light-group-dinner-1200.jpg",
    alt: "Guests gathered around dinner in a warmly lit riad.",
  },
  "/privacy": {
    path: "/brand/logo-full.png",
    alt: "Moroccan Secrets Riad logo.",
  },
  "/terms": {
    path: "/brand/logo-full.png",
    alt: "Moroccan Secrets Riad logo.",
  },
  "/cancellation-policy": {
    path: "/brand/logo-full.png",
    alt: "Moroccan Secrets Riad logo.",
  },
};

export function localizedSeo(path: string, language: Lang, translations: Dict = dict[language]) {
  const normalizedPath = path.startsWith("/blog/") ? "/blog" : path;
  const key = seoKeyByPath[normalizedPath];
  return key ? translations.seo[key] : null;
}

export function pageHead(path: string, title: string, description: string) {
  const baseUrl = getSiteUrl();
  const canonicalUrl = path.startsWith("http")
    ? path
    : `${baseUrl}${path.startsWith("/") ? path : `/${path}`}`;
  const normalizedPath = path.startsWith("/blog/") ? "/blog" : path;
  const englishMetadata = path.startsWith("/blog/")
    ? { title, description }
    : localizedSeo(path, "en");
  const headTitle = englishMetadata?.title ?? title;
  const headDescription = englishMetadata?.description ?? description;
  const image = openGraphImages[normalizedPath] ?? {
    path: "/og-image.png",
    alt: "A Moroccan dinner table in a Marrakesh riad.",
  };
  const ogImageUrl = `${baseUrl}${image.path}`;
  const breadcrumbSegments = normalizedPath.split("/").filter(Boolean);
  const breadcrumbItems = [
    { name: dict.en.nav.home, item: `${baseUrl}/` },
    ...breadcrumbSegments.map((segment, index) => ({
      name: segment.replaceAll("-", " ").replace(/\b\w/g, (letter) => letter.toUpperCase()),
      item: `${baseUrl}/${breadcrumbSegments.slice(0, index + 1).join("/")}`,
    })),
  ];
  const breadcrumbData = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: breadcrumbItems.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.item,
    })),
  };

  return {
    meta: [
      { title: headTitle },
      { name: "description", content: headDescription },
      { property: "og:site_name", content: BRAND_NAME },
      { property: "og:title", content: headTitle },
      { property: "og:description", content: headDescription },
      { property: "og:type", content: path.startsWith("/blog/") ? "article" : "website" },
      { property: "og:url", content: canonicalUrl },
      { property: "og:image", content: ogImageUrl },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      { property: "og:image:alt", content: image.alt },
      { property: "og:locale", content: "en_US" },
      { property: "og:locale:alternate", content: "fr_FR" },
      { property: "og:locale:alternate", content: "ar_MA" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:site", content: "@moroccansecrets" },
      { name: "twitter:title", content: headTitle },
      { name: "twitter:description", content: headDescription },
      { name: "twitter:image", content: ogImageUrl },
    ],
    links: [
      { rel: "canonical", href: canonicalUrl },
      ...(["en", "fr", "ar"] as const).map((language) => ({
        rel: "alternate",
        hrefLang: language,
        href: `${canonicalUrl}${canonicalUrl.includes("?") ? "&" : "?"}lang=${language}`,
      })),
      { rel: "alternate", hrefLang: "x-default", href: canonicalUrl },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify(breadcrumbData).replace(/</g, "\\u003c"),
      },
    ],
  };
}
