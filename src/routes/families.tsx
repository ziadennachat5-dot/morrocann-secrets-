import { createFileRoute } from "@tanstack/react-router";
import { useI18n } from "@/lib/i18n";
import { pageHead } from "@/lib/seo";
import { BRAND_NAME } from "@/lib/brand";
import { SectionHead } from "@/components/site/Brand";
import { FamilyCard } from "@/components/site/Cards";
import { PhotoGallery } from "@/components/site/PhotoGallery";
import { getPublishedFamilies } from "@/lib/public-content.functions";

export const Route = createFileRoute("/families")({
  loader: () => getPublishedFamilies(),
  head: () =>
    pageHead("/families", `Our Families — ${BRAND_NAME}`, "Host profiles published by the host."),
  component: FamiliesPage,
});

function FamiliesPage() {
  const families = Route.useLoaderData();
  const { t } = useI18n();
  return (
    <div className="zellige-bg">
      <div className="mx-auto max-w-7xl px-5 py-20">
        <SectionHead eyebrow={t.fam.eyebrow} title={t.fam.title} sub={t.fam.subtitle} />
        <div className="mt-14">
          <PhotoGallery />
        </div>
        {families.length > 0 ? (
          <div className="mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {families.map((family) => (
              <FamilyCard key={family.id} family={family} />
            ))}
          </div>
        ) : (
          <p className="mt-10 text-muted-foreground">{t.fam.empty}</p>
        )}
      </div>
    </div>
  );
}
