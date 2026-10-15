import { createFileRoute } from "@tanstack/react-router";
import { useI18n } from "@/lib/i18n";
import { families } from "@/lib/content";
import { pageHead } from "@/lib/seo";
import { SectionHead } from "@/components/site/Brand";
import { FamilyCard } from "@/components/site/Cards";

export const Route = createFileRoute("/families")({
  head: () => pageHead("/families", "Our Families — Moroccan Secrets", "Meet the Marrakesh families who host you: their neighbourhoods, languages, signature dishes and stories."),
  component: FamiliesPage,
});

function FamiliesPage() {
  const { t } = useI18n();
  return (
    <div className="zellige-bg">
      <div className="mx-auto max-w-7xl px-5 py-20">
        <SectionHead eyebrow={t.fam.eyebrow} title={t.fam.title} sub={t.fam.subtitle} />
        <div className="mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {families.map((f, i) => (
            <div key={f.id} className={i === 1 ? "lg:mt-16" : ""}><FamilyCard f={f} /></div>
          ))}
        </div>
      </div>
    </div>
  );
}
