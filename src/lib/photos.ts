import type { L10n } from "./i18n";

export type SitePhoto = {
  id: string;
  width: number;
  height: number;
  widths: number[];
  position: string;
  alt: L10n;
};

export const photos = {
  "couple-sharing-riad-dinner": {
    id: "couple-sharing-riad-dinner",
    width: 1200,
    height: 1600,
    widths: [480, 800, 1200],
    position: "50% 58%",
    alt: {
      en: "A man and woman share a Moroccan meal at a low table beneath patterned zellige tiles.",
      fr: "Un homme et une femme partagent un repas marocain à une table basse, devant des zelliges à motifs.",
      ar: "رجل وامرأة يتشاركان وجبة مغربية حول مائدة منخفضة أمام جدار من الزليج المزخرف.",
    },
  },
  "guests-in-kaftans": {
    id: "guests-in-kaftans",
    width: 1200,
    height: 1600,
    widths: [480, 800, 1200],
    position: "50% 44%",
    alt: {
      en: "Four people stand together in embroidered Moroccan kaftans in a decorated riad room.",
      fr: "Quatre personnes posent en caftans marocains brodés dans une pièce décorée d'un riad.",
      ar: "أربعة أشخاص يقفون معاً بجلابيب مغربية مطرزة في غرفة مزينة داخل رياض.",
    },
  },
  "low-light-group-dinner": {
    id: "low-light-group-dinner",
    width: 1200,
    height: 1600,
    widths: [480, 800, 1200],
    position: "50% 57%",
    alt: {
      en: "Guests gather around a shared dinner table in a warmly lit riad with patterned tile walls.",
      fr: "Des convives se réunissent autour d'une table dans un riad éclairé chaudement aux murs carrelés.",
      ar: "يجتمع ضيوف حول مائدة عشاء مشتركة في رياض دافئ الإضاءة بجدران مزخرفة بالبلاط.",
    },
  },
  "couple-sharing-tagine": {
    id: "couple-sharing-tagine",
    width: 960,
    height: 1280,
    widths: [480, 800, 960],
    position: "50% 48%",
    alt: {
      en: "A man and woman sit beside a tagine and share a meal in a tiled riad.",
      fr: "Un homme et une femme partagent un repas avec un tajine dans un riad carrelé.",
      ar: "رجل وامرأة يجلسان إلى جانب طاجين ويتشاركان وجبة في رياض مزين بالبلاط.",
    },
  },
  "four-guests-around-dinner": {
    id: "four-guests-around-dinner",
    width: 960,
    height: 1280,
    widths: [480, 800, 960],
    position: "50% 55%",
    alt: {
      en: "Four guests sit around a shared meal beneath the patterned walls of a riad.",
      fr: "Quatre convives partagent un repas sous les murs à motifs d'un riad.",
      ar: "أربعة ضيوف يجلسون حول وجبة مشتركة أمام جدران رياض مزخرفة.",
    },
  },
  "group-dinner-in-mosaic-riad": {
    id: "group-dinner-in-mosaic-riad",
    width: 960,
    height: 1280,
    widths: [480, 800, 960],
    position: "50% 58%",
    alt: {
      en: "A group of guests dine together around a low table in a mosaic-tiled riad.",
      fr: "Un groupe de convives dîne autour d'une table basse dans un riad aux mosaïques.",
      ar: "مجموعة من الضيوف تتناول الطعام حول مائدة منخفضة في رياض مزين بالفسيفساء.",
    },
  },
  "large-riad-dinner-gathering": {
    id: "large-riad-dinner-gathering",
    width: 1200,
    height: 1600,
    widths: [480, 800, 1200],
    position: "50% 58%",
    alt: {
      en: "A large group shares dinner around a table beneath a chandelier in a patterned riad.",
      fr: "Un grand groupe partage un dîner sous un lustre, dans un riad aux murs décorés.",
      ar: "مجموعة كبيرة تتشارك العشاء حول مائدة تحت ثريا في رياض مزخرف.",
    },
  },
  "family-sharing-tagine": {
    id: "family-sharing-tagine",
    width: 1200,
    height: 1600,
    widths: [480, 800, 1200],
    position: "50% 62%",
    alt: {
      en: "Adults, a baby and a young child sit at a table set with a tagine and Moroccan dishes.",
      fr: "Des adultes, un bébé et un jeune enfant sont assis à une table garnie d'un tajine et de plats marocains.",
      ar: "يجلس بالغون ورضيع وطفل صغير إلى مائدة عليها طاجين وأطباق مغربية.",
    },
  },
  "couscous-with-group-of-guests": {
    id: "couscous-with-group-of-guests",
    width: 1200,
    height: 1600,
    widths: [480, 800, 1200],
    position: "50% 58%",
    alt: {
      en: "Guests gather around a large shared platter and small dishes in a warmly lit riad.",
      fr: "Des convives se réunissent autour d'un grand plat à partager et de petits plats dans un riad chaleureux.",
      ar: "يجتمع الضيوف حول طبق كبير مشترك وأطباق صغيرة في رياض دافئ الإضاءة.",
    },
  },
  "women-in-embroidered-kaftans": {
    id: "women-in-embroidered-kaftans",
    width: 900,
    height: 1600,
    widths: [480, 800, 900],
    position: "50% 50%",
    alt: {
      en: "Seven women stand together in embroidered Moroccan kaftans in a bright riad room.",
      fr: "Sept femmes posent en caftans marocains brodés dans une pièce lumineuse d'un riad.",
      ar: "سبع نساء يقفن معاً بجلابيب مغربية مطرزة في غرفة مضيئة داخل رياض.",
    },
  },
  "guests-sharing-tagine": {
    id: "guests-sharing-tagine",
    width: 1200,
    height: 1600,
    widths: [480, 800, 1200],
    position: "50% 53%",
    alt: {
      en: "Two women and a man sit around a table with a tagine and several Moroccan dishes.",
      fr: "Deux femmes et un homme sont assis autour d'une table avec un tajine et plusieurs plats marocains.",
      ar: "امرأتان ورجل يجلسون حول مائدة عليها طاجين وأطباق مغربية متنوعة.",
    },
  },
  "moroccan-dishes-on-shared-table": {
    id: "moroccan-dishes-on-shared-table",
    width: 1200,
    height: 1600,
    widths: [480, 800, 1200],
    position: "50% 64%",
    alt: {
      en: "Guests sit behind a table spread with Moroccan dishes, bowls and patterned serving plates.",
      fr: "Des convives sont assis derrière une table garnie de plats marocains, de bols et d'assiettes décorées.",
      ar: "يجلس ضيوف خلف مائدة عامرة بأطباق مغربية وأوعية وأطباق تقديم مزخرفة.",
    },
  },
} satisfies Record<string, SitePhoto>;

export type PhotoId = keyof typeof photos;

export const galleryPhotos = Object.values(photos);
