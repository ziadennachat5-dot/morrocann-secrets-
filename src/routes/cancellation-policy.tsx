import { createFileRoute } from "@tanstack/react-router";
import { LegalDraftPage } from "@/components/site/LegalDraftPage";
import { BRAND_NAME } from "@/lib/brand";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/cancellation-policy")({
  head: () =>
    pageHead(
      "/cancellation-policy",
      `Cancellation policy — ${BRAND_NAME}`,
      "Cancellation policy draft for review before launch.",
    ),
  component: () => <LegalDraftPage kind="cancellation" />,
});
