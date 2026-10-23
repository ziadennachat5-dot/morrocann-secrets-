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
  const heroFacts = [
    {
      en: "Starters, drinks and dessert included",
      fr: "Entrées, boissons et dessert inclus",
      ar: "المقبلات والمشروبات والحلوى مشمولة",
    },
    {
      en: "Up to 8 guests",
      fr: "Jusqu'à 8 personnes",
      ar: "حتى 8 ضيوف",
    },
    {
      en: "About 3 hours",
      fr: "Environ 3 heures",
      ar: "حوالي 3 ساعات",
    },
  ];
  const floatingCardText = {
    en: "Dinner in a real family home",
    fr: "Dîner dans une vraie maison familiale",
    ar: "عشاء في بيت عائلي حقيقي",
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
          1. HERO — Full-width burgundy, zellige, gold line, arch
      ═══════════════════════════════════════════════════════════ */}
      <section
        id="home"
        className="relative bg-primary text-white overflow-x-clip z-10"
        style={{
          backgroundColor: "var(--primary)",
          borderBottom: "1px solid rgba(201, 162, 75, 0.45)",
        }}
        aria-label="Hero"
      >
        {/* Soft darker radial vignette toward edges */}
        <div
          aria-hidden="true"
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse at 50% 35%, rgba(139,26,26,0.82) 0%, rgba(95,15,15,0.96) 65%, rgba(65,10,10,0.99) 100%)",
          }}
        />

        {/* Subtle zellige pattern overlay at low opacity */}
        <div
          aria-hidden="true"
          className="zellige-burgundy absolute inset-0 pointer-events-none"
          style={{ opacity: 0.16 }}
        />

        <div
          className="ms-container relative z-10 w-full"
          style={{
            paddingTop: "clamp(24px, 4.5vw, 56px)",
            paddingBottom: "clamp(36px, 6vw, 72px)",
            minHeight: "min(90vh, 760px)",
            display: "flex",
            alignItems: "center",
          }}
        >
          <div className="grid gap-6 sm:gap-8 items-center lg:grid-cols-12 lg:gap-12 w-full">
            {/* Left column: white text & actions (order 2 on phone, order 1 on desktop) */}
            <div className="order-2 lg:order-1 lg:col-span-7 flex flex-col items-start gap-3.5 sm:gap-4 lg:gap-5 hero-fade">
              {/* Small pill badge in white outline with a green dot */}
              <div className="inline-flex items-center gap-2 rounded-full border border-white/35 bg-white/10 backdrop-blur-xs px-3.5 py-1 text-xs sm:text-sm font-medium text-white shadow-2xs">
                <span
                  className="h-2 w-2 rounded-full bg-accent ring-2 ring-accent/30 shrink-0"
                  aria-hidden="true"
                />
                <span>{heroBadgeText[lang]}</span>
              </div>

              {/* H1 on exactly TWO lines */}
              <h1
                className="font-display font-bold tracking-tight text-white"
                style={{
                  fontSize: "clamp(2.35rem, 5.2vw, 4.8rem)",
                  lineHeight: 1.08,
                }}
                dir={lang === "ar" ? "rtl" : "ltr"}
              >
                <span className="block text-white whitespace-nowrap sm:whitespace-normal">
                  {heroH1Line1[lang]}
                </span>
                <span className="block text-gold whitespace-nowrap sm:whitespace-normal">
                  {heroH1Line2[lang]}
                </span>
              </h1>

              {/* Thin gold ornament divider */}
              <OrnamentDivider light className="my-1 sm:my-1.5" />

              {/* Subtitle on at most 2 lines at 1.2rem, white at 90% */}
              <p
                className="text-white/90 leading-relaxed max-w-[46ch]"
                style={{ fontSize: "clamp(1rem, 1.8vw, 1.2rem)" }}
                dir={lang === "ar" ? "rtl" : "ltr"}
              >
                {heroSubtitle[lang]}
              </p>

              {/* Two buttons */}
              <div className="mt-2 sm:mt-3 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
                {firstBookable && (
                  <a
                    href="#booking"
                    className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-7 py-3 text-sm sm:text-base font-bold text-primary shadow-md hover:bg-[#FBF7F2] hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] transition-all duration-200 text-center w-full sm:w-auto"
                  >
                    <Utensils className="h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                    <span>{bookingTitle[lang]}</span>
                  </a>
                )}
                <a
                  href="#menu"
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-white/80 bg-white/5 backdrop-blur-xs px-6 py-3 text-sm sm:text-base font-semibold text-white hover:bg-white/15 hover:border-white hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] transition-all duration-200 text-center w-full sm:w-auto"
                >
                  <span>{seeMenuText[lang]}</span>
                  <ArrowRight className="h-4 w-4 shrink-0 rtl:rotate-180" aria-hidden="true" />
                </a>
              </div>

              {/* Three short facts in one row (stacked on phones) with small gold check icons */}
              <ul
                className="mt-2 sm:mt-3 flex flex-col sm:flex-row sm:flex-wrap items-start sm:items-center gap-2 sm:gap-4 lg:gap-5 text-xs sm:text-sm text-white/95"
                role="list"
                dir={lang === "ar" ? "rtl" : "ltr"}
              >
                {heroFacts.map((fact, index) => (
                  <li key={index} className="inline-flex items-center gap-2">
                    <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-gold/20 border border-gold/50">
                      <Check className="h-2.5 w-2.5 text-gold" strokeWidth={3} aria-hidden="true" />
                    </span>
                    <span className="font-medium whitespace-nowrap">{fact[lang]}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Right column: 6.jpeg tall arch frame (order 1 on phone, order 2 on desktop) */}
            <div className="order-1 lg:order-2 lg:col-span-5 flex justify-center hero-photo-fade w-full">
              <div
                className="relative w-[70%] max-w-[240px] sm:max-w-[290px] lg:w-full lg:max-w-[440px] lg:mb-[-64px] z-20"
                style={{ aspectRatio: "4/5" }}
              >
                {/* Second thin gold arch outline offset behind for depth */}
                <div
                  aria-hidden="true"
                  className="absolute -inset-2.5 sm:-inset-3 lg:-inset-4 rounded-t-[9999px] rounded-b-[28px] border border-gold/45 pointer-events-none translate-x-2 translate-y-2.5 sm:translate-x-3 sm:translate-y-3.5 rtl:-translate-x-2 rtl:sm:-translate-x-3 z-0"
                />

                {/* Main Arch Frame */}
                <div
                  className="relative z-10 w-full h-full rounded-t-[9999px] rounded-b-[24px] overflow-hidden bg-primary-dark"
                  style={{
                    border: "3px solid var(--gold)",
                    boxShadow:
                      "0 20px 48px -10px rgba(0,0,0,0.55), 0 10px 20px -6px rgba(0,0,0,0.35)",
                  }}
                >
                  <img
                    src={heroImageUrl}
                    srcSet={heroImageSrcSet}
                    alt={heroImageAlt}
                    className="h-full w-full object-cover object-[50%_35%] transition-transform duration-700 hover:scale-103"
                    loading="eager"
                    fetchPriority="high"
                    decoding="async"
                  />

                  {/* Small solid white tag fixed to lower-left corner */}
                  <div className="absolute bottom-3 left-3 sm:bottom-4 sm:left-4 rtl:left-auto rtl:right-3 rtl:sm:right-4 z-20 bg-white rounded-xl shadow-lg border border-stone-200/90 px-3 py-1.5 sm:px-3.5 sm:py-2 max-w-[190px] sm:max-w-[210px]">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <span
                        className="h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full bg-accent shrink-0"
                        aria-hidden="true"
                      />
                      <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-accent">
                        Marrakech
                      </span>
                    </div>
                    <p className="font-display text-xs sm:text-sm font-bold text-[#1C1817] leading-tight">
                      {floatingCardText[lang]}
                    </p>
                  </div>
                </div>
              </div>
            </div>
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
