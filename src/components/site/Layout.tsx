import { Link, useLocation } from "@tanstack/react-router";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { Menu, X, MessageCircle } from "lucide-react";
import { useI18n, LANGS } from "@/lib/i18n";
import { BRAND_NAME } from "@/lib/brand";
import { HeaderLogo, FooterLogo, StarDivider, OrnamentDivider } from "./Brand";
import { getPublicContactLinks } from "@/lib/public-contact.functions";
import { CookieConsent } from "./CookieConsent";

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

const siteNavItems = [
  { href: "/#concept", label: { en: "What is it?", fr: "Le concept", ar: "الفكرة" } },
  { href: "/#menu", label: { en: "Menu", fr: "Menu", ar: "قائمة الطعام" } },
  { href: "/#photos", label: { en: "Photos", fr: "Photos", ar: "الصور" } },
  { href: "/#booking", label: { en: "Book", fr: "Réserver", ar: "احجز" }, isBook: true },
];

function LangSwitch() {
  const { lang, setLang, t } = useI18n();
  return (
    <div
      role="group"
      aria-label={t.language}
      className="flex rounded-full border border-border/80 bg-offwhite p-0.5 text-xs font-medium"
    >
      {LANGS.map((l) => (
        <button
          key={l}
          type="button"
          onClick={() => setLang(l)}
          aria-pressed={lang === l}
          className={`rounded-full px-2 py-0.5 uppercase transition-colors text-[11px] font-semibold ${
            lang === l ? "bg-primary text-white shadow-2xs" : "text-foreground/75 hover:bg-muted"
          }`}
        >
          {l === "ar" ? (
            <span lang="ar" style={{ fontFamily: "system-ui, sans-serif" }}>
              ع
            </span>
          ) : (
            l
          )}
        </button>
      ))}
    </div>
  );
}

function Header() {
  const { lang, t } = useI18n();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState<string>("");
  const menuRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const sectionIds = ["concept", "menu", "photos", "booking", "how"];
    const handleScroll = () => {
      setScrolled(window.scrollY > 8);
      const scrollPos = window.scrollY + 130;
      for (const id of [...sectionIds].reverse()) {
        const el = document.getElementById(id);
        if (el && el.offsetTop <= scrollPos) {
          setActiveSection(id);
          return;
        }
      }
      if (window.scrollY < 200) setActiveSection("");
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu on Escape
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <header
      className={`sticky top-0 z-50 bg-white/85 backdrop-blur-md transition-shadow duration-300 ${
        scrolled ? "shadow-[0_4px_24px_-2px_rgba(36,26,26,0.07)]" : "shadow-none"
      }`}
    >
      <div className="mx-auto flex h-16 lg:h-[76px] max-w-[1240px] items-center justify-between gap-4 px-5 sm:px-10">
        {/* Logo */}
        <a
          href="/"
          className="flex items-center shrink-0 min-w-0"
          onClick={() => setOpen(false)}
          aria-label={BRAND_NAME}
        >
          <HeaderLogo />
        </a>

        {/* Desktop Nav — centred with active red dot */}
        <nav aria-label="Main" className="hidden items-center gap-9 md:flex flex-1 justify-center">
          {siteNavItems
            .filter((item) => !item.isBook)
            .map((item) => {
              const isActive = activeSection === item.href.replace("/#", "");
              return (
                <a
                  key={item.href}
                  href={item.href}
                  className={`relative text-[0.9375rem] font-medium transition-colors hover:text-primary py-1 ${
                    isActive ? "text-primary font-semibold" : "text-foreground/80"
                  }`}
                >
                  <span>{item.label[lang]}</span>
                  {isActive && (
                    <span
                      className="absolute -bottom-1 left-1/2 -translate-x-1/2 h-1.5 w-1.5 rounded-full bg-primary"
                      aria-hidden="true"
                    />
                  )}
                </a>
              );
            })}
        </nav>

        {/* Right: compact lang switch + solid burgundy Book button (>=44px high) */}
        <div className="flex items-center gap-3.5 shrink-0">
          <LangSwitch />
          <a
            href="/#booking"
            className="hidden md:inline-flex items-center justify-center h-11 min-h-[44px] px-6 rounded-full bg-primary text-white text-sm font-bold shadow-xs hover:bg-primary-dark active:scale-[0.98] transition-all duration-200"
          >
            {t.nav.book}
          </a>
          {/* Mobile hamburger */}
          <button
            type="button"
            className="rounded-full p-2 text-foreground hover:bg-muted md:hidden transition-colors"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            aria-controls="mobile-nav"
            onClick={() => setOpen(!open)}
          >
            {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile full-width panel */}
      {open && (
        <nav
          id="mobile-nav"
          ref={menuRef}
          aria-label="Mobile Navigation"
          className="border-t border-border bg-white shadow-lg md:hidden"
        >
          <ul className="flex flex-col px-5 py-4 gap-1">
            {siteNavItems.map((item) => (
              <li key={item.href}>
                <a
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={`block rounded-xl px-4 py-4 text-lg font-semibold transition-colors ${
                    item.isBook
                      ? "btn btn-primary mt-3 text-center justify-center w-full"
                      : "text-foreground hover:bg-offwhite hover:text-primary"
                  }`}
                >
                  {item.isBook ? t.nav.book : item.label[lang]}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </header>
  );
}

function ContactBand() {
  const { lang } = useI18n();
  const { links } = useContactLinks();

  const questionsTitle = {
    en: "Any questions?",
    fr: "Des questions\u00a0?",
    ar: "هل لديك سؤال؟",
  };

  const contactSubtitle = {
    en: "We are happy to answer you on WhatsApp or by email.",
    fr: "Nous serons ravis de vous répondre sur WhatsApp ou par email.",
    ar: "يسعدنا الإجابة عليك عبر واتساب أو البريد الإلكتروني.",
  };

  const whatsappHref = links?.whatsapp
    ? `https://wa.me/${links.whatsapp}`
    : "https://wa.me/212600000000";

  return (
    <section
      id="contact"
      className="scroll-mt-20 zellige-burgundy px-5 py-20 text-white sm:py-24"
      style={{ backgroundColor: "#5E1010" }}
    >
      <div className="mx-auto max-w-2xl text-center">
        <OrnamentDivider center light />
        <h2
          className="mt-6 font-display font-semibold text-white tracking-[-0.02em]"
          style={{ fontSize: "clamp(2.5rem, 5.5vw, 4.2rem)", lineHeight: 1.05 }}
        >
          {questionsTitle[lang]}
        </h2>
        <p className="mt-4 text-white/90 mx-auto" style={{ maxWidth: "50ch", lineHeight: "1.75" }}>
          {contactSubtitle[lang]}
        </p>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <a
            className="inline-flex items-center gap-2.5 rounded-full bg-white px-8 py-3.5 text-base font-bold text-primary shadow-md transition-all duration-200 hover:bg-offwhite hover:-translate-y-0.5 active:translate-y-0"
            style={{ minHeight: "52px" }}
            href={whatsappHref}
            target="_blank"
            rel="noreferrer"
          >
            <MessageCircle className="h-5 w-5 text-accent" aria-hidden />
            <span>WhatsApp</span>
          </a>
          {links?.email && (
            <a
              className="inline-flex items-center gap-2 rounded-full border-2 border-white/60 px-6 py-3 text-base font-medium text-white transition hover:bg-white/10"
              style={{ minHeight: "52px" }}
              href={`mailto:${links.email}`}
            >
              {links.email}
            </a>
          )}
        </div>
      </div>
    </section>
  );
}

function Footer() {
  const { lang, t } = useI18n();
  const { links } = useContactLinks();

  return (
    <footer
      className="text-white pb-10 sm:pb-8 border-t border-white/10"
      style={{ backgroundColor: "#5E1010" }}
    >
      <div className="mx-auto max-w-[1240px] px-5 pt-12 pb-2 sm:px-10">
        {/* Top row: logo + nav */}
        <div className="flex flex-col items-center gap-8 md:flex-row md:items-start md:justify-between">
          {/* Logo — light version, fully visible, never cropped */}
          <a href="/" aria-label={BRAND_NAME} className="flex items-center shrink-0">
            <FooterLogo className="h-20 sm:h-24 w-auto object-contain" />
          </a>

          {/* Nav links */}
          <nav
            aria-label="Footer"
            className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 md:justify-end"
          >
            {siteNavItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="text-sm font-medium text-white/80 transition-colors hover:text-gold"
              >
                {item.isBook ? t.nav.book : item.label[lang]}
              </a>
            ))}
          </nav>
        </div>

        {/* Divider */}
        <div className="my-8 h-px bg-white/10" />

        {/* Bottom row: contact + copyright */}
        <div className="flex flex-col items-center gap-4 text-center md:flex-row md:justify-between md:text-start">
          <div className="flex flex-wrap items-center justify-center gap-4 md:justify-start">
            {links?.whatsapp && (
              <a
                href={`https://wa.me/${links.whatsapp}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 text-sm text-white/70 hover:text-white transition-colors"
              >
                <MessageCircle className="h-4 w-4" aria-hidden />
                WhatsApp
              </a>
            )}
            {links?.email && (
              <a
                href={`mailto:${links.email}`}
                className="text-sm text-white/70 hover:text-white transition-colors"
              >
                {links.email}
              </a>
            )}
          </div>
          <p className="text-xs text-white/50">
            &copy; {new Date().getFullYear()} {BRAND_NAME}. {t.footer.rights}
          </p>
        </div>
      </div>
    </footer>
  );
}

function WhatsAppFab() {
  const { t } = useI18n();
  const { links } = useContactLinks();
  const whatsappHref = links?.whatsapp
    ? `https://wa.me/${links.whatsapp}`
    : "https://wa.me/212600000000";

  return (
    <a
      href={whatsappHref}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={t.whatsappLabel}
      className="whatsapp-fab fixed bottom-4 right-4 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-accent text-white shadow-lg transition-transform hover:scale-105 active:scale-95"
    >
      <MessageCircle className="h-6 w-6" />
    </a>
  );
}

function MobileBookingBar() {
  const { t } = useI18n();
  const pathname = useLocation({ select: (location) => location.pathname });
  if (pathname === "/booking" || pathname === "/") return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-white/95 p-3 shadow-lg backdrop-blur sm:hidden">
      <Link to="/booking" className="btn btn-primary w-full">
        {t.nav.book}
      </Link>
    </div>
  );
}

export function SiteLayout({ children }: { children: ReactNode }) {
  const pathname = useLocation({ select: (location) => location.pathname });
  if (pathname === "/admin") {
    return (
      <div className="min-h-screen bg-background">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:start-4 focus:top-4 focus:z-50 focus:bg-background focus:p-2"
        >
          Skip to content
        </a>
        {children}
        <CookieConsent />
      </div>
    );
  }
  return (
    <div className="flex min-h-screen flex-col bg-background">
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
      <ContactBand />
      <Footer />
      <WhatsAppFab />
      <MobileBookingBar />
      <CookieConsent />
    </div>
  );
}
