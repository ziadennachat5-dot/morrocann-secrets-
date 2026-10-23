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
} from "lucide-react";
import { OrnamentDivider } from "@/components/site/Brand";

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

export const CONCEPT_TEXT = {
  title: {
    en: "Eat with a local Moroccan family",
    fr: "Partagez le repas d'une famille marocaine",
    ar: "تناول الطعام مع عائلة مغربية",
  },
  intro: {
    en: "More than a meal, it's a Moroccan family experience. Step into a real family home and share authentic Moroccan cuisine, warm hospitality and local stories. You choose 2 main dishes, and the starters, drinks and dessert are included with every meal. Enjoy traditional clothing, authentic music and a true cultural exchange. Please tell us in advance about any allergies or dietary requirements, and we will do our best to accommodate you.",
    fr: "Plus qu'un repas, une expérience en famille marocaine. Entrez dans une vraie maison et partagez une cuisine marocaine authentique, un accueil chaleureux et des histoires locales. Vous choisissez 2 plats principaux, et les entrées, boissons et dessert sont inclus. Profitez des vêtements traditionnels, de la musique authentique et d'un vrai échange culturel. Merci de nous prévenir à l'avance de toute allergie ou régime alimentaire, nous ferons de notre mieux pour vous accueillir.",
    ar: "أكثر من مجرد وجبة، إنها تجربة عائلية مغربية. ادخل إلى بيت عائلة حقيقي وشارك المطبخ المغربي الأصيل والضيافة الدافئة والحكايات المحلية. تختار طبقين رئيسيين، والمقبلات والمشروبات والحلوى مشمولة مع كل وجبة. استمتع باللباس التقليدي والموسيقى الأصيلة وتبادل ثقافي حقيقي. يرجى إخبارنا مسبقاً بأي حساسية أو نظام غذائي، وسنبذل قصارى جهدنا لتلبية احتياجاتكم.",
  },
  pullQuote: {
    en: "More than a meal, it's a Moroccan family experience.",
    fr: "Plus qu'un repas, une expérience en famille marocaine.",
    ar: "أكثر من مجرد وجبة، إنها تجربة عائلية مغربية.",
  },
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

type ConceptFact = { num: string; label: { en: string; fr: string; ar: string } };

export function ConceptSection({
  secondPhotoUrl,
  conceptFacts,
}: {
  secondPhotoUrl?: string | null;
  conceptFacts?: ConceptFact[];
}) {
  const { lang } = useI18n();

  const dishesLabel = {
    en: "main dishes",
    fr: "plats au choix",
    ar: "أطباق رئيسية",
  };
  const guestsLabel = {
    en: "guests max",
    fr: "personnes max",
    ar: "ضيوف كحد أقصى",
  };
  const allergiesLabel = {
    en: "Allergies and diets welcome",
    fr: "Allergies et régimes bienvenus",
    ar: "نراعي جميع الحساسيات الغذائية",
  };

  const introRest = CONCEPT_TEXT.intro[lang]
    .replace(CONCEPT_TEXT.pullQuote[lang], "")
    .replace(/^\s*[.—-]?\s*/, "")
    .trim();

  return (
    <section
      id="concept"
      className="scroll-mt-20 bg-offwhite relative z-0"
      style={{ paddingBlock: "var(--section-pad-v-mobile)" }}
    >
      <div className="ms-container" style={{ paddingBottom: "var(--section-pad-v)" }}>
        {/* Big two-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-start">
          {/* Left Column: H2 + large serif lead paragraph in burgundy + normal body text */}
          <div
            className="lg:col-span-6 xl:col-span-6 flex flex-col items-start"
            dir={lang === "ar" ? "rtl" : "ltr"}
          >
            <h2 className="text-primary font-display font-semibold mb-6">
              {CONCEPT_TEXT.title[lang]}
            </h2>
            <OrnamentDivider className="mb-8" />
            <p className="font-display text-2xl sm:text-3xl text-primary font-semibold leading-snug mb-6">
              {CONCEPT_TEXT.pullQuote[lang]}
            </p>
            <div className="text-foreground/80 space-y-4 text-base sm:text-lg leading-relaxed">
              <p>{introRest || CONCEPT_TEXT.intro[lang]}</p>
            </div>
          </div>

          {/* Right Column: 2x2 Bento grid with rounded 24px corners */}
          <div className="lg:col-span-6 xl:col-span-6 w-full">
            <div className="grid grid-cols-2 gap-4 sm:gap-5">
              {/* Tile 1: White tile with big numeral 2 */}
              <div className="rounded-[24px] bg-white p-6 sm:p-8 shadow-card flex flex-col items-center justify-center text-center">
                <span className="font-display text-4xl sm:text-5xl font-bold text-primary block leading-none mb-2">
                  2
                </span>
                <span className="text-sm sm:text-base font-semibold text-foreground/80 leading-snug">
                  {dishesLabel[lang]}
                </span>
              </div>

              {/* Tile 2: White tile with big numeral 8 */}
              <div className="rounded-[24px] bg-white p-6 sm:p-8 shadow-card flex flex-col items-center justify-center text-center">
                <span className="font-display text-4xl sm:text-5xl font-bold text-primary block leading-none mb-2">
                  8
                </span>
                <span className="text-sm sm:text-base font-semibold text-foreground/80 leading-snug">
                  {guestsLabel[lang]}
                </span>
              </div>

              {/* Tile 3: Burgundy tile with short quote from the text in white serif */}
              <div
                className="rounded-[24px] bg-primary text-white p-6 sm:p-8 shadow-card flex flex-col items-center justify-center text-center"
                dir={lang === "ar" ? "rtl" : "ltr"}
              >
                <blockquote className="font-display text-base sm:text-lg font-medium leading-relaxed italic text-white/95">
                  &ldquo;{CONCEPT_TEXT.pullQuote[lang]}&rdquo;
                </blockquote>
              </div>

              {/* Tile 4: Off-white tile with small green icon and 'Allergies and diets welcome' */}
              <div
                className="rounded-[24px] bg-offwhite/90 border border-border/80 p-6 sm:p-8 shadow-xs flex flex-col items-center justify-center text-center"
                dir={lang === "ar" ? "rtl" : "ltr"}
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-accent/15 mb-3">
                  <AlertCircle className="h-6 w-6 text-accent" aria-hidden="true" />
                </div>
                <span className="text-xs sm:text-sm font-semibold text-foreground/85 leading-snug">
                  {allergiesLabel[lang]}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function SmallMenuCard({
  icon: Icon,
  title,
  children,
}: {
  icon: typeof Soup;
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col items-start text-start rounded-[24px] bg-white text-foreground p-7 shadow-card">
      <div className="flex items-center gap-3 mb-3">
        <Icon className="h-6 w-6 text-accent shrink-0" aria-hidden="true" />
        <h4 className="font-display text-xl font-bold text-foreground">{title}</h4>
      </div>
      <div className="text-base leading-relaxed text-foreground/80">{children}</div>
    </div>
  );
}

export function MenuSection() {
  const { lang } = useI18n();

  return (
    <>
      {/* Main menu section: deep red #5E1010 with very subtle zellige */}
      <section
        id="menu"
        className="scroll-mt-20 text-white relative overflow-hidden"
        style={{
          backgroundColor: "#5E1010",
          paddingBlock: "var(--section-pad-v)",
        }}
      >
        {/* Subtle zellige pattern overlay */}
        <div
          aria-hidden="true"
          className="zellige-burgundy absolute inset-0 pointer-events-none"
          style={{ opacity: 0.08 }}
        />

        <div className="ms-container relative z-10">
          {/* Section title */}
          <h2 className="text-center text-white font-display">{MENU_TEXT.sectionTitle[lang]}</h2>
          <OrnamentDivider center light className="mt-5 mb-14" />

          <div className="grid gap-8 lg:grid-cols-12 items-start">
            {/* Left: ONE large white card for main dishes (numbered 01 to 07 in serif, dotted leaders) */}
            <div className="lg:col-span-7 rounded-[24px] bg-white text-foreground p-8 sm:p-10 shadow-card">
              <div className="flex items-center gap-3 pb-6 mb-6 border-b border-border/70">
                <Utensils className="h-6 w-6 text-primary shrink-0" aria-hidden="true" />
                <h3 className="font-display text-2xl font-bold text-primary">
                  {MENU_TEXT.mainCoursesTitle[lang]}
                </h3>
              </div>

              {/* Numbered 01 to 07 with dotted leaders */}
              <ul className="space-y-4" dir={lang === "ar" ? "rtl" : "ltr"}>
                {MAIN_DISHES.map((dish, idx) => (
                  <li
                    key={dish.id}
                    className="flex items-baseline gap-3 py-2 text-base text-foreground/90"
                  >
                    <span className="font-display text-primary text-xl font-bold shrink-0 w-8">
                      {String(idx + 1).padStart(2, "0")}
                    </span>
                    <span className="font-semibold text-foreground text-base sm:text-lg shrink-0">
                      {dish.label[lang]}
                    </span>
                    <span
                      className="flex-1 border-b border-dotted border-stone-300 min-w-[20px] mb-1"
                      aria-hidden="true"
                    />
                  </li>
                ))}
              </ul>
            </div>

            {/* Right: Three compact white cards for starters, drinks and dessert */}
            <div className="lg:col-span-5 grid content-start gap-6">
              <SmallMenuCard icon={Soup} title={MENU_TEXT.starters.title[lang]}>
                <p>{MENU_TEXT.starters.desc[lang]}</p>
              </SmallMenuCard>

              <SmallMenuCard icon={Coffee} title={MENU_TEXT.drinks.title[lang]}>
                <p>{MENU_TEXT.drinks.desc[lang]}</p>
              </SmallMenuCard>

              <SmallMenuCard icon={CakeSlice} title={MENU_TEXT.dessert.title[lang]}>
                <p>{MENU_TEXT.dessert.desc[lang]}</p>
              </SmallMenuCard>
            </div>
          </div>
        </div>
      </section>

      {/* Highlights: separate white strip below as 5 items in a row with green line icons, NO circles or boxes */}
      <section
        className="bg-white border-b border-border/40 py-14 sm:py-16"
        aria-label={MENU_TEXT.highlightsTitle[lang]}
      >
        <div className="ms-container">
          <ul className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:grid-cols-5 text-center">
            {MENU_TEXT.highlights.map((item, idx) => {
              const Icon = item.icon;
              return (
                <li
                  key={idx}
                  className="flex flex-col items-center text-center p-2 cursor-default group"
                >
                  <Icon
                    className="h-8 w-8 text-accent stroke-[1.75] mb-3 transition-transform duration-300 group-hover:scale-110"
                    aria-hidden="true"
                  />
                  <span className="text-sm sm:text-base font-semibold text-foreground/85 leading-snug max-w-[16ch]">
                    {item.label[lang]}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      </section>
    </>
  );
}
