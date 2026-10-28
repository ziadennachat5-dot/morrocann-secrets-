import { createFileRoute } from "@tanstack/react-router";
import { PrivateEventsPage } from "@/routes/private-events";
import { pageHead } from "@/lib/seo";
import type { Lang } from "@/lib/i18n";

export const Route = createFileRoute("/$lang/private-events")({
  head: ({ params }) => pageHead("/private-events", params.lang as Lang),
  component: PrivateEventsPage,
});
