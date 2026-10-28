import { createFileRoute } from "@tanstack/react-router";
import { CancellationPolicyPage } from "@/routes/cancellation-policy";
import { getPublicCancellationTiers } from "@/lib/booking.functions";
import { pageHead } from "@/lib/seo";
import type { Lang } from "@/lib/i18n";

export const Route = createFileRoute("/$lang/cancellation-policy")({
  loader: () => getPublicCancellationTiers(),
  head: ({ params }) => pageHead("/cancellation-policy", params.lang as Lang),
  component: function LocalizedCancellation() {
    const tiers = Route.useLoaderData();
    return <CancellationPolicyPage tiers={tiers} />;
  },
});
