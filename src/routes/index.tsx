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
    return {
      meta: [
        { title: "Moroccan Secrets | Eat with a local Moroccan family" },
        {
          name: "description",
          content:
            "Share an authentic Moroccan family dinner in Marrakech. Homemade cuisine, warm hospitality, traditional music and cultural exchange.",
        },
        { property: "og:title", content: "Moroccan Secrets" },
        { property: "og:type", content: "website" },
        { property: "og:url", content: `${siteUrl}/` },
        { property: "og:image", content: loaderData?.experiences?.[0]?.image_url ?? "" },
      ],
      links: [{ rel: "canonical", href: `${siteUrl}/` }],
    };
  },
  component: HomePage,
});

const HOW_IT_WORKS_STEPS = [
  {
    num: "1",
    icon: "M12 3C8.13 3 5 6.13 5 10c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z",
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
    num: "2",
    icon: "M18.06 22.99h1.66c.84 0 1.53-.64 1.63-1.46L23 5.05h-5V1h-1.97v4.05h-4.97l.3 2.34c1.71.47 3.31 1.32 4.27 2.26 1.44 1.42 2.43 2.89 2.43 5.29v8.05zM1 21.99V21h15.03v.99c0 .55-.45 1-1.01 1H2.01c-.56 0-1.01-.45-1.01-1zm15.03-7H1v-2h15.03v2zm0-4H1v-2h15.03v2z",
    title: { en: "Cook together", fr: "Cuisinez ensemble", ar: "الطبخ معاً" },
    desc: {
      en: "Join the family in the kitchen and help prepare the meal.",
      fr: "Rejoignez la famille en cuisine et participez à la préparation du repas.",
      ar: "شارك العائلة في المطبخ وساهم في إعداد وجبة العشاء.",
    },
  },
  {
    num: "3",
    icon: "M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zm4.24 16L12 15.45 7.77 18l1.12-4.81-3.73-3.23 4.92-.42L12 5l1.92 4.53 4.92.42-3.73 3.23L16.23 18z",
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
  const heroFactsColumns = {
    guests: {
      num: "8",
      label: { en: "guests max", fr: "personnes max", ar: "ضيوف كحد أقصى" },
    },
    together: {
      num: "3h",
      label: { en: "together", fr: "partagées", ar: "معاً" },
    },
    dishes: {
      num: "2",
      label: { en: "main dishes", fr: "plats au choix", ar: "أطباق رئيسية" },
    },
  };

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

  const conceptFacts = [
    {
      num: "2",
      label: {
        en: "main dishes of your choice",
        fr: "plats principaux au choix",
        ar: "طبقان رئيسيان باختيارك",
      },
    },
    { num: "3", label: { en: "courses included", fr: "plats inclus", ar: "أطباق مشمولة" } },
    { num: "8", label: { en: "guests maximum", fr: "personnes maximum", ar: "ضيوف كحد أقصى" } },
    { num: "3h", label: { en: "of shared time", fr: "de temps partagé", ar: "من الوقت المشترك" } },
  ];

  return (
    <div>
      {/* ═══════════════════════════════════════════════════════════
          1. HERO — Editorial split desktop, full-bleed mobile sheet
      ═══════════════════════════════════════════════════════════ */}
      <section id="home" className="relative bg-white overflow-hidden" aria-label="Hero">
        {/* --- DESKTOP HERO (>=1024px) --- */}
        <div className="hidden lg:grid lg:grid-cols-12 min-h-[640px] h-[calc(100svh-76px)] w-full items-stretch relative">
          {/* Left half on white (6 cols) */}
          <div className="lg:col-span-6 flex flex-col justify-center items-start pl-8 sm:pl-12 lg:pl-16 xl:pl-20 pr-6 lg:pr-10 py-12 z-10 hero-fade">
            {/* Oversized headline on exactly TWO lines in burgundy, second line italic */}
            <h1
              className="text-primary font-display font-semibold tracking-[-0.02em] leading-[1.04]"
              style={{ fontSize: "clamp(3rem, 6.2vw, 6rem)" }}
              dir={lang === "ar" ? "rtl" : "ltr"}
            >
              <span className="block">{heroH1Line1[lang]}</span>
              <span className="block italic">{heroH1Line2[lang]}</span>
            </h1>

            {/* 2-line subtitle (1.25rem, text at 75%) */}
            <p
              className="mt-6 text-foreground/75 text-[1.25rem] leading-relaxed max-w-[42ch]"
              dir={lang === "ar" ? "rtl" : "ltr"}
            >
              {heroSubtitle[lang]}
            </p>

            {/* Two buttons: primary solid burgundy 60px high, secondary plain text link with red underline */}
            <div className="mt-9 flex items-center gap-7">
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

          {/* Right half: photo 6.jpeg flush to right edge, top and bottom (6 cols) */}
          <div className="lg:col-span-6 relative w-full h-full overflow-visible hero-photo-fade">
            <div className="relative w-full h-full">
              <img
                src={heroImageUrl}
                srcSet={heroImageSrcSet}
                alt={heroImageAlt}
                className="h-full w-full object-cover object-[50%_35%] rounded-l-[48px] rtl:rounded-r-[48px] rtl:rounded-l-0 shadow-[0_20px_50px_-15px_rgba(36,26,26,0.18)]"
                loading="eager"
                fetchPriority="high"
                decoding="async"
                style={{ maxWidth: "50vw" }}
              />
              {/* Very light warm gradient at bottom for depth */}
              <div
                className="absolute inset-0 rounded-l-[48px] rtl:rounded-r-[48px] rtl:rounded-l-0 pointer-events-none bg-gradient-to-t from-[#241A1A]/35 via-transparent to-transparent"
                aria-hidden="true"
              />

              {/* Over bottom-left corner of photo, overlapping into white half: Frosted Glass Card */}
              <div
                className="absolute bottom-8 -start-14 rtl:-end-14 z-20 bg-white/70 backdrop-blur-md rounded-[20px] shadow-[0_12px_36px_-6px_rgba(36,26,26,0.14)] border border-white/75 px-7 py-4 flex items-center gap-6"
                dir={lang === "ar" ? "rtl" : "ltr"}
              >
                <div className="text-center min-w-[70px]">
                  <span className="font-display text-3xl font-bold text-primary block leading-none">
                    {heroFactsColumns.guests.num}
                  </span>
                  <span className="text-xs text-foreground/80 mt-1 block font-medium whitespace-nowrap">
                    {heroFactsColumns.guests.label[lang]}
                  </span>
                </div>
                <div className="w-px h-8 bg-stone-300/60 shrink-0" aria-hidden="true" />
                <div className="text-center min-w-[70px]">
                  <span className="font-display text-3xl font-bold text-primary block leading-none">
                    {heroFactsColumns.together.num}
                  </span>
                  <span className="text-xs text-foreground/80 mt-1 block font-medium whitespace-nowrap">
                    {heroFactsColumns.together.label[lang]}
                  </span>
                </div>
                <div className="w-px h-8 bg-stone-300/60 shrink-0" aria-hidden="true" />
                <div className="text-center min-w-[70px]">
                  <span className="font-display text-3xl font-bold text-primary block leading-none">
                    {heroFactsColumns.dishes.num}
                  </span>
                  <span className="text-xs text-foreground/80 mt-1 block font-medium whitespace-nowrap">
                    {heroFactsColumns.dishes.label[lang]}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* --- MOBILE HERO (<1024px) --- */}
        <div className="lg:hidden flex flex-col w-full relative">
          {/* Photo comes first: full width, edge-to-edge, height 62svh, bottom corners rounded 32px */}
          <div className="w-full h-[62svh] max-h-[500px] overflow-hidden rounded-b-[32px] relative z-0 hero-photo-fade">
            <img
              src={heroImageUrl}
              srcSet={heroImageSrcSet}
              alt={heroImageAlt}
              className="h-full w-full object-cover object-[50%_35%]"
              loading="eager"
              fetchPriority="high"
              decoding="async"
            />
            {/* Soft warm gradient at bottom */}
            <div
              className="absolute inset-0 pointer-events-none bg-gradient-to-t from-[#241A1A]/35 via-transparent to-transparent"
              aria-hidden="true"
            />
          </div>

          {/* Directly below: white sheet overlapping photo by 28px, 24px padding */}
          <div
            className="relative -mt-7 z-10 bg-white rounded-t-[32px] px-6 pt-6 pb-8 shadow-[0_-8px_32px_rgba(36,26,26,0.06)] hero-fade"
            dir={lang === "ar" ? "rtl" : "ltr"}
          >
            {/* Headline on two lines in burgundy, second line italic */}
            <h1
              className="text-primary font-display font-semibold tracking-[-0.02em] leading-[1.05]"
              style={{ fontSize: "clamp(2.35rem, 9.5vw, 3.2rem)" }}
            >
              <span className="block">{heroH1Line1[lang]}</span>
              <span className="block italic">{heroH1Line2[lang]}</span>
            </h1>

            {/* 2-line subtitle */}
            <p className="mt-2.5 text-foreground/75 leading-relaxed text-sm sm:text-base max-w-[42ch]">
              {heroSubtitle[lang]}
            </p>

            {/* Buttons: full-width primary 56px high + text link */}
            <div className="mt-4 sm:mt-5 flex flex-col gap-2.5">
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
                className="text-center text-primary font-semibold text-sm sm:text-base underline underline-offset-8 decoration-primary/60 hover:decoration-primary py-1 transition-all duration-200"
              >
                {seeMenuText[lang]}
              </a>
            </div>

            {/* Three facts: horizontal row of three equal columns under buttons separated by hairlines */}
            <div className="grid grid-cols-3 divide-x rtl:divide-x-reverse divide-stone-200/80 pt-4 sm:pt-5 mt-4 sm:mt-5 border-t border-stone-200/60 text-center">
              <div className="px-1">
                <span className="font-display text-2xl font-bold text-primary block leading-none">
                  {heroFactsColumns.guests.num}
                </span>
                <span className="text-[11px] sm:text-xs text-foreground/75 mt-1 block font-medium">
                  {heroFactsColumns.guests.label[lang]}
                </span>
              </div>
              <div className="px-1">
                <span className="font-display text-2xl font-bold text-primary block leading-none">
                  {heroFactsColumns.together.num}
                </span>
                <span className="text-[11px] sm:text-xs text-foreground/75 mt-1 block font-medium">
                  {heroFactsColumns.together.label[lang]}
                </span>
              </div>
              <div className="px-1">
                <span className="font-display text-2xl font-bold text-primary block leading-none">
                  {heroFactsColumns.dishes.num}
                </span>
                <span className="text-[11px] sm:text-xs text-foreground/75 mt-1 block font-medium">
                  {heroFactsColumns.dishes.label[lang]}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* --- FULL-WIDTH BURGUNDY MARQUEE STRIP (48px high) --- */}
        <div
          className="marquee-container w-full h-12 bg-primary text-white overflow-hidden flex items-center relative z-20 cursor-default"
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
          2. CONCEPT (off-white, Bento Grid)
      ═══════════════════════════════════════════════════════════ */}
      <ConceptSection secondPhotoUrl={null} conceptFacts={conceptFacts} />

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
          5. HOW IT WORKS (Bento Timeline Cards)
      ═══════════════════════════════════════════════════════════ */}
      <section
        id="how"
        className="scroll-mt-20 bg-white"
        style={{ paddingBlock: "var(--section-pad-v-mobile)" }}
      >
        <div className="ms-container" style={{ paddingBottom: "var(--section-pad-v)" }}>
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 rounded-full bg-accent/10 border border-accent/25 px-4 py-1.5 text-xs font-bold text-accent mb-4">
              <span>
                {lang === "fr"
                  ? "Simple & Clair"
                  : lang === "ar"
                    ? "بكل بساطة"
                    : "Simple & Seamless"}
              </span>
            </div>
            <h2 className="text-primary text-center mb-4">{howTitle[lang]}</h2>
            <OrnamentDivider center />
          </div>

          {/* Steps grid: horizontal Bento cards on desktop, vertical timeline on mobile */}
          <div className="relative grid gap-8 lg:grid-cols-3 lg:gap-8">
            {/* Horizontal dotted gold connector line — desktop only */}
            <div
              aria-hidden="true"
              style={{
                position: "absolute",
                top: "36px",
                insetInlineStart: "calc(16.67% + 28px)",
                insetInlineEnd: "calc(16.67% + 28px)",
                height: "2px",
                borderTop: "2px dashed rgba(201,162,75,0.45)",
                display: "none",
                zIndex: 0,
              }}
              className="lg:block"
            />

            {/* Vertical timeline line on phones (left in LTR, right in Arabic) */}
            <div
              aria-hidden="true"
              className="absolute top-7 bottom-7 start-7 -translate-x-1/2 rtl:translate-x-1/2 w-0.5 border-s-2 border-dashed border-gold/45 lg:hidden z-0"
            />

            {HOW_IT_WORKS_STEPS.map((item) => (
              <div
                key={item.num}
                className="relative flex items-start gap-5 lg:flex-col lg:items-center lg:text-center ps-16 lg:ps-0"
                dir={lang === "ar" ? "rtl" : "ltr"}
              >
                {/* Numbered circle (absolute on mobile start-0, relative centered on desktop) */}
                <div
                  className="absolute start-0 top-0 lg:relative lg:start-auto lg:top-auto flex items-center justify-center shrink-0 mb-0 lg:mb-6 transition-all duration-300 group-hover:scale-105"
                  style={{
                    width: "56px",
                    height: "56px",
                    borderRadius: "50%",
                    background: "#fff",
                    border: "2.5px solid var(--primary)",
                    zIndex: 2,
                    boxShadow: "0 4px 14px rgba(139,26,26,0.14)",
                  }}
                >
                  <span
                    className="font-display font-bold text-primary"
                    style={{ fontSize: "1.5rem", lineHeight: 1 }}
                  >
                    {item.num}
                  </span>
                </div>

                {/* Bento Card container */}
                <div className="flex-1 w-full rounded-2xl lg:rounded-3xl bg-white/95 backdrop-blur-md border border-stone-200/80 p-6 lg:p-8 shadow-xs hover:shadow-card hover:-translate-y-1.5 hover:border-gold/50 transition-all duration-300 flex flex-col items-start lg:items-center group">
                  {/* Green icon container */}
                  <div
                    className="flex items-center justify-center mb-4 transition-all duration-300 group-hover:scale-110 group-hover:bg-accent/15 group-hover:border-accent"
                    style={{
                      width: "44px",
                      height: "44px",
                      borderRadius: "50%",
                      border: "1.5px solid rgba(47,93,52,0.3)",
                      background: "rgba(47,93,52,0.06)",
                    }}
                  >
                    <svg
                      viewBox="0 0 24 24"
                      className="h-5 w-5 text-accent"
                      fill="currentColor"
                      aria-hidden
                    >
                      <path d={item.icon} />
                    </svg>
                  </div>

                  <h3 className="text-foreground mb-2 text-xl font-bold font-display">
                    {item.title[lang]}
                  </h3>
                  <p className="text-foreground/75 leading-relaxed text-sm sm:text-base max-w-[32ch]">
                    {item.desc[lang]}
                  </p>
                </div>
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
