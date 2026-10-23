import type { ReactNode } from "react";
import { useI18n } from "@/lib/i18n";
import {
  Utensils,
  Soup,
  Coffee,
  Heart,
  Music,
  Users,
  MessageCircleHeart,
  Shirt,
  AlertCircle,
  CakeSlice,
  Clock,
  Check,
  Home,
  ChefHat,
} from "lucide-react";
import {
  OrnamentDivider,
  ZelligeLineArtStar,
  ZelligeStarSvg,
  IconLocalFamilies,
  IconHomeCooked,
} from "@/components/site/Brand";

export const MAIN_DISHES = [
  {
    id: "couscous-chicken",
    label: { en: "Couscous with chicken", fr: "Couscous au poulet", ar: "كسكس بالدجاج" },
  },
  {
    id: "couscous-beef",
    label: { en: "Couscous with beef", fr: "Couscous au bœuf", ar: "كسكس باللحم البقري" },
  },
  {
    id: "meat-tagine-prunes",
    label: {
      en: "Meat tagine with prunes, sesame and walnuts",
      fr: "Tajine de viande aux pruneaux, sésame et noix",
      ar: "طاجين اللحم بالبرقوق والسمسم والجوز",
    },
  },
  {
    id: "meat-tagine-vegetables",
    label: {
      en: "Meat tagine with vegetables",
      fr: "Tajine de viande aux légumes",
      ar: "طاجين اللحم بالخضار",
    },
  },
  {
    id: "vegetarian-tagine",
    label: { en: "Vegetarian tagine", fr: "Tajine végétarien", ar: "طاجين نباتي" },
  },
  {
    id: "chicken-tagine-lemon",
    label: {
      en: "Chicken tagine with preserved lemon and olives",
      fr: "Tajine de poulet au citron confit et olives",
      ar: "طاجين الدجاج بالليمون المخلل والزيتون",
    },
  },
  {
    id: "fish-tagine-vegetables",
    label: {
      en: "Fish tagine with vegetables",
      fr: "Tajine de poisson aux légumes",
      ar: "طاجين السمك بالخضار",
    },
  },
] as const;

export type MainDishId = (typeof MAIN_DISHES)[number]["id"];

export const WHAT_IS_IT_TEXT = {
  title: {
    en: "What is a dinner with a local family?",
    fr: "Qu'est-ce qu'un dîner chez une famille locale ?",
    ar: "ما هو العشاء عند عائلة محلية؟",
  },
  lead: {
    en: "It is not a restaurant and it is not a cooking class. It is an evening at the table of a Moroccan family in Marrakech, where you are the guest.",
    fr: "Ce n'est ni un restaurant ni un cours de cuisine. C'est une soirée à la table d'une famille marocaine à Marrakech, dont vous êtes l'invité.",
    ar: "ليس مطعماً وليس درساً في الطبخ. إنها أمسية على مائدة عائلة مغربية في مراكش، وأنت ضيفها.",
  },
  body: {
    en: "You are welcomed into the family home with mint tea, you join in preparing the meal, and then you share the table, the stories and the music. You leave having tasted real home cooking and met real people.",
    fr: "Vous êtes accueilli dans la maison avec un thé à la menthe, vous participez à la préparation du repas, puis vous partagez la table, les histoires et la musique. Vous repartez avec le goût d'une vraie cuisine de maison et de vraies rencontres.",
    ar: "تُستقبل في بيت العائلة بكأس شاي بالنعناع، وتشارك في تحضير الوجبة، ثم تتقاسم المائدة والحكايات والموسيقى. تغادر وقد تذوقت طبخاً منزلياً حقيقياً والتقيت بأناس حقيقيين.",
  },
  pillars: [
    {
      id: "home",
      icon: Home,
      title: {
        en: "A real family home",
        fr: "Chez une vraie famille",
        ar: "في بيت عائلة حقيقي",
      },
      desc: {
        en: "You eat inside the family's own home, around their table. The atmosphere is warm and relaxed.",
        fr: "Vous mangez dans la maison de la famille, autour de sa table. L'ambiance est chaleureuse et détendue.",
        ar: "تتناول الطعام داخل بيت العائلة نفسه حول مائدتها. الأجواء دافئة ومريحة.",
      },
    },
    {
      id: "cook",
      icon: ChefHat,
      title: {
        en: "Cook together",
        fr: "Cuisinez ensemble",
        ar: "الطبخ معاً",
      },
      desc: {
        en: "Join the family in the kitchen and help prepare the meal.",
        fr: "Rejoignez la famille en cuisine et aidez à préparer le repas.",
        ar: "انضم إلى العائلة في المطبخ وساعد في تحضير الوجبة.",
      },
    },
    {
      id: "culture",
      icon: Music,
      title: {
        en: "Culture and stories",
        fr: "Culture et histoires",
        ar: "ثقافة وحكايات",
      },
      desc: {
        en: "Traditional clothing, authentic music and local stories make it a true cultural exchange.",
        fr: "Vêtements traditionnels, musique authentique et histoires locales : un vrai échange culturel.",
        ar: "اللباس التقليدي والموسيقى الأصيلة والحكايات المحلية تصنع تبادلاً ثقافياً حقيقياً.",
      },
    },
    {
      id: "menu",
      icon: Utensils,
      title: {
        en: "Your menu, your choice",
        fr: "Votre menu, votre choix",
        ar: "قائمتك، اختيارك",
      },
      desc: {
        en: "Choose 2 of 7 main dishes. Starters, drinks and dessert are included. Tell us about allergies or diets in advance.",
        fr: "Choisissez 2 plats parmi 7. Entrées, boissons et dessert inclus. Prévenez-nous à l'avance pour toute allergie ou régime.",
        ar: "اختر طبقين من سبعة أطباق رئيسية. المقبلات والمشروبات والحلوى مشمولة. أخبرنا مسبقاً بأي حساسية أو نظام غذائي.",
      },
    },
  ],
  eveningGlance: {
    title: {
      en: "An evening at a glance",
      fr: "Une soirée en un coup d'œil",
      ar: "لمحة عن الأمسية",
    },
    duration: {
      en: "About 3 hours",
      fr: "Environ 3 heures",
      ar: "حوالي 3 ساعات",
    },
    stops: [
      {
        label: {
          en: "19:00 Welcome with mint tea",
          fr: "19:00 Accueil au thé à la menthe",
          ar: "19:00 الاستقبال بالشاي بالنعناع",
        },
      },
      {
        label: {
          en: "Cooking together",
          fr: "Cuisiner ensemble",
          ar: "الطبخ معاً",
        },
      },
      {
        label: {
          en: "Dinner around the table",
          fr: "Dîner autour de la table",
          ar: "العشاء حول المائدة",
        },
      },
      {
        label: {
          en: "Stories, music and dessert",
          fr: "Histoires, musique et dessert",
          ar: "حكايات وموسيقى وحلوى",
        },
      },
    ],
  },
  goodToKnow: {
    title: {
      en: "Good to know",
      fr: "Bon à savoir",
      ar: "معلومات تهمك",
    },
    items: [
      {
        q: {
          en: "How many guests?",
          fr: "Combien d'invités ?",
          ar: "كم عدد الضيوف؟",
        },
        a: {
          en: "From 1 to 8 guests per evening.",
          fr: "De 1 à 8 invités par soirée.",
          ar: "من ضيف واحد إلى 8 ضيوف في كل أمسية.",
        },
      },
      {
        q: {
          en: "How long does it last?",
          fr: "Combien de temps cela dure-t-il ?",
          ar: "كم تستغرق التجربة؟",
        },
        a: {
          en: "About 3 hours, starting at 19:00.",
          fr: "Environ 3 heures, à partir de 19h00.",
          ar: "حوالي 3 ساعات، ابتداءً من الساعة 19:00.",
        },
      },
      {
        q: {
          en: "I am vegetarian or have allergies.",
          fr: "Je suis végétarien ou j'ai des allergies.",
          ar: "أنا نباتي أو لدي حساسية غذائية.",
        },
        a: {
          en: "A vegetarian tagine is on the menu. Tell us about allergies or other needs when you book.",
          fr: "Un tajine végétarien est au menu. Indiquez-nous vos allergies ou régimes lors de votre réservation.",
          ar: "يوجد طاجين نباتي في القائمة. أخبرنا بأي حساسية أو احتياجات عند الحجز.",
        },
      },
      {
        q: {
          en: "How do I book?",
          fr: "Comment réserver ?",
          ar: "كيف يمكنني الحجز؟",
        },
        a: {
          en: "Choose a day, send the form, and the host confirms your request.",
          fr: "Choisissez un jour, envoyez le formulaire, et l'hôte confirme votre demande.",
          ar: "اختر يوماً، وأرسل النموذج، وسيقوم المضيف بتأكيد طلبك.",
        },
      },
    ],
  },
} as const;

export const CONCEPT_TEXT = {
  title: WHAT_IS_IT_TEXT.title,
  intro: WHAT_IS_IT_TEXT.body,
  pullQuote: WHAT_IS_IT_TEXT.lead,
} as const;

export const MENU_TEXT = {
  sectionTitle: { en: "The Menu", fr: "Le Menu", ar: "قائمة الطعام" },
  mainCoursesTitle: {
    en: "Main course, choose 2",
    fr: "Plat principal, choisissez-en 2",
    ar: "الطبق الرئيسي، اختر 2",
  },
  includedTitle: {
    en: "Included with every meal",
    fr: "Inclus avec chaque repas",
    ar: "مشمول مع كل وجبة",
  },
  starters: {
    title: { en: "Starters", fr: "Entrées", ar: "المقبلات" },
    desc: {
      en: "Spiced vegetable soup, Moroccan salads such as zaalouk and tektouka",
      fr: "Soupe de légumes épicée, salades marocaines telles que zaalouk et taktuka",
      ar: "حساء خضار متبل، وسلطات مغربية مثل الزعلوك والتكتوكة",
    },
  },
  drinks: {
    title: { en: "Drinks", fr: "Boissons", ar: "المشروبات" },
    desc: {
      en: "Traditional Moroccan mint tea, mineral water",
      fr: "Thé à la menthe marocain traditionnel, eau minérale",
      ar: "شاي مغربي تقليدي بالنعناع، ومياه معدنية",
    },
  },
  dessert: {
    title: { en: "Dessert", fr: "Dessert", ar: "الحلوى" },
    desc: {
      en: "Fresh juice, Moroccan pastry",
      fr: "Jus de fruits frais, pâtisserie marocaine",
      ar: "عصير طازج، وحلويات مغربية",
    },
  },
  highlightsTitle: {
    en: "Experience Highlights",
    fr: "Moments forts de l'expérience",
    ar: "أبرز ما في التجربة",
  },
  highlights: [
    {
      icon: Shirt,
      label: { en: "Traditional clothing", fr: "Vêtements traditionnels", ar: "اللباس التقليدي" },
    },
    {
      icon: Music,
      label: { en: "Authentic music", fr: "Musique authentique", ar: "موسيقى أصيلة" },
    },
    { icon: Heart, label: { en: "Warm hospitality", fr: "Accueil chaleureux", ar: "ضيافة دافئة" } },
    {
      icon: Users,
      label: {
        en: "Eat with a local family",
        fr: "Repas avec une famille locale",
        ar: "تناول الطعام مع عائلة محلية",
      },
    },
    {
      icon: MessageCircleHeart,
      label: {
        en: "Cultural exchange & local stories",
        fr: "Échange culturel et récits locaux",
        ar: "تبادل ثقافي وحكايات محلية",
      },
    },
  ],
  allergyNote: {
    en: "Please inform us in advance of any allergies or dietary restrictions.",
    fr: "Merci de nous prévenir à l'avance de toute allergie ou restriction alimentaire.",
    ar: "يرجى إخبارنا مسبقاً بأي حساسية أو قيود غذائية.",
  },
} as const;

const EXPERIENCE_TEXT = {
  eyebrow: {
    en: "THE EXPERIENCE",
    fr: "L'EXPÉRIENCE",
    ar: "التجربة",
  },
  title: {
    en: "More than a meal.",
    fr: "Plus qu'un repas.",
    ar: "أكثر من مجرد وجبة.",
  },
  lead: {
    en: "It's an invitation into Moroccan life — where food brings people together, traditions are shared, and every meal has a story.",
    fr: "Une invitation au cœur de la vie marocaine — où la cuisine rassemble, les traditions se partagent et chaque plat a son histoire.",
    ar: "دعوة إلى عمق الحياة المغربية — حيث يجمع الطعام القلوب، وتتقاسم التقاليد، ولكل وجبة حكاية.",
  },
  cards: [
    {
      sourceFile: "10.jpeg",
      icon: IconLocalFamilies,
      title: {
        en: "Meet your hosts",
        fr: "Rencontrez vos hôtes",
        ar: "تعرف على مضيفيك",
      },
      text: {
        en: "Warm families, genuine conversations, a true sense of belonging.",
        fr: "Des familles chaleureuses, des conversations sincères, un vrai sentiment d'appartenance.",
        ar: "عائلات دافئة، محادثات صادقة، وإحساس حقيقي بالانتماء.",
      },
    },
    {
      sourceFile: "4.jpeg",
      icon: IconHomeCooked,
      title: {
        en: "Taste family recipes",
        fr: "Savourez des recettes familiales",
        ar: "تذوق وصفات عائلية",
      },
      text: {
        en: "Generations-old dishes, prepared with love and fresh local ingredients.",
        fr: "Des plats transmis de génération en génération, préparés avec amour et produits frais.",
        ar: "أطباق متوارثة عبر الأجيال، محضرة بحب ومكونات محلية طازجة.",
      },
    },
    {
      sourceFile: "11.jpeg",
      icon: ZelligeStarSvg,
      title: {
        en: "Discover local traditions",
        fr: "Découvrez les traditions locales",
        ar: "اكتشف التقاليد المحلية",
      },
      text: {
        en: "From tea rituals to Moroccan hospitality, experience the culture beyond the guidebooks.",
        fr: "Du rituel du thé à l'hospitalité marocaine, vivez la culture bien au-delà des guides.",
        ar: "من طقوس الشاي إلى كرم الضيافة المغربية، عش أصالة الثقافة بعيداً عن الكتيبات.",
      },
    },
  ],
};

export function ExperienceCardPhoto({
  photo,
  sourceFile,
  alt,
}: {
  photo?: { url: string; srcSet?: string | undefined; alt?: { en: string; fr: string; ar: string } } | undefined;
  sourceFile: string;
  alt: string;
}) {
  if (photo?.url) {
    return (
      <div className="w-full h-44 sm:h-48 overflow-hidden rounded-[14px] bg-sand">
        <img
          src={photo.url}
          srcSet={photo.srcSet}
          alt={alt}
          loading="lazy"
          className="w-full h-full object-cover object-center transition-transform duration-500 hover:scale-105"
        />
      </div>
    );
  }

  // Neutral placeholder: oxblood with zellige pattern
  return (
    <div
      className="w-full h-44 sm:h-48 overflow-hidden rounded-[14px] bg-oxblood zellige-burgundy flex flex-col items-center justify-center p-4 text-center relative"
      aria-label={`Photo (${sourceFile}) pending consent`}
    >
      <ZelligeStarSvg className="w-8 h-8 text-gold/40 mb-2" />
      <span className="text-[11px] font-medium text-white/50 tracking-wider uppercase">
        Moroccan Secrets
      </span>
    </div>
  );
}

export function ConceptSection({
  photos = [],
  conceptPhoto,
}: {
  photos?: Array<{
    source_file?: string | null | undefined;
    guest_consent_confirmed: boolean;
    url: string;
    srcSet?: string | undefined;
    alt: { en: string; fr: string; ar: string };
  }> | undefined;
  conceptPhoto?: { url: string; alt: string; srcSet?: string | undefined } | undefined;
}) {
  const { lang } = useI18n();

  const eveningStops = [
    {
      time: "19:00",
      title: {
        en: "Welcome with mint tea",
        fr: "Accueil au thé à la menthe",
        ar: "الاستقبال بالشاي بالنعناع",
      },
    },
    {
      time: "19:30",
      title: {
        en: "Cooking together",
        fr: "Cuisiner ensemble",
        ar: "الطبخ معاً",
      },
    },
    {
      time: "20:30",
      title: {
        en: "Dinner around the table",
        fr: "Dîner autour de la table",
        ar: "العشاء حول المائدة",
      },
    },
    {
      time: "21:30",
      title: {
        en: "Stories, music and dessert",
        fr: "Histoires, musique et dessert",
        ar: "حكايات وموسيقى وحلوى",
      },
    },
  ];

  return (
    <section
      id="experience"
      className="scroll-mt-20 bg-cream relative z-0 section-pad"
    >
      <span id="concept" className="sr-only" aria-hidden="true" />
      <div className="ms-container">
        {/* Top: Two Columns */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
          {/* Left: Text + Star ornament (col-span-12 lg:col-span-4) */}
          <div
            className="lg:col-span-4 flex flex-col items-start h-full justify-between"
            dir={lang === "ar" ? "rtl" : "ltr"}
          >
            <div>
              <span className="tracked-label mb-3 text-gold">
                {EXPERIENCE_TEXT.eyebrow[lang]}
              </span>
              <h2 className="text-oxblood font-display font-semibold leading-[1.0] text-4xl sm:text-5xl lg:text-5xl tracking-[-0.02em] mt-2 mb-5">
                {EXPERIENCE_TEXT.title[lang]}
              </h2>
              <p className="text-muted-text text-base sm:text-lg leading-[1.65] max-w-[36ch]">
                {EXPERIENCE_TEXT.lead[lang]}
              </p>
              <div className="mt-6 mb-8">
                <span className="gold-line" />
              </div>
            </div>

            {/* Large gold line-art star at bottom-left */}
            <div className="hidden lg:block pt-4 rtl:scale-x-[-1]">
              <ZelligeLineArtStar className="w-36 h-36 xl:w-44 xl:h-44 text-gold" opacity={0.35} />
            </div>
          </div>

          {/* Right: Three white cards (col-span-12 lg:col-span-8) */}
          <div className="lg:col-span-8">
            <div className="flex overflow-x-auto snap-x snap-mandatory gap-4 pb-4 -mx-5 px-5 scrollbar-none md:grid md:grid-cols-3 md:gap-6 md:mx-0 md:px-0">
              {EXPERIENCE_TEXT.cards.map((card, idx) => {
                const Icon = card.icon;
                const matchedPhoto = photos.find(
                  (p) => p.source_file === card.sourceFile && p.guest_consent_confirmed,
                );
                return (
                  <div
                    key={idx}
                    className="min-w-[260px] sm:min-w-[280px] snap-center shrink-0 md:min-w-0 md:shrink rounded-[20px] bg-white p-5 shadow-soft flex flex-col justify-between border border-stone-200/50"
                    dir={lang === "ar" ? "rtl" : "ltr"}
                  >
                    <div>
                      {/* Photo slot */}
                      <ExperienceCardPhoto
                        photo={matchedPhoto}
                        sourceFile={card.sourceFile}
                        alt={card.title[lang]}
                      />
                      {/* Icon */}
                      <div className="mt-4 mb-2 flex items-center">
                        <Icon className="w-5 h-5 text-gold" />
                      </div>
                      {/* Title */}
                      <h3 className="font-display text-xl font-bold text-ink leading-tight mb-2">
                        {card.title[lang]}
                      </h3>
                      {/* Short text */}
                      <p className="text-xs sm:text-sm text-muted-text leading-relaxed">
                        {card.text[lang]}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* --- An evening at a glance timeline (restyled as slim gold-line timeline) --- */}
        <div
          className="mt-16 sm:mt-24 pt-12 border-t border-stone-300/60"
          dir={lang === "ar" ? "rtl" : "ltr"}
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10">
            <div>
              <h3 className="font-display text-2xl sm:text-3xl font-bold text-oxblood mb-2">
                {WHAT_IS_IT_TEXT.eveningGlance.title[lang]}
              </h3>
              <span className="gold-line" />
            </div>
            <div className="inline-flex items-center gap-2 self-start sm:self-auto rounded-full bg-cream border border-gold/40 px-4 py-1.5 text-xs font-semibold text-oxblood shadow-2xs">
              <Clock className="h-3.5 w-3.5 text-gold" aria-hidden="true" />
              <span>{WHAT_IS_IT_TEXT.eveningGlance.duration[lang]}</span>
            </div>
          </div>

          {/* Desktop timeline (horizontal) */}
          <div className="hidden lg:block relative pt-6 pb-2">
            <div
              className="absolute top-10 start-[12.5%] end-[12.5%] h-px bg-gold/50 z-0"
              aria-hidden="true"
            />
            <div className="grid grid-cols-4 gap-6 relative z-10 text-center">
              {eveningStops.map((stop, idx) => (
                <div key={idx} className="flex flex-col items-center px-2">
                  <div
                    className="h-3.5 w-3.5 rounded-full bg-oxblood ring-4 ring-cream shadow-2xs mb-4"
                    aria-hidden="true"
                  />
                  <span className="font-display text-2xl xl:text-3xl font-bold text-gold block leading-none mb-2">
                    {stop.time}
                  </span>
                  <h4 className="font-display text-base xl:text-lg font-bold text-ink leading-snug">
                    {stop.title[lang]}
                  </h4>
                </div>
              ))}
            </div>
          </div>

          {/* Mobile timeline (vertical) */}
          <div className="lg:hidden relative border-s border-gold/50 ms-4 ps-6 space-y-7">
            {eveningStops.map((stop, idx) => (
              <div key={idx} className="relative">
                <div
                  className="absolute -start-[31px] top-1.5 h-3 w-3 rounded-full bg-oxblood ring-4 ring-cream shadow-2xs"
                  aria-hidden="true"
                />
                <span className="font-display text-xl sm:text-2xl font-bold text-gold block leading-none mb-1">
                  {stop.time}
                </span>
                <h4 className="font-display text-base font-bold text-ink leading-snug">
                  {stop.title[lang]}
                </h4>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export function MenuSection({
  photos = [],
}: {
  photos?: Array<{
    source_file?: string | null | undefined;
    guest_consent_confirmed: boolean;
    url: string;
    srcSet?: string | undefined;
    alt: { en: string; fr: string; ar: string };
  }> | undefined;
}) {
  const { lang } = useI18n();
  const photo5 = photos?.find((p) => p.source_file === "5.jpeg" && p.guest_consent_confirmed);

  const menuHeadings = {
    eyebrow: { en: "THE MENU", fr: "LE MENU", ar: "قائمة الطعام" },
    title: { en: "A taste of Morocco.", fr: "Un goût du Maroc.", ar: "مذاق المغرب الأصيل." },
    chooseDishes: {
      en: "Choose 2 main dishes",
      fr: "Choisissez 2 plats principaux",
      ar: "اختر طبقين رئيسيين",
    },
    included: {
      en: "Included with every meal: starters, drinks, dessert",
      fr: "Inclus avec chaque repas : entrées, boissons, dessert",
      ar: "مشمول مع كل وجبة: المقبلات، المشروبات، الحلوى",
    },
  };

  return (
    <section
      id="menu"
      className="scroll-mt-20 bg-oxblood text-white relative overflow-hidden"
    >
      {/* Background subtle zellige pattern */}
      <div
        aria-hidden="true"
        className="zellige-burgundy absolute inset-0 pointer-events-none opacity-40"
      />

      {/* Desktop Layout (>=1024px): 2 columns with 5.jpeg occupying right half full-height */}
      <div className="hidden lg:grid lg:grid-cols-12 min-h-[640px] relative z-10">
        {/* Left column: Menu list inside container */}
        <div
          className="lg:col-span-7 py-16 xl:py-20 ps-6 pe-8 xl:ps-16 xl:pe-12 max-w-[700px] ms-auto flex flex-col justify-center"
          dir={lang === "ar" ? "rtl" : "ltr"}
        >
          <span className="tracked-label text-gold mb-3">
            {menuHeadings.eyebrow[lang]}
          </span>
          <h2 className="font-display text-4xl xl:text-5xl font-semibold text-white tracking-[-0.02em] leading-[1.0] mb-5">
            {menuHeadings.title[lang]}
          </h2>
          <span className="gold-line mb-8" />

          {/* Choose 2 main dishes */}
          <h3 className="font-display text-xl xl:text-2xl font-bold text-gold mb-4">
            {menuHeadings.chooseDishes[lang]}
          </h3>
          <ul className="space-y-2.5 mb-8">
            {MAIN_DISHES.map((dish) => (
              <li key={dish.id} className="flex items-baseline gap-3">
                <span className="text-gold font-bold select-none shrink-0">—</span>
                <span className="font-display text-lg xl:text-xl text-white/95 font-medium leading-snug">
                  {dish.label[lang]}
                </span>
              </li>
            ))}
          </ul>

          {/* Included with every meal */}
          <h3 className="font-display text-xl xl:text-2xl font-bold text-gold mb-3">
            {menuHeadings.included[lang]}
          </h3>
          <div className="space-y-2 text-sm xl:text-base text-white/85 mb-8">
            <div className="flex items-start gap-3">
              <span className="text-gold select-none shrink-0">—</span>
              <p>
                <strong className="text-white font-semibold">{MENU_TEXT.starters.title[lang]}:</strong>{" "}
                {MENU_TEXT.starters.desc[lang]}
              </p>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-gold select-none shrink-0">—</span>
              <p>
                <strong className="text-white font-semibold">{MENU_TEXT.drinks.title[lang]}:</strong>{" "}
                {MENU_TEXT.drinks.desc[lang]}
              </p>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-gold select-none shrink-0">—</span>
              <p>
                <strong className="text-white font-semibold">{MENU_TEXT.dessert.title[lang]}:</strong>{" "}
                {MENU_TEXT.dessert.desc[lang]}
              </p>
            </div>
          </div>

          {/* Allergy Note */}
          <div className="pt-4 border-t border-white/15 flex items-center gap-3 text-xs xl:text-sm text-white/75">
            <AlertCircle className="w-4 h-4 text-gold shrink-0" aria-hidden="true" />
            <p>{MENU_TEXT.allergyNote[lang]}</p>
          </div>
        </div>

        {/* Right column: 5.jpeg occupying ~50% width, full height, blended left edge */}
        <div className="lg:col-span-5 relative h-full min-h-[640px] overflow-hidden">
          {photo5?.url ? (
            <div className="w-full h-full relative">
              <img
                src={photo5.url}
                srcSet={photo5.srcSet}
                alt="Moroccan feast dishes and tagines"
                loading="lazy"
                className="w-full h-full object-cover object-center"
              />
              {/* Very light dark overlay */}
              <div className="absolute inset-0 bg-black/20 pointer-events-none" aria-hidden="true" />
              {/* Gradient blending left edge into oxblood (mirrors in RTL) */}
              <div
                className="absolute inset-y-0 start-0 w-32 bg-gradient-to-r rtl:bg-gradient-to-l from-oxblood to-transparent pointer-events-none"
                aria-hidden="true"
              />
            </div>
          ) : (
            <div className="w-full h-full bg-[#3A0E10] zellige-burgundy flex flex-col items-center justify-center p-8 text-center relative">
              <ZelligeStarSvg className="w-12 h-12 text-gold/30 mb-3" />
              <span className="text-xs font-semibold text-white/60 tracking-widest uppercase">
                A taste of Morocco
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Layout (<1024px): Photo on top with gradient into oxblood, list below */}
      <div className="lg:hidden flex flex-col w-full relative z-10">
        {/* Photo on top with gradient into oxblood */}
        <div className="w-full h-64 sm:h-80 relative overflow-hidden">
          {photo5?.url ? (
            <>
              <img
                src={photo5.url}
                srcSet={photo5.srcSet}
                alt="Moroccan feast dishes and tagines"
                loading="lazy"
                className="w-full h-full object-cover object-center"
              />
              <div className="absolute inset-0 bg-black/20 pointer-events-none" aria-hidden="true" />
              <div
                className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-oxblood via-oxblood/60 to-transparent pointer-events-none"
                aria-hidden="true"
              />
            </>
          ) : (
            <div className="w-full h-full bg-[#3A0E10] zellige-burgundy flex flex-col items-center justify-center p-6 text-center relative">
              <ZelligeStarSvg className="w-10 h-10 text-gold/30 mb-2" />
              <span className="text-xs font-semibold text-white/60 tracking-widest uppercase">
                A taste of Morocco
              </span>
            </div>
          )}
        </div>

        {/* List below */}
        <div
          className="ms-container py-10 px-5 flex flex-col"
          dir={lang === "ar" ? "rtl" : "ltr"}
        >
          <span className="tracked-label text-gold mb-2 text-xs">
            {menuHeadings.eyebrow[lang]}
          </span>
          <h2 className="font-display text-3xl sm:text-4xl font-semibold text-white tracking-[-0.02em] leading-[1.0] mb-3">
            {menuHeadings.title[lang]}
          </h2>
          <span className="gold-line mb-6" />

          {/* Choose 2 main dishes */}
          <h3 className="font-display text-lg sm:text-xl font-bold text-gold mb-3">
            {menuHeadings.chooseDishes[lang]}
          </h3>
          <ul className="space-y-2 mb-6">
            {MAIN_DISHES.map((dish) => (
              <li key={dish.id} className="flex items-baseline gap-2.5">
                <span className="text-gold font-bold select-none shrink-0">—</span>
                <span className="font-display text-base sm:text-lg text-white/95 font-medium leading-snug">
                  {dish.label[lang]}
                </span>
              </li>
            ))}
          </ul>

          {/* Included with every meal */}
          <h3 className="font-display text-lg sm:text-xl font-bold text-gold mb-2.5">
            {menuHeadings.included[lang]}
          </h3>
          <div className="space-y-2 text-xs sm:text-sm text-white/85 mb-6">
            <div className="flex items-start gap-2.5">
              <span className="text-gold select-none shrink-0">—</span>
              <p>
                <strong className="text-white font-semibold">{MENU_TEXT.starters.title[lang]}:</strong>{" "}
                {MENU_TEXT.starters.desc[lang]}
              </p>
            </div>
            <div className="flex items-start gap-2.5">
              <span className="text-gold select-none shrink-0">—</span>
              <p>
                <strong className="text-white font-semibold">{MENU_TEXT.drinks.title[lang]}:</strong>{" "}
                {MENU_TEXT.drinks.desc[lang]}
              </p>
            </div>
            <div className="flex items-start gap-2.5">
              <span className="text-gold select-none shrink-0">—</span>
              <p>
                <strong className="text-white font-semibold">{MENU_TEXT.dessert.title[lang]}:</strong>{" "}
                {MENU_TEXT.dessert.desc[lang]}
              </p>
            </div>
          </div>

          {/* Allergy Note */}
          <div className="pt-3 border-t border-white/15 flex items-center gap-2.5 text-xs text-white/75">
            <AlertCircle className="w-4 h-4 text-gold shrink-0" aria-hidden="true" />
            <p>{MENU_TEXT.allergyNote[lang]}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
