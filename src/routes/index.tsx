import { Fragment, useEffect, useRef, useState } from "react";
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

  if (photo4?.url) {
    const alt = photo4.alt[lang] || photo4.alt.en || "Moroccan family dinner";
    return (
      <div className="w-full max-w-[260px] sm:max-w-[280px] h-[340px] sm:h-[400px] arch-frame overflow-hidden shadow-soft bg-sand">
        <img
          src={photo4.url}
          srcSet={photo4.srcSet}
          alt={alt}
          loading="lazy"
          className="w-full h-full object-cover object-center"
        />
      </div>
    );
  }

  // Neutral placeholder: oxblood with zellige pattern
  return (
    <div
      className="w-full max-w-[260px] sm:max-w-[280px] h-[340px] sm:h-[400px] arch-frame overflow-hidden bg-oxblood zellige-burgundy flex flex-col items-center justify-center p-6 text-center shadow-soft relative"
      aria-label="Photo (4.png) pending consent"
    >
      <ZelligeStarSvg className="w-12 h-12 text-gold/40 mb-3" />
      <span className="text-xs font-medium text-white/60 tracking-widest uppercase">
        Moroccan Secrets
      </span>
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
    en: "BOOK YOUR DINNER",
    fr: "RÉSERVEZ VOTRE DÎNER",
    ar: "احجز عشاءك",
  };

  const bookingBandTitle = {
    en: "Good food. Great company.",
    fr: "Bonne table. Chaleureuse compagnie.",
    ar: "مائدة طيبة. وصحبة رائعة.",
  };

  const bookingBandDesc = {
    en: "Reserve your spot for an authentic Moroccan dinner with a local family.",
    fr: "Réservez votre place pour un dîner marocain authentique chez une famille locale.",
    ar: "احجز مكانك لعشاء مغربي أصيل في بيت عائلة محلية.",
  };

  const bookingBandTagline = {
    en: "Authentic · Intimate · Unforgettable",
    fr: "Authentique · Intime · Inoubliable",
    ar: "أصيل · حميم · لا يُنسى",
  };

  const bookingTitle = {
    en: "Book your dinner",
    fr: "Réservez votre dîner",
    ar: "احجز عشاءك",
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
      icon: IconStepCalendar,
      title: {
        en: "Choose your date",
        fr: "Choisissez votre date",
        ar: "اختر موعدك",
      },
      desc: {
        en: "Pick an available evening that fits your schedule in Marrakech.",
        fr: "Sélectionnez une soirée disponible selon vos dates de séjour à Marrakech.",
        ar: "اختر أمسية متاحة تناسب برنامج رحلتك في مراكش.",
      },
    },
    {
      num: "2",
      icon: IconStepConfirm,
      title: {
        en: "Send your request, the host confirms",
        fr: "Envoyez votre demande, l'hôte confirme",
        ar: "أرسل طلبك، والمضيف يؤكد",
      },
      desc: {
        en: "Fill in your details and dishes; the local family confirms your table.",
        fr: "Indiquez vos plats choisis et coordonnées ; la famille locale confirme votre table.",
        ar: "حدد أطباقك المفضلة وبياناتك، وستؤكد العائلة المحلية حجزك.",
      },
    },
    {
      num: "3",
      icon: IconStepEnjoy,
      title: {
        en: "Enjoy the evening",
        fr: "Profitez de la soirée",
        ar: "استمتع بالأمسية",
      },
      desc: {
        en: "Share tea, cook together, and gather around the family table.",
        fr: "Partagez le thé, cuisinez ensemble et savourez le dîner autour de la table.",
        ar: "شارك الشاي، اطبخوا معاً، واجتمعوا حول مائدة العائلة الدافئة.",
      },
    },
  ];

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
                    <div className="pt-2 flex items-center justify-center text-gold" aria-hidden="true">
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
                  <p className="text-ink text-sm leading-relaxed max-w-[38ch]">
                    {step.desc[lang]}
                  </p>
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
        <section id="booking" className="scroll-mt-20 bg-sand section-pad border-y border-stone-300/40">
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
                <span className="tracked-label block mb-2 text-gold">
                  {bookingBandLabel[lang]}
                </span>
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
