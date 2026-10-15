import { createFileRoute } from "@tanstack/react-router";
import { useI18n } from "@/lib/i18n";
import { experiences } from "@/lib/content";
import { pageHead } from "@/lib/seo";
import { SectionHead, StarDivider } from "@/components/site/Brand";
import { ExperienceRow } from "@/components/site/Cards";

export const Route = createFileRoute("/experiences")({
  head: () => pageHead("/experiences", "Experiences — Moroccan Secrets", "Family dinners, cooking workshops and Friday couscous in Marrakesh riads. Prices, durations and what's included."),
  component: ExperiencesPage,
});

function ExperiencesPage() {
  const { t } = useI18n();
  return (
    <div className="mx-auto max-w-6xl px-5 py-20">
      <SectionHead eyebrow={t.exp.eyebrow} title={t.exp.title} sub={t.exp.subtitle} center />
      <StarDivider className="my-14" />
      <div className="space-y-24">
        {experiences.map((e, i) => <ExperienceRow key={e.id} e={e} reverse={i % 2 === 1} />)}
      </div>
    </div>
  );
}
