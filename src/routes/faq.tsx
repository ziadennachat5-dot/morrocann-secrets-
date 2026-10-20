import { createFileRoute } from "@tanstack/react-router";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { SectionHead } from "@/components/site/Brand";
import { useI18n } from "@/lib/i18n";
import { getPublishedFaqs } from "@/lib/public-content.functions";
import { pageHead } from "@/lib/seo";
import { BRAND_NAME } from "@/lib/brand";

export const Route = createFileRoute("/faq")({
  loader: () => getPublishedFaqs(),
  head: () =>
    pageHead("/faq", `FAQ — ${BRAND_NAME}`, "Frequently asked questions published by the host."),
  component: FaqPage,
});

function FaqPage() {
  const faqs = Route.useLoaderData();
  const { t, lang } = useI18n();
  const groups = new Map<string, typeof faqs>();
  for (const faq of faqs) {
    const category = faq.category[lang];
    groups.set(category, [...(groups.get(category) ?? []), faq]);
  }
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question[lang],
      acceptedAnswer: { "@type": "Answer", text: faq.answer[lang] },
    })),
  };

  return (
    <section className="mx-auto max-w-5xl px-5 py-16">
      <SectionHead eyebrow={t.faq.eyebrow} title={t.faqPage.title} />
      {faqs.length === 0 ? (
        <p className="mt-10 text-muted-foreground">{t.inquiry.empty}</p>
      ) : (
        <div className="mt-10 space-y-10">
          {[...groups.entries()].map(([category, items]) => (
            <section key={category}>
              <h2 className="mb-4 font-display text-3xl">{category}</h2>
              <Accordion type="single" collapsible className="w-full">
                {items.map((faq) => (
                  <AccordionItem key={faq.id} value={faq.id}>
                    <AccordionTrigger className="text-start font-display text-xl">
                      {faq.question[lang]}
                    </AccordionTrigger>
                    <AccordionContent className="whitespace-pre-line text-base text-muted-foreground">
                      {faq.answer[lang]}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </section>
          ))}
        </div>
      )}
      {faqs.length > 0 && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(structuredData).replace(/</g, "\\u003c"),
          }}
        />
      )}
    </section>
  );
}
