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
    en: "You are welcomed into a local family's home in Marrakech and share a traditional home-cooked meal at their table. You taste local dishes made with fresh local ingredients, and the family shares stories about daily life and Moroccan traditions.",
    fr: "Vous êtes accueilli dans la maison d'une famille locale à Marrakech et partagez un repas traditionnel fait maison à sa table. Vous goûtez des plats locaux préparés avec des ingrédients frais, et la famille vous raconte son quotidien et les traditions marocaines.",
    ar: "يُستقبَل بكم في بيت عائلة مغربية في مراكش وتتقاسمون وجبة تقليدية منزلية على مائدتها. تتذوقون أطباقًا محلية معدّة بمكوّنات طازجة، وتحكي لكم العائلة عن حياتها اليومية وعن التقاليد المغربية.",
  },
  duration: {
    en: "About 3 hours",
    fr: "Environ 3 heures",
    ar: "حوالي 3 ساعات",
  },
  price: 23,
  max_guests: 8,
  min_guests: 2,
  start_time: "19:00",
  meal_options: [],
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
