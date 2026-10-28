import { createFileRoute } from "@tanstack/react-router";
import { SectionHead } from "@/components/site/Brand";
import { pageHead } from "@/lib/seo";
import { useI18n } from "@/lib/i18n";
import { getPublicCancellationTiers } from "@/lib/booking.functions";
import { formatCancellationTiers } from "@/lib/booking-pricing";

export const Route = createFileRoute("/cancellation-policy")({
  loader: () => getPublicCancellationTiers(),
  head: () => pageHead("/cancellation-policy", "en"),
  component: function CancellationRouteComponent() {
    const tiers = Route.useLoaderData();
    return <CancellationPolicyPage tiers={tiers} />;
  },
});

export function CancellationPolicyPage({ tiers: propTiers }: { tiers?: CancellationTier[] } = {}) {
  const tiers = propTiers ?? [];
  const { t, lang } = useI18n();
  return (
    <article className="mx-auto max-w-4xl px-5 py-16">
      <SectionHead eyebrow={t.booking.cancellationPolicy} title={t.booking.cancellationPolicy} />
      {tiers.length > 0 ? (
        <div className="mt-8 space-y-4">
          <ul className="list-disc space-y-3 ps-5 text-foreground">
            {formatCancellationTiers(tiers, lang).map((tier) => (
              <li key={tier}>{tier}</li>
            ))}
          </ul>
          <p className="text-sm text-muted-foreground">
            {lang === "fr"
              ? "Remboursement intégral en cas d'annulation au moins 1 jour (24 heures) avant le début ; aucun remboursement après ce délai."
              : lang === "ar"
                ? "استرداد كامل للمبلغ عند الإلغاء قبل يوم واحد (24 ساعة) على الأقل من موعد البداية؛ ولا يُسترد أي مبلغ بعد ذلك."
                : "Full refund when cancelling at least 1 day (24 hours) before the start; no refund for cancellations made after that deadline."}
          </p>
        </div>
      ) : (
        <p className="mt-8 text-muted-foreground">
          {lang === "fr"
            ? "Annulation gratuite jusqu'à 24 heures avant le début de l'expérience."
            : lang === "ar"
              ? "إلغاء مجاني حتى 24 ساعة قبل بدء التجربة."
              : "Free cancellation up to 24 hours before the experience starts."}
        </p>
      )}
    </article>
  );
}
