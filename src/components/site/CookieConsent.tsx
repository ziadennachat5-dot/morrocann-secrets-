import { useEffect, useState } from "react";
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

  useEffect(() => {
    const saved = localStorage.getItem(storageKey);
    if (saved === "accepted" || saved === "declined") setConsent(saved);
    const showSettings = () => setShowPreferences(true);
    window.addEventListener("moroccan-secrets:cookie-settings", showSettings);
    return () => window.removeEventListener("moroccan-secrets:cookie-settings", showSettings);
  }, []);

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
      aria-label={t.consent.title}
      className="fixed inset-x-4 bottom-20 z-[60] mx-auto max-w-2xl rounded-xl border border-border bg-background p-4 shadow-xl sm:bottom-5 sm:p-5"
    >
      <h2 className="font-semibold text-foreground">{t.consent.title}</h2>
      <p className="mt-2 text-sm text-muted-foreground">{t.consent.body}</p>
      <div className="mt-4 flex flex-wrap gap-2">
        <Button onClick={() => choose("accepted")}>{t.consent.accept}</Button>
        <Button variant="outline" onClick={() => choose("declined")}>
          {t.consent.decline}
        </Button>
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
