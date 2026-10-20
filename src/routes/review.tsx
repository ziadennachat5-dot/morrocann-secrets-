import { createFileRoute } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { submitGuestReview } from "@/lib/review.functions";
import type { Lang } from "@/lib/i18n";

const translations: Record<
  Lang,
  {
    title: string;
    intro: string;
    name: string;
    origin: string;
    review: string;
    rating: string;
    submit: string;
    thanks: string;
    pending: string;
    invalid: string;
    ratings: string[];
  }
> = {
  en: {
    title: "Share your experience",
    intro: "Your review will be checked before it appears on the site.",
    name: "Name to display",
    origin: "Where are you from? (optional)",
    review: "Your review",
    rating: "Rating",
    submit: "Submit review",
    thanks: "Thank you for sharing your feedback.",
    pending: "Your review is awaiting approval.",
    invalid: "This review link is invalid or has expired. Please contact us if you need help.",
    ratings: ["1 — Poor", "2 — Fair", "3 — Good", "4 — Very good", "5 — Excellent"],
  },
  fr: {
    title: "Partagez votre expérience",
    intro: "Votre avis sera vérifié avant sa publication sur le site.",
    name: "Nom à afficher",
    origin: "Votre lieu d'origine (facultatif)",
    review: "Votre avis",
    rating: "Note",
    submit: "Envoyer l'avis",
    thanks: "Merci d'avoir partagé votre avis.",
    pending: "Votre avis est en attente de validation.",
    invalid: "Ce lien d'avis est invalide ou a expiré. Contactez-nous si vous avez besoin d'aide.",
    ratings: ["1 — Insuffisant", "2 — Moyen", "3 — Bien", "4 — Très bien", "5 — Excellent"],
  },
  ar: {
    title: "شاركنا تجربتك",
    intro: "سنراجع تقييمك قبل ظهوره على الموقع.",
    name: "الاسم المعروض",
    origin: "من أين أنت؟ (اختياري)",
    review: "تقييمك",
    rating: "التقييم",
    submit: "إرسال التقييم",
    thanks: "شكراً لمشاركة رأيك.",
    pending: "تقييمك بانتظار المراجعة.",
    invalid: "رابط التقييم غير صالح أو انتهت صلاحيته. تواصل معنا إذا احتجت إلى المساعدة.",
    ratings: ["١ — ضعيف", "٢ — مقبول", "٣ — جيد", "٤ — جيد جداً", "٥ — ممتاز"],
  },
};

const inputClass =
  "w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

export const Route = createFileRoute("/review")({
  validateSearch: z.object({
    token: z.string().max(512).optional(),
    lang: z.enum(["en", "fr", "ar"]).optional(),
  }),
  head: () => ({
    meta: [
      { title: "Guest review — Moroccan Secrets Riad" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: ReviewPage,
});

function ReviewPage() {
  const search = Route.useSearch();
  const token = search.token ?? "";
  const language: Lang = search.lang === "fr" || search.lang === "ar" ? search.lang : "en";
  const text = translations[language];
  const [author, setAuthor] = useState("");
  const [origin, setOrigin] = useState("");
  const [quote, setQuote] = useState("");
  const [rating, setRating] = useState(5);
  const [honeypot, setHoneypot] = useState("");
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      await submitGuestReview({
        data: { token, language, author, origin, quote, rating, honeypot },
      });
      setSubmitted(true);
    } catch (failure) {
      console.error("Guest review submission could not be completed:", failure);
      setError(text.invalid);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main
      lang={language}
      dir={language === "ar" ? "rtl" : "ltr"}
      className="mx-auto min-h-[60vh] max-w-2xl px-4 py-16"
    >
      <section className="rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-10">
        <p className="eyebrow">Moroccan Secrets</p>
        <h1 className="mt-3 font-display text-4xl text-primary">{text.title}</h1>
        <p className="mt-3 text-muted-foreground">{text.intro}</p>
        {!token ? (
          <p role="alert" className="mt-6 rounded bg-destructive/10 p-4">
            {text.invalid}
          </p>
        ) : submitted ? (
          <div role="status" className="mt-6 rounded bg-accent/10 p-4">
            <p className="font-semibold">{text.thanks}</p>
            <p className="mt-1 text-sm">{text.pending}</p>
          </div>
        ) : (
          <form onSubmit={(event) => void submit(event)} className="mt-6 space-y-4">
            <label className="block text-sm font-medium">
              {text.name}
              <input
                className={`${inputClass} mt-1`}
                maxLength={80}
                required
                value={author}
                onChange={(event) => setAuthor(event.target.value)}
              />
            </label>
            <label className="block text-sm font-medium">
              {text.origin}
              <input
                className={`${inputClass} mt-1`}
                maxLength={100}
                value={origin}
                onChange={(event) => setOrigin(event.target.value)}
              />
            </label>
            <label className="block text-sm font-medium">
              {text.rating}
              <select
                className={`${inputClass} mt-1`}
                value={rating}
                onChange={(event) => setRating(Number(event.target.value))}
              >
                {text.ratings.map((label, index) => (
                  <option key={label} value={index + 1}>
                    {label}
                  </option>
                ))}
              </select>
            </label>
            <label className="block text-sm font-medium">
              {text.review}
              <textarea
                className={`${inputClass} mt-1`}
                rows={5}
                minLength={10}
                maxLength={2000}
                required
                value={quote}
                onChange={(event) => setQuote(event.target.value)}
              />
            </label>
            <label
              aria-hidden="true"
              className="absolute -left-[10000px] h-px w-px overflow-hidden"
            >
              Leave this field empty
              <input
                tabIndex={-1}
                autoComplete="off"
                value={honeypot}
                onChange={(event) => setHoneypot(event.target.value)}
              />
            </label>
            {error && (
              <p role="alert" className="text-sm text-destructive">
                {error}
              </p>
            )}
            <Button type="submit" disabled={submitting}>
              {submitting ? "…" : text.submit}
            </Button>
          </form>
        )}
      </section>
    </main>
  );
}
