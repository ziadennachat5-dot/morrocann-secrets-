import { createFileRoute } from "@tanstack/react-router";
import { GiftPage } from "@/routes/gift";
import { pageHead } from "@/lib/seo";
import type { Lang } from "@/lib/i18n";

export const Route = createFileRoute("/$lang/gift")({
  head: ({ params }) => pageHead("/gift", params.lang as Lang),
  component: GiftPage,
});
