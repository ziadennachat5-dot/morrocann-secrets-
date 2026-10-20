import { Link, createFileRoute } from "@tanstack/react-router";
import { SectionHead } from "@/components/site/Brand";
import { useI18n } from "@/lib/i18n";
import { getPublishedPosts } from "@/lib/public-content.functions";
import { pageHead } from "@/lib/seo";
import { BRAND_NAME } from "@/lib/brand";

export const Route = createFileRoute("/blog")({
  loader: () => getPublishedPosts(),
  head: () =>
    pageHead("/blog", `Journal — ${BRAND_NAME}`, "Guides and notes published by the host."),
  component: BlogPage,
});

function BlogPage() {
  const posts = Route.useLoaderData();
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
              <h2 className="font-display text-3xl">{post.title[lang]}</h2>
              <p className="mt-3 text-muted-foreground">{post.summary[lang]}</p>
              <Link
                to="/blog/$slug"
                params={{ slug: post.slug }}
                className="btn btn-ghost mt-5 text-primary"
              >
                {t.blogPage.readArticle}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
