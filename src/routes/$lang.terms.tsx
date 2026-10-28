import { createFileRoute } from "@tanstack/react-router";
import { TermsPage } from "@/routes/terms";
import { pageHead } from "@/lib/seo";
import type { Lang } from "@/lib/i18n";

export const Route = createFileRoute("/$lang/terms")({
  head: ({ params }) => pageHead("/terms", params.lang as Lang),
  component: TermsPage,
});
