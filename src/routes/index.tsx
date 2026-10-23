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
