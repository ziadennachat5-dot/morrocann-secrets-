import { useI18n } from "@/lib/i18n";
import {
  Utensils,
  Soup,
  Coffee,
  Sparkles,
  Heart,
  Music,
  Users,
  MessageCircleHeart,
  Shirt,
  AlertCircle,
  CakeSlice,
  Check,
} from "lucide-react";

export const MAIN_DISHES = [
  {
    id: "couscous-chicken",
    label: {
      en: "Couscous with chicken",
      fr: "Couscous au poulet",
      ar: "كسكس بالدجاج",
    },
  },
  {
    id: "couscous-beef",
    label: {
      en: "Couscous with beef",
      fr: "Couscous au bœuf",
      ar: "كسكس باللحم البقري",
    },
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
    label: {
      en: "Vegetarian tagine",
      fr: "Tajine végétarien",
      ar: "طاجين نباتي",
    },
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
} as const;

export const MENU_TEXT = {
  sectionTitle: {
    en: "The Menu",
    fr: "Le Menu",
    ar: "قائمة الطعام",
  },
  mainCoursesTitle: {
    en: "Main course (choose 2)",
    fr: "Plat principal (choisissez-en 2)",
    ar: "الطبق الرئيسي (اختر 2)",
  },
  includedTitle: {
    en: "Included with every meal",
    fr: "Inclus avec chaque repas",
    ar: "مشمول مع كل وجبة",
  },
  starters: {
    title: {
      en: "Starters",
      fr: "Entrées",
      ar: "المقبلات",
    },
    desc: {
      en: "Spiced vegetable soup, Moroccan salads such as zaalouk and tektouka",
      fr: "Soupe de légumes épicée, salades marocaines telles que zaalouk et taktuka",
      ar: "حساء خضار متبل، وسلطات مغربية مثل الزعلوك والتكتوكة",
    },
  },
  drinks: {
    title: {
      en: "Drinks",
      fr: "Boissons",
      ar: "المشروبات",
    },
    desc: {
      en: "Traditional Moroccan mint tea, mineral water",
      fr: "Thé à la menthe marocain traditionnel, eau minérale",
      ar: "شاي مغربي تقليدي بالنعناع، ومياه معدنية",
    },
  },
  dessert: {
    title: {
      en: "Dessert",
      fr: "Dessert",
      ar: "الحلوى",
    },
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
      label: {
        en: "Traditional clothing",
        fr: "Vêtements traditionnels",
        ar: "اللباس التقليدي",
      },
    },
    {
      icon: Music,
      label: {
        en: "Authentic music",
        fr: "Musique authentique",
        ar: "موسيقى أصيلة",
      },
    },
    {
      icon: Heart,
      label: {
        en: "Warm hospitality",
        fr: "Accueil chaleureux",
        ar: "ضيافة دافئة",
      },
    },
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

export function ConceptSection() {
  const { lang } = useI18n();

  return (
    <section id="concept" className="scroll-mt-20 mx-auto max-w-5xl px-5 py-16 sm:py-24">
      <span className="eyebrow text-accent block mb-3 font-semibold uppercase tracking-wider text-sm">
        {lang === "fr" ? "Notre Concept" : lang === "ar" ? "فكرة التجربة" : "Our Concept"}
      </span>
      <h2 className="font-display text-3xl sm:text-5xl text-primary leading-tight">
        {CONCEPT_TEXT.title[lang]}
      </h2>
      <p className="mt-6 max-w-3xl text-lg sm:text-xl leading-relaxed text-foreground/85">
        {CONCEPT_TEXT.intro[lang]}
      </p>
    </section>
  );
}

export function MenuSection() {
  const { lang } = useI18n();

  return (
    <section
      id="menu"
      className="scroll-mt-20 bg-secondary/15 px-5 py-16 sm:py-24 border-y border-border/60"
    >
      <div className="mx-auto max-w-7xl">
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
          <span className="eyebrow text-accent font-semibold uppercase tracking-wider text-sm block mb-2">
            Moroccan Secrets
          </span>
          <h2 className="font-display text-3xl sm:text-5xl text-primary">
            {MENU_TEXT.sectionTitle[lang]}
          </h2>
        </div>

        {/* 5 Highlights Row */}
        <div className="mb-14">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {MENU_TEXT.highlights.map((item, idx) => {
              const Icon = item.icon;
              return (
                <div
                  key={idx}
                  className="flex flex-col items-center justify-center text-center rounded-2xl border border-border/80 bg-background p-4 shadow-sm"
                >
                  <div className="h-10 w-10 rounded-full bg-accent/15 text-accent flex items-center justify-center mb-2.5">
                    <Icon className="h-5 w-5" aria-hidden />
                  </div>
                  <span className="text-xs sm:text-sm font-bold text-foreground">
                    {item.label[lang]}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-2 items-start">
          {/* Main Course: Choose 2 */}
          <div className="rounded-3xl border border-border bg-background p-6 sm:p-8 shadow-sm">
            <div className="flex items-center gap-3 border-b border-border/60 pb-4 mb-6">
              <div className="h-10 w-10 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                <Utensils className="h-5 w-5" aria-hidden />
              </div>
              <div>
                <h3 className="font-display text-2xl text-primary">
                  {MENU_TEXT.mainCoursesTitle[lang]}
                </h3>
                <span className="text-xs text-muted-foreground font-medium">
                  {lang === "fr"
                    ? "7 plats faits maison au choix"
                    : lang === "ar"
                      ? "7 أطباق منزلية شهية للاختيار"
                      : "7 homemade authentic dishes to choose from"}
                </span>
              </div>
            </div>

            <ul className="space-y-3">
              {MAIN_DISHES.map((dish, index) => (
                <li
                  key={dish.id}
                  className="flex items-start gap-3 rounded-xl border border-border/50 bg-muted/30 p-3.5 transition hover:bg-muted/50"
                >
                  <span className="h-6 w-6 rounded-full bg-primary/15 text-primary text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                    {index + 1}
                  </span>
                  <span className="font-medium text-foreground text-sm sm:text-base">
                    {dish.label[lang]}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Included with every meal */}
          <div className="space-y-6">
            <div className="rounded-3xl border border-border bg-background p-6 sm:p-8 shadow-sm">
              <div className="flex items-center gap-3 border-b border-border/60 pb-4 mb-6">
                <div className="h-10 w-10 rounded-full bg-accent/10 text-accent flex items-center justify-center">
                  <Sparkles className="h-5 w-5" aria-hidden />
                </div>
                <div>
                  <h3 className="font-display text-2xl text-primary">
                    {MENU_TEXT.includedTitle[lang]}
                  </h3>
                  <span className="text-xs text-muted-foreground font-medium">
                    {lang === "fr"
                      ? "Offert avec chaque expérience"
                      : lang === "ar"
                        ? "مشمول بالكامل مع كل تجربة"
                        : "Included with every dining experience"}
                  </span>
                </div>
              </div>

              <div className="space-y-4">
                {/* Starters */}
                <div className="rounded-2xl border border-border/60 bg-muted/20 p-4">
                  <div className="flex items-center gap-2 text-primary font-bold text-base mb-1">
                    <Soup className="h-4 w-4" aria-hidden />
                    <h4>{MENU_TEXT.starters.title[lang]}</h4>
                  </div>
                  <p className="text-sm text-foreground/80 leading-relaxed ps-6">
                    {MENU_TEXT.starters.desc[lang]}
                  </p>
                </div>

                {/* Drinks */}
                <div className="rounded-2xl border border-border/60 bg-muted/20 p-4">
                  <div className="flex items-center gap-2 text-primary font-bold text-base mb-1">
                    <Coffee className="h-4 w-4" aria-hidden />
                    <h4>{MENU_TEXT.drinks.title[lang]}</h4>
                  </div>
                  <p className="text-sm text-foreground/80 leading-relaxed ps-6">
                    {MENU_TEXT.drinks.desc[lang]}
                  </p>
                </div>

                {/* Dessert */}
                <div className="rounded-2xl border border-border/60 bg-muted/20 p-4">
                  <div className="flex items-center gap-2 text-primary font-bold text-base mb-1">
                    <CakeSlice className="h-4 w-4" aria-hidden />
                    <h4>{MENU_TEXT.dessert.title[lang]}</h4>
                  </div>
                  <p className="text-sm text-foreground/80 leading-relaxed ps-6">
                    {MENU_TEXT.dessert.desc[lang]}
                  </p>
                </div>
              </div>
            </div>

            {/* Note on allergies */}
            <div className="rounded-2xl border border-amber-300 bg-amber-50 p-4 flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-amber-700 shrink-0 mt-0.5" aria-hidden />
              <p className="text-sm text-amber-900 font-medium leading-relaxed">
                {MENU_TEXT.allergyNote[lang]}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
