import { SectionHead } from "@/components/site/Brand";
import { useI18n } from "@/lib/i18n";
import { legalDrafts } from "@/lib/legal-drafts";

type LegalKind = keyof typeof legalDrafts;

const titleKeys: Record<LegalKind, "privacyTitle" | "termsTitle" | "cancellationTitle"> = {
  privacy: "privacyTitle",
  terms: "termsTitle",
  cancellation: "cancellationTitle",
};

export function LegalDraftPage({ kind }: { kind: LegalKind }) {
  const { t, lang } = useI18n();
  const draft = legalDrafts[kind];
  return (
    <article className="mx-auto max-w-4xl px-5 py-16">
      <div
        role="note"
        className="mb-8 rounded-lg border border-gold bg-sand p-4 text-sm font-semibold text-ink"
      >
        {t.legal.draftBanner}
      </div>
      <SectionHead eyebrow={t.legal.draftBanner} title={t.legal[titleKeys[kind]]} />
      <p className="mt-5 rounded-xl border border-border bg-card p-5 text-sm text-muted-foreground">
        {t.legal.professionalReview}
      </p>
      <div className="mt-10 space-y-8">
        {draft.sections.map((section) => (
          <section key={section.heading.en}>
            <h2 className="font-display text-2xl">{section.heading[lang]}</h2>
            <p className="mt-3 whitespace-pre-line text-muted-foreground">{section.body[lang]}</p>
          </section>
        ))}
      </div>
    </article>
  );
}
