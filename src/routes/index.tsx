import { createFileRoute, Link } from "@tanstack/react-router";
import { useI18n } from "@/lib/i18n";
import { pageHead } from "@/lib/seo";
import { StarDivider } from "@/components/site/Brand";
import { TrustSections } from "@/components/site/TrustSections";
import hero from "@/assets/hero.jpg";
import { BRAND_NAME, TAGLINE, BRAND_DESCRIPTION } from "@/lib/brand";
import { getSiteUrl } from "@/lib/seo";

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  name: BRAND_NAME,
  description: BRAND_DESCRIPTION,
  url: getSiteUrl(),
  image: `${getSiteUrl()}/og-image.png`,
  availableLanguage: ["English", "French", "Arabic"],
};

export const Route = createFileRoute("/")({
  head: () => {
    const metadata = pageHead("/", `${BRAND_NAME} — ${TAGLINE}`, BRAND_DESCRIPTION);
    return {
      ...metadata,
      links: [
        ...(metadata.links ?? []),
        {
          rel: "preload",
          href: "/images/hero-1200.webp",
          imageSrcSet:
            "/images/hero-480.webp 480w, /images/hero-800.webp 800w, /images/hero-1200.webp 1200w",
          imageSizes: "100vw",
          as: "image",
          type: "image/webp",
          fetchPriority: "high",
        },
      ],
      scripts: [
        ...(metadata.scripts ?? []),
        {
          type: "application/ld+json",
          children: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        },
      ],
    };
  },
  component: Home,
});

function Home() {
  const { t } = useI18n();
  return (
    <>
      {/* Hero */}
      <section className="relative isolate overflow-hidden bg-ink text-ink-foreground">
        <picture className="absolute inset-0 -z-10 block">
          <source
            type="image/webp"
            srcSet="/images/hero-480.webp 480w, /images/hero-800.webp 800w, /images/hero-1200.webp 1200w"
            sizes="100vw"
          />
          <img
            src={hero}
            alt="Candlelit riad courtyard with a tagine and mint tea"
            width={1600}
            height={1008}
            sizes="100vw"
            fetchPriority="high"
            className="h-full w-full object-cover opacity-55"
          />
        </picture>
        <div className="absolute inset-0 -z-10 bg-gradient-to-t from-ink via-ink/40 to-transparent" />
        <div className="mx-auto flex min-h-[86vh] max-w-7xl flex-col justify-end px-5 pb-16 pt-32 sm:pb-24">
          <p className="eyebrow !text-gold">{t.hero.eyebrow}</p>
          <h1 className="mt-4 max-w-4xl text-5xl sm:text-7xl lg:text-8xl">{t.hero.title}</h1>
          <p className="mt-6 max-w-xl text-lg text-ink-foreground/85">{t.hero.subtitle}</p>
          <div className="mt-9 flex flex-wrap gap-3">
            <Link to="/booking" className="btn btn-primary">
              {t.hero.cta}
            </Link>
            <Link to="/experiences" className="btn btn-ghost">
              {t.hero.secondary}
            </Link>
          </div>
        </div>
      </section>

      <StarDivider />

      <TrustSections />

      {/* Final CTA */}
      <section className="zellige-bg bg-primary text-primary-foreground">
        <div className="mx-auto max-w-4xl px-5 py-24 text-center">
          <h2 className="text-5xl sm:text-6xl">{t.final.title}</h2>
          <p className="mt-4 text-lg text-primary-foreground/85">{t.final.subtitle}</p>
          <Link to="/booking" className="btn mt-9 bg-background text-primary hover:bg-sand">
            {t.final.cta}
          </Link>
        </div>
      </section>
    </>
  );
}
