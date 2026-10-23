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
  Home,
  ChefHat,
  ChevronDown,
  Clock,
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

type ConceptFact = { num: string; label: { en: string; fr: string; ar: string } };

export function ConceptSection() {
  const { lang } = useI18n();

  return (
    <section
      id="concept"
      className="scroll-mt-20 bg-offwhite relative z-0"
      style={{ paddingBlock: "var(--section-pad-v)" }}
    >
      <div className="ms-container">
        {/* --- Top: H2, Lead in large serif burgundy, Body paragraph --- */}
        <div className="max-w-3xl" dir={lang === "ar" ? "rtl" : "ltr"}>
          <h2 className="text-primary font-display font-semibold mb-5">
            {WHAT_IS_IT_TEXT.title[lang]}
          </h2>
          <OrnamentDivider className="mb-6" />
          <p className="font-display text-2xl sm:text-3xl text-primary font-semibold leading-snug mb-5">
            {WHAT_IS_IT_TEXT.lead[lang]}
          </p>
          <p className="text-foreground/80 text-base sm:text-[1.125rem] leading-[1.7]">
            {WHAT_IS_IT_TEXT.body[lang]}
          </p>
        </div>

        {/* --- Four pillars as 2x2 grid of white cards (one column on phones) --- */}
        <div
          className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-12 sm:mt-16"
          dir={lang === "ar" ? "rtl" : "ltr"}
        >
          {WHAT_IS_IT_TEXT.pillars.map((pillar) => {
            const Icon = pillar.icon;
            return (
              <div
                key={pillar.id}
                className="rounded-[24px] bg-white p-7 sm:p-8 shadow-card flex flex-col items-start border border-stone-200/50 hover:shadow-lg transition-shadow duration-300"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent/10 mb-5">
                  <Icon className="h-6 w-6 text-accent stroke-[1.75]" aria-hidden="true" />
                </div>
                <h3 className="font-display text-xl sm:text-2xl font-bold text-foreground mb-2.5">
                  {pillar.title[lang]}
                </h3>
                <p className="text-foreground/75 text-sm sm:text-base leading-relaxed">
                  {pillar.desc[lang]}
                </p>
              </div>
            );
          })}
        </div>

        {/* --- An evening at a glance: horizontal timeline (vertical on phones) --- */}
        <div className="mt-16 sm:mt-24 pt-12 sm:pt-16 border-t border-stone-200/70">
          <div
            className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-12"
            dir={lang === "ar" ? "rtl" : "ltr"}
          >
            <div>
              <h3 className="font-display text-2xl sm:text-3xl font-bold text-primary mb-2">
                {WHAT_IS_IT_TEXT.eveningGlance.title[lang]}
              </h3>
              <OrnamentDivider />
            </div>
            <div className="inline-flex items-center gap-2 self-start sm:self-auto rounded-full bg-primary/10 border border-primary/20 px-4 py-1.5 text-xs font-bold text-primary">
              <Clock className="h-3.5 w-3.5" aria-hidden="true" />
              <span>{WHAT_IS_IT_TEXT.eveningGlance.duration[lang]}</span>
            </div>
          </div>

          {/* Desktop timeline (horizontal) */}
          <div className="hidden lg:block relative pt-6 pb-2" dir={lang === "ar" ? "rtl" : "ltr"}>
            {/* Thin gold line */}
            <div
              className="absolute top-9 start-[12.5%] end-[12.5%] h-[1.5px] bg-[#C9A24B]/50 z-0"
              aria-hidden="true"
            />
            <div className="grid grid-cols-4 gap-6 relative z-10 text-center">
              {WHAT_IS_IT_TEXT.eveningGlance.stops.map((stop, idx) => (
                <div key={idx} className="flex flex-col items-center px-2">
                  <div
                    className="h-4 w-4 rounded-full bg-primary ring-4 ring-white shadow-xs mb-4"
                    aria-hidden="true"
                  />
                  <span className="font-display font-bold text-lg text-foreground leading-snug">
                    {stop.label[lang]}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Mobile timeline (vertical) */}
          <div
            className="lg:hidden relative border-s border-[#C9A24B]/50 ms-4 ps-7 space-y-7"
            dir={lang === "ar" ? "rtl" : "ltr"}
          >
            {WHAT_IS_IT_TEXT.eveningGlance.stops.map((stop, idx) => (
              <div key={idx} className="relative">
                {/* Small red dot on timeline */}
                <div
                  className="absolute -start-[35px] top-1.5 h-3.5 w-3.5 rounded-full bg-primary ring-4 ring-white shadow-xs"
                  aria-hidden="true"
                />
                <span className="font-display font-bold text-base sm:text-lg text-foreground block leading-snug">
                  {stop.label[lang]}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* --- Good to know block: 4 short Q&A items (open grid desktop, accordion phones) --- */}
        <div className="mt-16 sm:mt-24 pt-12 sm:pt-16 border-t border-stone-200/70">
          <div className="text-center mb-10">
            <h3 className="font-display text-2xl sm:text-3xl font-bold text-primary mb-3">
              {WHAT_IS_IT_TEXT.goodToKnow.title[lang]}
            </h3>
            <OrnamentDivider center />
          </div>

          {/* Desktop (open 2x2 grid) */}
          <div className="hidden md:grid md:grid-cols-2 gap-6" dir={lang === "ar" ? "rtl" : "ltr"}>
            {WHAT_IS_IT_TEXT.goodToKnow.items.map((item, idx) => (
              <div
                key={idx}
                className="rounded-[20px] bg-white p-7 shadow-xs border border-stone-200/70 flex flex-col items-start"
              >
                <h4 className="font-display text-lg font-bold text-foreground mb-2.5 flex items-center gap-2.5">
                  <span className="h-2 w-2 rounded-full bg-accent shrink-0" aria-hidden="true" />
                  <span>{item.q[lang]}</span>
                </h4>
                <p className="text-foreground/75 text-sm sm:text-base leading-relaxed">
                  {item.a[lang]}
                </p>
              </div>
            ))}
          </div>

          {/* Phones (accordion) */}
          <div className="md:hidden space-y-3" dir={lang === "ar" ? "rtl" : "ltr"}>
            {WHAT_IS_IT_TEXT.goodToKnow.items.map((item, idx) => (
              <details
                key={idx}
                className="group rounded-[18px] bg-white p-4 sm:p-5 border border-stone-200/70 shadow-xs transition-colors"
              >
                <summary className="flex items-center justify-between font-display font-semibold text-foreground text-base cursor-pointer list-none select-none">
                  <span className="flex items-center gap-2.5 pe-3">
                    <span className="h-2 w-2 rounded-full bg-accent shrink-0" aria-hidden="true" />
                    <span>{item.q[lang]}</span>
                  </span>
                  <ChevronDown className="h-4 w-4 text-primary transition-transform duration-200 group-open:rotate-180 shrink-0" />
                </summary>
                <p className="mt-3 text-sm text-foreground/75 leading-relaxed ps-4 border-s border-primary/20">
                  {item.a[lang]}
                </p>
              </details>
            ))}
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
