import type { Lang } from "@/lib/i18n";

export type CancellationTier = {
  hours_before: number;
  refund_percent: number;
};

export function countCapacityGuests(adults: number, children: number): number {
  return adults + children;
}

export function calculateBookingTotal(
  adultPrice: number,
  childPrice: number | null,
  adults: number,
  children: number,
): number {
  return adultPrice * adults + (childPrice ?? 0) * children;
}

export function parseCancellationTiers(value: unknown): CancellationTier[] {
  if (!Array.isArray(value)) return [];
  const tiers: CancellationTier[] = [];
  for (const item of value) {
    if (typeof item !== "object" || item === null || Array.isArray(item)) return [];
    const hoursBefore = item["hours_before"];
    const refundPercent = item["refund_percent"];
    if (
      typeof hoursBefore !== "number" ||
      !Number.isInteger(hoursBefore) ||
      hoursBefore < 0 ||
      typeof refundPercent !== "number" ||
      !Number.isInteger(refundPercent) ||
      refundPercent < 0 ||
      refundPercent > 100
    ) {
      return [];
    }
    tiers.push({ hours_before: hoursBefore, refund_percent: refundPercent });
  }
  if (
    tiers.some((tier, index) => index > 0 && tiers[index - 1]!.hours_before <= tier.hours_before)
  ) {
    return [];
  }
  return tiers;
}

export function formatCancellationTier(tier: CancellationTier, language: Lang): string {
  const { hours_before: hours, refund_percent: refund } = tier;
  const numberLocale = language === "ar" ? "ar-u-nu-arab" : language;
  const formattedHours = new Intl.NumberFormat(numberLocale).format(hours);
  const formattedRefund = new Intl.NumberFormat(numberLocale).format(refund);
  if (language === "fr") {
    return `Annulation au moins ${formattedHours} heures avant le début : remboursement de ${formattedRefund} %.`;
  }
  if (language === "ar") {
    return `الإلغاء قبل ${formattedHours} ساعة على الأقل من الموعد: استرداد ${formattedRefund}٪.`;
  }
  return `Cancel at least ${formattedHours} hours before the start for a ${formattedRefund}% refund.`;
}

export function formatCancellationTiers(tiers: CancellationTier[], language: Lang): string[] {
  return tiers.map((tier) => formatCancellationTier(tier, language));
}
