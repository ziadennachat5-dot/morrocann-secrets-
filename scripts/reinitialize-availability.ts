import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env["SUPABASE_URL"];
const serviceRoleKey = process.env["SUPABASE_SERVICE_ROLE_KEY"];

if (!supabaseUrl || !serviceRoleKey) {
  throw new Error("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in .env.");
}

const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function reinitializeAvailability() {
  console.log("Fetching experiences...");
  const { data: experiences, error: expError } = await supabaseAdmin
    .from("experiences")
    .select("id, title, max_guests");

  if (expError || !experiences || experiences.length === 0) {
    throw new Error(`Failed to fetch experiences: ${expError?.message}`);
  }

  console.log(`Found ${experiences.length} experiences:`, experiences.map((e) => e.id));

  // 1. Delete invalid historical dates (like 1901-01-01)
  const { error: delInvalidErr } = await supabaseAdmin
    .from("availability")
    .delete()
    .lt("date", "2026-01-01");
  if (delInvalidErr) {
    console.warn("Warning deleting old dates:", delInvalidErr.message);
  } else {
    console.log("Cleaned up any invalid dates before 2026-01-01.");
  }

  // 2. Fetch existing bookings to preserve actual bookings counts
  const { data: bookings } = await supabaseAdmin
    .from("bookings")
    .select("experience_id, date, status, adults, children")
    .neq("status", "cancelled");

  const bookingCountMap = new Map<string, number>();
  for (const b of bookings ?? []) {
    const key = `${b.experience_id}:${b.date}`;
    const guests = (b.adults || 0) + (b.children || 0);
    bookingCountMap.set(key, (bookingCountMap.get(key) || 0) + guests);
  }

  // 3. Generate dates from 2026-10-01 to 2027-12-31
  const startDate = new Date(2026, 9, 1); // 2026-10-01
  const endDate = new Date(2027, 11, 31); // 2027-12-31
  const allDates: string[] = [];

  const cur = new Date(startDate);
  while (cur <= endDate) {
    const y = cur.getFullYear();
    const m = String(cur.getMonth() + 1).padStart(2, "0");
    const d = String(cur.getDate()).padStart(2, "0");
    allDates.push(`${y}-${m}-${d}`);
    cur.setDate(cur.getDate() + 1);
  }

  console.log(`Generated ${allDates.length} dates from 2026-10-01 to 2027-12-31.`);

  // 4. For each experience, upsert in batches of 100
  let totalUpserted = 0;

  for (const exp of experiences) {
    const cap = exp.max_guests ?? 25;
    const rows = allDates.map((date) => {
      const bookedGuests = bookingCountMap.get(`${exp.id}:${date}`) || 0;
      return {
        experience_id: exp.id,
        date,
        capacity: cap,
        booked_count: bookedGuests,
        status: "available" as const,
      };
    });

    const batchSize = 100;
    for (let i = 0; i < rows.length; i += batchSize) {
      const chunk = rows.slice(i, i + batchSize);
      const { error: upsertErr } = await supabaseAdmin
        .from("availability")
        .upsert(chunk, { onConflict: "date,experience_id" });

      if (upsertErr) {
        throw new Error(`Failed to upsert availability batch for ${exp.id}: ${upsertErr.message}`);
      }
      totalUpserted += chunk.length;
    }

    console.log(`Successfully initialized ${rows.length} dates as 'available' for experience: ${exp.id}`);
  }

  // Also make sure any existing rows outside this range are also set to available
  const { error: updateExistingErr } = await supabaseAdmin
    .from("availability")
    .update({ status: "available" })
    .neq("status", "available");

  if (updateExistingErr) {
    console.warn("Notice updating any remaining records:", updateExistingErr.message);
  }

  console.log(`\nDONE! Total ${totalUpserted} records initialized to 'available'.`);
}

reinitializeAvailability()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Error:", err);
    process.exit(1);
  });
