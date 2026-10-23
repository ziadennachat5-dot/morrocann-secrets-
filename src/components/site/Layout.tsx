import { Link, useLocation } from "@tanstack/react-router";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { Menu, X, MessageCircle } from "lucide-react";
import { useI18n, LANGS } from "@/lib/i18n";
import { BRAND_NAME } from "@/lib/brand";
import { HeaderLogo, HeaderLogoLight, FooterLogo, StarDivider, OrnamentDivider, ZelligeClipDefs } from "./Brand";
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
  { href: "/#how", label: { en: "How it works", fr: "Comment ça marche", ar: "كيف تسير الأمسية" } },
  { href: "/#booking", label: { en: "Book", fr: "Réserver", ar: "احجز" }, isBook: true },
];

function LangSwitch() {
  const { lang, setLang, t } = useI18n();
  return (
    <div
      role="group"
      aria-label={t.language}
      className="flex shrink-0 items-center rounded-full border border-border/80 bg-offwhite p-0.5 text-xs font-medium"
    >
      {LANGS.map((l) => (
        <button
          key={l}
          type="button"
          onClick={() => setLang(l)}
          aria-pressed={lang === l}
          className={`flex h-[36px] min-w-[34px] sm:min-w-[38px] items-center justify-center rounded-full px-2 uppercase transition-colors text-[12px] font-semibold shrink-0 cursor-pointer ${
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
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const sectionIds = ["concept", "menu", "photos", "how", "booking"];
    const handleScroll = () => {
      setScrolled(window.scrollY > 8);

      const total = document.documentElement.scrollHeight - window.innerHeight;
      const progress = total > 0 ? (window.scrollY / total) * 100 : 0;
      setScrollProgress(Math.min(100, Math.max(0, progress)));

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

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

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
    <>
      {/* Thin red scroll-progress line at the very top */}
      <div
        className="scroll-progress-line"
        style={{ width: `${scrollProgress}%` }}
        aria-hidden="true"
      />

      <header
        className={`sticky top-0 z-50 bg-white/85 backdrop-blur-md transition-shadow duration-300 h-[72px] flex flex-col justify-center ${
          scrolled ? "header-scrolled border-b border-stone-200/50" : "border-b border-stone-200/30"
        }`}
      >
        <div className="mx-auto flex w-full max-w-[1320px] items-center justify-between gap-2 sm:gap-4 px-4 sm:px-6 lg:px-12">
          {/* Logo left (fully visible) */}
          <a
            href="/"
            className="flex items-center shrink-0 min-w-0"
            onClick={() => setOpen(false)}
            aria-label={BRAND_NAME}
          >
            <HeaderLogo className="h-9 sm:h-11 w-auto object-contain" />
          </a>

          {/* Desktop Nav centered with animated underline */}
          <nav
            aria-label="Main"
            className="hidden lg:flex flex-1 items-center justify-center gap-10"
          >
            {siteNavItems
              .filter((item) => !item.isBook)
              .map((item) => {
                const isActive = activeSection === item.href.replace("/#", "");
                return (
                  <a
                    key={item.href}
                    href={item.href}
                    className={`nav-link text-[0.9375rem] ${
                      isActive ? "active text-primary font-semibold" : ""
                    }`}
                  >
                    <span>{item.label[lang]}</span>
                  </a>
                );
              })}
          </nav>

          {/* Right: EN/FR/AR switcher and solid burgundy Book button */}
          <div className="flex items-center gap-2 sm:gap-3.5 shrink-0">
            <LangSwitch />
            <a
              href="/#booking"
              className="hidden lg:inline-flex items-center justify-center h-11 min-h-[44px] px-7 rounded-full bg-primary text-white text-sm font-bold shadow-xs hover:bg-primary-dark active:scale-[0.98] transition-all duration-200"
            >
              {t.nav.book}
            </a>

            {/* Mobile menu trigger */}
            <button
              type="button"
              className="flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-full text-foreground hover:bg-stone-100 lg:hidden transition-colors shrink-0"
              aria-label={open ? "Close menu" : "Open menu"}
              aria-expanded={open}
              aria-controls="mobile-nav"
              onClick={() => setOpen(!open)}
            >
              {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </header>

      {/* Full-screen deep-red phone menu */}
      {open && (
        <div
          id="mobile-nav"
          role="dialog"
          aria-modal="true"
          aria-label="Mobile Navigation"
          className="fixed inset-0 z-[70] bg-[#4A0E0E] text-white flex flex-col justify-between p-6 sm:p-8 lg:hidden animate-in fade-in duration-200"
        >
          {/* Top row: white logo & close button */}
          <div className="flex items-center justify-between">
            <a href="/" onClick={() => setOpen(false)} aria-label={BRAND_NAME}>
              <HeaderLogoLight className="h-10 w-auto" />
            </a>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
              aria-label="Close menu"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Center: huge serif links */}
          <nav className="flex flex-col items-center justify-center gap-6 my-auto text-center">
            {siteNavItems
              .filter((item) => !item.isBook)
              .map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="font-display text-4xl sm:text-5xl font-semibold text-white/95 hover:text-gold transition-colors tracking-tight"
                >
                  {item.label[lang]}
                </a>
              ))}
          </nav>

          {/* Bottom: solid Book button */}
          <div className="pt-6">
            <a
              href="/#booking"
              onClick={() => setOpen(false)}
              className="btn btn-primary w-full h-[56px] text-lg font-bold shadow-lg text-center"
            >
              {t.nav.book}
            </a>
          </div>
        </div>
      )}
    </>
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
      <ZelligeClipDefs />
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
