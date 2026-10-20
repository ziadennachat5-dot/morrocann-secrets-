import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/cron/emails")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const secret = process.env["CRON_SECRET"]?.trim() ?? "";
        if (!secret) {
          return Response.json({ error: "Email worker is not configured." }, { status: 503 });
        }
        if (request.headers.get("authorization") !== `Bearer ${secret}`) {
          return Response.json({ error: "Unauthorized." }, { status: 401 });
        }
        try {
          const { processBookingEmailOutbox } = await import("@/lib/email-outbox.server");
          return Response.json(await processBookingEmailOutbox());
        } catch (error) {
          console.error("Booking email queue processing failed:", error);
          return Response.json(
            { error: "Unable to process booking email queue." },
            { status: 500 },
          );
        }
      },
    },
  },
});
