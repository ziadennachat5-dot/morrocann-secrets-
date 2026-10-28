import { createFileRoute } from "@tanstack/react-router";
import { getSiteUrl } from "@/lib/seo";

export const Route = createFileRoute("/robots.txt")({
  server: {
    handlers: {
      GET: () => {
        const siteUrl = getSiteUrl();
        const content = [
          "User-agent: *",
          "Allow: /",
          "Disallow: /admin",
          "Disallow: /api",
          "Disallow: /review",
          "Disallow: /newsletter/confirm",
          "",
          `Sitemap: ${siteUrl}/sitemap.xml`,
          "",
        ].join("\n");
        return new Response(content, {
          headers: {
            "Content-Type": "text/plain; charset=utf-8",
            "Cache-Control": "public, max-age=0, s-maxage=3600",
          },
        });
      },
    },
  },
});
