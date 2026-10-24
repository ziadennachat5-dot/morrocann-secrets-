export interface LocalizedText {
  en: string;
  fr: string;
  ar: string;
}

export interface ExperienceRecord {
  id: string;
  title: LocalizedText;
  blurb: LocalizedText;
  duration: LocalizedText;
  price: number;
  child_price: number | null;
  child_age_min?: number | null;
  child_age_max?: number | null;
  min_guests: number | null;
  deposit_amount?: number;
  max_guests: number;
  start_time: string | null;
  meal_options: unknown[];
  why_love: LocalizedText[];
  what_to_expect: LocalizedText | null;
  what_to_remember: LocalizedText | null;
  host_languages: LocalizedText | null;
  image_url: string;
  image_alt: LocalizedText | null;
  included: LocalizedText[];
  is_published: boolean;
  created_at?: string;
  updated_at?: string;
}

export const DINNER_EXPERIENCE_ID = "family-dinner-marrakech";
export const LUNCH_EXPERIENCE_ID = "family-lunch-marrakech";
export const IFTAR_EXPERIENCE_ID = "family-iftar-marrakech";

export const UPDATED_DINNER_CONTENT = {
  title: {
    en: "Dinner with a Moroccan Family",
    fr: "Dîner chez une famille marocaine",
    ar: "عشاء مع عائلة مغربية",
  },
  blurb: {
    en: "You are welcomed into a local family's home in Marrakech and share a traditional home-cooked meal at their table. You taste local dishes made with fresh local ingredients, and the family shares stories about daily life and Moroccan traditions.",
    fr: "Vous êtes accueilli dans la maison d'une famille locale à Marrakech et partagez un repas traditionnel fait maison à sa table. Vous goûtez des plats locaux préparés avec des ingrédients frais, et la famille vous raconte son quotidien et les traditions marocaines.",
    ar: "يُستقبَل بكم في بيت عائلة مغربية في مراكش وتتقاسمون وجبة تقليدية منزلية على مائدتها. تتذوقون أطباقًا محلية معدّة بمكوّنات طازجة، وتحكي لكم العائلة عن حياتها اليومية وعن التقاليد المغربية.",
  },
  duration: {
    en: "About 2 hours",
    fr: "Environ 2 heures",
    ar: "حوالي ساعتين",
  },
  start_time: "19:30:00",
  included: [
    {
      en: "Home-cooked traditional dinner",
      fr: "Dîner traditionnel fait maison",
      ar: "عشاء تقليدي منزلي",
    },
    {
      en: "Local dishes made with fresh ingredients",
      fr: "Plats locaux préparés avec des ingrédients frais",
      ar: "أطباق محلية بمكوّنات طازجة",
    },
    {
      en: "Time with the host family",
      fr: "Moment partagé avec la famille d'accueil",
      ar: "وقت مع العائلة المضيفة",
    },
  ],
  why_love: [
    {
      en: "Taste traditional home-cooked dishes",
      fr: "Goûtez des plats traditionnels faits maison",
      ar: "تذوقوا أطباقًا تقليدية منزلية",
    },
    {
      en: "Discover Moroccan culture and daily life",
      fr: "Découvrez la culture et le quotidien marocains",
      ar: "اكتشفوا الثقافة المغربية والحياة اليومية",
    },
    {
      en: "Enjoy dinner with a local family",
      fr: "Profitez d'un dîner avec une famille locale",
      ar: "استمتعوا بعشاء مع عائلة محلية",
    },
  ],
  what_to_expect: {
    en: "You are welcomed into a local family's home in Marrakech and share a traditional home-cooked meal at their table. You taste local dishes made with fresh local ingredients, and the family shares stories about daily life and Moroccan traditions.",
    fr: "Vous êtes accueilli dans la maison d'une famille locale à Marrakech et partagez un repas traditionnel fait maison à sa table. Vous goûtez des plats locaux préparés avec des ingrédients frais, et la famille vous raconte son quotidien et les traditions marocaines.",
    ar: "يُستقبَل بكم في بيت عائلة مغربية في مراكش وتتقاسمون وجبة تقليدية منزلية على مائدتها. تتذوقون أطباقًا محلية معدّة بمكوّنات طازجة، وتحكي لكم العائلة عن حياتها اليومية وعن التقاليد المغربية.",
  },
  what_to_remember: {
    en: "Come hungry! Guests aged 2 and over are welcome. The experience is relaxed and needs no physical effort. Please tell us about any allergies when you book.",
    fr: "Venez avec un bon appétit ! Les voyageurs à partir de 2 ans sont les bienvenus. L'expérience est tranquille et ne demande aucun effort physique. Merci de nous signaler toute allergie lors de la réservation.",
    ar: "تعالوا بشهية مفتوحة! يرحَّب بالضيوف من عمر سنتين فما فوق. التجربة هادئة ولا تتطلب أي مجهود بدني. يرجى إبلاغنا بأي حساسية عند الحجز.",
  },
  host_languages: {
    en: "English, French, Arabic",
    fr: "Anglais, français, arabe",
    ar: "الإنجليزية والفرنسية والعربية",
  },
  meal_options: [] as unknown[],
  is_published: false,
};

export const CANCELLATION_TIERS_SETTING = [
  {
    hours_before: 24,
    refund_percent: 100,
  },
];

export const PUBLIC_MEETING_AREA_SETTING: LocalizedText = {
  en: "Bab Ghmat, Marrakech",
  fr: "Bab Ghmat, Marrakech",
  ar: "Bab Ghmat, Marrakech",
};

/**
 * Creates the update payload for the existing dinner experience.
 * Explicitly preserves image_url, image_alt, price, child_price, min_guests, max_guests.
 */
export function buildDinnerUpdate(existing: ExperienceRecord): Partial<ExperienceRecord> {
  return {
    title: UPDATED_DINNER_CONTENT.title,
    blurb: UPDATED_DINNER_CONTENT.blurb,
    duration: UPDATED_DINNER_CONTENT.duration,
    start_time: UPDATED_DINNER_CONTENT.start_time,
    included: UPDATED_DINNER_CONTENT.included,
    why_love: UPDATED_DINNER_CONTENT.why_love,
    what_to_expect: UPDATED_DINNER_CONTENT.what_to_expect,
    what_to_remember: UPDATED_DINNER_CONTENT.what_to_remember,
    host_languages: UPDATED_DINNER_CONTENT.host_languages,
    meal_options: UPDATED_DINNER_CONTENT.meal_options,
    is_published: false,
    // Explicitly preserve existing photo and image alt text
    image_url: existing.image_url,
    image_alt: existing.image_alt,
    // Explicitly preserve pricing and guest limits
    price: existing.price,
    child_price: existing.child_price,
    min_guests: existing.min_guests,
    max_guests: existing.max_guests,
  };
}

/**
 * Creates the duplicate lunch experience from the updated dinner experience.
 * Starts at 14:00, unpublished, without a photo.
 */
export function buildLunchDuplicate(dinner: ExperienceRecord): Omit<ExperienceRecord, "created_at" | "updated_at"> {
  return {
    id: LUNCH_EXPERIENCE_ID,
    title: {
      en: "Lunch with a Moroccan Family",
      fr: "Déjeuner chez une famille marocaine",
      ar: "غداء مع عائلة مغربية",
    },
    blurb: dinner.blurb,
    duration: dinner.duration,
    price: dinner.price,
    child_price: dinner.child_price,
    child_age_min: dinner.child_age_min ?? null,
    child_age_max: dinner.child_age_max ?? null,
    min_guests: dinner.min_guests,
    deposit_amount: dinner.deposit_amount ?? 0,
    max_guests: dinner.max_guests,
    start_time: "14:00:00",
    meal_options: [],
    why_love: dinner.why_love,
    what_to_expect: dinner.what_to_expect,
    what_to_remember: dinner.what_to_remember,
    host_languages: dinner.host_languages,
    image_url: "",
    image_alt: null,
    included: dinner.included,
    is_published: false,
  };
}

/**
 * Creates the duplicate Ramadan seasonal iftar experience from the updated dinner experience.
 * Description indicates Ramadan only, start time empty, unpublished, without photo.
 */
export function buildIftarDuplicate(dinner: ExperienceRecord): Omit<ExperienceRecord, "created_at" | "updated_at"> {
  const ramadanBlurb: LocalizedText = {
    en: "Share a traditional iftar meal with a local family during Ramadan.",
    fr: "Partagez un iftar traditionnel avec une famille locale pendant le Ramadan.",
    ar: "شاركوا عائلة محلية وجبة إفطار تقليدية خلال شهر رمضان.",
  };

  return {
    id: IFTAR_EXPERIENCE_ID,
    title: {
      en: "Iftar with a Moroccan Family",
      fr: "Iftar chez une famille marocaine",
      ar: "إفطار مع عائلة مغربية",
    },
    blurb: ramadanBlurb,
    duration: dinner.duration,
    price: dinner.price,
    child_price: dinner.child_price,
    child_age_min: dinner.child_age_min ?? null,
    child_age_max: dinner.child_age_max ?? null,
    min_guests: dinner.min_guests,
    deposit_amount: dinner.deposit_amount ?? 0,
    max_guests: dinner.max_guests,
    start_time: null,
    meal_options: [],
    why_love: dinner.why_love,
    what_to_expect: ramadanBlurb,
    what_to_remember: dinner.what_to_remember,
    host_languages: dinner.host_languages,
    image_url: "",
    image_alt: null,
    included: dinner.included,
    is_published: false,
  };
}
