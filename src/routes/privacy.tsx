import { createFileRoute } from "@tanstack/react-router";
import { LegalDraftPage } from "@/components/site/LegalDraftPage";
import { BRAND_NAME } from "@/lib/brand";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/privacy")({
  head: () =>
    pageHead(
      "/privacy",
      `Privacy — ${BRAND_NAME}`,
      "Privacy notice draft for review before launch.",
    ),
  component: () => <LegalDraftPage kind="privacy" />,
});
