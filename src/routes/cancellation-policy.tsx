import { createFileRoute } from "@tanstack/react-router";
import { SectionHead } from "@/components/site/Brand";
import { BRAND_NAME } from "@/lib/brand";
import { pageHead } from "@/lib/seo";
import { useI18n } from "@/lib/i18n";
import { getPublicCancellationTiers } from "@/lib/booking.functions";
import { formatCancellationTiers } from "@/lib/booking-pricing";

export const Route = createFileRoute("/cancellation-policy")({
  loader: () => getPublicCancellationTiers(),
  head: () =>
    pageHead(
      "/cancellation-policy",
      `Cancellation policy — ${BRAND_NAME}`,
      "Cancellation terms configured by the host.",
    ),
  component: CancellationPolicyPage,
});

function CancellationPolicyPage() {
  const tiers = Route.useLoaderData();
  const { t, lang } = useI18n();
  return (
    <article className="mx-auto max-w-4xl px-5 py-16">
      <SectionHead eyebrow={t.booking.cancellationPolicy} title={t.booking.cancellationPolicy} />
      {tiers.length > 0 ? (
        <ul className="mt-8 list-disc space-y-3 ps-5">
          {formatCancellationTiers(tiers, lang).map((tier) => (
            <li key={tier}>{tier}</li>
          ))}
        </ul>
      ) : (
        <p role="status" className="mt-6 text-muted-foreground">
          {t.booking.policyMissing}
        </p>
      )}
    </article>
  );
}
