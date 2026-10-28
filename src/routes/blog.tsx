import { Link, createFileRoute } from "@tanstack/react-router";
import { SectionHead } from "@/components/site/Brand";
import { useI18n } from "@/lib/i18n";
import { getPublishedPosts } from "@/lib/public-content.functions";
import { pageHead, getLocalizedPath } from "@/lib/seo";

export const Route = createFileRoute("/blog")({
  loader: () => getPublishedPosts(),
  head: () => pageHead("/blog", "en"),
  component: function BlogRouteComponent() {
    const posts = Route.useLoaderData();
    return <BlogPage posts={posts} />;
  },
});

export function BlogPage({ posts: propPosts }: { posts?: Awaited<ReturnType<typeof getPublishedPosts>> } = {}) {
  const posts = propPosts ?? [];
  const { t, lang } = useI18n();

  return (
    <section className="mx-auto max-w-6xl px-5 py-16">
      <SectionHead eyebrow={t.blogPage.title} title={t.blogPage.title} />
      {posts.length === 0 ? (
        <p className="mt-10 text-muted-foreground">{t.blogPage.notPublished}</p>
      ) : (
        <ul className="mt-10 grid gap-6 md:grid-cols-2">
          {posts.map((post) => (
            <li key={post.slug} className="rounded-2xl border border-border bg-card p-6">
              <h2 className="font-display text-3xl">{post.title[lang] || post.title.en}</h2>
              <p className="mt-3 text-muted-foreground">{post.summary[lang] || post.summary.en}</p>
              <a
                href={getLocalizedPath(`/blog/${post.slug}`, lang)}
                className="btn btn-ghost mt-5 text-primary"
              >
                {t.blogPage.readArticle}
              </a>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
