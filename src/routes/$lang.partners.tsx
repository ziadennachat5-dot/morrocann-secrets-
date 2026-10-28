import { createFileRoute } from "@tanstack/react-router";
import { PartnersPage } from "@/routes/partners";
import { pageHead } from "@/lib/seo";
import type { Lang } from "@/lib/i18n";

export const Route = createFileRoute("/$lang/partners")({
  head: ({ params }) => pageHead("/partners", params.lang as Lang),
  component: PartnersPage,
});
