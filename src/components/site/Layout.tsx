import { Link } from "@tanstack/react-router";
import { useState, type ReactNode } from "react";
import { Menu, X, MessageCircle, Mail, Instagram } from "lucide-react";
import { useI18n, LANGS } from "@/lib/i18n";
import { CONTACT } from "@/lib/content";
import { BRAND_NAME } from "@/lib/brand";
import { HeaderLogo, FooterLogo, StarDivider } from "./Brand";

const navItems = [
  { to: "/", key: "home" },
  { to: "/experiences", key: "experiences" },
  { to: "/families", key: "families" },
  { to: "/about", key: "about" },
  { to: "/contact", key: "contact" },
] as const;

function LangSwitch() {
  const { lang, setLang, t } = useI18n();
  return (
    <div role="group" aria-label={t.language} className="flex rounded-full border border-border p-0.5 text-xs font-semibold">
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
        <Link to="/" className="flex items-center" onClick={() => setOpen(false)} aria-label={BRAND_NAME}>
          <HeaderLogo />
        </Link>
        <nav aria-label="Main" className="hidden items-center gap-7 lg:flex">
          {navItems.map((n) => (
            <Link key={n.to} to={n.to} className="text-sm font-medium text-foreground/80 hover:text-primary" activeProps={{ className: "text-primary" }} activeOptions={{ exact: true }}>
              {t.nav[n.key]}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <LangSwitch />
          <Link to="/booking" className="btn btn-primary hidden !py-2.5 sm:inline-flex">{t.nav.book}</Link>
          <button type="button" className="rounded-md p-2 lg:hidden" aria-label="Menu" aria-expanded={open} onClick={() => setOpen(!open)}>
            {open ? <X /> : <Menu />}
          </button>
        </div>
      </div>
      {open && (
        <nav aria-label="Mobile" className="border-t border-border bg-background px-5 py-4 lg:hidden">
          <ul className="flex flex-col gap-1">
            {navItems.map((n) => (
              <li key={n.to}>
                <Link to={n.to} onClick={() => setOpen(false)} className="block rounded-md px-2 py-3 font-display text-2xl text-foreground hover:bg-muted">{t.nav[n.key]}</Link>
              </li>
            ))}
          </ul>
          <Link to="/booking" onClick={() => setOpen(false)} className="btn btn-primary mt-4 w-full">{t.nav.book}</Link>
        </nav>
      )}
    </header>
  );
}

function Footer() {
  const { t } = useI18n();
  return (
    <footer className="bg-ink text-ink-foreground">
      <div className="zellige-bg">
        <div className="mx-auto grid max-w-7xl gap-10 px-5 py-14 md:grid-cols-3">
          <div>
            <div className="flex items-center">
              <FooterLogo />
            </div>
            <p className="mt-4 max-w-xs text-ink-foreground/75">{t.footer.tagline}</p>
          </div>
          <ul className="space-y-2">
            {navItems.map((n) => (
              <li key={n.to}><Link to={n.to} className="hover:text-gold">{t.nav[n.key]}</Link></li>
            ))}
            <li><Link to="/booking" className="hover:text-gold">{t.nav.book}</Link></li>
          </ul>
          <ul className="space-y-3">
            <li><a className="inline-flex items-center gap-2 hover:text-gold" href={`https://wa.me/${CONTACT.whatsapp}`}><MessageCircle className="h-4 w-4" />WhatsApp</a></li>
            <li><a className="inline-flex items-center gap-2 hover:text-gold" href={`mailto:${CONTACT.email}`}><Mail className="h-4 w-4" />{CONTACT.email}</a></li>
            <li><a className="inline-flex items-center gap-2 hover:text-gold" href={CONTACT.instagram}><Instagram className="h-4 w-4" />Instagram</a></li>
          </ul>
        </div>
        <StarDivider />
        <p className="py-6 text-center text-xs text-ink-foreground/60">© {new Date().getFullYear()} {BRAND_NAME}. {t.footer.rights}</p>
      </div>
    </footer>
  );
}

function WhatsAppFab() {
  const { t } = useI18n();
  return (
    <a
      href={`https://wa.me/${CONTACT.whatsapp}`}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={t.whatsappLabel}
      className="fixed bottom-5 end-5 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-whatsapp text-primary-foreground shadow-xl transition-transform hover:scale-105"
    >
      <MessageCircle className="h-7 w-7" />
    </a>
  );
}

export function SiteLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:start-4 focus:top-4 focus:z-50 focus:bg-background focus:p-2">Skip to content</a>
      <Header />
      <main id="main" className="flex-1">{children}</main>
      <Footer />
      <WhatsAppFab />
    </div>
  );
}
