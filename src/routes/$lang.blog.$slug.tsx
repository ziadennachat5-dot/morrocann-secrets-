import { createFileRoute, notFound } from "@tanstack/react-router";
import { BlogArticlePage } from "@/routes/blog.$slug";
import { getPublishedPost } from "@/lib/public-content.functions";
import { pageHead } from "@/lib/seo";
import type { Lang } from "@/lib/i18n";

export const Route = createFileRoute("/$lang/blog/$slug")({
  loader: async ({ params }) => {
    const post = await getPublishedPost({ data: { slug: params.slug } });
    if (!post) throw notFound();
    return post;
  },
  head: ({ loaderData, params }) => {
    const lang = params.lang as Lang;
    return pageHead(
      `/blog/${loaderData?.slug ?? ""}`,
      lang,
      loaderData?.title[lang] || loaderData?.title.en,
      loaderData?.summary[lang] || loaderData?.summary.en,
      {
        article: {
          publishedAt: loaderData?.published_at,
          createdAt: loaderData?.created_at,
        },
      },
    );
  },
  component: function LocalizedArticle() {
    const post = Route.useLoaderData();
    return <BlogArticlePage post={post} />;
  },
});
