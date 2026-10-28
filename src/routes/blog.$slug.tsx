import { createFileRoute, notFound } from "@tanstack/react-router";
import { SectionHead } from "@/components/site/Brand";
import { useI18n } from "@/lib/i18n";
import { getPublishedPost } from "@/lib/public-content.functions";
import { pageHead } from "@/lib/seo";
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
      "en",
      loaderData?.title.en,
      loaderData?.summary.en,
      {
        article: {
          publishedAt: loaderData?.published_at,
          createdAt: loaderData?.created_at,
        },
      },
    ),
  component: function BlogArticleRouteComponent() {
    const post = Route.useLoaderData();
    return <BlogArticlePage post={post} />;
  },
});

export function BlogArticlePage({
  post,
}: {
  post?: Awaited<ReturnType<typeof getPublishedPost>>;
} = {}) {
  if (!post) return null;
  const { lang } = useI18n();

  const title = post.title[lang] || post.title.en;
  const summary = post.summary[lang] || post.summary.en;
  const body = post.body[lang] || post.body.en;

  return (
    <article className="mx-auto max-w-3xl px-5 py-16">
      <SectionHead eyebrow={BRAND_NAME} title={title} sub={summary} />
      <div className="mt-10 space-y-5 text-lg leading-relaxed text-muted-foreground font-sans">
        {body.split(/\n{2,}/).map((paragraph, index) => (
          <p key={index}>{paragraph}</p>
        ))}
      </div>
    </article>
  );
}
