import { createFileRoute } from "@tanstack/react-router";
import { LegalDraftPage } from "@/components/site/LegalDraftPage";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/terms")({
  head: () => pageHead("/terms", "en"),
  component: TermsPage,
});

export function TermsPage() {
  return <LegalDraftPage kind="terms" />;
}
