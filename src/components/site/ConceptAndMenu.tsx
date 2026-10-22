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
        {/* Main two-column layout */}
        <div
          className={`grid items-start gap-12 ${secondPhotoUrl ? "lg:grid-cols-12 lg:gap-16" : "lg:grid-cols-12 lg:gap-16"}`}
        >
          {/* Left: title + ornament + intro */}
          <div className={secondPhotoUrl ? "lg:col-span-7" : "lg:col-span-7"}>
            <h2 className="text-primary">{CONCEPT_TEXT.title[lang]}</h2>
            <OrnamentDivider className="mt-5 mb-8" />
            <p style={{ fontSize: "1.2rem", lineHeight: "1.7", maxWidth: "60ch" }}>
              {/* First sentence emphasized */}
              <strong
                style={{
                  display: "block",
                  fontSize: "1.35rem",
                  color: "var(--primary)",
                  fontWeight: 600,
                  marginBottom: "0.75rem",
                  lineHeight: "1.4",
                }}
              >
                {CONCEPT_TEXT.pullQuote[lang]}
              </strong>
              {/* Rest of paragraph (skip first sentence) */}
              {CONCEPT_TEXT.intro[lang]
                .replace(CONCEPT_TEXT.pullQuote[lang], "")
                .replace(/^\s*/, "")}
            </p>
          </div>

          {/* Right: photo OR pull-quote burgundy panel */}
          <div className="lg:col-span-5">
            {secondPhotoUrl ? (
              <div
                style={{
                  borderRadius: "9999px 9999px 24px 24px",
                  overflow: "hidden",
                  border: "2px solid rgba(201,162,75,0.4)",
                  boxShadow: "var(--shadow-photo)",
                  aspectRatio: "4/5",
                }}
              >
                <img
                  src={secondPhotoUrl}
                  alt={CONCEPT_TEXT.title[lang]}
                  loading="lazy"
                  className="h-full w-full object-cover"
                />
              </div>
            ) : (
              /* Pull-quote burgundy panel with zellige */
              <div
                className="zellige-burgundy"
                style={{
                  background: "var(--primary)",
                  borderRadius: "24px",
                  padding: "clamp(32px, 5vw, 52px)",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  minHeight: "340px",
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                {/* Gold ornament top */}
                <OrnamentDivider center light className="mb-8" />
                {/* Pull quote */}
                <blockquote
                  className="font-display text-white text-center"
                  style={{
                    fontSize: "clamp(1.4rem, 3vw, 1.8rem)",
                    fontWeight: 600,
                    lineHeight: lang === "ar" ? "1.9" : "1.4",
                    maxWidth: "28ch",
                  }}
                >
                  &ldquo;{CONCEPT_TEXT.pullQuote[lang]}&rdquo;
                </blockquote>
                {/* Gold ornament bottom */}
                <OrnamentDivider center light className="mt-8" />
              </div>
            )}
          </div>
        </div>

        {/* Facts row — 4 large figures */}
        {conceptFacts && conceptFacts.length > 0 && (
          <div
            className="mt-16 grid grid-cols-2 gap-6 sm:grid-cols-4"
            role="list"
            aria-label={
              lang === "ar" ? "أرقام التجربة" : lang === "fr" ? "Chiffres clés" : "Experience facts"
            }
          >
            {conceptFacts.map((fact) => (
              <div
                key={fact.num}
                role="listitem"
                className="text-center"
                style={{
                  padding: "24px 12px",
                  background: "#fff",
                  borderRadius: "16px",
                  border: "1px solid rgba(232,222,212,0.6)",
                  boxShadow: "var(--shadow-card)",
                }}
              >
                <p
                  className="font-display text-primary"
                  style={{
                    fontSize: "clamp(2.8rem, 6vw, 4rem)",
                    lineHeight: 1,
                    fontWeight: 700,
                    marginBottom: "8px",
                  }}
                >
                  {fact.num}
                </p>
                <p
                  className="text-foreground/70 text-sm font-medium"
                  style={{ maxWidth: "16ch", margin: "0 auto" }}
                >
                  {fact.label[lang]}
                </p>
              </div>
            ))}
          </div>
        )}
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

      {/* Experience highlights — clean white strip right after the red section */}
      <section
        className="bg-white border-b border-border/40"
        style={{ paddingBlock: "clamp(40px, 5vw, 64px)" }}
        aria-label={MENU_TEXT.highlightsTitle[lang]}
      >
        <div className="ms-container">
          <h3 className="text-center text-foreground mb-8 text-2xl sm:text-3xl">
            {MENU_TEXT.highlightsTitle[lang]}
          </h3>
          <ul className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-5 text-center">
            {MENU_TEXT.highlights.map((item, idx) => {
              const Icon = item.icon;
              return (
                <li key={idx} className="flex flex-col items-center gap-3">
                  <span
                    className="flex h-14 w-14 items-center justify-center rounded-full transition-transform hover:scale-105"
                    style={{
                      border: "1.5px solid rgba(47,93,52,0.35)",
                      background: "rgba(47,93,52,0.05)",
                    }}
                  >
                    <Icon className="h-6 w-6 text-accent stroke-[2]" aria-hidden />
                  </span>
                  <span
                    className="text-sm font-semibold text-foreground/85"
                    style={{ maxWidth: "16ch" }}
                  >
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
