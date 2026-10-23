import { createFileRoute } from "@tanstack/react-router";
import { Utensils, MapPin, Check, ArrowRight } from "lucide-react";
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
import { getPublicGuestPhotos, selectHeroAndGalleryPhotos } from "@/lib/guest-photos.functions";
import { GuestPhotoGallery } from "@/components/site/GuestPhotoGallery";
import { ConceptSection, MenuSection } from "@/components/site/ConceptAndMenu";
import { OrnamentDivider } from "@/components/site/Brand";
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
    const fallbackHeroUrl = loaderData?.experiences?.[0]?.image_url ?? "/images/hero-1200.webp";
    const heroImage =
      loaderData?.photos?.photos?.find(
        (p: { source_file?: string | null; guest_consent_confirmed: boolean }) =>
          p.source_file === "6.jpeg" && p.guest_consent_confirmed,
      )?.url || fallbackHeroUrl;
    return {
      meta: [
        { title: "Moroccan Secrets | Dinner with a local Moroccan family in Marrakech" },
        {
          name: "description",
          content:
            "Share an authentic dinner with a local Moroccan family in Marrakech. Homemade cuisine, warm hospitality, traditional music and cultural exchange.",
        },
        { property: "og:title", content: "Moroccan Secrets" },
        { property: "og:type", content: "website" },
        { property: "og:url", content: `${siteUrl}/` },
        { property: "og:image", content: heroImage },
      ],
      links: [
        { rel: "canonical", href: `${siteUrl}/` },
        { rel: "preload", as: "image", href: heroImage, fetchPriority: "high" },
      ],
    };
  },
  component: HomePage,
});

const HOW_IT_WORKS_STEPS = [
  {
    num: "01",
    title: {
      en: "Arrive and enjoy tea",
      fr: "Arrivez et savourez le thé",
      ar: "الوصول والاستمتاع بالشاي",
    },
    desc: {
      en: "You are welcomed into the family home with Moroccan mint tea.",
      fr: "Vous êtes accueillis dans la maison familiale avec un thé à la menthe marocain traditionnel.",
      ar: "تستقبلكم العائلة في بيتها بالشاي المغربي الأصيل بالنعناع.",
    },
  },
  {
    num: "02",
    title: { en: "Cook together", fr: "Cuisinez ensemble", ar: "الطبخ معاً" },
    desc: {
      en: "Join the family in the kitchen and help prepare the meal.",
      fr: "Rejoignez la famille en cuisine et participez à la préparation du repas.",
      ar: "شارك العائلة في المطبخ وساهم في إعداد وجبة العشاء.",
    },
  },
  {
    num: "03",
    title: { en: "Eat slowly", fr: "Prenez le temps de manger", ar: "تناول الطعام بهدوء" },
    desc: {
      en: "Share the table, the stories and the music.",
      fr: "Partagez la table, les anecdotes et la musique authentique.",
      ar: "شارك المائدة، والحكايات العائلية والموسيقى الأصيلة.",
    },
  },
] as const;

function HomePage() {
  const data = Route.useLoaderData();
  const { lang } = useI18n();
  const firstBookable = data.bookingOptions.experiences[0]?.id;
  const firstExperience = data.experiences[0];

  const fallbackHeroUrl = firstExperience?.image_url ?? "/images/hero-1200.webp";
  const { heroGuestPhoto, heroImageUrl, heroImageSrcSet, galleryPhotos } =
    selectHeroAndGalleryPhotos(data.photos.photos, fallbackHeroUrl);

  const heroImageAlt = heroGuestPhoto
    ? heroGuestPhoto.alt[lang] || heroGuestPhoto.alt.en || "Dinner with a Moroccan family"
    : firstExperience?.title?.[lang] || "Eat with a local Moroccan family";

  const heroH1Line1 = {
    en: "Eat with a local",
    fr: "Partagez le repas d'une",
    ar: "تناول الطعام مع",
  };
  const heroH1Line2 = {
    en: "Moroccan family",
    fr: "famille marocaine",
    ar: "عائلة مغربية",
  };
  const heroBadgeText = {
    en: "Marrakech · Family dinner",
    fr: "Marrakech · Dîner en famille",
    ar: "مراكش · عشاء عائلي",
  };
  const heroSubtitle = {
    en: "A real family home in Marrakech. Authentic cuisine, culture, hospitality and memories.",
    fr: "Une vraie maison familiale à Marrakech. Cuisine authentique, culture, hospitalité et souvenirs.",
    ar: "بيت عائلي حقيقي في مراكش. مطبخ أصيل، ثقافة، ضيافة وذكريات.",
  };
  const bookingTitle = {
    en: "Book your dinner",
    fr: "Réservez votre dîner",
    ar: "احجز عشاءك",
  };
  const seeMenuText = {
    en: "See the menu",
    fr: "Voir le menu",
    ar: "شاهد قائمة الطعام",
  };
  const heroFactsColumns = [
    {
      num: "19:00",
      label: { en: "Start", fr: "Début", ar: "البداية" },
    },
    {
      num: "3h",
      label: { en: "Together", fr: "Partagées", ar: "معاً" },
    },
    {
      num: "2",
      label: { en: "Dishes to choose", fr: "Plats au choix", ar: "أطباق للاختيار" },
    },
    {
      num: "8",
      label: { en: "Guests max", fr: "Personnes max", ar: "ضيوف كحد أقصى" },
    },
  ];

  const marqueeItems = {
    en: ["Authentic cuisine", "Culture", "Hospitality", "Memories"],
    fr: ["Cuisine authentique", "Culture", "Hospitalité", "Souvenirs"],
    ar: ["مطبخ أصيل", "ثقافة", "كرم الضيافة", "ذكريات"],
  };

  const photosTitle = {
    en: "Moments from our table",
    fr: "Moments autour de notre table",
    ar: "لحظات من مائدتنا",
  };

  const howTitle = {
    en: "How it works",
    fr: "Comment ça marche",
    ar: "كيف تسير الأمسية",
  };

  return (
    <div>
      {/* ═══════════════════════════════════════════════════════════
          1. HERO — Editorial Moroccan Modern, full viewport height
      ═══════════════════════════════════════════════════════════ */}
      <section id="home" className="relative bg-white overflow-hidden" aria-label="Hero">
        {/* --- DESKTOP HERO (>=1024px) --- */}
        <div className="hidden lg:flex flex-col justify-between min-h-[calc(100svh-72px)] relative w-full pt-10 pb-8 px-8 xl:px-12 max-w-[1320px] mx-auto">
          {/* Main edge-to-edge split: Left text overlapping right photo */}
          <div className="relative w-full flex-1 flex items-center">
            {/* Right Photo: ~55% width, bleeding off right and bottom edges, cropped by zellige-cut mask */}
            <div
              className="absolute top-0 bottom-0 end-[-48px] w-[55%] pointer-events-none hero-photo-fade z-0 flex items-center justify-end"
              aria-hidden="true"
            >
              <div className="w-full h-full max-w-[850px] relative">
                <img
                  src={heroImageUrl}
                  srcSet={heroImageSrcSet}
                  alt={heroImageAlt}
                  className="h-full w-full object-cover object-[50%_35%] zellige-cut-mask shadow-photo"
                  loading="eager"
                  fetchPriority="high"
                  decoding="async"
                />
                <div
                  className="absolute inset-0 zellige-cut-mask bg-gradient-to-t from-[#1D1414]/25 via-transparent to-transparent pointer-events-none"
                  aria-hidden="true"
                />
              </div>
            </div>

            {/* Left Headline & Content: Overlaps photo on its right side */}
            <div
              className="relative z-10 max-w-[64%] py-6 hero-rise"
              dir={lang === "ar" ? "rtl" : "ltr"}
            >
              {/* Confident two-line headline in burgundy, overlapping photo */}
              <h1
                className="text-primary font-display font-semibold tracking-[-0.03em] leading-[0.95]"
                style={{
                  fontSize: "clamp(3.4rem, 8.5vw, 8rem)",
                  textShadow:
                    "0 2px 14px rgba(255, 255, 255, 0.95), 0 0 6px rgba(255, 255, 255, 0.9)",
                }}
              >
                <span className="block">{heroH1Line1[lang]}</span>
                <span className="block italic">{heroH1Line2[lang]}</span>
              </h1>

              {/* 2-line subtitle */}
              <p className="mt-6 text-foreground/85 text-lg lg:text-xl leading-[1.65] max-w-[44ch] drop-shadow-[0_1px_4px_rgba(255,255,255,0.9)]">
                {heroSubtitle[lang]}
              </p>

              {/* Primary solid burgundy 60px button with arrow + plain text link See the menu */}
              <div className="mt-8 flex items-center gap-7">
                {firstBookable && (
                  <a
                    href="#booking"
                    className="h-[60px] px-9 rounded-full bg-primary text-white font-bold text-base inline-flex items-center gap-3 shadow-md hover:bg-primary-dark hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] transition-all duration-200"
                  >
                    <span>{bookingTitle[lang]}</span>
                    <ArrowRight className="h-5 w-5 rtl:rotate-180" aria-hidden="true" />
                  </a>
                )}
                <a
                  href="#menu"
                  className="text-primary font-semibold text-base underline underline-offset-8 decoration-primary/60 hover:decoration-primary transition-all duration-200"
                >
                  {seeMenuText[lang]}
                </a>
              </div>
            </div>
          </div>

          {/* Glass info bar at the bottom of the hero spanning the width */}
          <div
            className="w-full relative z-20 mt-6 glass-card rounded-2xl px-6 py-5 border border-white/80 shadow-soft"
            dir={lang === "ar" ? "rtl" : "ltr"}
          >
            <div className="grid grid-cols-4 divide-x rtl:divide-x-reverse divide-stone-300/60 text-center">
              {heroFactsColumns.map((fact, idx) => (
                <div key={idx} className="px-3">
                  <span className="font-display text-3xl xl:text-4xl font-bold text-primary block leading-none">
                    {fact.num}
                  </span>
                  <span className="text-xs sm:text-sm font-semibold text-foreground/80 mt-1.5 block tracking-wide">
                    {fact.label[lang]}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* --- MOBILE HERO (<1024px) --- */}
        <div className="lg:hidden flex flex-col w-full relative">
          {/* Full-bleed photo on top: 52-58svh, bottom corners 32px */}
          <div className="w-full h-[52svh] max-h-[440px] overflow-hidden rounded-b-[32px] relative z-0 hero-photo-fade">
            <img
              src={heroImageUrl}
              srcSet={heroImageSrcSet}
              alt={heroImageAlt}
              className="h-full w-full object-cover object-[50%_35%]"
              loading="eager"
              fetchPriority="high"
              decoding="async"
            />
            <div
              className="absolute inset-0 pointer-events-none bg-gradient-to-t from-[#1D1414]/30 via-transparent to-transparent"
              aria-hidden="true"
            />
          </div>

          {/* White sheet overlapping photo by 28px */}
          <div
            className="relative -mt-7 z-10 bg-white rounded-t-[32px] px-5 sm:px-6 pt-5 pb-7 shadow-soft hero-rise"
            dir={lang === "ar" ? "rtl" : "ltr"}
          >
            {/* Giant headline in burgundy */}
            <h1
              className="text-primary font-display font-semibold tracking-[-0.03em] leading-[0.95]"
              style={{ fontSize: "clamp(2.8rem, 11vw, 3.8rem)" }}
            >
              <span className="block">{heroH1Line1[lang]}</span>
              <span className="block italic">{heroH1Line2[lang]}</span>
            </h1>

            {/* Subtitle */}
            <p className="mt-2.5 text-foreground/80 leading-relaxed text-sm sm:text-base max-w-[42ch]">
              {heroSubtitle[lang]}
            </p>

            {/* Main button: first screen at 390x844 shows photo, headline and button without scrolling */}
            <div className="mt-3.5 flex flex-col gap-2">
              {firstBookable && (
                <a
                  href="#booking"
                  className="h-14 w-full rounded-full bg-primary text-white font-bold text-base inline-flex items-center justify-center gap-2.5 shadow-md hover:bg-primary-dark active:scale-[0.98] transition-all duration-200"
                >
                  <span>{bookingTitle[lang]}</span>
                  <ArrowRight className="h-5 w-5 rtl:rotate-180" aria-hidden="true" />
                </a>
              )}
              <a
                href="#menu"
                className="text-center text-primary font-semibold text-sm underline underline-offset-6 decoration-primary/60 hover:decoration-primary py-1 transition-all duration-200"
              >
                {seeMenuText[lang]}
              </a>
            </div>

            {/* Four facts as a 2x2 grid */}
            <div className="grid grid-cols-2 gap-3 pt-4 mt-3 border-t border-stone-200/70 text-center">
              {heroFactsColumns.map((fact, idx) => (
                <div key={idx} className="p-2.5 rounded-xl bg-stone-50/80">
                  <span className="font-display text-2xl font-bold text-primary block leading-none">
                    {fact.num}
                  </span>
                  <span className="text-[12px] font-semibold text-foreground/80 mt-1 block">
                    {fact.label[lang]}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* --- FULL-WIDTH DEEP-RED MARQUEE STRIP (48px high) --- */}
        <div
          className="marquee-container w-full h-12 bg-[#4A0E0E] text-white overflow-hidden flex items-center relative z-20 cursor-default"
          dir={lang === "ar" ? "rtl" : "ltr"}
        >
          <div className="marquee-track flex items-center gap-8 px-4 text-xs sm:text-sm font-medium tracking-wide">
            {[...Array(6)].flatMap((_, rep) =>
              marqueeItems[lang].map((item, idx) => (
                <span
                  key={`${rep}-${idx}`}
                  className="inline-flex items-center gap-8 whitespace-nowrap"
                >
                  <span className="text-white/95">{item}</span>
                  <span className="text-gold text-[10px]" aria-hidden="true">
                    ◆
                  </span>
                </span>
              )),
            )}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          2. WHAT IS IT? (off-white, 4 pillars, timeline, good to know)
      ═══════════════════════════════════════════════════════════ */}
      <ConceptSection />

      {/* ═══════════════════════════════════════════════════════════
          3. MENU (full-width burgundy)
      ═══════════════════════════════════════════════════════════ */}
      <MenuSection />

      {/* ═══════════════════════════════════════════════════════════
          4. PHOTOS (only when approved photos exist)
      ═══════════════════════════════════════════════════════════ */}
      {galleryPhotos.length > 0 && (
        <section
          id="photos"
          className="scroll-mt-20 bg-white"
          style={{ paddingBlock: "var(--section-pad-v-mobile)" }}
        >
          <div className="ms-container">
            <h2 className="text-center text-primary mb-4">{photosTitle[lang]}</h2>
            <OrnamentDivider center className="mb-12" />
            <GuestPhotoGallery photos={galleryPhotos} />
          </div>
        </section>
      )}

      {/* ═══════════════════════════════════════════════════════════
          5. HOW IT WORKS (Outlined Burgundy Numerals, Vertical Dividers)
      ═══════════════════════════════════════════════════════════ */}
      <section
        id="how"
        className="scroll-mt-20 bg-white"
        style={{ paddingBlock: "var(--section-pad-v-mobile)" }}
      >
        <div className="ms-container" style={{ paddingBottom: "var(--section-pad-v)" }}>
          <div className="text-center mb-16">
            <h2 className="text-primary text-center mb-4">{howTitle[lang]}</h2>
            <OrnamentDivider center />
          </div>

          {/* Desktop (>=1024px): 3 columns with thin vertical dividers */}
          <div className="hidden lg:grid lg:grid-cols-3 divide-x rtl:divide-x-reverse divide-stone-200/80">
            {HOW_IT_WORKS_STEPS.map((item) => (
              <div
                key={item.num}
                className="px-10 py-4 flex flex-col items-start"
                dir={lang === "ar" ? "rtl" : "ltr"}
              >
                <span
                  className="font-display text-7xl font-bold tracking-tight mb-5 select-none"
                  style={{
                    WebkitTextStroke: "2px #8B1A1A",
                    color: "transparent",
                  }}
                  aria-hidden="true"
                >
                  {item.num}
                </span>
                <h3 className="font-display text-2xl font-bold text-foreground mb-3">
                  {item.title[lang]}
                </h3>
                <p className="text-foreground/75 text-base sm:text-[1.125rem] leading-[1.7] max-w-[34ch]">
                  {item.desc[lang]}
                </p>
              </div>
            ))}
          </div>

          {/* Mobile (<1024px): vertical timeline */}
          <div
            className="lg:hidden relative border-s-2 border-stone-200/80 ms-4 ps-7 space-y-12"
            dir={lang === "ar" ? "rtl" : "ltr"}
          >
            {HOW_IT_WORKS_STEPS.map((item) => (
              <div key={item.num} className="relative">
                {/* Timeline node dot */}
                <div
                  className="absolute -start-[35px] top-3 h-3.5 w-3.5 rounded-full bg-primary ring-4 ring-white"
                  aria-hidden="true"
                />
                <span
                  className="font-display text-5xl sm:text-6xl font-bold tracking-tight mb-2 block select-none"
                  style={{
                    WebkitTextStroke: "2px #8B1A1A",
                    color: "transparent",
                  }}
                  aria-hidden="true"
                >
                  {item.num}
                </span>
                <h3 className="font-display text-xl sm:text-2xl font-bold text-foreground mb-2">
                  {item.title[lang]}
                </h3>
                <p className="text-foreground/75 text-base leading-relaxed max-w-[42ch]">
                  {item.desc[lang]}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          6. BOOK YOUR DINNER (off-white, one large white card)
      ═══════════════════════════════════════════════════════════ */}
      {data.bookingOptions.experiences.length > 0 && (
        <section
          id="booking"
          className="scroll-mt-20 bg-offwhite"
          style={{ paddingBlock: "var(--section-pad-v-mobile)" }}
        >
          <div className="ms-container" style={{ paddingBottom: "var(--section-pad-v)" }}>
            <div className="text-center mb-10">
              <h2 className="text-primary mb-4">{bookingTitle[lang]}</h2>
              <OrnamentDivider center className="mb-5" />
              <p
                className="text-foreground/70 mx-auto"
                style={{ maxWidth: "48ch", fontSize: "1.0625rem" }}
              >
                {lang === "fr"
                  ? "Partagez le repas d'une vraie famille marocaine. Entrées, boissons et dessert inclus."
                  : lang === "ar"
                    ? "شارك وجبة عائلية مغربية أصيلة. المقبلات والمشروبات والتحلية مشمولة."
                    : "Eat with a real local Moroccan family. Starters, drinks and dessert included."}
              </p>
            </div>

            <BookingFlow
              initialExperienceId={firstBookable ?? ""}
              initialOptions={data.bookingOptions}
            />
          </div>
        </section>
      )}
    </div>
  );
}
