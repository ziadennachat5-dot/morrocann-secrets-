import { createClient } from "@supabase/supabase-js";

const url = process.env.SUPABASE_URL!;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(url, key);

async function main() {
  const { data: bookings, error: bErr } = await supabase
    .from("bookings")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(10);

  console.log("Bookings err:", bErr);
  console.log("Recent bookings count:", bookings?.length);
  if (bookings && bookings.length > 0) {
    console.log("Most recent booking:", bookings[0]);
  }

  const { data: admins, error: aErr } = await supabase.from("admin_users").select("*");
  console.log("Admin users count:", admins?.length, "err:", aErr);
  console.log("Admin users:", admins);

  const { data: exps, error: eErr } = await supabase.from("experiences").select("id,price,child_price,min_guests,max_guests,is_published");
  console.log("Experiences:", exps, eErr);
}

main().catch(console.error);
