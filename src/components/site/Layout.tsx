import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { Link, useLocation } from "@tanstack/react-router";
import { Menu, X, MessageCircle, Mail } from "lucide-react";
import { useI18n, LANGS } from "@/lib/i18n";
import { BRAND_NAME } from "@/lib/brand";
import {
  HeaderLogo,
  HeaderLogoLight,
  FooterLogo,
  StarDivider,
  OrnamentDivider,
  ZelligeClipDefs,
  ZelligeLineArtStar,
} from "./Brand";
import { getPublicContactLinks } from "@/lib/public-contact.functions";
import { CookieConsent } from "./CookieConsent";

type PublicContactLinks = Awaited<ReturnType<typeof getPublicContactLinks>>;

const GalleryContext = createContext<{ hasGallery: boolean; setHasGallery: (v: boolean) => void }>({
  hasGallery: false,
  setHasGallery: () => {},
});

export function useGalleryContext() {
  return useContext(GalleryContext);
}

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

function LangSwitch() {
  const { lang, setLang, t } = useI18n();
  return (
    <div
      role="group"
      aria-label={t.language}
      className="flex shrink-0 items-center rounded-full border border-stone-300/80 bg-sand/60 p-0.5 text-xs font-semibold"
    >
      {LANGS.map((l) => (
        <button
          key={l}
          type="button"
          onClick={() => setLang(l)}
          aria-pressed={lang === l}
          className={`flex h-[32px] min-w-[32px] sm:min-w-[34px] items-center justify-center rounded-full px-2 uppercase transition-colors text-[11px] sm:text-[12px] font-semibold shrink-0 cursor-pointer ${
            lang === l ? "bg-oxblood text-white shadow-2xs" : "text-ink/80 hover:bg-sand"
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

export function getNavLinks(hasGallery: boolean) {
  return [
    { href: "/#experience", label: { en: "Experience", fr: "L'expérience", ar: "التجربة" } },
    { href: "/#menu", label: { en: "The menu", fr: "Le menu", ar: "قائمة الطعام" } },
    ...(hasGallery
      ? [{ href: "/#photos", label: { en: "Photos", fr: "Photos", ar: "الصور" } }]
      : []),
    { href: "/#booking", label: { en: "Book", fr: "Réserver", ar: "احجز" } },
  ];
}

function Header() {
  const { lang, t } = useI18n();
  const { hasGallery } = useGalleryContext();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState<string>("");
  const [scrollProgress, setScrollProgress] = useState(0);

  const navLinks = getNavLinks(hasGallery);

  const bookDinnerText = {
    en: "Book a dinner",
    fr: "Réserver un dîner",
    ar: "احجز عشاءً",
  };

  useEffect(() => {
    const sectionIds = ["experience", "menu", "photos", "how", "booking"];
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
      {/* Thin scroll-progress line at top */}
      <div
        className="scroll-progress-line"
        style={{ width: `${scrollProgress}%` }}
        aria-hidden="true"
      />

      <header
        className={`sticky top-0 z-50 bg-[#F6F0E6]/90 backdrop-blur-md transition-shadow duration-300 h-[76px] flex flex-col justify-center border-b ${
          scrolled ? "header-scrolled border-stone-300/70" : "border-stone-200/50"
        }`}
      >
        <div className="ms-container flex items-center justify-between gap-2 sm:gap-4 h-full">
          {/* Logo left (fully visible) */}
          <a
            href="/"
            className="flex items-center shrink-0 min-w-0"
            onClick={() => setOpen(false)}
            aria-label={BRAND_NAME}
          >
            <HeaderLogo className="h-10 sm:h-12 w-auto object-contain" />
          </a>

          {/* Center: links with thin gold underline on hover */}
          <nav
            aria-label="Main"
            className="hidden lg:flex flex-1 items-center justify-center gap-10"
          >
            {navLinks.map((item) => {
              const isActive = activeSection === item.href.replace("/#", "");
              return (
                <a
                  key={item.href}
                  href={item.href}
                  className={`nav-link text-[0.9375rem] text-ink/90 hover:text-oxblood ${
                    isActive ? "active text-oxblood font-semibold" : ""
                  }`}
                >
                  <span>{item.label[lang]}</span>
                </a>
              );
            })}
          </nav>

          {/* Right: compact EN / FR / ع switcher and oxblood pill button "Book a dinner" */}
          <div className="flex items-center gap-2 sm:gap-3.5 shrink-0">
            <LangSwitch />
            <a
              href="/#booking"
              className="hidden lg:inline-flex items-center justify-center h-11 px-6 rounded-full bg-oxblood text-white text-sm font-semibold hover:bg-burgundy active:scale-[0.98] transition-all duration-200 shadow-sm"
            >
              {bookDinnerText[lang]}
            </a>

            {/* Mobile menu trigger */}
            <button
              type="button"
              className="flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-full text-ink hover:bg-sand/60 lg:hidden transition-colors shrink-0 cursor-pointer"
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

      {/* Full-screen oxblood phone menu */}
      {open && (
        <div
          id="mobile-nav"
          role="dialog"
          aria-modal="true"
          aria-label="Mobile Navigation"
          className="fixed inset-0 z-[70] bg-oxblood text-white flex flex-col justify-between p-6 sm:p-8 lg:hidden animate-in fade-in duration-200"
        >
          {/* Top row: white logo & close button */}
          <div className="flex items-center justify-between">
            <a href="/" onClick={() => setOpen(false)} aria-label={BRAND_NAME}>
              <HeaderLogoLight className="h-10 w-auto" />
            </a>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors cursor-pointer"
              aria-label="Close menu"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Center: large serif links */}
          <nav className="flex flex-col items-center justify-center gap-6 my-auto text-center">
            {navLinks.map((item) => (
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

          {/* Bottom: Book a dinner button */}
          <div className="pt-6">
            <a
              href="/#booking"
              onClick={() => setOpen(false)}
              className="btn bg-gold text-oxblood font-bold w-full h-[54px] rounded-full text-lg shadow-lg text-center"
            >
              {bookDinnerText[lang]}
            </a>
          </div>
        </div>
      )}
    </>
  );
}

function ClosingBand() {
  const { lang } = useI18n();

  const trackedLabel = {
    en: "REAL PEOPLE / AUTHENTIC HOMES / LASTING MEMORIES",
    fr: "VRAIES FAMILLES / MAISONS AUTHENTIQUES / SOUVENIRS UNIQUES",
    ar: "عائلات مضيافة / بيوت أصيلة / ذكريات تدوم",
  };

  const title = {
    en: "Come as a guest. Leave as family.",
    fr: "Venez en invité. Partez en famille.",
    ar: "تعال كضيف. وغادر كفرد من العائلة.",
  };

  const buttonText = {
    en: "Book your dinner",
    fr: "Réservez votre dîner",
    ar: "احجز عشاءك",
  };

  return (
    <section
      id="closing"
      className="bg-oxblood text-white text-center py-20 sm:py-28 relative overflow-hidden"
      dir={lang === "ar" ? "rtl" : "ltr"}
    >
      {/* Large gold line-art star ornaments at both edges */}
      <div
        className="absolute -start-16 sm:-start-20 lg:-start-12 top-1/2 -translate-y-1/2 pointer-events-none"
        aria-hidden="true"
      >
        <ZelligeLineArtStar className="w-56 h-56 sm:w-72 sm:h-72 text-gold opacity-25" />
      </div>
      <div
        className="absolute -end-16 sm:-end-20 lg:-end-12 top-1/2 -translate-y-1/2 pointer-events-none"
        aria-hidden="true"
      >
        <ZelligeLineArtStar className="w-56 h-56 sm:w-72 sm:h-72 text-gold opacity-25" />
      </div>

      <div className="ms-container max-w-3xl mx-auto relative z-10 px-4">
        <span className="tracked-label block mb-3 text-gold text-[10px] sm:text-[11px]">
          {trackedLabel[lang]}
        </span>
        <h2 className="font-display font-semibold text-white text-3xl sm:text-4xl lg:text-[46px] leading-[1.05] tracking-tight mb-8">
          {title[lang]}
        </h2>
        <div className="flex justify-center">
          <a
            href="#booking"
            className="btn bg-gold text-oxblood hover:bg-gold/90 font-bold px-8 h-12 rounded-full inline-flex items-center justify-center gap-2 text-sm sm:text-base shadow-btn transition-transform hover:-translate-y-0.5 active:translate-y-0"
          >
            <span>{buttonText[lang]}</span>
          </a>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  const { lang, t } = useI18n();
  const { hasGallery } = useGalleryContext();
  const { links } = useContactLinks();
  const navLinks = getNavLinks(hasGallery);

  const whatsappHref = links?.whatsapp
    ? `https://wa.me/${links.whatsapp}`
    : "https://wa.me/212600000000";

  const emailHref = links?.email ? `mailto:${links.email}` : "mailto:contact@moroccansecrets.com";
  const emailLabel = links?.email ?? "contact@moroccansecrets.com";

  const hospitalityText = {
    en: "Moroccan hospitality, always.",
    fr: "L'hospitalité marocaine, toujours.",
    ar: "الضيافة المغربية، دوماً.",
  };

  return (
    <footer
      className="bg-cream text-ink border-t border-stone-300/60 pt-12 pb-10 sm:pb-8 lg:pb-10"
      style={{
        paddingBottom: "max(40px, env(safe-area-inset-bottom))",
      }}
      dir={lang === "ar" ? "rtl" : "ltr"}
    >
      <div className="ms-container">
        {/* Main Footer Row: Logo left, Links center, Switcher right */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-10 border-b border-stone-300/60">
          {/* Logo — our logo, fully visible */}
          <a href="/" aria-label={BRAND_NAME} className="flex items-center shrink-0">
            <HeaderLogo className="h-10 sm:h-12 w-auto object-contain" />
          </a>

          {/* Centered nav links */}
          <nav
            aria-label="Footer"
            className="flex flex-wrap items-center justify-center gap-x-6 sm:gap-x-8 gap-y-2"
          >
            {navLinks.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="text-sm sm:text-base font-medium text-ink hover:text-oxblood transition-colors py-1 hover:underline hover:decoration-gold hover:underline-offset-8"
              >
                {item.label[lang]}
              </a>
            ))}
          </nav>

          {/* Compact language switcher on right */}
          <div className="shrink-0">
            <LangSwitch />
          </div>
        </div>

        {/* Optional contact row: WhatsApp and email only if set */}
        {(links?.whatsapp || links?.email) && (
          <div className="py-4 flex flex-wrap items-center justify-center gap-6 text-xs sm:text-sm text-muted-text border-b border-stone-300/40">
            {links?.whatsapp && (
              <a
                href={whatsappHref}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 hover:text-oxblood transition-colors"
              >
                <MessageCircle className="h-3.5 w-3.5 text-oxblood" aria-hidden="true" />
                <span>WhatsApp</span>
              </a>
            )}
            {links?.email && (
              <a
                href={emailHref}
                className="inline-flex items-center gap-2 hover:text-oxblood transition-colors"
              >
                <Mail className="h-3.5 w-3.5 text-oxblood" aria-hidden="true" />
                <span>{emailLabel}</span>
              </a>
            )}
          </div>
        )}

        {/* Bottom row: copyright bottom-left, "Moroccan hospitality, always." with gold line bottom-right */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-start">
          <p className="text-xs text-muted-text tracking-wide">
            &copy; {new Date().getFullYear()} {BRAND_NAME}. {t.footer.rights}
          </p>

          <div className="flex items-center gap-3 text-xs sm:text-sm font-serif italic text-muted-text">
            <span className="w-10 sm:w-14 h-[1px] bg-gold/70" aria-hidden="true" />
            <span>{hospitalityText[lang]}</span>
          </div>
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
  const [hasGallery, setHasGallery] = useState(false);
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
    <GalleryContext.Provider value={{ hasGallery, setHasGallery }}>
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
        <ClosingBand />
        <Footer />
        <WhatsAppFab />
        <MobileBookingBar />
        <CookieConsent />
      </div>
    </GalleryContext.Provider>
  );
}
