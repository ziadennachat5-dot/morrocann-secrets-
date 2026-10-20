import { useEffect, useState } from "react";
import { Quote } from "lucide-react";
import { SectionHead } from "@/components/site/Brand";
import { useI18n, type Lang } from "@/lib/i18n";
import { getTrustContent } from "@/lib/trust.functions";

type TrustContent = Awaited<ReturnType<typeof getTrustContent>>;

const goodToKnowKeys = [
  ["arrivalTime", "arrivalTime"],
  ["meetingPoint", "meetingPoint"],
  ["dress", "dress"],
  ["alcoholPolicy", "alcoholPolicy"],
  ["whatToBring", "whatToBring"],
] as const;

function localized(value: { en: string; fr: string; ar: string } | null, lang: Lang) {
  return value?.[lang] ?? "";
}

export function TrustSections() {
  const { t, lang } = useI18n();
  const [content, setContent] = useState<TrustContent | null>(null);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    getTrustContent()
      .then(setContent)
      .catch((error: unknown) => {
        console.error("Unable to load trust content:", error);
        setLoadError(true);
      });
  }, []);

  if (!content) {
    return loadError ? (
      <p role="alert" className="mx-auto max-w-6xl px-5 py-4 text-sm text-destructive">
        {t.trust.loadError}
      </p>
    ) : null;
  }

  const included = content.included?.[lang] ?? [];
  const notIncluded = content.notIncluded?.[lang] ?? [];
  const goodToKnow = goodToKnowKeys.flatMap(([key, label]) => {
    const value = localized(content.goodToKnow[key], lang);
    return value ? [{ key, label: t.trust[label], value }] : [];
  });
  const whyFamilyHome = localized(content.whyFamilyHome, lang);
  const safetyHygiene = localized(content.safetyHygiene, lang);
  const reviews = content.reviews.filter((review) => {
    const hasTranslations = ["en", "fr", "ar"].every((locale) => review.quote[locale]?.trim());
    return review.quote[lang]?.trim() && (hasTranslations || review.language === lang);
  });
  const hasIncluded = included.length > 0 || notIncluded.length > 0;
  const hasExternalReviewLinks =
    content.reviewLinks.tripAdvisor !== null || content.reviewLinks.googleBusiness !== null;

  return (
    <>
      {hasIncluded && (
        <section className="bg-sand">
          <div className="mx-auto grid max-w-6xl gap-8 px-5 py-20 md:grid-cols-2">
            {included.length > 0 && (
              <div>
                <SectionHead eyebrow={t.trust.eyebrow} title={t.trust.included} />
                <ul className="mt-6 list-disc space-y-2 ps-5">
                  {included.map((item, index) => (
                    <li key={`${index}-${item}`}>{item}</li>
                  ))}
                </ul>
              </div>
            )}
            {notIncluded.length > 0 && (
              <div>
                <SectionHead eyebrow={t.trust.eyebrow} title={t.trust.notIncluded} />
                <ul className="mt-6 list-disc space-y-2 ps-5">
                  {notIncluded.map((item, index) => (
                    <li key={`${index}-${item}`}>{item}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </section>
      )}
      {goodToKnow.length > 0 && (
        <section className="mx-auto max-w-6xl px-5 py-20">
          <SectionHead eyebrow={t.trust.eyebrow} title={t.trust.goodToKnow} />
          <dl className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {goodToKnow.map(({ key, label, value }) => (
              <div key={key} className="rounded-xl border border-border bg-card p-5">
                <dt className="font-semibold">{label}</dt>
                <dd className="mt-2 whitespace-pre-line text-muted-foreground">{value}</dd>
              </div>
            ))}
          </dl>
        </section>
      )}
      {whyFamilyHome && (
        <section className="bg-card">
          <div className="mx-auto max-w-4xl px-5 py-20 text-center">
            <SectionHead eyebrow={t.trust.eyebrow} title={t.trust.whyFamilyHome} center />
            <p className="mt-6 whitespace-pre-line text-lg text-muted-foreground">
              {whyFamilyHome}
            </p>
          </div>
        </section>
      )}
      {safetyHygiene && (
        <section className="mx-auto max-w-4xl px-5 py-20">
          <SectionHead eyebrow={t.trust.eyebrow} title={t.trust.safetyHygiene} center />
          <p className="mt-6 whitespace-pre-line text-center text-muted-foreground">
            {safetyHygiene}
          </p>
        </section>
      )}
      {reviews.length > 0 && (
        <section className="mx-auto max-w-6xl px-5 py-20">
          <SectionHead eyebrow={t.reviews.eyebrow} title={t.reviews.title} center />
          <div className="mt-10 grid gap-6 md:grid-cols-2">
            {reviews.map((review) => (
              <figure key={review.id} className="rounded-xl border border-border bg-card p-6">
                <Quote className="h-7 w-7 text-gold" aria-hidden />
                <blockquote className="mt-4 text-lg">“{review.quote[lang]}”</blockquote>
                <figcaption className="mt-4 text-sm text-muted-foreground">
                  — {review.author}
                  {review.origin ? `, ${review.origin}` : ""}
                </figcaption>
              </figure>
            ))}
          </div>
        </section>
      )}
      {hasExternalReviewLinks && (
        <nav
          aria-label={t.trust.externalReviews}
          className="mx-auto flex max-w-6xl flex-wrap justify-center gap-4 px-5 pb-16"
        >
          {content.reviewLinks.tripAdvisor && (
            <a
              className="btn btn-ghost text-primary"
              href={content.reviewLinks.tripAdvisor}
              target="_blank"
              rel="noopener noreferrer"
            >
              {t.trust.tripAdvisor}
            </a>
          )}
          {content.reviewLinks.googleBusiness && (
            <a
              className="btn btn-ghost text-primary"
              href={content.reviewLinks.googleBusiness}
              target="_blank"
              rel="noopener noreferrer"
            >
              {t.trust.googleReviews}
            </a>
          )}
        </nav>
      )}
    </>
  );
}
