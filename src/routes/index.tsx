import { useEffect, useRef, useState } from "react";
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
import {
  OrnamentDivider,
  ZelligeStarSvg,
  OliveBranchSvg,
  IconLocalFamilies,
  IconHomeCooked,
  IconSmallGroups,
} from "@/components/site/Brand";
import { useGalleryContext } from "@/components/site/Layout";
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
  head: () => {
    const siteUrl = getSiteUrl();
    const heroImage = "/media/hero-poster.jpg";
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

function HeroVideo() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [reduceMotion, setReduceMotion] = useState(false);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduceMotion(mql.matches);
    const handler = (e: MediaQueryListEvent) => setReduceMotion(e.matches);
    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || reduceMotion || hasError) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            video.play().catch(() => {});
          } else {
            video.pause();
          }
        }
      },
      { threshold: 0.15 },
    );

    observer.observe(video);
    return () => observer.disconnect();
  }, [reduceMotion, hasError]);

  if (reduceMotion || hasError) {
    return (
      <img
        src="/media/hero-poster.jpg"
        alt="Moroccan dining experience"
        className="w-full h-full object-cover object-center"
      />
    );
  }

  return (
    <video
      ref={videoRef}
      src="/media/hero.mp4"
      poster="/media/hero-poster.jpg"
      autoPlay
      muted
      loop
      playsInline
      preload="metadata"
      onError={() => setHasError(true)}
      className="w-full h-full object-cover object-center"
      aria-label="Moroccan dining experience"
    />
  );
}

function HomePage() {
  const data = Route.useLoaderData();
  const { lang } = useI18n();
  const { setHasGallery } = useGalleryContext();
  const firstBookable = data.bookingOptions.experiences[0]?.id;
  const firstExperience = data.experiences[0];
  const fallbackHeroUrl = firstExperience?.image_url ?? "/images/hero-1200.webp";
  const { galleryPhotos } = selectHeroAndGalleryPhotos(data.photos.photos, fallbackHeroUrl);

  const conceptPhoto = galleryPhotos[0]
    ? {
        url: galleryPhotos[0].url,
        srcSet: galleryPhotos[0].srcSet,
        alt: galleryPhotos[0].alt[lang] || galleryPhotos[0].alt.en || "Dinner with a local family",
      }
    : undefined;

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

  const bookingTitle = {
    en: "Book your dinner",
    fr: "Réservez votre dîner",
    ar: "احجز عشاءك",
  };

  // Manage gallery visibility: only show if 3 or more approved photos remain besides the assigned ones
  useEffect(() => {
    const assignedFiles = new Set(["10.jpeg", "4.jpeg", "11.jpeg", "5.jpeg"]);
    const remainingApproved = data.photos.photos.filter(
      (p) => !assignedFiles.has(p.source_file ?? "") && p.guest_consent_confirmed,
    );
    setHasGallery(remainingApproved.length >= 3);
  }, [data.photos.photos, setHasGallery]);

  const heroTrackedLabel = {
    en: "LOCAL FAMILY DINNER / MARRAKECH",
    fr: "DÎNER EN FAMILLE LOCALE / MARRAKECH",
    ar: "عشاء عائلي أصيل / مراكش",
  };

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

  const heroSubtitle = {
    en: "A real family home in Marrakech. Authentic cuisine, culture, hospitality and memories.",
    fr: "Une vraie maison familiale à Marrakech. Cuisine authentique, culture, hospitalité et souvenirs.",
    ar: "بيت عائلي حقيقي في مراكش. مطبخ أصيل، ثقافة، ضيافة وذكريات.",
  };

  const heroBookingBtn = {
    en: "Book your dinner",
    fr: "Réservez votre dîner",
    ar: "احجز عشاءك",
  };

  const heroDiscoverBtn = {
    en: "Discover the experience",
    fr: "Découvrir l'expérience",
    ar: "اكتشف التجربة",
  };

  const heroNoteLine1 = {
    en: "A real home.",
    fr: "Une vraie maison.",
    ar: "بيت حقيقي.",
  };

  const heroNoteLine2 = {
    en: "A shared meal.",
    fr: "Un repas partagé.",
    ar: "مائدة مشتركة.",
  };

  const heroTagText = {
    en: "Made with Moroccan hospitality",
    fr: "Fait avec l'hospitalité marocaine",
    ar: "مصنوع بالضيافة المغربية",
  };

  const sandBandItems = [
    {
      icon: IconLocalFamilies,
      title: { en: "Local families", fr: "Familles locales", ar: "عائلات محلية" },
      desc: {
        en: "Authentic homes, real connections",
        fr: "Maisons authentiques, liens sincères",
        ar: "بيوت أصيلة، تواصل حقيقي",
      },
    },
    {
      icon: IconHomeCooked,
      title: { en: "Home-cooked dishes", fr: "Plats faits maison", ar: "أطباق منزلية" },
      desc: {
        en: "Traditional recipes, fresh ingredients",
        fr: "Recettes traditionnelles, ingrédients frais",
        ar: "وصفات تقليدية، مكونات طازجة",
      },
    },
    {
      icon: IconSmallGroups,
      title: { en: "Small groups", fr: "Petits groupes", ar: "مجموعات صغيرة" },
      desc: {
        en: "Meaningful, intimate experiences (1 to 8 guests)",
        fr: "Expériences intimes et chaleureuses (1 à 8 personnes)",
        ar: "تجارب حميمة وهادفة (من 1 إلى 8 ضيوف)",
      },
    },
  ];

  return (
    <div>
      {/* ═══════════════════════════════════════════════════════════
          1. HERO — Two columns on cream background (#F6F0E6)
      ═══════════════════════════════════════════════════════════ */}
      <section id="home" className="relative bg-cream overflow-hidden" aria-label="Hero">
        {/* --- DESKTOP HERO (>=1024px) --- */}
        <div className="hidden lg:grid lg:grid-cols-12 gap-8 xl:gap-14 items-center py-14 xl:py-20 ms-container">
          {/* Left Column (col-span-7) */}
          <div className="lg:col-span-7 flex flex-col items-start hero-rise">
            <span className="tracked-label mb-4 text-gold">
              {heroTrackedLabel[lang]}
            </span>
            <h1 className="font-display font-semibold text-oxblood tracking-[-0.02em] leading-[1.0] text-5xl xl:text-[5rem]">
              <span className="block">{heroH1Line1[lang]}</span>
              <span className="block italic">{heroH1Line2[lang]}</span>
            </h1>
            <p className="mt-6 text-muted-text text-lg xl:text-xl leading-[1.6] max-w-[44ch]">
              {heroSubtitle[lang]}
            </p>
            <div className="mt-8 flex items-center gap-6">
              <a
                href="#booking"
                className="btn bg-oxblood text-white hover:bg-burgundy px-8 h-[54px] font-semibold text-base inline-flex items-center gap-3 shadow-btn hover:shadow-btn-hover"
              >
                <span>{heroBookingBtn[lang]}</span>
                <ArrowRight className="h-5 w-5 rtl:rotate-180" aria-hidden="true" />
              </a>
              <a
                href="#experience"
                className="text-ink hover:text-oxblood font-semibold text-base inline-flex items-center gap-2 transition-colors py-2"
              >
                <span>{heroDiscoverBtn[lang]}</span>
                <ArrowRight className="h-4 w-4 rtl:rotate-180" aria-hidden="true" />
              </a>
            </div>
          </div>

          {/* Right Column: Arch Video + Overlapping Cards (col-span-5) */}
          <div className="lg:col-span-5 flex justify-center relative">
            <div className="relative w-full max-w-[420px] xl:max-w-[450px]">
              {/* Arch Frame (rounded top, straight bottom corners) */}
              <div className="arch-frame w-full h-[520px] xl:h-[560px] shadow-photo bg-sand relative z-10">
                <HeroVideo />
              </div>

              {/* Top-Right Overlapping Note Card (Mirrors in RTL) */}
              <div
                className="absolute -top-4 end-[-14px] xl:end-[-20px] z-20 bg-[#FDFCF9] rounded-2xl p-4 shadow-soft border border-[#EFE6D8] max-w-[210px]"
                dir={lang === "ar" ? "rtl" : "ltr"}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <p className="font-display text-base font-bold text-ink leading-tight">
                    {heroNoteLine1[lang]}
                    <br />
                    {heroNoteLine2[lang]}
                  </p>
                  <OliveBranchSvg className="w-7 h-7 text-accent shrink-0" />
                </div>
                <div className="flex items-center gap-2">
                  <ZelligeStarSvg className="w-2.5 h-2.5 text-gold shrink-0" />
                  <span className="h-px w-8 bg-gold/70 inline-block" />
                </div>
              </div>

              {/* Bottom-Right Overlapping Oxblood Square Tag (Mirrors in RTL) */}
              <div
                className="absolute -bottom-5 end-[-10px] xl:end-[-16px] z-20 bg-oxblood text-white rounded-2xl p-4 shadow-soft border border-gold/30 w-[148px] text-center flex flex-col items-center justify-center gap-1.5"
                dir={lang === "ar" ? "rtl" : "ltr"}
              >
                <ZelligeStarSvg className="w-4 h-4 text-gold mb-0.5" />
                <span className="text-xs font-medium leading-snug text-white/95">
                  {heroTagText[lang]}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* --- MOBILE HERO (<1024px): video arch first, then text, full-width button --- */}
        <div className="lg:hidden flex flex-col w-full px-5 py-5 ms-container">
          {/* 1. Arch Video first */}
          <div className="relative w-full max-w-[260px] sm:max-w-[290px] mx-auto">
            <div className="arch-frame w-full h-[270px] sm:h-[300px] shadow-photo bg-sand relative z-10">
              <HeroVideo />
            </div>

            {/* Overlapping top-right note card */}
            <div
              className="absolute -top-3 end-[-10px] z-20 bg-[#FDFCF9] rounded-xl p-2.5 sm:p-3 shadow-soft border border-[#EFE6D8] max-w-[155px]"
              dir={lang === "ar" ? "rtl" : "ltr"}
            >
              <div className="flex items-start justify-between gap-1.5 mb-1.5">
                <p className="font-display text-xs sm:text-sm font-bold text-ink leading-tight">
                  {heroNoteLine1[lang]}
                  <br />
                  {heroNoteLine2[lang]}
                </p>
                <OliveBranchSvg className="w-5 h-5 text-accent shrink-0" />
              </div>
              <div className="flex items-center gap-1.5">
                <ZelligeStarSvg className="w-2 h-2 text-gold shrink-0" />
                <span className="h-px w-5 bg-gold/70 inline-block" />
              </div>
            </div>

            {/* Overlapping bottom-right oxblood tag */}
            <div
              className="absolute -bottom-3 end-[-6px] z-20 bg-oxblood text-white rounded-xl p-2.5 sm:p-3 shadow-soft border border-gold/30 w-[124px] text-center flex flex-col items-center justify-center gap-1"
              dir={lang === "ar" ? "rtl" : "ltr"}
            >
              <ZelligeStarSvg className="w-3 h-3 text-gold" />
              <span className="text-[11px] font-medium leading-tight text-white/95">
                {heroTagText[lang]}
              </span>
            </div>
          </div>

          {/* 2. Text Content below */}
          <div className="mt-5 text-center flex flex-col items-center hero-rise">
            <span className="tracked-label mb-2 text-[10px] sm:text-[11px] text-gold">
              {heroTrackedLabel[lang]}
            </span>
            <h1 className="font-display font-semibold text-oxblood tracking-[-0.02em] leading-[1.0] text-3xl sm:text-4xl">
              <span className="block">{heroH1Line1[lang]}</span>
              <span className="block italic">{heroH1Line2[lang]}</span>
            </h1>
            <p className="mt-2 text-muted-text text-sm sm:text-base leading-snug max-w-[36ch]">
              {heroSubtitle[lang]}
            </p>
            <div className="mt-4 w-full flex flex-col items-center gap-2">
              <a
                href="#booking"
                className="btn bg-oxblood text-white hover:bg-burgundy w-full h-12 font-semibold text-sm sm:text-base inline-flex items-center justify-center gap-2 shadow-btn"
              >
                <span>{heroBookingBtn[lang]}</span>
                <ArrowRight className="h-4 w-4 rtl:rotate-180" aria-hidden="true" />
              </a>
              <a
                href="#experience"
                className="text-ink hover:text-oxblood font-semibold text-sm inline-flex items-center gap-1.5 py-1"
              >
                <span>{heroDiscoverBtn[lang]}</span>
                <ArrowRight className="h-3.5 w-3.5 rtl:rotate-180" aria-hidden="true" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          SAND BAND BELOW HERO (3 items separated by hairlines)
      ═══════════════════════════════════════════════════════════ */}
      <section className="bg-sand border-y border-stone-300/50" aria-label="Highlights">
        <div className="ms-container py-6 lg:py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x rtl:md:divide-x-reverse divide-stone-300/60">
            {sandBandItems.map((item, idx) => {
              const Icon = item.icon;
              return (
                <div
                  key={idx}
                  className="flex items-center gap-4 py-4 md:py-2 px-3 md:px-8"
                  dir={lang === "ar" ? "rtl" : "ltr"}
                >
                  <div className="shrink-0 p-2.5 rounded-full bg-cream/70 border border-gold/40 flex items-center justify-center">
                    <Icon className="w-6 h-6 text-gold" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-display text-lg sm:text-xl font-bold text-ink leading-tight">
                      {item.title[lang]}
                    </h3>
                    <p className="text-xs sm:text-sm text-muted-text mt-0.5 leading-snug">
                      {item.desc[lang]}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          2. THE EXPERIENCE — More than a meal
      ═══════════════════════════════════════════════════════════ */}
      <ConceptSection photos={data.photos.photos} conceptPhoto={conceptPhoto} />

      {/* ═══════════════════════════════════════════════════════════
          3. MENU (full-width oxblood)
      ═══════════════════════════════════════════════════════════ */}
      <MenuSection photos={data.photos.photos} />

      {/* ═══════════════════════════════════════════════════════════
          4. PHOTOS (only when approved photos exist)
      ═══════════════════════════════════════════════════════════ */}
      {galleryPhotos.length > 0 && (
        <section id="photos" className="scroll-mt-20 bg-white section-pad">
          <div className="ms-container">
            <div className="text-center mb-12 sm:mb-16">
              <span className="section-index block mb-3">03 / PHOTOS</span>
              <h2 className="text-center text-primary font-display font-semibold leading-[1.02]">
                {photosTitle[lang]}
              </h2>
              <OrnamentDivider center className="mt-5" />
            </div>
            <GuestPhotoGallery photos={galleryPhotos} />
          </div>
        </section>
      )}

      {/* ═══════════════════════════════════════════════════════════
          5. HOW IT WORKS (Outlined Burgundy Numerals, Vertical Dividers)
      ═══════════════════════════════════════════════════════════ */}
      <section id="how" className="scroll-mt-20 bg-white section-pad">
        <div className="ms-container">
          <div className="text-center mb-12 sm:mb-16">
            <span className="section-index block mb-3">04 / HOW IT WORKS</span>
            <h2 className="text-center text-primary font-display font-semibold leading-[1.02]">
              {howTitle[lang]}
            </h2>
            <OrnamentDivider center className="mt-5" />
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
          6. BOOK YOUR DINNER (paper background, section index 05, large title)
      ═══════════════════════════════════════════════════════════ */}
      {data.bookingOptions.experiences.length > 0 && (
        <section id="booking" className="scroll-mt-20 bg-paper section-pad">
          <div className="ms-container">
            <div className="text-center mb-10 sm:mb-14">
              <span className="section-index block mb-3">05 / BOOKING</span>
              <h2 className="text-center text-primary font-display font-semibold leading-[1.02]">
                {bookingTitle[lang]}
              </h2>
              <OrnamentDivider center className="mt-5 mb-5" />
              <p className="text-foreground/75 mx-auto leading-relaxed text-base sm:text-[1.125rem] max-w-[52ch]">
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
