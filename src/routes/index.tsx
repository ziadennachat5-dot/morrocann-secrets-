import { Fragment, useEffect, useRef, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Utensils, MapPin, Check, ArrowRight, ChevronDown } from "lucide-react";
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
  IconLocalFamilies,
  IconHomeCooked,
  IconSmallGroups,
  IconStepCalendar,
  IconStepConfirm,
  IconStepEnjoy,
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

    // React JSX muted attribute does not always set DOM property; set explicitly for autoplay compliance
    video.muted = true;
    video.defaultMuted = true;

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
        className="w-full h-full object-cover object-[center_30%]"
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
      className="w-full h-full object-cover object-[center_30%]"
      aria-label="Moroccan dining experience"
    />
  );
}

function BookingBandArchPhoto({
  photos,
  lang,
}: {
  photos: Array<{
    source_file?: string | null | undefined;
    guest_consent_confirmed: boolean;
    url: string;
    srcSet?: string | undefined;
    alt: { en: string; fr: string; ar: string };
  }>;
  lang: "en" | "fr" | "ar";
}) {
  const photo4 =
    photos.find((p) => p.source_file === "4.png" && p.guest_consent_confirmed) ??
    photos.find((p) => p.source_file === "4.jpeg" && p.guest_consent_confirmed);

  const photo4Url = photo4?.url || "/4.png";
  const alt = photo4?.alt
    ? photo4.alt[lang] || photo4.alt.en || "Moroccan family dinner"
    : "Moroccan family dinner";

  return (
    <div className="w-full max-w-[260px] sm:max-w-[280px] h-[340px] sm:h-[400px] arch-frame overflow-hidden shadow-soft bg-sand">
      <img
        src={photo4Url}
        srcSet={photo4?.srcSet}
        alt={alt}
        loading="lazy"
        onError={(e) => {
          const target = e.currentTarget;
          if (target.src !== "/4.png") {
            target.srcset = "";
            target.src = "/4.png";
          }
        }}
        className="w-full h-full object-cover object-center"
      />
    </div>
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

  const bookingBandLabel = {
    en: "BOOK LUNCH OR DINNER",
    fr: "RÉSERVEZ DÉJEUNER OU DÎNER",
    ar: "احجز الغداء أو العشاء",
  };

  const bookingBandTitle = {
    en: "Good food. Great company.",
    fr: "Bonne table. Chaleureuse compagnie.",
    ar: "مائدة طيبة. وصحبة رائعة.",
  };

  const bookingBandDesc = {
    en: "Reserve your spot for an authentic Moroccan lunch or dinner with a local family.",
    fr: "Réservez votre place pour un déjeuner ou dîner marocain authentique chez une famille locale.",
    ar: "احجز مكانك لغداء أو عشاء مغربي أصيل في بيت عائلة محلية.",
  };

  const bookingBandTagline = {
    en: "Authentic · Intimate · Unforgettable",
    fr: "Authentique · Intime · Inoubliable",
    ar: "أصيل · حميم · لا يُنسى",
  };

  const bookingTitle = {
    en: "Book lunch or dinner",
    fr: "Réservez déjeuner ou dîner",
    ar: "احجز الغداء أو العشاء",
  };

  const assignedFiles = new Set([
    "10.png",
    "4.png",
    "11.png",
    "5.png",
    "10.jpeg",
    "4.jpeg",
    "11.jpeg",
    "5.jpeg",
  ]);
  const remainingApprovedPhotos = data.photos.photos.filter(
    (p) => !assignedFiles.has(p.source_file ?? "") && p.guest_consent_confirmed,
  );

  // Manage gallery visibility: only show if 3 or more approved photos remain besides the assigned ones
  useEffect(() => {
    setHasGallery(remainingApprovedPhotos.length >= 3);
  }, [remainingApprovedPhotos.length, setHasGallery]);

  const howItWorksTrackedLabel = {
    en: "HOW IT WORKS",
    fr: "COMMENT ÇA MARCHE",
    ar: "كيف تسير التجربة",
  };

  const howItWorksTitle = {
    en: "A simple journey.",
    fr: "Un parcours simple.",
    ar: "رحلة بسيطة وممتعة.",
  };

  const howItWorksSteps = [
    {
      num: "1",
      icon: IconLocalFamilies,
      title: {
        en: "Arrive and meet the family",
        fr: "Arrivez et rencontrez la famille",
        ar: "الوصول والتعرف على العائلة",
      },
      desc: {
        en: "You are welcomed into a local family's home in Marrakech.",
        fr: "Vous êtes accueilli dans la maison d'une famille locale à Marrakech.",
        ar: "يُستقبل بكم في بيت عائلة محلية في مراكش.",
      },
    },
    {
      num: "2",
      icon: IconHomeCooked,
      title: {
        en: "Share the meal and taste local dishes",
        fr: "Partagez le repas et goûtez les plats locaux",
        ar: "مشاركة الوجبة وتذوق الأطباق المحلية",
      },
      desc: {
        en: "Share a traditional home-cooked meal made with fresh local ingredients at their table.",
        fr: "Partagez un repas traditionnel fait maison à sa table et goûtez des plats locaux préparés avec des ingrédients frais.",
        ar: "تتقاسمون وجبة تقليدية منزلية على مائدتها وتتذوقون أطباقًا محلية معدّة بمكوّنات طازجة.",
      },
    },
    {
      num: "3",
      icon: IconStepEnjoy,
      title: {
        en: "Hear their stories and traditions",
        fr: "Écoutez leurs histoires et traditions",
        ar: "الاستماع إلى قصصهم وتقاليدهم",
      },
      desc: {
        en: "The family shares stories about daily life and Moroccan traditions.",
        fr: "La famille vous raconte son quotidien et les traditions marocaines.",
        ar: "تحكي لكم العائلة عن حياتها اليومية وعن التقاليد المغربية.",
      },
    },
  ];

  const heroTrackedLabel = {
    en: "LOCAL FAMILY MEAL / MARRAKECH",
    fr: "REPAS EN FAMILLE LOCALE / MARRAKECH",
    ar: "وجبة عائلية أصيلة / مراكش",
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
    en: "Book lunch or dinner",
    fr: "Réservez déjeuner ou dîner",
    ar: "احجز الغداء أو العشاء",
  };

  const heroDiscoverBtn = {
    en: "Discover the experience",
    fr: "Découvrir l'expérience",
    ar: "اكتشف التجربة",
  };

  const heroFacts = [
    {
      num: "14:30 & 19:00",
      label: {
        en: "Lunch & Dinner",
        fr: "Déjeuner & Dîner",
        ar: "غداء وعشاء",
      },
    },
    {
      num: {
        en: "2.5h – 3h",
        fr: "2h30 – 3h",
        ar: "2.5 – 3 ساعات",
      },
      label: {
        en: "Duration",
        fr: "Durée",
        ar: "المدة",
      },
    },
    {
      num: "100%",
      label: {
        en: "Home-cooked",
        fr: "Fait maison",
        ar: "طهي منزلي",
      },
    },
    {
      num: "8",
      label: {
        en: "Guests max",
        fr: "Invités max",
        ar: "ضيوف كحد أقصى",
      },
    },
  ];

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
          1. HERO — Full-bleed video background (100svh, min 600px)
      ═══════════════════════════════════════════════════════════ */}
      <section
        id="home"
        className="relative w-full h-[100svh] min-h-[600px] overflow-hidden flex flex-col justify-between"
        aria-label="Hero"
      >
        {/* Full-bleed background video / poster fallback */}
        <div className="absolute inset-0 z-0">
          <HeroVideo />
        </div>

        {/* Dark oxblood gradient overlay for WCAG AA readability */}
        <div
          className="absolute inset-0 z-[1] pointer-events-none"
          style={{
            background:
              "linear-gradient(to top, rgba(26,6,8,0.78) 0%, rgba(26,6,8,0.55) 45%, rgba(26,6,8,0.25) 100%)",
          }}
          aria-hidden="true"
        />
        <div
          className="absolute inset-0 z-[1] pointer-events-none hidden sm:block"
          style={{
            background:
              lang === "ar"
                ? "linear-gradient(to left, rgba(26,6,8,0.85) 0%, rgba(26,6,8,0.45) 55%, transparent 100%)"
                : "linear-gradient(to right, rgba(26,6,8,0.85) 0%, rgba(26,6,8,0.45) 55%, transparent 100%)",
          }}
          aria-hidden="true"
        />

        {/* Foreground Content: on left on desktop, bottom on phones */}
        <div className="ms-container w-full h-full relative z-10 flex flex-col justify-between pt-24 sm:pt-28 lg:pt-32 pb-4 sm:pb-6 lg:pb-8">
          {/* Middle/Bottom Text Block */}
          <div className="my-auto lg:my-auto max-w-2xl text-start">
            <span className="tracked-label mb-3 sm:mb-4 text-gold drop-shadow-xs font-semibold inline-block">
              {heroTrackedLabel[lang]}
            </span>
            <h1 className="font-display font-semibold text-white tracking-[-0.02em] leading-[1.05] sm:leading-[1.02] text-4xl sm:text-5xl lg:text-6xl xl:text-7xl drop-shadow-sm">
              <span className="block">{heroH1Line1[lang]}</span>
              <span className="block italic">{heroH1Line2[lang]}</span>
            </h1>
            <p className="mt-4 sm:mt-6 text-white/90 text-base sm:text-lg lg:text-xl leading-[1.6] max-w-[46ch] drop-shadow-xs">
              {heroSubtitle[lang]}
            </p>
            <div className="mt-7 sm:mt-9 flex flex-wrap items-center gap-4 sm:gap-6">
              <a
                href="#booking"
                className="h-[60px] px-8 sm:px-9 rounded-full bg-gold text-oxblood hover:bg-[#D8B45B] active:scale-[0.98] font-semibold text-base inline-flex items-center gap-3 transition-all duration-200 shadow-lg shadow-black/20 group"
              >
                <span>{heroBookingBtn[lang]}</span>
                <ArrowRight
                  className="h-5 w-5 rtl:rotate-180 transition-transform group-hover:translate-x-1 rtl:group-hover:-translate-x-1"
                  aria-hidden="true"
                />
              </a>
              <a
                href="#experience"
                className="text-white/90 hover:text-white font-semibold text-base inline-flex items-center gap-2 transition-colors py-3 group"
              >
                <span className="border-b border-transparent group-hover:border-white transition-colors">
                  {heroDiscoverBtn[lang]}
                </span>
                <ArrowRight
                  className="h-4 w-4 rtl:rotate-180 transition-transform group-hover:translate-x-1 rtl:group-hover:-translate-x-1"
                  aria-hidden="true"
                />
              </a>
            </div>
          </div>

          {/* Bottom Facts Glass Bar + Animated Scroll Indicator */}
          <div className="w-full flex flex-col items-center">
            {/* Facts glass bar */}
            <div className="w-full rounded-2xl backdrop-blur-md bg-white/[0.12] border border-white/20 shadow-xl p-3 sm:p-4 lg:p-5 mt-4 sm:mt-6">
              <div className="grid grid-cols-2 sm:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x rtl:sm:divide-x-reverse divide-white/20">
                {heroFacts.map((fact, idx) => {
                  const isOdd = idx % 2 === 0;
                  return (
                    <div
                      key={idx}
                      className={`flex flex-col items-center justify-center text-center py-2 px-2 sm:px-4 ${
                        isOdd
                          ? "border-r rtl:border-r-0 rtl:border-l border-white/20 sm:border-0"
                          : ""
                      } ${idx >= 2 ? "pt-3 sm:pt-2" : "pb-3 sm:pb-2"}`}
                    >
                      <span className="font-display text-2xl sm:text-3xl lg:text-4xl font-semibold text-white tracking-tight leading-none">
                        {typeof fact.num === "string" ? fact.num : fact.num[lang]}
                      </span>
                      <span className="text-xs sm:text-sm text-white/85 font-sans mt-1 sm:mt-1.5 font-medium tracking-wide">
                        {fact.label[lang]}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Animated scroll indicator (desktop only) */}
            <div className="hidden lg:flex justify-center pt-3 pb-1">
              <a
                href="#experience"
                aria-label="Scroll to experience"
                className="flex flex-col items-center gap-1 text-white/70 hover:text-white transition-colors cursor-pointer group"
              >
                <span className="text-[10px] uppercase tracking-[0.2em] font-sans font-semibold">
                  {lang === "fr" ? "Découvrir" : lang === "ar" ? "اكتشف" : "Scroll"}
                </span>
                <ChevronDown className="w-4 h-4 animate-bounce text-white/80 group-hover:text-gold transition-colors" />
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
          4. PHOTOS (only when 3 or more approved photos remain)
      ═══════════════════════════════════════════════════════════ */}
      {remainingApprovedPhotos.length >= 3 && (
        <section id="photos" className="scroll-mt-20 bg-cream section-pad">
          <div className="ms-container">
            <div className="text-center mb-12 sm:mb-16">
              <span className="tracked-label block mb-2 text-gold">
                {lang === "fr" ? "GALERIE PHOTOS" : lang === "ar" ? "صور الضيوف" : "PHOTOS"}
              </span>
              <h2 className="text-center text-oxblood font-display font-semibold leading-[1.0] text-3xl sm:text-4xl lg:text-[44px] tracking-tight">
                {photosTitle[lang]}
              </h2>
            </div>
            <GuestPhotoGallery photos={remainingApprovedPhotos} />
          </div>
        </section>
      )}

      {/* ═══════════════════════════════════════════════════════════
          5. HOW IT WORKS
      ═══════════════════════════════════════════════════════════ */}
      <section id="how" className="scroll-mt-20 bg-cream section-pad">
        <div className="ms-container">
          <div className="text-center mb-12 sm:mb-16">
            <span className="tracked-label block mb-2 text-gold">
              {howItWorksTrackedLabel[lang]}
            </span>
            <h2 className="text-center text-oxblood font-display font-semibold leading-[1.0] text-3xl sm:text-4xl lg:text-[44px] tracking-tight">
              {howItWorksTitle[lang]}
            </h2>
          </div>

          {/* Desktop (>=1024px): 3 steps in a row with gold arrows */}
          <div className="hidden lg:grid lg:grid-cols-[1fr_auto_1fr_auto_1fr] items-start gap-4">
            {howItWorksSteps.map((step, idx) => {
              const Icon = step.icon;
              return (
                <Fragment key={step.num}>
                  <div className="flex flex-col items-center text-center px-4">
                    <div className="flex items-center gap-3.5 mb-4">
                      <span className="w-10 h-10 rounded-full bg-oxblood text-white flex items-center justify-center font-display text-base font-bold shadow-sm select-none">
                        {step.num}
                      </span>
                      <Icon className="w-7 h-7 text-oxblood" />
                    </div>
                    <h3 className="font-display font-bold text-oxblood text-xl sm:text-2xl mb-2">
                      {step.title[lang]}
                    </h3>
                    <p className="text-ink text-sm sm:text-base leading-relaxed max-w-[280px]">
                      {step.desc[lang]}
                    </p>
                  </div>
                  {idx < howItWorksSteps.length - 1 && (
                    <div
                      className="pt-2 flex items-center justify-center text-gold"
                      aria-hidden="true"
                    >
                      <ArrowRight className="w-6 h-6 rtl:rotate-180" />
                    </div>
                  )}
                </Fragment>
              );
            })}
          </div>

          {/* Mobile / Tablet (<1024px): Stacked on vertical line */}
          <div
            className="lg:hidden relative border-s-2 border-gold ms-6 sm:ms-8 ps-8 sm:ps-10 space-y-12"
            dir={lang === "ar" ? "rtl" : "ltr"}
          >
            {howItWorksSteps.map((step) => {
              const Icon = step.icon;
              return (
                <div key={step.num} className="relative">
                  {/* Step numbered circle node (40px solid oxblood) overlapping the vertical line */}
                  <div
                    className="absolute -start-[21px] top-0 w-10 h-10 rounded-full bg-oxblood text-white flex items-center justify-center font-display text-sm font-bold shadow-sm ring-4 ring-cream select-none"
                    aria-hidden="true"
                  >
                    {step.num}
                  </div>
                  <div className="flex items-center gap-2.5 mb-2">
                    <Icon className="w-6 h-6 text-oxblood shrink-0" />
                    <h3 className="font-display font-bold text-oxblood text-lg sm:text-xl">
                      {step.title[lang]}
                    </h3>
                  </div>
                  <p className="text-ink text-sm leading-relaxed max-w-[38ch]">{step.desc[lang]}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          6. BOOKING BAND (sand band with arch photo and white card)
      ═══════════════════════════════════════════════════════════ */}
      {data.bookingOptions.experiences.length > 0 && (
        <section
          id="booking"
          className="scroll-mt-20 bg-sand section-pad border-y border-stone-300/40"
        >
          <div className="ms-container">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
              {/* Left Column: Arch photo, label, title, sentence, gold line, tagline */}
              <div
                className="lg:col-span-4 flex flex-col items-start lg:sticky lg:top-28"
                dir={lang === "ar" ? "rtl" : "ltr"}
              >
                <div className="mb-6 mx-auto lg:mx-0">
                  <BookingBandArchPhoto photos={data.photos.photos} lang={lang} />
                </div>
                <span className="tracked-label block mb-2 text-gold">{bookingBandLabel[lang]}</span>
                <h2 className="font-display font-semibold text-oxblood text-3xl sm:text-4xl lg:text-[40px] leading-[1.05] tracking-tight mb-3">
                  {bookingBandTitle[lang]}
                </h2>
                <p className="text-muted-text text-sm sm:text-base leading-relaxed mb-4 max-w-[34ch]">
                  {bookingBandDesc[lang]}
                </p>
                <div className="w-12 h-[1px] bg-gold/70 mb-4" aria-hidden="true" />
                <p className="text-xs sm:text-sm font-medium text-ink/75 tracking-wider uppercase">
                  {bookingBandTagline[lang]}
                </p>
              </div>

              {/* Right Column: One large white card containing the booking flow */}
              <div className="lg:col-span-8 w-full min-w-0">
                <BookingFlow
                  initialExperienceId={firstBookable ?? ""}
                  initialOptions={data.bookingOptions}
                />
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
