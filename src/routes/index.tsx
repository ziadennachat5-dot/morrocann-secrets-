import { createFileRoute, Link } from "@tanstack/react-router";
import { Quote } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { families, menu, reviews, faqs, CONTACT } from "@/lib/content";
import { pageHead } from "@/lib/seo";
import { SectionHead, StarDivider, PlaceholderTag } from "@/components/site/Brand";
import { FamilyCard } from "@/components/site/Cards";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import hero from "@/assets/hero.jpg";
import cooking from "@/assets/cooking.jpg";

const jsonLd = {
  "@context": "https://schema.org",
  "@type": ["TouristAttraction", "LocalBusiness"],
  name: "Moroccan Secrets",
  description: "Home dining and cooking experiences with local Moroccan families in a Marrakesh riad.",
  address: { "@type": "PostalAddress", addressLocality: "Marrakesh", addressCountry: "MA" },
  touristType: ["Food lovers", "Families", "Cultural travellers"],
  availableLanguage: ["English", "French", "Arabic"],
  email: CONTACT.email,
  priceRange: "€€",
};

export const Route = createFileRoute("/")({
  head: () => ({
    ...pageHead("/", "Moroccan Secrets — Dine with a family in Marrakesh", "Sit at a Moroccan family's table: mint tea, cooking together and a slow home-cooked dinner in a Marrakesh riad."),
    scripts: [{ type: "application/ld+json", children: JSON.stringify(jsonLd) }],
  }),
  component: Home,
});

function Home() {
  const { t, l } = useI18n();
  return (
    <>
      {/* Hero */}
      <section className="relative isolate overflow-hidden bg-ink text-ink-foreground">
        <img src={hero} alt="Candlelit riad courtyard with a tagine and mint tea" width={1600} height={1008} className="absolute inset-0 -z-10 h-full w-full object-cover opacity-55" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-t from-ink via-ink/40 to-transparent" />
        <div className="mx-auto flex min-h-[86vh] max-w-7xl flex-col justify-end px-5 pb-16 pt-32 sm:pb-24">
          <p className="eyebrow !text-gold">{t.hero.eyebrow}</p>
          <h1 className="mt-4 max-w-4xl text-5xl sm:text-7xl lg:text-8xl">{t.hero.title}</h1>
          <p className="mt-6 max-w-xl text-lg text-ink-foreground/85">{t.hero.subtitle}</p>
          <div className="mt-9 flex flex-wrap gap-3">
            <Link to="/booking" className="btn btn-primary">{t.hero.cta}</Link>
            <Link to="/experiences" className="btn btn-ghost">{t.hero.secondary}</Link>
          </div>
        </div>
      </section>

      {/* How it works — numbered timeline */}
      <section className="mx-auto max-w-7xl px-5 py-24">
        <SectionHead eyebrow={t.how.eyebrow} title={t.how.title} center />
        <ol className="mt-16 grid gap-12 md:grid-cols-3 md:gap-8">
          {t.how.steps.map((s, i) => (
            <li key={i} className="relative border-t-2 border-primary pt-6">
              <span className="font-display text-7xl leading-none text-gold">0{i + 1}</span>
              <h3 className="mt-3 text-3xl">{s.t}</h3>
              <p className="mt-2 text-muted-foreground">{s.d}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* Menu — split with image */}
      <section className="bg-sand">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-5 py-24 lg:grid-cols-[1fr_1.1fr]">
          <img src={cooking} alt="Hosts and guests hand-rolling couscous" loading="lazy" width={1200} height={912} className="arch aspect-[4/5] w-full object-cover" />
          <div>
            <SectionHead eyebrow={t.menu.eyebrow} title={t.menu.title} />
            <ul className="mt-10 divide-y divide-gold/40 border-y border-gold/40">
              {menu.map((m) => (
                <li key={m.course.en} className="grid gap-1 py-5 sm:grid-cols-[9rem_1fr]">
                  <span className="eyebrow pt-1">{l(m.course)}</span>
                  <div>
                    <p className="font-display text-2xl">{l(m.dish)}</p>
                    <p className="text-sm italic text-muted-foreground">{l(m.note)}</p>
                  </div>
                </li>
              ))}
            </ul>
            <p className="mt-4 text-sm text-muted-foreground">{t.menu.note}</p>
          </div>
        </div>
      </section>

      {/* Families — asymmetric */}
      <section className="mx-auto max-w-7xl px-5 py-24">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <SectionHead eyebrow={t.families.eyebrow} title={t.families.title} />
          <Link to="/families" className="btn btn-ghost text-primary">{t.families.all}</Link>
        </div>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          <div className="md:col-span-2"><FamilyCard f={families[0]} /></div>
          <div className="grid gap-6"><FamilyCard f={families[1]} compact /></div>
        </div>
      </section>

      <StarDivider />

      {/* Reviews — large quote + small quotes */}
      <section className="mx-auto max-w-6xl px-5 py-24">
        <SectionHead eyebrow={t.reviews.eyebrow} title={t.reviews.title} center />
        <figure className="mx-auto mt-14 max-w-3xl text-center">
          <Quote className="mx-auto h-10 w-10 text-gold" aria-hidden />
          <blockquote className="mt-4 font-display text-3xl leading-snug sm:text-4xl">“{l(reviews[0].quote)}”</blockquote>
          <figcaption className="mt-5 text-sm text-muted-foreground">— {reviews[0].author}, {reviews[0].origin} <PlaceholderTag /></figcaption>
        </figure>
        <div className="mt-14 grid gap-6 sm:grid-cols-2">
          {reviews.slice(1).map((r) => (
            <figure key={r.author} className="border-s-4 border-accent bg-card p-6">
              <blockquote className="text-lg">“{l(r.quote)}”</blockquote>
              <figcaption className="mt-3 text-sm text-muted-foreground">— {r.author}, {r.origin}</figcaption>
            </figure>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-card">
        <div className="mx-auto grid max-w-6xl gap-10 px-5 py-24 md:grid-cols-[1fr_1.5fr]">
          <SectionHead eyebrow={t.faq.eyebrow} title={t.faq.title} />
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((f, i) => (
              <AccordionItem key={i} value={`q${i}`}>
                <AccordionTrigger className="text-start font-display text-xl">{l(f.q)}</AccordionTrigger>
                <AccordionContent className="text-base text-muted-foreground">{l(f.a)}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* Final CTA */}
      <section className="zellige-bg bg-primary text-primary-foreground">
        <div className="mx-auto max-w-4xl px-5 py-24 text-center">
          <h2 className="text-5xl sm:text-6xl">{t.final.title}</h2>
          <p className="mt-4 text-lg text-primary-foreground/85">{t.final.subtitle}</p>
          <Link to="/booking" className="btn mt-9 bg-background text-primary hover:bg-sand">{t.final.cta}</Link>
        </div>
      </section>
    </>
  );
}
