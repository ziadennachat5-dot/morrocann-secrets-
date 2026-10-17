const DEFAULT_SITE_URL = "https://moroccansecrets.com";

export function getSiteUrl(): string {
  const envUrl =
    (typeof import.meta !== "undefined" && import.meta.env?.VITE_SITE_URL) ||
    (typeof process !== "undefined" && process.env?.VITE_SITE_URL) ||
    DEFAULT_SITE_URL;
  return envUrl.replace(/\/+$/, "");
}

export function pageHead(path: string, title: string, description: string) {
  const baseUrl = getSiteUrl();
  const canonicalUrl = path.startsWith("http") ? path : `${baseUrl}${path.startsWith("/") ? path : `/${path}`}`;
  const ogImageUrl = `${baseUrl}/og-image.png`;

  return {
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:site_name", content: "Moroccan Secrets" },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { property: "og:url", content: canonicalUrl },
      { property: "og:image", content: ogImageUrl },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      { property: "og:image:alt", content: "Moroccan Secrets - Dine with a Moroccan family in Marrakesh" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:site", content: "@moroccansecrets" },
      { name: "twitter:title", content: title },
      { name: "twitter:description", content: description },
      { name: "twitter:image", content: ogImageUrl },
    ],
    links: [{ rel: "canonical", href: canonicalUrl }],
  };
}
