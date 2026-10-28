import { createFileRoute } from "@tanstack/react-router";
import { PrivacyPage } from "@/routes/privacy";
import { pageHead } from "@/lib/seo";
import type { Lang } from "@/lib/i18n";

export const Route = createFileRoute("/$lang/privacy")({
  head: ({ params }) => pageHead("/privacy", params.lang as Lang),
  component: PrivacyPage,
});
