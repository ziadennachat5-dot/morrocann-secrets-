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
import { getPublicGuestPhotos } from "@/lib/guest-photos.functions";
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
  const heroImageUrl = firstExperience?.image_url ?? "/images/hero-1200.webp";

  const heroHeadline = {
    en: "Eat with a local Moroccan family",
    fr: "Partagez le repas d'une famille marocaine",
    ar: "تناول الطعام مع عائلة مغربية",
  };
  const heroHeadlineItalic = {
    en: "in their home in Marrakech",
    fr: "dans leur maison à Marrakech",
    ar: "في بيتهم بمراكش",
  };
  const heroSubtitle = {
    en: "Authentic cuisine, culture, hospitality and memories — all in one evening.",
    fr: "Cuisine authentique, culture, hospitalité et souvenirs — en une seule soirée.",
    ar: "مطبخ أصيل، ثقافة، ضيافة وذكريات في أمسية واحدة.",
  };
  const badgeText = {
    en: "Marrakech, family dinner",
    fr: "Marrakech, dîner en famille",
    ar: "مراكش، عشاء عائلي",
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
  const reassurances = [
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
      en: "Around 3 hours",
      fr: "Environ 3 heures",
      ar: "حوالي 3 ساعات",
    },
  ];
  const floatingCardText = {
    en: "Dinner in a real family home",
    fr: "Dîner dans une vraie maison familiale",
    ar: "عشاء في بيت عائلي حقيقي",
  };

  const bookingTitle2 = {
    en: "Book your dinner",
    fr: "Réservez votre dîner",
    ar: "احجز عشاءك",
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
          1. HERO — 85vh min, white + burgundy soft circle + zellige
      ═══════════════════════════════════════════════════════════ */}
      <section
        id="home"
        className="relative bg-white overflow-hidden"
        style={{ minHeight: "85vh", display: "flex", alignItems: "center" }}
        aria-label="Hero"
      >
        {/* Large soft burgundy circle / arch — decorative bg */}
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            insetInlineEnd: "-5%",
            top: "-10%",
            width: "55%",
            aspectRatio: "1/1.3",
            borderRadius: "50% 50% 40% 40% / 60% 60% 40% 40%",
            background:
              "radial-gradient(ellipse at 60% 30%, rgba(139,26,26,0.085) 0%, rgba(139,26,26,0.02) 65%, transparent 100%)",
            pointerEvents: "none",
          }}
        />
        {/* Zellige corner — bottom-start */}
        <div
          aria-hidden="true"
          className="zellige-light"
          style={{
            position: "absolute",
            insetInlineStart: 0,
            bottom: 0,
            width: "220px",
            height: "220px",
            opacity: 0.6,
            pointerEvents: "none",
          }}
        />

        <div
          className="ms-container"
          style={{
            paddingTop: "clamp(48px, 8vw, 96px)",
            paddingBottom: "clamp(64px, 10vw, 112px)",
            width: "100%",
          }}
        >
          <div className="grid gap-10 items-center lg:grid-cols-12 lg:gap-16">
            {/* Text block — desktop left, mobile second */}
            <div className="order-2 lg:order-1 lg:col-span-7 flex flex-col items-start hero-fade">
              {/* Green badge */}
              <div
                className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-semibold text-white mb-6"
                style={{ background: "var(--accent)" }}
              >
                <MapPin className="h-3.5 w-3.5" aria-hidden />
                <span>{badgeText[lang]}</span>
              </div>

              {/* H1 */}
              <h1 className="text-primary font-display" dir={lang === "ar" ? "rtl" : "ltr"}>
                {heroHeadline[lang]}
                <br />
                <em
                  style={{
                    fontStyle: "italic",
                    fontWeight: 500,
                    color: "var(--primary-dark)",
                    opacity: 0.75,
                    fontSize: "0.82em",
                  }}
                >
                  {heroHeadlineItalic[lang]}
                </em>
              </h1>

              {/* Subtitle */}
              <p
                className="mt-5 text-foreground/75"
                style={{ fontSize: "1.25rem", lineHeight: "1.65", maxWidth: "48ch" }}
              >
                {heroSubtitle[lang]}
              </p>

              {/* Buttons */}
              <div className="mt-8 flex flex-wrap gap-4">
                {firstBookable && (
                  <a href="#booking" className="btn btn-primary gap-2">
                    <Utensils className="h-4 w-4" aria-hidden />
                    {bookingTitle[lang]}
                  </a>
                )}
                <a href="#menu" className="btn btn-secondary gap-2">
                  {seeMenuText[lang]}
                  <ArrowRight className="h-4 w-4" aria-hidden />
                </a>
              </div>

              {/* Reassurance row with interactive pills */}
              <ul
                className="mt-8 flex flex-col gap-2.5 sm:flex-row sm:flex-wrap sm:gap-x-3.5"
                role="list"
              >
                {reassurances.map((r, i) => (
                  <li
                    key={i}
                    className="inline-flex items-center gap-2.5 rounded-full bg-offwhite/90 backdrop-blur-xs border border-stone-200/80 px-4 py-2 text-sm font-semibold text-foreground/85 shadow-2xs hover:bg-white hover:border-accent/40 hover:shadow-xs hover:-translate-y-0.5 transition-all duration-200 cursor-default"
                  >
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accent/15">
                      <Check className="h-3 w-3 text-accent" aria-hidden strokeWidth={3} />
                    </span>
                    {r[lang]}
                  </li>
                ))}
              </ul>
            </div>

            {/* Photo — desktop right, mobile first */}
            <div className="order-1 lg:order-2 lg:col-span-5 flex justify-center hero-photo-fade">
              <div className="relative w-full max-w-[75%] sm:max-w-sm lg:max-w-none">
                {/* Offset burgundy arch outline (depth) */}
                <div
                  aria-hidden="true"
                  style={{
                    position: "absolute",
                    inset: "-14px",
                    borderRadius: "9999px 9999px 28px 28px",
                    border: "2px solid var(--primary)",
                    opacity: 0.2,
                    zIndex: 0,
                    transform: "translate(10px, 12px)",
                  }}
                />
                {/* Gold border arch */}
                <div
                  style={{
                    position: "relative",
                    zIndex: 1,
                    borderRadius: "9999px 9999px 24px 24px",
                    border: "2px solid rgba(201,162,75,0.45)",
                    overflow: "hidden",
                    aspectRatio: "4/5",
                    boxShadow: "var(--shadow-photo)",
                  }}
                >
                  <img
                    src={heroImageUrl}
                    alt={heroHeadline[lang]}
                    className="h-full w-full object-cover object-center transition-transform duration-700 hover:scale-105"
                    loading="eager"
                    fetchPriority="high"
                    decoding="async"
                  />
                </div>

                {/* Floating card with modern glassmorphism */}
                <div
                  className="group transition-all duration-300 hover:scale-105"
                  style={{
                    position: "absolute",
                    bottom: "20px",
                    insetInlineStart: "-20px",
                    zIndex: 2,
                    background: "rgba(255, 255, 255, 0.9)",
                    backdropFilter: "blur(16px)",
                    WebkitBackdropFilter: "blur(16px)",
                    borderRadius: "16px",
                    padding: "12px 18px",
                    boxShadow: "0 12px 36px -4px rgba(42,32,32,0.18)",
                    border: "1px solid rgba(255,255,255,0.75)",
                    maxWidth: "205px",
                  }}
                >
                  <div className="flex items-center gap-1.5 mb-1 text-accent">
                    <span className="h-2 w-2 rounded-full bg-accent animate-pulse" />
                    <span className="text-[11px] font-bold uppercase tracking-wider text-accent">
                      Marrakech
                    </span>
                  </div>
                  <p
                    className="font-display text-foreground"
                    style={{ fontSize: "0.9375rem", lineHeight: "1.35", fontWeight: 700 }}
                  >
                    {floatingCardText[lang]}
                  </p>
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
      {data.photos.photos.length > 0 && (
        <section
          id="photos"
          className="scroll-mt-20 bg-white"
          style={{ paddingBlock: "var(--section-pad-v-mobile)" }}
        >
          <div className="ms-container">
            <h2 className="text-center text-primary mb-4">{photosTitle[lang]}</h2>
            <OrnamentDivider center className="mb-12" />
            <GuestPhotoGallery photos={data.photos.photos} />
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
              <h2 className="text-primary mb-4">{bookingTitle2[lang]}</h2>
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
