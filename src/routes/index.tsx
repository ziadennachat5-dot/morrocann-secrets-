import { createFileRoute, Link } from "@tanstack/react-router";
import { useI18n } from "@/lib/i18n";
import { families, menu, faqs, CONTACT } from "@/lib/content";
import { pageHead } from "@/lib/seo";
import { SectionHead, StarDivider } from "@/components/site/Brand";
import { FamilyCard } from "@/components/site/Cards";
import { Photo } from "@/components/site/Photo";
import { TrustSections } from "@/components/site/TrustSections";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import hero from "@/assets/hero.jpg";
import { BRAND_NAME, TAGLINE, BRAND_DESCRIPTION } from "@/lib/brand";
import { photos } from "@/lib/photos";

const jsonLd = {
  "@context": "https://schema.org",
  "@type": ["TouristAttraction", "LocalBusiness"],
  name: BRAND_NAME,
  description: BRAND_DESCRIPTION,
  address: { "@type": "PostalAddress", addressLocality: "Marrakesh", addressCountry: "MA" },
  touristType: ["Food lovers", "Families", "Cultural travellers"],
  availableLanguage: ["English", "French", "Arabic"],
  email: CONTACT.email,
  priceRange: "€€",
};

const stepPhotos = [
  photos["women-in-embroidered-kaftans"],
  photos["couple-sharing-tagine"],
  photos["large-riad-dinner-gathering"],
];

export const Route = createFileRoute("/")({
  head: () => ({
    ...pageHead("/", `${BRAND_NAME} — ${TAGLINE}`, BRAND_DESCRIPTION),
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
        <img
          src={hero}
          alt="Candlelit riad courtyard with a tagine and mint tea"
          width={1600}
          height={1008}
          fetchPriority="high"
          className="absolute inset-0 -z-10 h-full w-full object-cover opacity-55"
        />
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

      {/* How it works — numbered timeline */}
      <section className="mx-auto max-w-7xl px-5 py-24">
        <SectionHead eyebrow={t.how.eyebrow} title={t.how.title} center />
        <ol className="mt-16 grid gap-12 md:grid-cols-3 md:gap-8">
          {t.how.steps.map((s, i) => {
            const photo = stepPhotos[i];
            if (!photo) throw new Error(`Missing photo for how-it-works step ${i + 1}`);

            return (
              <li key={i} className="relative border-t-2 border-primary pt-6">
                <Photo
                  photo={photo}
                  sizes="(min-width: 768px) 30vw, 100vw"
                  className="mb-5 aspect-[4/3] w-full rounded-xl object-cover"
                />
                <span className="font-display text-7xl leading-none text-gold">0{i + 1}</span>
                <h3 className="mt-3 text-3xl">{s.t}</h3>
                <p className="mt-2 text-muted-foreground">{s.d}</p>
              </li>
            );
          })}
        </ol>
      </section>

      {/* Menu — split with image */}
      <section className="bg-sand">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-5 py-24 lg:grid-cols-[1fr_1.1fr]">
          <Photo
            photo={photos["family-sharing-tagine"]}
            sizes="(min-width: 1024px) 50vw, 100vw"
            className="arch aspect-[4/5] w-full object-cover"
          />
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
          <Link to="/families" className="btn btn-ghost text-primary">
            {t.families.all}
          </Link>
        </div>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          <div className="md:col-span-2">
            <FamilyCard f={families[0]} />
          </div>
          <div className="grid gap-6">
            <FamilyCard f={families[1]} compact />
          </div>
        </div>
      </section>

      <StarDivider />

      <TrustSections />

      {/* FAQ */}
      <section className="bg-card">
        <div className="mx-auto grid max-w-6xl gap-10 px-5 py-24 md:grid-cols-[1fr_1.5fr]">
          <SectionHead eyebrow={t.faq.eyebrow} title={t.faq.title} />
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((f, i) => (
              <AccordionItem key={i} value={`q${i}`}>
                <AccordionTrigger className="text-start font-display text-xl">
                  {l(f.q)}
                </AccordionTrigger>
                <AccordionContent className="text-base text-muted-foreground">
                  {l(f.a)}
                </AccordionContent>
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
          <Link to="/booking" className="btn mt-9 bg-background text-primary hover:bg-sand">
            {t.final.cta}
          </Link>
        </div>
      </section>
    </>
  );
}
