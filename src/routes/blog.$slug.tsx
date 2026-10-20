import { createFileRoute, notFound } from "@tanstack/react-router";
import { useEffect } from "react";
import { SectionHead } from "@/components/site/Brand";
import { useI18n } from "@/lib/i18n";
import { getPublishedPost } from "@/lib/public-content.functions";
import { getSiteUrl, pageHead } from "@/lib/seo";
import { BRAND_NAME } from "@/lib/brand";

export const Route = createFileRoute("/blog/$slug")({
  loader: async ({ params }) => {
    const post = await getPublishedPost({ data: { slug: params.slug } });
    if (!post) throw notFound();
    return post;
  },
  head: ({ loaderData }) =>
    pageHead(
      `/blog/${loaderData?.slug ?? ""}`,
      loaderData ? `${loaderData.title.en} — ${BRAND_NAME}` : `Journal — ${BRAND_NAME}`,
      loaderData?.summary.en ?? "A guide published by the host.",
    ),
  component: BlogArticlePage,
});

function BlogArticlePage() {
  const post = Route.useLoaderData();
  const { lang } = useI18n();
  const articleUrl = `${getSiteUrl()}/blog/${post.slug}`;
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title[lang],
    description: post.summary[lang],
    inLanguage: lang,
    datePublished: post.published_at,
    author: { "@type": "Organization", name: BRAND_NAME },
    mainEntityOfPage: articleUrl,
  };

  useEffect(() => {
    document.title = `${post.title[lang]} — ${BRAND_NAME}`;
    const pageUrl = new URL(window.location.href);
    pageUrl.searchParams.set("lang", lang);
    document
      .querySelector<HTMLLinkElement>('link[rel="canonical"]')
      ?.setAttribute("href", pageUrl.toString());
    document
      .querySelector<HTMLMetaElement>('meta[name="description"]')
      ?.setAttribute("content", post.summary[lang]);
    document
      .querySelector<HTMLMetaElement>('meta[property="og:title"]')
      ?.setAttribute("content", `${post.title[lang]} — ${BRAND_NAME}`);
    document
      .querySelector<HTMLMetaElement>('meta[property="og:description"]')
      ?.setAttribute("content", post.summary[lang]);
  }, [lang, post]);

  return (
    <article className="mx-auto max-w-3xl px-5 py-16">
      <SectionHead eyebrow={BRAND_NAME} title={post.title[lang]} sub={post.summary[lang]} />
      <div className="mt-10 space-y-5 text-lg leading-relaxed text-muted-foreground">
        {post.body[lang].split(/\n{2,}/).map((paragraph, index) => (
          <p key={index}>{paragraph}</p>
        ))}
      </div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData).replace(/</g, "\\u003c"),
        }}
      />
    </article>
  );
}
