import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";

type Consent = "accepted" | "declined";
const storageKey = "moroccan-secrets-cookie-consent";

const plausibleScriptUrl = import.meta.env["VITE_PLAUSIBLE_SCRIPT_URL"]?.trim() ?? "";
const plausibleDomain = import.meta.env["VITE_PLAUSIBLE_DOMAIN"]?.trim() ?? "";

export function CookieConsent() {
  const { t } = useI18n();
  const [consent, setConsent] = useState<Consent | null>(null);
  const [showPreferences, setShowPreferences] = useState(false);
  const bannerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem(storageKey);
    if (saved === "accepted" || saved === "declined") setConsent(saved);
    const showSettings = () => setShowPreferences(true);
    window.addEventListener("moroccan-secrets:cookie-settings", showSettings);
    return () => window.removeEventListener("moroccan-secrets:cookie-settings", showSettings);
  }, []);

  // Measure banner height and add bottom padding to body so footer is never hidden
  useEffect(() => {
    const banner = bannerRef.current;
    if (!banner) {
      document.body.style.removeProperty("padding-bottom");
      document.body.removeAttribute("data-cookie-banner");
      return;
    }
    document.body.setAttribute("data-cookie-banner", "open");
    const measure = () => {
      document.body.style.setProperty("padding-bottom", `${banner.offsetHeight + 8}px`);
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(banner);
    return () => {
      ro.disconnect();
      document.body.style.removeProperty("padding-bottom");
      document.body.removeAttribute("data-cookie-banner");
    };
  }, [consent, showPreferences]);

  useEffect(() => {
    if (consent !== "accepted" || !plausibleScriptUrl || !plausibleDomain) return;
    let scriptUrl: URL;
    try {
      scriptUrl = new URL(plausibleScriptUrl);
    } catch (error) {
      console.error("Invalid Plausible script URL:", error);
      return;
    }
    if (scriptUrl.protocol !== "https:") {
      console.error("Plausible script URL must use HTTPS.");
      return;
    }
    const script = document.createElement("script");
    script.defer = true;
    script.src = scriptUrl.toString();
    script.dataset["domain"] = plausibleDomain;
    script.dataset["msConsent"] = "accepted";
    document.head.append(script);
    return () => script.remove();
  }, [consent]);

  function choose(value: Consent) {
    localStorage.setItem(storageKey, value);
    setConsent(value);
    setShowPreferences(false);
  }

  if (consent !== null && !showPreferences) return null;

  return (
    <aside
      ref={bannerRef}
      aria-label={t.consent.title}
      className="fixed inset-x-0 bottom-0 z-[60] flex justify-center px-4 pb-4 pointer-events-none"
    >
      <div
        className="pointer-events-auto w-full max-w-[720px] rounded-2xl border border-border bg-white/97 px-5 py-4 shadow-xl backdrop-blur-sm"
        style={{ boxShadow: "0 8px 40px -8px rgba(42,32,32,0.18)" }}
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-foreground">{t.consent.title}</p>
            <p className="mt-0.5 text-xs text-muted-foreground leading-relaxed">{t.consent.body}</p>
          </div>
          <div className="flex flex-wrap gap-2 shrink-0">
            <Button size="sm" onClick={() => choose("accepted")} className="text-xs">
              {t.consent.accept}
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => choose("declined")}
              className="text-xs"
            >
              {t.consent.decline}
            </Button>
          </div>
        </div>
      </div>
    </aside>
  );
}

export function CookieSettingsButton() {
  const { t } = useI18n();
  return (
    <button
      type="button"
      className="text-left text-sm underline underline-offset-4 hover:text-gold"
      onClick={() => window.dispatchEvent(new Event("moroccan-secrets:cookie-settings"))}
    >
      {t.consent.settings}
    </button>
  );
}
