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
    en: "Arrive and meet the family",
    fr: "Arrivez et rencontrez la famille",
    ar: "الوصول والتعرف على العائلة",
  },
  {
    en: "Share the meal and taste local dishes",
    fr: "Partagez le repas et goûtez les plats locaux",
    ar: "مشاركة الوجبة وتذوق الأطباق المحلية",
  },
  {
    en: "Hear their stories and traditions",
    fr: "Écoutez leurs histoires et traditions",
    ar: "الاستماع إلى قصصهم وتقاليدهم",
  },
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
