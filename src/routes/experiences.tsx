import { createFileRoute } from "@tanstack/react-router";
import { useI18n } from "@/lib/i18n";
import { pageHead } from "@/lib/seo";
import { BRAND_NAME } from "@/lib/brand";
import { SectionHead, StarDivider } from "@/components/site/Brand";
import { ExperienceRow } from "@/components/site/Cards";
import { getPublishedExperiences } from "@/lib/public-content.functions";

export const Route = createFileRoute("/experiences")({
  loader: () => getPublishedExperiences(),
  head: () =>
    pageHead(
      "/experiences",
      `Experiences — ${BRAND_NAME}`,
      "Experiences and details published by the host.",
    ),
  component: ExperiencesPage,
});

function ExperiencesPage() {
  const { experiences, currency } = Route.useLoaderData();
  const { t } = useI18n();
  return (
    <div className="mx-auto max-w-6xl px-5 py-20">
      <SectionHead eyebrow={t.exp.eyebrow} title={t.exp.title} sub={t.exp.subtitle} center />
      <StarDivider className="my-14" />
      {experiences.length === 0 ? (
        <p className="text-center text-muted-foreground">{t.booking.noExperiences}</p>
      ) : (
        <div className="space-y-24">
          {experiences.map((experience, index) => (
            <ExperienceRow
              key={experience.id}
              experience={experience}
              currency={currency}
              reverse={index % 2 === 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}
