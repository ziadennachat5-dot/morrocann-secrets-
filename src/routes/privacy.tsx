import { createFileRoute } from "@tanstack/react-router";
import { LegalDraftPage } from "@/components/site/LegalDraftPage";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/privacy")({
  head: () => pageHead("/privacy", "en"),
  component: PrivacyPage,
});

export function PrivacyPage() {
  return <LegalDraftPage kind="privacy" />;
}
