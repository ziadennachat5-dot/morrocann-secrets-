import { createFileRoute } from "@tanstack/react-router";
import { LegalDraftPage } from "@/components/site/LegalDraftPage";
import { BRAND_NAME } from "@/lib/brand";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/terms")({
  head: () => pageHead("/terms", `Terms — ${BRAND_NAME}`, "Terms draft for review before launch."),
  component: () => <LegalDraftPage kind="terms" />,
});
