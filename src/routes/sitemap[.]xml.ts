import { createFileRoute } from "@tanstack/react-router";
import { getSiteUrl } from "@/lib/seo";

const languages = ["en", "fr", "ar"] as const;
const publicPaths = [
  "/",
  "/experiences",
  "/families",
  "/booking",
  "/faq",
  "/blog",
  "/private-events",
  "/gift",
  "/partners",
];

function escapeXml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

function sitemapUrl(path: string, language: (typeof languages)[number]): string {
  const url = new URL(path, getSiteUrl());
  url.searchParams.set("lang", language);
  return url.toString();
}

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const postsResult = await supabaseAdmin
          .from("posts")
          .select("slug,published_at")
          .eq("status", "published")
          .not("published_at", "is", null)
          .order("published_at", { ascending: false });
        if (postsResult.error) {
          console.error(
            "Unable to build sitemap from published articles:",
            postsResult.error.message,
          );
          return new Response("Unable to build sitemap.", { status: 503 });
        }
        const paths = [
          ...publicPaths.map((path) => ({ path, lastModified: "" })),
          ...(postsResult.data ?? []).map((post) => ({
            path: `/blog/${post.slug}`,
            lastModified: post.published_at ?? "",
          })),
        ];
        const entries = paths.flatMap(({ path, lastModified }) =>
          languages.map((language) => {
            const alternatives = languages
              .map(
                (alternate) =>
                  `<xhtml:link rel="alternate" hreflang="${alternate}" href="${escapeXml(sitemapUrl(path, alternate))}" />`,
              )
              .join("");
            const modified = lastModified
              ? `<lastmod>${escapeXml(lastModified.slice(0, 10))}</lastmod>`
              : "";
            return `<url><loc>${escapeXml(sitemapUrl(path, language))}</loc>${modified}${alternatives}</url>`;
          }),
        );
        const xml = `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">${entries.join("")}</urlset>`;
        return new Response(xml, {
          headers: {
            "Content-Type": "application/xml; charset=utf-8",
            "Cache-Control": "public, max-age=0, s-maxage=3600",
          },
        });
      },
    },
  },
});
