import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowDown, ArrowRight, Clock3 } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { BookingFlow } from "@/routes/booking";
import { getBookingOptions } from "@/lib/booking.functions";
import {
  getPublishedExperiences,
  getPublishedFaqs,
  getPublishedFamilies,
} from "@/lib/public-content.functions";
import { getPublicContactLinks } from "@/lib/public-contact.functions";
import { getHomepageContent } from "@/lib/homepage.functions";
import { DEFAULT_HOW_STEPS, visibleHomepageSections } from "@/lib/homepage-content";
import { getPublicGuestPhotos } from "@/lib/guest-photos.functions";
import { GuestPhotoGallery } from "@/components/site/GuestPhotoGallery";
import { ExperienceMediaSlider } from "@/components/site/Cards";
import { ConceptSection, MenuSection } from "@/components/site/ConceptAndMenu";
import { HeaderLogo } from "@/components/site/Brand";
import { getSiteUrl } from "@/lib/seo";

export const Route = createFileRoute("/")({
  loader: async () => {
    const [catalog, families, bookingOptions, faqs, contact, homepage, photos] = await Promise.all([
      getPublishedExperiences(),
      getPublishedFamilies(),
      getBookingOptions(),
      getPublishedFaqs(),
      getPublicContactLinks(),
      getHomepageContent(),
      getPublicGuestPhotos(),
    ]);
    return { ...catalog, families, bookingOptions, faqs, contact, homepage, photos };
  },
  head: ({ loaderData }) => {
    const siteUrl = getSiteUrl();
    const experienceItems = (loaderData?.experiences ?? []).map((experience) => ({
      "@type": "TouristTrip",
      name: experience.title.en,
      ...(experience.blurb.en ? { description: experience.blurb.en } : {}),
      url: `${siteUrl}/#experience-${encodeURIComponent(experience.id)}`,
    }));
    return {
      meta: [
        { title: "Moroccan Secrets | Home dining experiences" },
        {
          name: "description",
          content: "View published experiences, availability, and booking information.",
        },
        { property: "og:title", content: "Moroccan Secrets" },
        { property: "og:type", content: "website" },
        { property: "og:url", content: `${siteUrl}/` },
      ],
      links: [{ rel: "canonical", href: `${siteUrl}/` }],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify([
            {
              "@context": "https://schema.org",
              "@type": "WebSite",
              name: "Moroccan Secrets",
              url: `${siteUrl}/`,
            },
            {
              "@context": "https://schema.org",
              "@type": "ItemList",
              itemListElement: experienceItems.map((item, index) => ({
                "@type": "ListItem",
                position: index + 1,
                item,
              })),
            },
          ]),
        },
      ],
    };
  },
  component: HomePage,
});

function localized(
  value: { en: string; fr: string; ar: string } | null | undefined,
  lang: "en" | "fr" | "ar",
) {
  if (!value) return "";
  return value[lang]?.trim() || value.en.trim();
}

const sectionLabels = {
  concept: { en: "The Experience", fr: "L'expérience", ar: "التجربة" },
  menu: { en: "Menu", fr: "Menu", ar: "قائمة الطعام" },
  idea: { en: "The idea", fr: "L'idée", ar: "الفكرة" },
  reasons: { en: "Why try it", fr: "Pourquoi essayer", ar: "لماذا التجربة؟" },
  how: { en: "How it works", fr: "Comment ça marche", ar: "كيف تسير الأمسية" },
  experiences: { en: "Experiences", fr: "Expériences", ar: "التجارب" },
  families: { en: "Host families", fr: "Familles d'accueil", ar: "العائلات المضيفة" },
  photos: { en: "Photos", fr: "Photos", ar: "الصور" },
  booking: {
    en: "Availability & booking",
    fr: "Disponibilités et réservation",
    ar: "التوفر والحجز",
  },
  faq: { en: "FAQ", fr: "FAQ", ar: "الأسئلة الشائعة" },
  contact: { en: "Contact", fr: "Contact", ar: "التواصل" },
  whyLove: {
    en: "Why you'll love this",
    fr: "Pourquoi vous allez aimer",
    ar: "لماذا ستحب هذه التجربة",
  },
  whatToExpect: { en: "What to expect", fr: "À quoi s'attendre", ar: "ما الذي تتوقعه" },
  included: { en: "What's included", fr: "Ce qui est inclus", ar: "ما يشمله السعر" },
  whatToRemember: { en: "What to remember", fr: "À retenir", ar: "ما ينبغي تذكره" },
  hostLanguages: {
    en: "Languages spoken by the host",
    fr: "Langues parlées par l'hôte",
    ar: "اللغات التي يتحدث بها المضيف",
  },
} as const;

function HomePage() {
  const data = Route.useLoaderData();
  const { t, lang } = useI18n();
  const firstBookable = data.bookingOptions.experiences[0]?.id;
  const firstExperience = data.experiences[0];
  const [selectedExperienceId, setSelectedExperienceId] = useState(firstBookable);
  const steps = (data.homepage.steps.length ? data.homepage.steps : DEFAULT_HOW_STEPS).filter(
    (step) => localized(step, lang),
  );
  const visibleSectionIds = new Set([
    "concept",
    "menu",
    ...visibleHomepageSections({
      hasIdea: Boolean(data.homepage.idea && localized(data.homepage.idea, lang)),
      reasonCount: data.homepage.reasons.filter((reason) => localized(reason, lang)).length,
      experienceCount: data.experiences.length,
      stepCount: steps.length,
      familyCount: data.families.length,
      photoCount: data.photos.photos.length,
      bookingExperienceCount: data.bookingOptions.experiences.length,
      faqCount: data.faqs.length,
      hasContact: Boolean(data.contact.whatsapp || data.contact.email),
    }),
  ]);
  const sectionEntries = [
    ["concept", sectionLabels.concept],
    ["menu", sectionLabels.menu],
    ["why", sectionLabels.reasons],
    ["how", sectionLabels.how],
    ["experiences", sectionLabels.experiences],
    ["families", sectionLabels.families],
    ["photos", sectionLabels.photos],
    ["booking", sectionLabels.booking],
    ["faq", sectionLabels.faq],
    ["contact", sectionLabels.contact],
  ] as const;
  const sections = sectionEntries.filter(([id]) => visibleSectionIds.has(id));
  const reasons = data.homepage.reasons.filter((reason) => localized(reason, lang));
  const faqs = data.faqs;

  return (
    <div>
      {sections.length > 0 && (
        <nav
          aria-label={
            lang === "ar" ? "أقسام الصفحة" : lang === "fr" ? "Sections de la page" : "Page sections"
          }
          className="sticky top-0 z-40 border-b border-border bg-background/95 shadow-sm backdrop-blur"
        >
          <div className="mx-auto flex max-w-7xl items-center gap-3 overflow-x-auto px-4 py-3">
            <a href="#main" aria-label="Moroccan Secrets" className="shrink-0">
              <HeaderLogo />
            </a>
            {sections.map(([id, labels]) => (
              <a
                key={id}
                href={`#${id}`}
                className="min-h-11 shrink-0 content-center px-2 text-sm font-medium hover:text-primary focus-visible:outline"
              >
                {labels[lang]}
              </a>
            ))}
            {firstBookable && (
              <a href="#booking" className="btn btn-primary ml-auto min-h-11 shrink-0 !py-2">
                {t.nav.book}
              </a>
            )}
          </div>
        </nav>
      )}

      {data.homepage.hero && localized(data.homepage.hero, lang) && (
        <section
          id="home"
          className="relative flex min-h-[70svh] items-center overflow-hidden bg-ink px-5 py-16 text-ink-foreground"
        >
          <div className="mx-auto w-full max-w-7xl">
            <HeaderLogo className="mb-10" />
            <h1 className="max-w-3xl font-display text-5xl leading-tight sm:text-7xl">
              {localized(data.homepage.hero, lang)}
            </h1>
            {firstBookable && (
              <a
                href="#booking"
                className="btn btn-primary mt-8 inline-flex min-h-12 items-center gap-2"
              >
                {t.nav.book} <ArrowDown aria-hidden="true" className="h-4 w-4" />
              </a>
            )}
          </div>
        </section>
      )}

      {/* Concept Section (hardcoded in EN/FR/AR, never hidden) */}
      <ConceptSection />

      {/* Menu Section (hardcoded in EN/FR/AR, right after concept) */}
      <MenuSection />

      {reasons.length > 0 && (
        <section id="why" className="bg-secondary/10 px-5 py-16 sm:py-24">
          <div className="mx-auto max-w-7xl">
            <h2 className="font-display text-3xl sm:text-5xl">{sectionLabels.reasons[lang]}</h2>
            <ul className="mt-8 grid gap-5 sm:grid-cols-3">
              {reasons.map((reason, index) => (
                <li
                  key={index}
                  className="rounded-2xl border border-border bg-background p-6 text-lg leading-7"
                >
                  {localized(reason, lang)}
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {firstExperience && steps.length > 0 && (
        <section id="how" className="mx-auto max-w-7xl px-5 py-16 sm:py-24">
          <h2 className="font-display text-3xl sm:text-5xl">{sectionLabels.how[lang]}</h2>
          <ol className="mt-8 grid gap-5 sm:grid-cols-3">
            {steps.map((step, index) => (
              <li key={index} className="rounded-2xl bg-muted/60 p-6">
                <span className="text-sm font-semibold text-primary">{index + 1}</span>
                <p className="mt-2 text-lg">{localized(step, lang)}</p>
              </li>
            ))}
          </ol>
          <div className="mt-6 flex flex-wrap gap-4 text-sm text-foreground/75">
            <ul className="flex flex-wrap gap-x-5 gap-y-2">
              {data.experiences.map((experience) => (
                <li key={experience.id} className="inline-flex items-center gap-2">
                  <Clock3 aria-hidden="true" className="h-4 w-4" />
                  <span>
                    {localized(experience.title, lang)}
                    {experience.start_time ? ` · ${experience.start_time}` : ""}
                    {localized(experience.duration, lang)
                      ? ` · ${localized(experience.duration, lang)}`
                      : ""}
                  </span>
                </li>
              ))}
            </ul>
            {data.meetingArea && localized(data.meetingArea, lang) && (
              <p className="mt-3 text-sm text-foreground/75">
                {t.trust.meetingPoint}: {localized(data.meetingArea, lang)}
              </p>
            )}
          </div>
        </section>
      )}

      {data.experiences.length > 0 && (
        <section id="experiences" className="bg-muted/40 px-5 py-16 sm:py-24">
          <div className="mx-auto max-w-7xl">
            <h2 className="font-display text-3xl sm:text-5xl">{sectionLabels.experiences[lang]}</h2>
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {data.experiences.map((experience) => (
                <article
                  key={experience.id}
                  id={`experience-${experience.id}`}
                  className="overflow-hidden rounded-2xl border border-border bg-background"
                >
                  <ExperienceMediaSlider
                    imageUrl={experience.image_url}
                    alt={
                      experience.image_alt
                        ? localized(experience.image_alt, lang)
                        : localized(experience.title, lang)
                    }
                    aspectClass="aspect-[4/3]"
                  />
                  <div className="p-5">
                    <h3 className="font-display text-2xl">{localized(experience.title, lang)}</h3>
                    <p className="mt-3 line-clamp-3 text-foreground/75">
                      {localized(experience.blurb, lang)}
                    </p>
                    {experience.why_love.some((item) => localized(item, lang)) && (
                      <details className="mt-4">
                        <summary className="min-h-11 cursor-pointer content-center font-medium">
                          {sectionLabels.whyLove[lang]}
                        </summary>
                        <ul className="list-disc space-y-1 ps-5 text-sm">
                          {experience.why_love
                            .map((item) => localized(item, lang))
                            .filter(Boolean)
                            .map((item, index) => (
                              <li key={index}>{item}</li>
                            ))}
                        </ul>
                      </details>
                    )}
                    {experience.what_to_expect && localized(experience.what_to_expect, lang) && (
                      <details className="mt-2">
                        <summary className="min-h-11 cursor-pointer content-center font-medium">
                          {sectionLabels.whatToExpect[lang]}
                        </summary>
                        <p className="pb-2 text-sm leading-6">
                          {localized(experience.what_to_expect, lang)}
                        </p>
                      </details>
                    )}
                    {experience.included.some((item) => localized(item, lang)) && (
                      <details className="mt-2">
                        <summary className="min-h-11 cursor-pointer content-center font-medium">
                          {sectionLabels.included[lang]}
                        </summary>
                        <ul className="list-disc space-y-1 ps-5 text-sm">
                          {experience.included
                            .map((item) => localized(item, lang))
                            .filter(Boolean)
                            .map((item, index) => (
                              <li key={index}>{item}</li>
                            ))}
                        </ul>
                      </details>
                    )}
                    {experience.what_to_remember &&
                      localized(experience.what_to_remember, lang) && (
                        <details className="mt-2">
                          <summary className="min-h-11 cursor-pointer content-center font-medium">
                            {sectionLabels.whatToRemember[lang]}
                          </summary>
                          <p className="pb-2 text-sm leading-6">
                            {localized(experience.what_to_remember, lang)}
                          </p>
                        </details>
                      )}
                    {experience.host_languages && localized(experience.host_languages, lang) && (
                      <p className="mt-3 text-sm">
                        <span className="font-medium">{sectionLabels.hostLanguages[lang]}: </span>
                        {localized(experience.host_languages, lang)}
                      </p>
                    )}
                    <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-sm text-foreground/75">
                      <span>{localized(experience.duration, lang)}</span>
                    </div>
                    {data.bookingOptions.experiences.some(
                      (option) => option.id === experience.id,
                    ) && (
                      <a
                        href="#booking"
                        onClick={() => setSelectedExperienceId(experience.id)}
                        className="btn btn-primary mt-5 inline-flex min-h-11 items-center gap-2"
                      >
                        {t.nav.bookThis} <ArrowRight aria-hidden="true" className="h-4 w-4" />
                      </a>
                    )}
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      {data.families.length > 0 && (
        <section id="families" className="mx-auto max-w-7xl px-5 py-16 sm:py-24">
          <h2 className="font-display text-3xl sm:text-5xl">{sectionLabels.families[lang]}</h2>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {data.families.map((family) => (
              <article key={family.id} className="overflow-hidden rounded-2xl border border-border">
                {family.image_url && (
                  <img
                    src={family.image_url}
                    alt={
                      family.image_alt
                        ? localized(family.image_alt, lang)
                        : localized(family.name, lang)
                    }
                    loading="lazy"
                    className="aspect-[4/3] w-full object-cover"
                  />
                )}
                <div className="p-5">
                  <h3 className="font-display text-2xl">{localized(family.name, lang)}</h3>
                  <p className="mt-2 text-sm text-foreground/70">{localized(family.area, lang)}</p>
                  <p className="mt-4 leading-7">{localized(family.story, lang)}</p>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      {data.photos.photos.length > 0 && (
        <section id="photos" className="bg-ink px-5 py-16 text-ink-foreground sm:py-24">
          <div className="mx-auto max-w-7xl">
            <h2 className="font-display text-3xl sm:text-5xl">{sectionLabels.photos[lang]}</h2>
            <GuestPhotoGallery photos={data.photos.photos} />
          </div>
        </section>
      )}
      {data.photos.unavailable && (
        <p role="alert" className="mx-auto max-w-7xl px-5 py-4 text-sm text-destructive">
          {t.gallery.unavailable}
        </p>
      )}

      {data.bookingOptions.experiences.length > 0 && (
        <section id="booking" className="scroll-mt-20 px-5 py-16 sm:py-24">
          <div className="mx-auto max-w-7xl">
            <h2 className="mb-8 font-display text-3xl sm:text-5xl">
              {sectionLabels.booking[lang]}
            </h2>
            <BookingFlow
              initialExperienceId={selectedExperienceId ?? ""}
              initialOptions={data.bookingOptions}
            />
          </div>
        </section>
      )}

      {faqs.length > 0 && (
        <section id="faq" className="bg-secondary/10 px-5 py-16 sm:py-24">
          <div className="mx-auto max-w-4xl">
            <h2 className="font-display text-3xl sm:text-5xl">{sectionLabels.faq[lang]}</h2>
            <div className="mt-8 divide-y divide-border">
              {faqs.map((faq) => (
                <details key={faq.id} className="py-5">
                  <summary className="cursor-pointer text-lg font-semibold">
                    {localized(faq.question, lang)}
                  </summary>
                  <p className="mt-3 leading-7 text-foreground/75">{localized(faq.answer, lang)}</p>
                </details>
              ))}
            </div>
          </div>
        </section>
      )}

      {(data.contact.whatsapp || data.contact.email) && (
        <section id="contact" className="mx-auto max-w-7xl px-5 py-16 sm:py-24">
          <h2 className="font-display text-3xl sm:text-5xl">{sectionLabels.contact[lang]}</h2>
          <div className="mt-6 flex flex-wrap gap-4">
            {data.contact.whatsapp && (
              <a
                className="btn btn-primary min-h-12"
                href={`https://wa.me/${data.contact.whatsapp}`}
                target="_blank"
                rel="noreferrer"
              >
                WhatsApp
              </a>
            )}
            {data.contact.email && (
              <a
                className="btn min-h-12 border border-border"
                href={`mailto:${data.contact.email}`}
              >
                {data.contact.email}
              </a>
            )}
          </div>
        </section>
      )}
    </div>
  );
}
