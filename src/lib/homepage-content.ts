export type HomepageVisibility = {
  hasIdea: boolean;
  reasonCount: number;
  experienceCount: number;
  stepCount: number;
  familyCount: number;
  photoCount: number;
  bookingExperienceCount: number;
  faqCount: number;
  hasContact: boolean;
};

export const DEFAULT_HOW_STEPS = [
  {
    en: "Arrive and enjoy tea",
    fr: "Arriver et partager un thé",
    ar: "الوصول والاستمتاع بالشاي",
  },
  { en: "Cook together", fr: "Cuisiner ensemble", ar: "الطبخ معًا" },
  { en: "Eat slowly", fr: "Prendre le temps de manger", ar: "تناول الطعام على مهل" },
] as const;

export function visibleHomepageSections(content: HomepageVisibility): string[] {
  return [
    ...(content.hasIdea ? ["idea"] : []),
    ...(content.reasonCount === 3 ? ["why"] : []),
    ...(content.experienceCount > 0 && content.stepCount === 3 ? ["how"] : []),
    ...(content.experienceCount > 0 ? ["experiences"] : []),
    ...(content.familyCount > 0 ? ["families"] : []),
    ...(content.photoCount > 0 ? ["photos"] : []),
    ...(content.bookingExperienceCount > 0 ? ["booking"] : []),
    ...(content.faqCount > 0 ? ["faq"] : []),
    ...(content.hasContact ? ["contact"] : []),
  ];
}
