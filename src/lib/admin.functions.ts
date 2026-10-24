import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const updateAvailabilitySchema = z.object({
  accessToken: z.string().optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  experienceId: z.string().min(1),
  capacity: z.number().int().min(1).max(100),
  status: z.enum(["available", "booked", "closed"]),
});

export const updateAdminAvailabilitySlot = createServerFn({ method: "POST" })
  .validator((data: z.infer<typeof updateAvailabilitySchema>) =>
    updateAvailabilitySchema.parse(data),
  )
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    if (data.accessToken) {
      const {
        data: { user },
        error: authError,
      } = await supabaseAdmin.auth.getUser(data.accessToken);

      if (authError || !user) {
        throw new Error("Authentication failed: invalid session");
      }

      const { data: adminRecord, error: adminError } = await supabaseAdmin
        .from("admin_users")
        .select("id")
        .eq("id", user.id)
        .maybeSingle();

      if (adminError || !adminRecord) {
        throw new Error("Administrator access required");
      }
    }

    const { error } = await supabaseAdmin.from("availability").upsert(
      {
        date: data.date,
        experience_id: data.experienceId,
        capacity: data.capacity,
        status: data.status,
      },
      { onConflict: "date,experience_id" },
    );

    if (error) {
      throw new Error(`Database error: ${error.message}`);
    }

    return { success: true };
  });

const updateAvailabilityBatchSchema = z.object({
  accessToken: z.string().optional(),
  dates: z
    .array(z.string().regex(/^\d{4}-\d{2}-\d{2}$/))
    .min(1)
    .max(366),
  experienceIds: z.array(z.string().min(1)).min(1),
  capacity: z.number().int().min(1).max(100),
  status: z.enum(["available", "booked", "closed"]),
});

export const updateAdminAvailabilityBatch = createServerFn({ method: "POST" })
  .validator((data: z.infer<typeof updateAvailabilityBatchSchema>) =>
    updateAvailabilityBatchSchema.parse(data),
  )
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    if (data.accessToken) {
      const {
        data: { user },
        error: authError,
      } = await supabaseAdmin.auth.getUser(data.accessToken);

      if (authError || !user) {
        throw new Error("Authentication failed: invalid session");
      }

      const { data: adminRecord, error: adminError } = await supabaseAdmin
        .from("admin_users")
        .select("id")
        .eq("id", user.id)
        .maybeSingle();

      if (adminError || !adminRecord) {
        throw new Error("Administrator access required");
      }
    }

    const rows = data.experienceIds.flatMap((expId) =>
      data.dates.map((date) => ({
        date,
        experience_id: expId,
        capacity: data.capacity,
        status: data.status,
      })),
    );

    const { error } = await supabaseAdmin
      .from("availability")
      .upsert(rows, { onConflict: "date,experience_id" });

    if (error) {
      throw new Error(`Database error: ${error.message}`);
    }

    return { success: true, count: rows.length };
  });
