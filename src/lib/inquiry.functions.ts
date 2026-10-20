import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { getClientIp } from "./client-ip";
import { inquirySchema } from "./inquiry-schema";

export const submitInquiry = createServerFn({ method: "POST" })
  .validator(inquirySchema)
  .handler(async ({ data }) => {
    if (data.honeypot) throw new Error("Unable to process this inquiry.");

    const clientIp = getClientIp(getRequest());
    const rateLimitSecret = process.env["PUBLIC_FORM_RATE_LIMIT_SECRET"];
    if (!clientIp || !rateLimitSecret || rateLimitSecret.length < 32) {
      throw new Error("Public inquiries are temporarily unavailable.");
    }

    const key = await crypto.subtle.importKey(
      "raw",
      new TextEncoder().encode(rateLimitSecret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"],
    );
    const digest = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(clientIp));
    const ipHash = Array.from(new Uint8Array(digest), (byte) =>
      byte.toString(16).padStart(2, "0"),
    ).join("");

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const rateLimit = await supabaseAdmin.rpc("consume_public_form_rate_limit", {
      p_ip_hash: ipHash,
    });
    if (rateLimit.error) throw new Error("Unable to verify inquiry request limits.");
    if (!rateLimit.data) throw new Error("Too many requests. Please try again later.");

    const result = await supabaseAdmin.from("inquiries").insert({
      kind: data.kind,
      full_name: data.fullName,
      email: data.email,
      phone: data.phone || null,
      organization: data.organization || null,
      event_type: data.eventType || null,
      requested_date: data.requestedDate || null,
      guest_count: data.guestCount,
      quantity: data.quantity,
      message: data.message,
      status: "new",
    });
    if (result.error) {
      console.error("Inquiry submission failed:", result.error.message);
      throw new Error("Unable to save this inquiry. Please try again later.");
    }

    return { success: true };
  });
