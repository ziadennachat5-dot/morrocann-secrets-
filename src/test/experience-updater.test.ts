import { describe, expect, it } from "vitest";
import {
  buildDinnerUpdate,
  buildLunchDuplicate,
  buildIftarDuplicate,
  DINNER_EXPERIENCE_ID,
  LUNCH_EXPERIENCE_ID,
  IFTAR_EXPERIENCE_ID,
  type ExperienceRecord,
} from "../../scripts/experience-updater";

describe("experience updater logic", () => {
  const existingDinnerRecord: ExperienceRecord = {
    id: DINNER_EXPERIENCE_ID,
    title: {
      en: "Old Dinner Title",
      fr: "Ancien titre dîner",
      ar: "عنوان قديم",
    },
    blurb: {
      en: "Old blurb mentioning mint tea and cooking together in the kitchen.",
      fr: "Ancien texte avec thé à la menthe et cuisine ensemble.",
      ar: "نص قديم",
    },
    duration: {
      en: "About 3 hours",
      fr: "Environ 3 heures",
      ar: "حوالي 3 ساعات",
    },
    price: 500,
    child_price: 200,
    child_age_min: 2,
    child_age_max: 12,
    min_guests: 2,
    max_guests: 8,
    deposit_amount: 0,
    start_time: "19:00:00",
    meal_options: [{ en: "Meat", fr: "Viande", ar: "لحم" }],
    why_love: [],
    what_to_expect: null,
    what_to_remember: null,
    host_languages: null,
    image_url: "https://example.supabase.co/storage/v1/object/public/media/experiences/photo-abc-123.jpg",
    image_alt: {
      en: "Guests sharing a meal at a Moroccan family table in Marrakech",
      fr: "Des invités partagent un repas à une table marocaine",
      ar: "ضيوف يتقاسمون وجبة على مائدة مغربية",
    },
    included: [],
    is_published: true,
  };

  it("updates dinner fields while strictly preserving existing photo, alt text and pricing", () => {
    const update = buildDinnerUpdate(existingDinnerRecord);

    // Assert that image_url and image_alt are strictly preserved
    expect(update.image_url).toBe(existingDinnerRecord.image_url);
    expect(update.image_alt).toEqual(existingDinnerRecord.image_alt);

    // Assert that price, child price, and guest limits are preserved
    expect(update.price).toBe(500);
    expect(update.child_price).toBe(200);
    expect(update.min_guests).toBe(2);
    expect(update.max_guests).toBe(8);

    // Assert that status is unpublished
    expect(update.is_published).toBe(false);

    // Assert updated start time is 19:30
    expect(update.start_time).toBe("19:30:00");

    // Assert unconfirmed meal options are emptied
    expect(update.meal_options).toEqual([]);

    // Assert updated duration
    expect(update.duration).toEqual({
      en: "About 2 hours",
      fr: "Environ 2 heures",
      ar: "حوالي ساعتين",
    });

    // Assert description removes cooking together / mint tea
    expect(update.blurb?.en).not.toContain("mint tea");
    expect(update.blurb?.en).not.toContain("cook together");
    expect(update.blurb?.fr).not.toContain("thé à la menthe");
    expect(update.blurb?.fr).not.toContain("cuisine");
    expect(update.blurb?.ar).not.toContain("شاي بالنعناع");

    // Assert 3 included items per language
    expect(update.included).toHaveLength(3);
    expect(update.included?.[0]?.en).toBe("Home-cooked traditional dinner");
    expect(update.included?.[1]?.fr).toBe("Plats locaux préparés avec des ingrédients frais");
    expect(update.included?.[2]?.ar).toBe("وقت مع العائلة المضيفة");

    // Assert 3 why you'll love this bullets
    expect(update.why_love).toHaveLength(3);
    expect(update.why_love?.[0]?.en).toBe("Taste traditional home-cooked dishes");

    // Assert what to expect reuses description
    expect(update.what_to_expect).toEqual(update.blurb);

    // Assert what to remember
    expect(update.what_to_remember?.en).toContain("Come hungry!");
    expect(update.what_to_remember?.fr).toContain("Venez avec un bon appétit !");
    expect(update.what_to_remember?.ar).toContain("تعالوا بشهية مفتوحة!");

    // Assert languages
    expect(update.host_languages).toEqual({
      en: "English, French, Arabic",
      fr: "Anglais, français, arabe",
      ar: "الإنجليزية والفرنسية والعربية",
    });
  });

  it("builds lunch duplicate with start time 14:00, unpublished, and without photo", () => {
    const updatedDinner: ExperienceRecord = {
      ...existingDinnerRecord,
      ...buildDinnerUpdate(existingDinnerRecord),
    };

    const lunch = buildLunchDuplicate(updatedDinner);

    expect(lunch.id).toBe(LUNCH_EXPERIENCE_ID);
    expect(lunch.title).toEqual({
      en: "Lunch with a Moroccan Family",
      fr: "Déjeuner chez une famille marocaine",
      ar: "غداء مع عائلة مغربية",
    });
    expect(lunch.start_time).toBe("14:00:00");
    expect(lunch.is_published).toBe(false);
    expect(lunch.image_url).toBe("");
    expect(lunch.image_alt).toBeNull();
    expect(lunch.price).toBe(500);
    expect(lunch.child_price).toBe(200);
  });

  it("builds seasonal Ramadan iftar duplicate without photo and with null start time", () => {
    const updatedDinner: ExperienceRecord = {
      ...existingDinnerRecord,
      ...buildDinnerUpdate(existingDinnerRecord),
    };

    const iftar = buildIftarDuplicate(updatedDinner);

    expect(iftar.id).toBe(IFTAR_EXPERIENCE_ID);
    expect(iftar.title).toEqual({
      en: "Iftar with a Moroccan Family",
      fr: "Iftar chez une famille marocaine",
      ar: "إفطار مع عائلة مغربية",
    });
    expect(iftar.start_time).toBeNull();
    expect(iftar.is_published).toBe(false);
    expect(iftar.image_url).toBe("");
    expect(iftar.image_alt).toBeNull();
    expect(iftar.blurb.en).toBe("Share a traditional iftar meal with a local family during Ramadan.");
    expect(iftar.blurb.fr).toBe("Partagez un iftar traditionnel avec une famille locale pendant le Ramadan.");
    expect(iftar.blurb.ar).toBe("شاركوا عائلة محلية وجبة إفطار تقليدية خلال شهر رمضان.");
  });
});
