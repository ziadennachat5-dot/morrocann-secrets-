import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { z } from "zod";
import { useI18n, type Lang } from "@/lib/i18n";
import { BRAND_NAME } from "@/lib/brand";
import { pageHead } from "@/lib/seo";
import { confirmNewsletterSubscription } from "@/lib/newsletter.functions";

const searchSchema = z.object({ lang: z.enum(["en", "fr", "ar"]).optional() });

export const Route = createFileRoute("/newsletter/confirm")({
  validateSearch: searchSchema,
  head: () => {
    const metadata = pageHead(
      "/newsletter/confirm",
      `Newsletter confirmation — ${BRAND_NAME}`,
      "Confirm your email subscription.",
    );
    return {
      ...metadata,
      meta: [...metadata.meta, { name: "robots", content: "noindex,nofollow" }],
    };
  },
  component: NewsletterConfirmationPage,
});

function NewsletterConfirmationPage() {
  const search = Route.useSearch();
  const { t } = useI18n();
  const language: Lang = search.lang ?? "en";
  const [status, setStatus] = useState<"loading" | "confirmed" | "invalid">("loading");
  const attempted = useRef(false);

  useEffect(() => {
    if (attempted.current) return;
    attempted.current = true;
    const token = new URLSearchParams(window.location.hash.slice(1)).get("token");
    if (!token) {
      setStatus("invalid");
      return;
    }
    confirmNewsletterSubscription({ data: { token } })
      .then((result) => setStatus(result.confirmed ? "confirmed" : "invalid"))
      .catch((error: unknown) => {
        console.error("Newsletter confirmation failed:", error);
        setStatus("invalid");
      });
  }, []);

  return (
    <main
      lang={language}
      dir={language === "ar" ? "rtl" : "ltr"}
      className="mx-auto max-w-2xl px-4 py-20"
    >
      <section className="rounded-2xl border bg-card p-8 text-center shadow-sm">
        <h1 className="font-display text-4xl text-primary">{t.consent.newsletterTitle}</h1>
        {status === "loading" ? (
          <p role="status" className="mt-4 text-muted-foreground">
            …
          </p>
        ) : (
          <p
            role={status === "invalid" ? "alert" : "status"}
            className="mt-4 text-muted-foreground"
          >
            {status === "confirmed"
              ? t.consent.subscriptionConfirmed
              : t.consent.subscriptionInvalid}
          </p>
        )}
        <Link to="/" className="btn btn-primary mt-6">
          {t.errorPages.home}
        </Link>
      </section>
    </main>
  );
}
