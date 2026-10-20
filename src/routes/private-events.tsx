import { createFileRoute } from "@tanstack/react-router";
import { InquiryForm } from "@/components/site/InquiryForm";
import { SectionHead } from "@/components/site/Brand";
import { useI18n } from "@/lib/i18n";
import { BRAND_NAME } from "@/lib/brand";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/private-events")({
  head: () =>
    pageHead(
      "/private-events",
      `Private events — ${BRAND_NAME}`,
      "Send an inquiry about a private event.",
    ),
  component: PrivateEventsPage,
});

function PrivateEventsPage() {
  const { t } = useI18n();
  return (
    <section className="mx-auto max-w-3xl px-5 py-16">
      <SectionHead
        eyebrow={t.inquiry.eyebrow}
        title={t.inquiry.privateEvents.title}
        sub={t.inquiry.privateEvents.description}
      />
      <InquiryForm kind="private_event" />
    </section>
  );
}
