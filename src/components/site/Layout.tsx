import { Link, useLocation } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import { Menu, X, MessageCircle, Mail, Instagram } from "lucide-react";
import { useI18n, LANGS } from "@/lib/i18n";
import { BRAND_NAME } from "@/lib/brand";
import { HeaderLogo, FooterLogo, StarDivider } from "./Brand";
import { getPublicContactLinks } from "@/lib/public-contact.functions";
import { CookieConsent, CookieSettingsButton } from "./CookieConsent";
import { Button } from "@/components/ui/button";
import { requestNewsletterSubscription } from "@/lib/newsletter.functions";

type PublicContactLinks = Awaited<ReturnType<typeof getPublicContactLinks>>;

function useContactLinks() {
  const [links, setLinks] = useState<PublicContactLinks | null>(null);
  const [error, setError] = useState(false);
  useEffect(() => {
    getPublicContactLinks()
      .then(setLinks)
      .catch((loadError: unknown) => {
        console.error("Unable to load public contact links:", loadError);
        setError(true);
      });
  }, []);
  return { links, error };
}

const navItems = [
  { to: "/", key: "home" },
  { to: "/experiences", key: "experiences" },
  { to: "/families", key: "families" },
  { to: "/faq", key: "faq" },
  { to: "/blog", key: "blog" },
] as const;

function LangSwitch() {
  const { lang, setLang, t } = useI18n();
  return (
    <div
      role="group"
      aria-label={t.language}
      className="flex rounded-full border border-border p-0.5 text-xs font-semibold"
    >
      {LANGS.map((l) => (
        <button
          key={l}
          type="button"
          onClick={() => setLang(l)}
          aria-pressed={lang === l}
          className={`rounded-full px-2.5 py-1 uppercase transition-colors ${lang === l ? "bg-primary text-primary-foreground" : "text-foreground hover:bg-muted"}`}
        >
          {l === "ar" ? "ع" : l}
        </button>
      ))}
    </div>
  );
}

function Header() {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-3">
        <Link
          to="/"
          className="flex items-center"
          onClick={() => setOpen(false)}
          aria-label={BRAND_NAME}
        >
          <HeaderLogo />
        </Link>
        <nav aria-label="Main" className="hidden items-center gap-7 lg:flex">
          {navItems.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              className="text-sm font-medium text-foreground/80 hover:text-primary"
              activeProps={{ className: "text-primary" }}
              activeOptions={{ exact: true }}
            >
              {t.nav[n.key]}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <LangSwitch />
          <Link to="/booking" className="btn btn-primary hidden !py-2.5 sm:inline-flex">
            {t.nav.book}
          </Link>
          <button
            type="button"
            className="rounded-md p-2 lg:hidden"
            aria-label="Menu"
            aria-expanded={open}
            onClick={() => setOpen(!open)}
          >
            {open ? <X /> : <Menu />}
          </button>
        </div>
      </div>
      {open && (
        <nav
          aria-label="Mobile"
          className="border-t border-border bg-background px-5 py-4 lg:hidden"
        >
          <ul className="flex flex-col gap-1">
            {navItems.map((n) => (
              <li key={n.to}>
                <Link
                  to={n.to}
                  onClick={() => setOpen(false)}
                  className="block rounded-md px-2 py-3 font-display text-2xl text-foreground hover:bg-muted"
                >
                  {t.nav[n.key]}
                </Link>
              </li>
            ))}
          </ul>
          <Link
            to="/booking"
            onClick={() => setOpen(false)}
            className="btn btn-primary mt-4 w-full"
          >
            {t.nav.book}
          </Link>
        </nav>
      )}
    </header>
  );
}

function Footer() {
  const { t } = useI18n();
  const { links, error } = useContactLinks();
  return (
    <footer className="bg-ink text-ink-foreground">
      <div className="zellige-bg">
        <div className="mx-auto grid max-w-7xl gap-10 px-5 py-14 md:grid-cols-4">
          <div>
            <div className="flex items-center">
              <FooterLogo />
            </div>
            <p className="mt-4 max-w-xs text-ink-foreground/75">{t.footer.tagline}</p>
          </div>
          <ul className="space-y-2">
            {navItems.map((n) => (
              <li key={n.to}>
                <Link to={n.to} className="hover:text-gold">
                  {t.nav[n.key]}
                </Link>
              </li>
            ))}
            <li>
              <Link to="/booking" className="hover:text-gold">
                {t.nav.book}
              </Link>
            </li>
            <li>
              <Link to="/private-events" className="hover:text-gold">
                {t.inquiry.privateEvents.title}
              </Link>
            </li>
            <li>
              <Link to="/gift" className="hover:text-gold">
                {t.inquiry.gift.title}
              </Link>
            </li>
            <li>
              <Link to="/partners" className="hover:text-gold">
                {t.inquiry.partners.title}
              </Link>
            </li>
            <li>
              <Link to="/privacy" className="hover:text-gold">
                {t.legal.privacyTitle}
              </Link>
            </li>
            <li>
              <Link to="/terms" className="hover:text-gold">
                {t.legal.termsTitle}
              </Link>
            </li>
            <li>
              <Link to="/cancellation-policy" className="hover:text-gold">
                {t.legal.cancellationTitle}
              </Link>
            </li>
          </ul>
          <ul className="space-y-3">
            {error && <li role="alert">{t.contact.unavailable}</li>}
            {links?.whatsapp && (
              <li>
                <a
                  className="inline-flex items-center gap-2 hover:text-gold"
                  href={`https://wa.me/${links.whatsapp}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  <MessageCircle className="h-4 w-4" />
                  WhatsApp
                </a>
              </li>
            )}
            {links?.email && (
              <li>
                <a
                  className="inline-flex items-center gap-2 hover:text-gold"
                  href={`mailto:${links.email}`}
                >
                  <Mail className="h-4 w-4" />
                  {links.email}
                </a>
              </li>
            )}
            {links?.instagram && (
              <li>
                <a
                  className="inline-flex items-center gap-2 hover:text-gold"
                  href={links.instagram}
                  target="_blank"
                  rel="noreferrer"
                >
                  <Instagram className="h-4 w-4" />
                  Instagram
                </a>
              </li>
            )}
            <li>
              <CookieSettingsButton />
            </li>
          </ul>
          <NewsletterSignup />
        </div>
        <StarDivider />
        <p className="py-6 text-center text-xs text-ink-foreground/60">
          © {new Date().getFullYear()} {BRAND_NAME}. {t.footer.rights}
        </p>
      </div>
    </footer>
  );
}

function NewsletterSignup() {
  const { t, lang } = useI18n();
  const [email, setEmail] = useState("");
  const [honeypot, setHoneypot] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "submitted" | "error">("idle");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("submitting");
    try {
      await requestNewsletterSubscription({ data: { email, language: lang, honeypot } });
      setStatus("submitted");
      setEmail("");
    } catch (error) {
      console.error("Newsletter subscription request failed:", error);
      setStatus("error");
    }
  }

  return (
    <section aria-labelledby="newsletter-heading">
      <h2 id="newsletter-heading" className="font-display text-2xl text-gold">
        {t.consent.newsletterTitle}
      </h2>
      <p className="mt-2 text-sm text-ink-foreground/75">{t.consent.newsletterBody}</p>
      <form className="mt-4 space-y-3" onSubmit={(event) => void submit(event)}>
        <label className="block text-sm">
          {t.consent.email}
          <input
            className="mt-1 w-full rounded-md border border-ink-foreground/30 bg-background px-3 py-2 text-foreground"
            type="email"
            autoComplete="email"
            maxLength={255}
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </label>
        <label aria-hidden="true" className="absolute -left-[10000px] h-px w-px overflow-hidden">
          Leave this field empty
          <input
            tabIndex={-1}
            autoComplete="off"
            value={honeypot}
            onChange={(event) => setHoneypot(event.target.value)}
          />
        </label>
        <Button type="submit" variant="secondary" size="sm" disabled={status === "submitting"}>
          {status === "submitting" ? "…" : t.consent.subscribe}
        </Button>
        <p role="status" aria-live="polite" className="text-sm">
          {status === "submitted" && t.consent.subscriptionPending}
          {status === "error" && t.consent.subscriptionError}
        </p>
      </form>
    </section>
  );
}

function WhatsAppFab() {
  const { t } = useI18n();
  const { links } = useContactLinks();
  if (!links?.whatsapp) return null;
  return (
    <a
      href={`https://wa.me/${links.whatsapp}`}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={t.whatsappLabel}
      className="fixed bottom-20 end-5 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-whatsapp text-primary-foreground shadow-xl transition-transform hover:scale-105 sm:bottom-5"
    >
      <MessageCircle className="h-7 w-7" />
    </a>
  );
}

function MobileBookingBar() {
  const { t } = useI18n();
  const pathname = useLocation({ select: (location) => location.pathname });
  if (pathname === "/booking") return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 p-3 shadow-lg backdrop-blur sm:hidden">
      <Link to="/booking" className="btn btn-primary w-full">
        {t.nav.book}
      </Link>
    </div>
  );
}

export function SiteLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:start-4 focus:top-4 focus:z-50 focus:bg-background focus:p-2"
      >
        Skip to content
      </a>
      <Header />
      <main id="main" className="flex-1">
        {children}
      </main>
      <Footer />
      <WhatsAppFab />
      <MobileBookingBar />
      <CookieConsent />
    </div>
  );
}
