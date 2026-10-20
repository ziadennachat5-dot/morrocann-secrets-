export type LocalizedFields = { en: string; fr: string; ar: string };

export type ExperienceDraft = {
  id: string;
  title: LocalizedFields;
  description: LocalizedFields;
  duration: LocalizedFields;
  imageAlt: LocalizedFields;
  price: string;
  childPrice: string;
  childAgeMin: string;
  childAgeMax: string;
  minGuests: string;
  maxGuests: string;
  startTime: string;
  mealOptions: LocalizedFields;
  included: LocalizedFields;
  whyLove: [LocalizedFields, LocalizedFields, LocalizedFields];
  whatToExpect: LocalizedFields;
  whatToRemember: LocalizedFields;
  hostLanguages: LocalizedFields;
  published: boolean;
};

export type FamilyDraft = {
  id: string;
  name: LocalizedFields;
  neighbourhood: LocalizedFields;
  languages: LocalizedFields;
  signatureDish: LocalizedFields;
  story: LocalizedFields;
  imageAlt: LocalizedFields;
  published: boolean;
};

export function emptyLocalizedFields(): LocalizedFields {
  return { en: "", fr: "", ar: "" };
}

export function emptyExperienceDraft(): ExperienceDraft {
  return {
    id: "",
    title: emptyLocalizedFields(),
    description: emptyLocalizedFields(),
    duration: emptyLocalizedFields(),
    imageAlt: emptyLocalizedFields(),
    price: "",
    childPrice: "",
    childAgeMin: "",
    childAgeMax: "",
    minGuests: "",
    maxGuests: "",
    startTime: "",
    mealOptions: emptyLocalizedFields(),
    included: emptyLocalizedFields(),
    whyLove: [emptyLocalizedFields(), emptyLocalizedFields(), emptyLocalizedFields()],
    whatToExpect: emptyLocalizedFields(),
    whatToRemember: emptyLocalizedFields(),
    hostLanguages: emptyLocalizedFields(),
    published: false,
  };
}

export function emptyFamilyDraft(): FamilyDraft {
  return {
    id: "",
    name: emptyLocalizedFields(),
    neighbourhood: emptyLocalizedFields(),
    languages: emptyLocalizedFields(),
    signatureDish: emptyLocalizedFields(),
    story: emptyLocalizedFields(),
    imageAlt: emptyLocalizedFields(),
    published: false,
  };
}

export function localizedIncludedItems(fields: LocalizedFields): {
  items: LocalizedFields[];
  error: string | null;
} {
  const lines = {
    en: splitIncludedLines(fields.en),
    fr: splitIncludedLines(fields.fr),
    ar: splitIncludedLines(fields.ar),
  };
  const counts = Object.values(lines).map((items) => items.length);
  if (counts.every((count) => count === 0)) return { items: [], error: null };
  if (counts.some((count) => count !== counts[0])) {
    return {
      items: [],
      error: "Add the same number of included-item translations in each language.",
    };
  }
  if (Object.values(lines).some((items) => items.some((item) => !item))) {
    return { items: [], error: "Remove blank lines from the included-item translations." };
  }
  return {
    items: lines.en.map((_, index) => ({
      en: lines.en[index]!,
      fr: lines.fr[index]!,
      ar: lines.ar[index]!,
    })),
    error: null,
  };
}

export function localizedLines(fields: LocalizedFields): {
  items: LocalizedFields[];
  error: string | null;
} {
  return localizedIncludedItems(fields);
}

export function isValidCurrencyCode(value: string): boolean {
  return /^[A-Z]{3}$/.test(value);
}

function splitIncludedLines(value: string): string[] {
  if (!value.trim()) return [];
  return value.split(/\r?\n/).map((line) => line.trim());
}
