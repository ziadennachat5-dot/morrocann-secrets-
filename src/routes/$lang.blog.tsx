import { createFileRoute } from "@tanstack/react-router";
import { BlogPage } from "@/routes/blog";
import { getPublishedPosts } from "@/lib/public-content.functions";
import { pageHead } from "@/lib/seo";
import type { Lang } from "@/lib/i18n";

export const Route = createFileRoute("/$lang/blog")({
  loader: () => getPublishedPosts(),
  head: ({ params }) => pageHead("/blog", params.lang as Lang),
  component: function LocalizedBlog() {
    const posts = Route.useLoaderData();
    return <BlogPage posts={posts} />;
  },
});
