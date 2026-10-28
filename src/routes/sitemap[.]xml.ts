import { createFileRoute } from "@tanstack/react-router";
import { getSiteUrl, getLocalizedPath } from "@/lib/seo";

const languages = ["en", "fr", "ar"] as const;
const publicPaths = [
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

function escapeXml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const postsResult = await supabaseAdmin
          .from("posts")
          .select("slug,published_at,updated_at")
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

        const today = new Date().toISOString().slice(0, 10);
        const baseUrl = getSiteUrl();

        const paths = [
          ...publicPaths.map((path) => ({ path, lastModified: today })),
          ...(postsResult.data ?? []).map((post) => ({
            path: `/blog/${post.slug}`,
            lastModified: (post.updated_at ?? post.published_at ?? today).slice(0, 10),
          })),
        ];

        const entries = paths.flatMap(({ path, lastModified }) => {
          const enUrl = `${baseUrl}${getLocalizedPath(path, "en")}`;
          const frUrl = `${baseUrl}${getLocalizedPath(path, "fr")}`;
          const arUrl = `${baseUrl}${getLocalizedPath(path, "ar")}`;

          const alternates = [
            `<xhtml:link rel="alternate" hreflang="en" href="${escapeXml(enUrl)}" />`,
            `<xhtml:link rel="alternate" hreflang="fr" href="${escapeXml(frUrl)}" />`,
            `<xhtml:link rel="alternate" hreflang="ar" href="${escapeXml(arUrl)}" />`,
            `<xhtml:link rel="alternate" hreflang="x-default" href="${escapeXml(enUrl)}" />`,
          ].join("");

          return languages.map((lang) => {
            const locUrl = `${baseUrl}${getLocalizedPath(path, lang)}`;
            const modified = `<lastmod>${escapeXml(lastModified)}</lastmod>`;
            return `<url><loc>${escapeXml(locUrl)}</loc>${modified}${alternates}</url>`;
          });
        });

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
