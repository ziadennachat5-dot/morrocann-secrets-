import { createClient } from "@supabase/supabase-js";

const experienceId = "family-dinner-marrakech";
const updateExisting = process.argv.includes("--update-existing");
const supabaseUrl = process.env["SUPABASE_URL"];
const serviceRoleKey = process.env["SUPABASE_SERVICE_ROLE_KEY"];

if (!supabaseUrl || !serviceRoleKey) {
  throw new Error("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in .env.");
}

const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const schemaCheck = await supabaseAdmin
  .from("experiences")
  .select("child_price,min_guests,start_time,meal_options")
  .limit(0);
if (schemaCheck.error) {
  throw new Error("The booking experience migration must be applied before seeding.");
}

const [existingExperience, oldExperience] = await Promise.all([
  supabaseAdmin.from("experiences").select("id").eq("id", experienceId).maybeSingle(),
  supabaseAdmin.from("experiences").select("id").eq("id", "gedg").maybeSingle(),
]);
if (existingExperience.error || oldExperience.error) {
  throw new Error("Unable to inspect the target experiences.");
}

if (oldExperience.data) {
  const bookingCount = await supabaseAdmin
    .from("bookings")
    .select("id", { count: "exact", head: true })
    .eq("experience_id", "gedg");
  if (bookingCount.error) throw new Error("Unable to verify bookings for the old test experience.");
  if (bookingCount.count !== 0) {
    throw new Error("The old test experience has bookings and was not deleted.");
  }
}

const experienceRecord = {
  id: experienceId,
  title: {
    en: "Dinner with a Moroccan Family",
    fr: "Dîner chez une famille marocaine",
    ar: "عشاء مع عائلة مغربية",
  },
  blurb: {
    en: "Join a local family in Marrakech for an evening at their home. You are welcomed with mint tea, help prepare part of the meal in the kitchen, then share a home-cooked dinner at the family table. Expect good food, easy conversation and a real look at everyday Moroccan hospitality.",
    fr: "Rejoignez une famille locale à Marrakech pour une soirée chez elle. Vous êtes accueilli avec un thé à la menthe, vous participez à la préparation d'une partie du repas en cuisine, puis vous partagez un dîner fait maison à la table de la famille. Au programme : une cuisine généreuse, des conversations simples et un vrai aperçu de l'hospitalité marocaine au quotidien.",
    ar: "انضموا إلى عائلة مغربية في مراكش لقضاء أمسية في بيتها. يبدأ اللقاء بكأس شاي بالنعناع، ثم تشاركون في تحضير جزء من الوجبة في المطبخ، وبعدها تتقاسمون عشاءً منزليًا على مائدة العائلة. أمسية من الطعام الطيب والحديث البسيط وكرم الضيافة المغربية كما هي في الحياة اليومية.",
  },
  duration: {
    en: "About 3 hours",
    fr: "Environ 3 heures",
    ar: "حوالي 3 ساعات",
  },
  price: 500,
  max_guests: 8,
  min_guests: 2,
  start_time: "19:00",
  meal_options: [
    { en: "Meat", fr: "Viande", ar: "لحم" },
    { en: "Fish", fr: "Poisson", ar: "سمك" },
    { en: "Vegetarian", fr: "Végétarien", ar: "نباتي" },
  ],
  included: [
    {
      en: "Welcome mint tea",
      fr: "Thé à la menthe de bienvenue",
      ar: "شاي بالنعناع للترحيب",
    },
    {
      en: "Hands-on cooking with your hosts",
      fr: "Cuisine avec vos hôtes",
      ar: "الطبخ مع أصحاب البيت",
    },
    { en: "Home-cooked dinner", fr: "Dîner fait maison", ar: "عشاء منزلي" },
    {
      en: "Conversation with the host family",
      fr: "Échanges avec la famille d'accueil",
      ar: "أحاديث مع العائلة المضيفة",
    },
  ],
  image_url: "",
  image_alt: null,
  child_price: null,
  child_age_min: null,
  child_age_max: null,
  why_love: [],
  what_to_expect: null,
  what_to_remember: null,
  host_languages: null,
  is_published: false,
};

if (existingExperience.data && updateExisting) {
  const updateResult = await supabaseAdmin
    .from("experiences")
    .update(experienceRecord)
    .eq("id", experienceId);
  if (updateResult.error) throw new Error("Unable to update the existing experience to the draft.");
  console.info(`Updated unpublished experience ${experienceId}.`);
} else if (existingExperience.data) {
  console.info(`Skipped experience ${experienceId}; its URL ID already exists.`);
} else {
  const insertResult = await supabaseAdmin.from("experiences").insert(experienceRecord);
  if (insertResult.error) throw new Error("Unable to insert the first unpublished experience.");
  console.info(`Created unpublished experience ${experienceId}.`);
}

if (oldExperience.data) {
  const deleteResult = await supabaseAdmin.from("experiences").delete().eq("id", "gedg");
  if (deleteResult.error) throw new Error("Unable to delete the old test experience.");
  console.info("Deleted old test experience gedg.");
} else {
  console.info("Old test experience gedg was not present.");
}

const currencyResult = await supabaseAdmin.from("site_settings").upsert(
  {
    setting_key: "booking.currency",
    value: "MAD",
    is_public: true,
    updated_at: new Date().toISOString(),
  },
  { onConflict: "setting_key" },
);
if (currencyResult.error) throw new Error("Unable to set the shared booking currency.");
console.info("Set shared booking currency to MAD.");
