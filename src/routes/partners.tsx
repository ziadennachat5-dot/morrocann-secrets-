import { createFileRoute } from "@tanstack/react-router";
import { InquiryForm } from "@/components/site/InquiryForm";
import { SectionHead } from "@/components/site/Brand";
import { useI18n } from "@/lib/i18n";
import { BRAND_NAME } from "@/lib/brand";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/partners")({
  head: () =>
    pageHead(
      "/partners",
      `Partners — ${BRAND_NAME}`,
      "Hotels, riads, and guides can inquire about referring guests.",
    ),
  component: PartnersPage,
});

function PartnersPage() {
  const { t } = useI18n();
  return (
    <section className="mx-auto max-w-3xl px-5 py-16">
      <SectionHead
        eyebrow={t.inquiry.eyebrow}
        title={t.inquiry.partners.title}
        sub={t.inquiry.partners.description}
      />
      <InquiryForm kind="partner" />
    </section>
  );
}
