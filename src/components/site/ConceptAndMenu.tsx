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

  return (
    <section
      id="concept"
      className="scroll-mt-20 bg-offwhite"
      style={{ paddingBlock: "var(--section-pad-v-mobile)" }}
    >
      <div className="ms-container" style={{ paddingBottom: "var(--section-pad-v)" }}>
        {/* Concept Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
          {/* Bento Item 1: Main Story Card */}
          <div className="md:col-span-7 lg:col-span-8 rounded-3xl bg-white/95 backdrop-blur-md border border-stone-200/80 p-8 sm:p-10 shadow-card hover:shadow-xl hover:border-gold/40 transition-all duration-300 flex flex-col justify-between group">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-accent/10 border border-accent/25 px-3.5 py-1 text-xs font-bold text-accent mb-4">
                <Heart className="h-3.5 w-3.5" />
                <span>
                  {lang === "fr"
                    ? "L'Esprit de la Maison"
                    : lang === "ar"
                      ? "جوهر التجربة"
                      : "The Experience"}
                </span>
              </div>
              <h2 className="text-primary">{CONCEPT_TEXT.title[lang]}</h2>
              <OrnamentDivider className="mt-4 mb-6" />
              <div className="text-foreground/85 leading-relaxed text-base sm:text-lg space-y-4">
                <p
                  className="font-display text-xl sm:text-2xl font-bold text-primary leading-snug"
                  dir={lang === "ar" ? "rtl" : "ltr"}
                >
                  {CONCEPT_TEXT.pullQuote[lang]}
                </p>
                <p dir={lang === "ar" ? "rtl" : "ltr"}>
                  {CONCEPT_TEXT.intro[lang]
                    .replace(CONCEPT_TEXT.pullQuote[lang], "")
                    .replace(/^\s*/, "")}
                </p>
              </div>
            </div>
            <div className="mt-8 pt-5 border-t border-border/60 flex flex-wrap items-center justify-between gap-3 text-xs font-semibold text-muted-foreground">
              <span className="flex items-center gap-1.5 text-accent font-bold">
                <Utensils className="h-4 w-4" />
                {lang === "fr"
                  ? "Cuisine familiale marocaine"
                  : lang === "ar"
                    ? "مطبخ عائلي مغربي أصيل"
                    : "Authentic family cooking"}
              </span>
              <span className="text-gold">&bull;</span>
              <span>Marrakech</span>
            </div>
          </div>

          {/* Bento Item 2: Pull Quote or Arch Photo */}
          <div className="md:col-span-5 lg:col-span-4 flex flex-col">
            {secondPhotoUrl ? (
              <div
                className="h-full rounded-3xl overflow-hidden border-2 border-gold/40 shadow-card hover:shadow-xl transition-all duration-300"
                style={{ aspectRatio: "4/5" }}
              >
                <img
                  src={secondPhotoUrl}
                  alt={CONCEPT_TEXT.title[lang]}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
                />
              </div>
            ) : (
              <div
                className="zellige-burgundy h-full min-h-[340px] rounded-3xl p-8 sm:p-10 flex flex-col justify-between items-center text-center relative overflow-hidden shadow-card hover:shadow-xl transition-all duration-300 group"
                style={{ background: "var(--primary)" }}
              >
                <OrnamentDivider center light className="mb-4" />
                <blockquote
                  className="font-display text-white text-center my-auto px-2 group-hover:scale-102 transition-transform duration-300"
                  style={{
                    fontSize: "clamp(1.35rem, 2.5vw, 1.75rem)",
                    fontWeight: 600,
                    lineHeight: lang === "ar" ? "1.9" : "1.45",
                    maxWidth: "28ch",
                  }}
                >
                  &ldquo;{CONCEPT_TEXT.pullQuote[lang]}&rdquo;
                </blockquote>
                <OrnamentDivider center light className="mt-4" />
              </div>
            )}
          </div>

          {/* Bento Facts Row (4 cards spanning 3 cols on md/lg) */}
          {conceptFacts?.map((fact) => (
            <div
              key={fact.num}
              role="listitem"
              className="col-span-6 md:col-span-3 rounded-2xl bg-white/90 backdrop-blur-md border border-stone-200/80 p-6 text-center shadow-xs hover:shadow-card hover:-translate-y-1 hover:border-gold/50 transition-all duration-300 group cursor-default"
            >
              <p
                className="font-display text-primary group-hover:scale-110 transition-transform duration-300"
                style={{
                  fontSize: "clamp(2.5rem, 5vw, 3.6rem)",
                  lineHeight: 1,
                  fontWeight: 700,
                  marginBottom: "8px",
                }}
              >
                {fact.num}
              </p>
              <p className="text-foreground/75 text-sm font-semibold max-w-[16ch] mx-auto leading-snug">
                {fact.label[lang]}
              </p>
            </div>
          ))}
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
    <div
      className="flex flex-col items-center text-center rounded-[20px] bg-white text-foreground p-6"
      style={{
        boxShadow: "var(--shadow-card)",
        border: "1px solid rgba(232,222,212,0.6)",
      }}
    >
      {/* Icon in green circle */}
      <span
        className="flex h-12 w-12 items-center justify-center rounded-full mb-3 shadow-2xs"
        style={{
          background: "rgba(47,93,52,0.1)",
          border: "1.5px solid rgba(47,93,52,0.3)",
        }}
      >
        <Icon className="h-6 w-6 text-accent" aria-hidden />
      </span>
      <h4 className="font-display text-xl font-bold text-foreground mb-1.5">{title}</h4>
      <div className="text-sm leading-relaxed text-foreground/80">{children}</div>
    </div>
  );
}

export function MenuSection() {
  const { lang } = useI18n();

  return (
    <>
      {/* Main burgundy section */}
      <section
        id="menu"
        className="zellige-burgundy scroll-mt-20 bg-primary text-white"
        style={{
          paddingBlock: "var(--section-pad-v-mobile)",
          paddingBottom: "calc(var(--section-pad-v-mobile) + 40px)",
          position: "relative",
        }}
      >
        {/* Scalloped SVG bottom edge */}
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            bottom: -1,
            left: 0,
            right: 0,
            height: "40px",
            overflow: "hidden",
            lineHeight: 0,
          }}
        >
          <svg
            viewBox="0 0 1200 40"
            preserveAspectRatio="none"
            xmlns="http://www.w3.org/2000/svg"
            style={{ display: "block", width: "100%", height: "100%" }}
          >
            <path
              d="M0 0 Q60 40 120 0 Q180 40 240 0 Q300 40 360 0 Q420 40 480 0 Q540 40 600 0 Q660 40 720 0 Q780 40 840 0 Q900 40 960 0 Q1020 40 1080 0 Q1140 40 1200 0 L1200 40 L0 40 Z"
              fill="white"
            />
          </svg>
        </div>

        <div className="ms-container">
          {/* Section title */}
          <h2 className="text-center text-white">{MENU_TEXT.sectionTitle[lang]}</h2>
          <OrnamentDivider center light className="mt-5 mb-14" />

          <div className="grid gap-8 lg:grid-cols-5">
            {/* Large white main course card */}
            <div
              className="rounded-[24px] bg-white text-foreground lg:col-span-3"
              style={{
                boxShadow: "0 16px 64px -16px rgba(0,0,0,0.2)",
                overflow: "hidden",
              }}
            >
              {/* Ribbon title */}
              <div className="ribbon-red flex items-center gap-3 px-8 py-4">
                <Utensils className="h-5 w-5 text-white flex-shrink-0" aria-hidden />
                <h3
                  className="font-display font-bold text-white"
                  style={{ fontSize: "clamp(1.3rem, 2.5vw, 1.6rem)" }}
                >
                  {MENU_TEXT.mainCoursesTitle[lang]}
                </h3>
              </div>
              {/* Dish list */}
              <ul className="px-8 py-6 space-y-0">
                {MAIN_DISHES.map((dish) => (
                  <li
                    key={dish.id}
                    className="flex items-center gap-4 py-3 text-base text-foreground/90"
                    style={{ borderBottom: "1px dotted rgba(42,32,32,0.12)" }}
                  >
                    <span
                      style={{
                        width: "8px",
                        height: "8px",
                        background: "var(--primary)",
                        borderRadius: "1px",
                        transform: "rotate(45deg)",
                        flexShrink: 0,
                      }}
                      aria-hidden="true"
                    />
                    <span className="font-medium" style={{ fontSize: "1rem" }}>
                      {dish.label[lang]}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Right column: 3 smaller cards */}
            <div className="grid content-start gap-5 lg:col-span-2">
              <p
                className="text-center font-display text-gold font-bold"
                style={{ fontSize: "clamp(1.2rem, 2vw, 1.4rem)" }}
              >
                {MENU_TEXT.includedTitle[lang]}
              </p>

              <SmallMenuCard icon={Soup} title={MENU_TEXT.starters.title[lang]}>
                <p className="text-sm leading-relaxed text-foreground/80">
                  {MENU_TEXT.starters.desc[lang]}
                </p>
              </SmallMenuCard>

              <SmallMenuCard icon={Coffee} title={MENU_TEXT.drinks.title[lang]}>
                <p className="text-sm leading-relaxed text-foreground/80">
                  {MENU_TEXT.drinks.desc[lang]}
                </p>
              </SmallMenuCard>

              <SmallMenuCard icon={CakeSlice} title={MENU_TEXT.dessert.title[lang]}>
                <p className="text-sm leading-relaxed text-foreground/80">
                  {MENU_TEXT.dessert.desc[lang]}
                </p>
              </SmallMenuCard>
            </div>
          </div>

          {/* Allergy note — white rounded pill */}
          <div
            className="mx-auto mt-12 flex max-w-2xl items-center justify-center gap-3 rounded-full bg-white px-7 py-3.5 text-sm font-semibold text-foreground shadow-md border border-border/80"
            style={{ width: "fit-content" }}
          >
            <AlertCircle className="h-5 w-5 shrink-0 text-accent" aria-hidden />
            <span>{MENU_TEXT.allergyNote[lang]}</span>
          </div>
        </div>
      </section>

      {/* Experience highlights — Bento Feature Cards */}
      <section
        className="bg-offwhite/50 border-b border-border/40"
        style={{ paddingBlock: "clamp(48px, 6vw, 72px)" }}
        aria-label={MENU_TEXT.highlightsTitle[lang]}
      >
        <div className="ms-container">
          <div className="text-center mb-10">
            <h3 className="font-display text-primary text-2xl sm:text-3xl font-bold mb-3">
              {MENU_TEXT.highlightsTitle[lang]}
            </h3>
            <OrnamentDivider center />
          </div>
          <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5 text-center">
            {MENU_TEXT.highlights.map((item, idx) => {
              const Icon = item.icon;
              return (
                <li
                  key={idx}
                  className="group flex flex-col items-center text-center rounded-2xl bg-white/90 backdrop-blur-sm border border-stone-200/80 p-5 sm:p-6 shadow-xs hover:shadow-card hover:-translate-y-1.5 hover:border-accent/40 transition-all duration-300 cursor-default"
                >
                  <span
                    className="flex h-14 w-14 items-center justify-center rounded-full mb-3.5 transition-all duration-300 group-hover:scale-110 group-hover:bg-accent/15 group-hover:border-accent shadow-2xs"
                    style={{
                      border: "1.5px solid rgba(47,93,52,0.3)",
                      background: "rgba(47,93,52,0.06)",
                    }}
                  >
                    <Icon className="h-6 w-6 text-accent stroke-[2]" aria-hidden />
                  </span>
                  <span className="text-sm font-bold text-foreground/85 leading-snug max-w-[15ch]">
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
