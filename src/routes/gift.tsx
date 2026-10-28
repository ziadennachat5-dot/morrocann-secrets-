import { createFileRoute } from "@tanstack/react-router";
import { InquiryForm } from "@/components/site/InquiryForm";
import { SectionHead } from "@/components/site/Brand";
import { useI18n } from "@/lib/i18n";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/gift")({
  head: () => pageHead("/gift", "en"),
  component: GiftPage,
});

export function GiftPage() {
  const { t } = useI18n();
  return (
    <section className="mx-auto max-w-3xl px-5 py-16">
      <SectionHead
        eyebrow={t.inquiry.eyebrow}
        title={t.inquiry.gift.title}
        sub={t.inquiry.gift.description}
      />
      <InquiryForm kind="gift" />
    </section>
  );
}
