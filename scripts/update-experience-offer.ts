import { createClient } from "@supabase/supabase-js";
import {
  DINNER_EXPERIENCE_ID,
  LUNCH_EXPERIENCE_ID,
  IFTAR_EXPERIENCE_ID,
  buildDinnerUpdate,
  buildLunchDuplicate,
  buildIftarDuplicate,
  CANCELLATION_TIERS_SETTING,
  PUBLIC_MEETING_AREA_SETTING,
  type ExperienceRecord,
} from "./experience-updater.ts";

const supabaseUrl = process.env["SUPABASE_URL"];
const serviceRoleKey = process.env["SUPABASE_SERVICE_ROLE_KEY"];

if (!supabaseUrl || !serviceRoleKey) {
  throw new Error("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in .env.");
}

const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

console.info("Starting guarded update of experiences and site settings...");

// 1. Fetch existing dinner experience
const { data: existingDinner, error: dinnerFetchError } = await supabaseAdmin
  .from("experiences")
  .select("*")
  .eq("id", DINNER_EXPERIENCE_ID)
  .maybeSingle();

if (dinnerFetchError || !existingDinner) {
  throw new Error(
    `Failed to fetch existing experience '${DINNER_EXPERIENCE_ID}': ${dinnerFetchError?.message || "Not found"}`,
  );
}

const originalPhoto = existingDinner.image_url;
const originalPhotoAlt = existingDinner.image_alt;
const originalPrice = existingDinner.price;
const originalChildPrice = existingDinner.child_price;
const originalMinGuests = existingDinner.min_guests;
const originalMaxGuests = existingDinner.max_guests;

// Check existing availability for dinner
const { count: initialAvailabilityCount, error: availCountError } = await supabaseAdmin
  .from("availability")
  .select("id", { count: "exact", head: true })
  .eq("experience_id", DINNER_EXPERIENCE_ID);

if (availCountError) {
  throw new Error(`Failed to check existing availability: ${availCountError.message}`);
}

console.info(
  `Found existing dinner experience with ${initialAvailabilityCount} availability slot(s). Preserving photo and availability.`,
);

// 2. Apply guarded update to dinner experience
const dinnerUpdate = buildDinnerUpdate(existingDinner as ExperienceRecord);
const { error: updateError } = await supabaseAdmin
  .from("experiences")
  .update({
    ...dinnerUpdate,
    updated_at: new Date().toISOString(),
  })
  .eq("id", DINNER_EXPERIENCE_ID);

if (updateError) {
  throw new Error(`Failed to update dinner experience: ${updateError.message}`);
}

// Verify post-update preservation of photo and alt text
const { data: updatedDinner, error: verifyDinnerError } = await supabaseAdmin
  .from("experiences")
  .select("*")
  .eq("id", DINNER_EXPERIENCE_ID)
  .single();

if (verifyDinnerError || !updatedDinner) {
  throw new Error(`Failed to verify updated dinner experience: ${verifyDinnerError?.message}`);
}

if (updatedDinner.image_url !== originalPhoto) {
  throw new Error("GUARD VIOLATION: Existing experience photo was modified!");
}
if (JSON.stringify(updatedDinner.image_alt) !== JSON.stringify(originalPhotoAlt)) {
  throw new Error("GUARD VIOLATION: Existing experience photo alt text was modified!");
}
if (updatedDinner.is_published !== false) {
  throw new Error("GUARD VIOLATION: Experience must be kept UNPUBLISHED!");
}

const { count: postAvailabilityCount, error: postAvailError } = await supabaseAdmin
  .from("availability")
  .select("id", { count: "exact", head: true })
  .eq("experience_id", DINNER_EXPERIENCE_ID);

if (postAvailError || postAvailabilityCount !== initialAvailabilityCount) {
  throw new Error("GUARD VIOLATION: Availability records were altered during update!");
}

console.info(
  `[SUCCESS] Updated '${DINNER_EXPERIENCE_ID}' (UNPUBLISHED). Photo, alt text, and ${postAvailabilityCount} availability slots preserved.`,
);

// 3. Create / update duplicate lunch experience
const lunchRecord = buildLunchDuplicate(updatedDinner as ExperienceRecord);
const { error: lunchError } = await supabaseAdmin.from("experiences").upsert(
  {
    ...lunchRecord,
    updated_at: new Date().toISOString(),
  },
  { onConflict: "id" },
);

if (lunchError) {
  throw new Error(`Failed to upsert duplicate lunch experience: ${lunchError.message}`);
}
console.info(`[SUCCESS] Configured duplicate experience '${LUNCH_EXPERIENCE_ID}' (14:00, UNPUBLISHED, no photo).`);

// 4. Create / update duplicate Ramadan iftar experience
const iftarRecord = buildIftarDuplicate(updatedDinner as ExperienceRecord);
const { error: iftarError } = await supabaseAdmin.from("experiences").upsert(
  {
    ...iftarRecord,
    updated_at: new Date().toISOString(),
  },
  { onConflict: "id" },
);

if (iftarError) {
  throw new Error(`Failed to upsert duplicate iftar experience: ${iftarError.message}`);
}
console.info(
  `[SUCCESS] Configured seasonal experience '${IFTAR_EXPERIENCE_ID}' (UNPUBLISHED, no photo, start_time: null).`,
);

// 5. Update site_settings
const { error: cancelSettingError } = await supabaseAdmin.from("site_settings").upsert(
  {
    setting_key: "booking.cancellation_tiers",
    value: CANCELLATION_TIERS_SETTING,
    is_public: true,
    updated_at: new Date().toISOString(),
  },
  { onConflict: "setting_key" },
);

if (cancelSettingError) {
  throw new Error(`Failed to set cancellation tiers setting: ${cancelSettingError.message}`);
}
console.info("[SUCCESS] Set site_settings 'booking.cancellation_tiers' to 24h / 100% refund.");

const { error: meetingAreaError } = await supabaseAdmin.from("site_settings").upsert(
  {
    setting_key: "trust.meeting_area",
    value: PUBLIC_MEETING_AREA_SETTING,
    is_public: true,
    updated_at: new Date().toISOString(),
  },
  { onConflict: "setting_key" },
);

if (meetingAreaError) {
  throw new Error(`Failed to set meeting area setting: ${meetingAreaError.message}`);
}
console.info("[SUCCESS] Set site_settings 'trust.meeting_area' to 'Bab Ghmat, Marrakech'.");

console.info("\n--- Verification Summary ---");
console.info(`Dinner price: ${originalPrice} MAD`);
console.info(`Dinner child price: ${originalChildPrice} MAD`);
console.info(`Dinner min guests: ${originalMinGuests}`);
console.info(`Dinner max guests: ${originalMaxGuests}`);
console.info("All experiences are kept unpublished.");
